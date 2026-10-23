/** Fetch target and parser for DeepSeek's official RMB price table. */

export const PRICING_URL = 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing/'

function textOf(fragment) {
  return fragment
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanModelId(value) {
  return value.replace(/\s*\(\d+\)\s*$/, '').trim()
}

function cleanModelName(value) {
  return value.replace(/-\d{4}$/, '').trim()
}

function priceCells(row) {
  const values = []
  for (const cell of row) {
    const match = /^([0-9]+(?:\.[0-9]+)?)\s*元$/.exec(cell)
    if (match !== null) values.push(Number(match[1]))
  }
  return values
}

function categoryOf(row) {
  const joined = row.join(' ')
  if (joined.includes('缓存命中')) return 'cacheHit'
  if (joined.includes('缓存未命中')) return 'cacheMiss'
  if (joined.includes('tokens输出') || joined.includes('tokens 输出')) return 'output'
  return undefined
}

function periodOf(row) {
  if (row.some(cell => cell.includes('空闲时段'))) return 'offPeak'
  if (row.some(cell => cell.includes('高峰时段'))) return 'peak'
  return undefined
}

/**
 * Parse the model/price table from the official Chinese pricing page.
 * Returns `{ [modelId]: { name, cacheHit, cacheMiss, cacheWrite, output } }`
 * or null when the page shape no longer provides every required price.
 */
export function parsePricingPage(html) {
  if (typeof html !== 'string') return null
  const tableStart = html.indexOf('<table style="text-align:center"')
  if (tableStart === -1) return null
  const tableEnd = html.indexOf('</table>', tableStart)
  if (tableEnd === -1) return null
  const table = html.slice(tableStart, tableEnd + 8)
  const rows = [...table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(match =>
    [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(cell => textOf(cell[1])))

  const modelRow = rows.find(row => row.some(cell => cell === '模型'))
  if (modelRow === undefined) return null
  const modelIndex = modelRow.indexOf('模型')
  const ids = modelRow.slice(modelIndex + 1).map(cleanModelId).filter(Boolean)
  if (ids.length === 0) return null

  const versionRow = rows.find(row => row.some(cell => cell === '模型版本'))
  const names = versionRow === undefined ? [] : versionRow.slice(1).map(cleanModelName)

  const models = Object.fromEntries(ids.map((id, index) => [id, {
    name: names[index] || id,
    cacheHit: {},
    cacheMiss: {},
    cacheWrite: {},
    output: {},
  }]))

  // `缓存命中` and the output label use a rowspan, so the peak-price row that
  // follows each off-peak row carries only the period cell.
  let category
  for (const row of rows) {
    const nextCategory = categoryOf(row)
    if (nextCategory !== undefined) category = nextCategory
    const period = periodOf(row)
    if (category === undefined || period === undefined) continue
    const values = priceCells(row)
    if (values.length !== ids.length) continue
    for (let index = 0; index < ids.length; index += 1) {
      models[ids[index]][category][period] = values[index]
    }
  }

  for (const model of Object.values(models)) {
    for (const period of ['offPeak', 'peak']) {
      if (!Number.isFinite(model.cacheHit[period])
        || !Number.isFinite(model.cacheMiss[period])
        || !Number.isFinite(model.output[period])) return null
      model.cacheWrite[period] = model.cacheMiss[period]
    }
  }
  return models
}

/**
 * Parse the Search/Fetch table and the documented free-until instant.
 * Prices are listed per 1,000 successful requests.
 */
export function parseWebPricingPage(html) {
  if (typeof html !== 'string') return null
  const sectionStart = html.indexOf('id="网页搜索与抓取价格"')
  if (sectionStart === -1) return null
  const nextHeading = html.indexOf('<h2', sectionStart + 1)
  const section = html.slice(sectionStart, nextHeading === -1 ? undefined : nextHeading)
  const tableMatch = /<table[^>]*>([\s\S]*?)<\/table>/.exec(section)
  if (tableMatch === null) return null

  const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(match =>
    [...match[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map(cell => textOf(cell[1])))

  let searchPerRequest
  let fetchPerRequest
  for (const row of rows) {
    const label = row[0]?.toLowerCase()
    if (label !== 'search' && label !== 'fetch') continue
    for (const cell of row.slice(1)) {
      const price = /^([0-9]+(?:\.[0-9]+)?)\s*元$/.exec(cell)
      if (price === null) continue
      const perRequest = Number(price[1]) / 1000
      if (label === 'search') searchPerRequest = perRequest
      else fetchPerRequest = perRequest
      break
    }
  }
  if (!Number.isFinite(searchPerRequest) || !Number.isFinite(fetchPerRequest)) return null

  const freeMatch = /北京时间\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*(\d{1,2}):(\d{2})/.exec(html)
  const freeUntil = freeMatch === null
    ? Date.parse('2026-11-01T00:00:00+08:00')
    : Date.parse(`${freeMatch[1]}-${freeMatch[2].padStart(2, '0')}-${freeMatch[3].padStart(2, '0')}T${freeMatch[4].padStart(2, '0')}:${freeMatch[5]}:00+08:00`)

  return {
    searchPerRequest,
    fetchPerRequest,
    freeUntil: Number.isFinite(freeUntil) ? freeUntil : Date.parse('2026-11-01T00:00:00+08:00'),
  }
}
