/** Host half: session cost projection plus the official-price refresh route. */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  applyEvent,
  createCostState,
  markPricingCached,
  passthroughSchema,
  projectCost,
  setFetchedPricing,
} from './cost.js'
import { PRICING_URL, parsePricingPage } from './pricing-source.js'

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
let refreshInFlight = null

function loadCachedPricing() {
  try {
    const cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
    if (cache?.version !== 1 || cache.models === undefined) return false
    if (!setFetchedPricing(cache.models)) return false
    markPricingCached(true)
    return true
  } catch {
    // A missing or partial cache simply leaves the built-in table active.
    return false
  }
}

function saveCachedPricing(models) {
  try {
    mkdirSync(dirname(CACHE_PATH), { recursive: true })
    writeFileSync(CACHE_PATH, JSON.stringify({
      version: 1,
      source: PRICING_URL,
      updatedAt: new Date().toISOString(),
      models,
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
  const models = parsePricingPage(result.body?.content)
  if (models === null) {
    throw new Error('官方价格页格式已变化，无法解析')
  }
  if (!setFetchedPricing(models)) {
    throw new Error('抓取到的价格表无效')
  }
  const saved = saveCachedPricing(models)
  markPricingCached(saved.persisted)
  return {
    models,
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
  const cacheLoaded = loadCachedPricing()

  ctx.effect(() => ctx.sessionProjections.register({
    key: 'deepseekCost',
    stateSchema: passthroughSchema,
    init: createCostState,
    apply: applyEvent,
    wire: {
      viewSchema: passthroughSchema,
      view: projectCost,
    },
    stateVersion: 4,
  }), 'deepseek-cost: session cost projection')

  if (!cacheLoaded) {
    ctx.effect(() => {
      void refreshPricing(ctx).catch(() => {})
      return () => {}
    }, 'deepseek-cost: first-run price refresh')
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
