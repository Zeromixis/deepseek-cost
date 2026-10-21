/**
 * Pure cost fold for the composer cost projection.
 *
 * Prices are DeepSeek's published list prices in RMB per 1M tokens. DeepSeek
 * bills weekday peak hours at twice the off-peak rate; the fold snapshots that
 * choice from each request header's time so later reads stay stable.
 */

const PRICE_PER_MILLION = {
  flash: {
    cacheHit: { offPeak: 0.02, peak: 0.04 },
    cacheMiss: { offPeak: 1, peak: 2 },
    cacheWrite: { offPeak: 1, peak: 2 },
    output: { offPeak: 4, peak: 8 },
  },
  pro: {
    cacheHit: { offPeak: 0.15, peak: 0.3 },
    cacheMiss: { offPeak: 4.5, peak: 9 },
    cacheWrite: { offPeak: 4.5, peak: 9 },
    output: { offPeak: 13.5, peak: 27 },
  },
}

const MODEL_FAMILIES = new Map([
  ['deepseek-flash', 'flash'],
  ['deepseek-v4-flash', 'flash'],
  ['deepseek-v4-flash-vision-exp', 'flash'],
  ['deepseek-chat', 'flash'],
  ['deepseek-v4-pro', 'pro'],
])

const MODEL_NAMES = new Map([
  ['deepseek-flash', 'DeepSeek-V4.1-Flash'],
  ['deepseek-v4-flash', 'DeepSeek-V4.1-Flash'],
  ['deepseek-v4-flash-vision-exp', 'DeepSeek-V4.1-Flash'],
  ['deepseek-chat', 'DeepSeek-V4.1-Flash'],
  ['deepseek-v4-pro', 'DeepSeek-V4-Pro'],
])

/** Prices fetched from the official page override the built-in defaults. */
let fetchedPricing = null
/** Whether the active pricing table came from a durable local cache. */
let pricingCached = false

/** Record whether the active table was restored from the local cache. */
export function markPricingCached(value) {
  pricingCached = value === true
}

const SHANGHAI_TIME = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** A projection schema that validates nothing; the fold owns its invariants. */
export const passthroughSchema = {
  parse(value) {
    return value
  },
}

const isCount = (value) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0

/** Whether one instant falls in DeepSeek's weekday peak-price window. */
export function isPeakTime(time) {
  if (!Number.isFinite(time)) return false
  const parts = SHANGHAI_TIME.formatToParts(new Date(time))
  const weekday = parts.find(part => part.type === 'weekday')?.value
  const hour = Number(parts.find(part => part.type === 'hour')?.value)
  const minute = Number(parts.find(part => part.type === 'minute')?.value)
  if (weekday === undefined || !Number.isFinite(hour) || !Number.isFinite(minute)) return false
  if (weekday === 'Sat' || weekday === 'Sun') return false
  const minutes = hour * 60 + minute
  return (minutes >= 9 * 60 && minutes < 12 * 60)
    || (minutes >= 14 * 60 && minutes < 18 * 60)
}

function normalizePricingEntry(entry) {
  if (entry === null || typeof entry !== 'object') return undefined
  const rates = {}
  for (const key of ['cacheHit', 'cacheMiss', 'cacheWrite', 'output']) {
    const source = entry[key]
    if (source === null || typeof source !== 'object') return undefined
    const read = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? value
      : undefined
    const offPeak = read(source.offPeak)
    const peak = read(source.peak)
    if (offPeak === undefined || peak === undefined) return undefined
    rates[key] = { offPeak, peak }
  }
  return rates
}

/** Install prices fetched from the official page; invalid payloads keep the old table. */
export function setFetchedPricing(models) {
  if (models === null || typeof models !== 'object' || Array.isArray(models)) return false
  const next = {}
  for (const [id, entry] of Object.entries(models)) {
    if (typeof id !== 'string' || id.length === 0) continue
    const rates = normalizePricingEntry(entry)
    if (rates === undefined) continue
    const name = typeof entry.name === 'string' && entry.name.length > 0 ? entry.name : id
    next[id] = { name, ...rates }
  }
  if (Object.keys(next).length === 0) return false
  fetchedPricing = next
  return true
}

/** Snapshot of fetched pricing, used by the Host cache and refresh route. */
export function getFetchedPricing() {
  return fetchedPricing
}

/** Resolve the published price entry for one provider/model route. */
export function priceFamily(provider, model) {
  if (typeof provider !== 'string' || typeof model !== 'string') return undefined
  if (provider !== 'deepseek' && provider !== 'deepseek-account') return undefined
  const fetched = fetchedPricing?.[model]
  if (fetched !== undefined) return fetched
  const family = MODEL_FAMILIES.get(model)
  return family === undefined ? undefined : PRICE_PER_MILLION[family]
}

/** The current model's RMB list price, shaped for the click-open detail panel. */
export function priceList(provider, model) {
  const rates = priceFamily(provider, model)
  if (rates === undefined) return null
  return {
    cacheHit: { ...rates.cacheHit },
    cacheMiss: { ...rates.cacheMiss },
    output: { ...rates.output },
  }
}

/** Friendly catalog name for a known model id. */
export function modelName(model) {
  return fetchedPricing?.[model]?.name ?? MODEL_NAMES.get(model) ?? model ?? null
}

/** Price one provider usage sample in RMB, or return undefined for an unknown route. */
export function priceUsage(usage, provider, model, peak) {
  if (usage === null || typeof usage !== 'object') return undefined
  const rates = priceFamily(provider, model)
  if (rates === undefined) return undefined
  const miss = usage.inputTokens
  const hit = usage.cacheReadTokens ?? 0
  const write = usage.cacheWriteTokens ?? 0
  const output = usage.outputTokens
  if (![miss, hit, write, output].every(isCount)) return undefined
  const period = peak ? 'peak' : 'offPeak'
  return (
    miss * rates.cacheMiss[period]
    + hit * rates.cacheHit[period]
    + write * rates.cacheWrite[period]
    + output * rates.output[period]
  ) / 1_000_000
}

/** Read the last provider usage chunk from one assistant message's stream. */
function streamUsage(stream) {
  if (!Array.isArray(stream)) return undefined
  for (let index = stream.length - 1; index >= 0; index -= 1) {
    const record = stream[index]
    if (record?.type === 'chunk' && record.chunk?.type === 'usage') return record.chunk.usage
  }
  return undefined
}

/** Fresh projection state; pending is the route captured by the latest header. */
export function createCostState() {
  return {
    totalCny: 0,
    requests: 0,
    unpricedRequests: 0,
    lastProvider: null,
    lastModel: null,
    pending: null,
  }
}

/**
 * Fold one durable event. Only a successful assistant message with usage is
 * billed; a request header snapshots the route and the time-of-day rate.
 */
export function applyEvent(state, event) {
  if (event?.type === 'model/selection') {
    const selection = event.data
    if (typeof selection?.provider !== 'string' || typeof selection?.model !== 'string') return state
    return {
      ...state,
      lastProvider: selection.provider,
      lastModel: selection.model,
    }
  }
  if (event?.type === 'request/header') {
    const config = event.data?.header?.config
    if (typeof config?.provider !== 'string' || typeof config?.model !== 'string') return state
    return {
      ...state,
      lastProvider: config.provider,
      lastModel: config.model,
      pending: {
        provider: config.provider,
        model: config.model,
        peak: isPeakTime(event.time),
      },
    }
  }
  if (event?.type !== 'assistant/message') return state
  const usage = event.data?.usage ?? streamUsage(event.data?.stream)
  if (usage === undefined || usage === null) return state
  const route = state.pending
  if (route === null) {
    return { ...state, unpricedRequests: state.unpricedRequests + 1 }
  }
  const amount = priceUsage(usage, route.provider, route.model, route.peak)
  if (amount === undefined) {
    return {
      ...state,
      unpricedRequests: state.unpricedRequests + 1,
      lastProvider: route.provider,
      lastModel: route.model,
    }
  }
  return {
    ...state,
    totalCny: Math.round((state.totalCny + amount) * 1e8) / 1e8,
    requests: state.requests + 1,
    lastProvider: route.provider,
    lastModel: route.model,
  }
}

/** Client-visible view; the route snapshot detail stays host-only. */
export function projectCost(state) {
  return {
    totalCny: state.totalCny,
    requests: state.requests,
    unpricedRequests: state.unpricedRequests,
    provider: state.lastProvider,
    model: state.lastModel,
    modelName: modelName(state.lastModel),
    prices: priceList(state.lastProvider, state.lastModel),
    pricingCached,
  }
}
