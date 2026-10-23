/** Host half: session cost projection plus the official-price refresh route. */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  applyEvent,
  createCostState,
  isDeepSeekProvider,
  markPricingCached,
  passthroughSchema,
  priceList,
  projectCost,
  setFetchedPricing,
  setFetchedWebPricing,
  webPricing,
} from './cost.js'
import { PRICING_URL, parsePricingPage, parseWebPricingPage } from './pricing-source.js'

export const inject = ['sessionProjections', 'web', 'webServer']

const ROUTE_PATH = '/deepseek-cost/prices'

function resolveProfileDir() {
  if (process.env.DSH_PROFILE_DIR !== undefined) return process.env.DSH_PROFILE_DIR
  const profilesRoot = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'profiles')
  if (process.env.DSH_PROFILE !== undefined) return join(profilesRoot, process.env.DSH_PROFILE)
  try {
    const names = readdirSync(profilesRoot, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
    if (names.includes('desktop')) return join(profilesRoot, 'desktop')
    if (names.length > 0) return join(profilesRoot, names[0])
  } catch {
    // Fall through to the conventional desktop profile.
  }
  return join(profilesRoot, 'desktop')
}

const CACHE_PATH = join(resolveProfileDir(), 'data', 'deepseek-cost', 'pricing.json')
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
let refreshInFlight = null

function loadCachedPricing() {
  try {
    const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
    if ((cache?.version !== 1 && cache?.version !== 2) || cache.models === undefined) {
      return { loaded: false }
    }
    if (!setFetchedPricing(cache.models)) return { loaded: false }
    if (cache.web !== undefined) setFetchedWebPricing(cache.web)
    markPricingCached(true)
    const updatedAt = typeof cache.updatedAt === 'string' ? Date.parse(cache.updatedAt) : NaN
    return { loaded: true, updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0 }
  } catch {
    // A missing or partial cache simply leaves the built-in table active.
    return { loaded: false }
  }
}

function saveCachedPricing(models, web) {
  try {
    mkdirSync(dirname(CACHE_PATH), { recursive: true })
    writeFileSync(CACHE_PATH, JSON.stringify({
      version: 2,
      source: PRICING_URL,
      updatedAt: new Date().toISOString(),
      models,
      web,
    }, null, 2))
    return { persisted: true, path: CACHE_PATH }
  } catch (error) {
    return { persisted: false, error: error instanceof Error ? error.message : String(error), path: CACHE_PATH }
  }
}

async function fetchOfficialPricing(ctx) {
  const result = await ctx.web.fetch({ url: PRICING_URL })
  if (result.statusCode !== 200) {
    throw new Error(`官方价格页返回 HTTP ${result.statusCode}`)
  }
  const content = result.body?.content
  const models = parsePricingPage(content)
  if (models === null) {
    throw new Error('官方价格页格式已变化，无法解析')
  }
  if (!setFetchedPricing(models)) {
    throw new Error('抓取到的价格表无效')
  }
  const web = parseWebPricingPage(content)
  if (web !== null) setFetchedWebPricing(web)
  const saved = saveCachedPricing(models, web ?? webPricing())
  markPricingCached(saved.persisted)
  return {
    models,
    web: web ?? webPricing(),
    persisted: saved.persisted,
    updatedAt: new Date().toISOString(),
  }
}

function refreshPricing(ctx) {
  if (refreshInFlight !== null) return refreshInFlight
  const task = fetchOfficialPricing(ctx)
  refreshInFlight = task
  task.finally(() => {
    if (refreshInFlight === task) refreshInFlight = null
  }).catch(() => {})
  return task
}

function reply(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(payload))
}

export function apply(ctx) {
  const cache = loadCachedPricing()
  const cacheStale = !cache.loaded
    || cache.updatedAt === 0
    || Date.now() - cache.updatedAt > CACHE_TTL_MS

  ctx.effect(() => ctx.sessionProjections.register({
    key: 'deepseekCost',
    stateSchema: passthroughSchema,
    init: createCostState,
    apply: applyEvent,
    wire: {
      viewSchema: passthroughSchema,
      view: projectCost,
    },
    stateVersion: 5,
  }), 'deepseek-cost: session cost projection')

  ctx.effect(() => ctx.on('session/event', (_session, event) => {
    let provider
    let model
    if (event?.type === 'model/selection') {
      provider = event.data?.provider
      model = event.data?.model
    } else if (event?.type === 'request/header') {
      provider = event.data?.header?.config?.provider
      model = event.data?.header?.config?.model
    } else {
      return
    }
    if (!isDeepSeekProvider(provider) || priceList(provider, model) !== null) return
    void refreshPricing(ctx).catch(() => {})
  }), 'deepseek-cost: refresh prices for an unknown model')

  if (cacheStale) {
    ctx.effect(() => {
      void refreshPricing(ctx).catch(() => {})
      return () => {}
    }, 'deepseek-cost: price refresh')
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ROUTE_PATH,
    handler: async (req, res) => {
      if (req.method !== 'GET') {
        reply(res, 405, { ok: false, error: 'Method not allowed' })
        return
      }
      try {
        const refreshed = await refreshPricing(ctx)
        reply(res, 200, {
          ok: true,
          source: PRICING_URL,
          ...refreshed,
        })
      } catch (error) {
        reply(res, 502, {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    },
  }), 'deepseek-cost: official price refresh route')
}
