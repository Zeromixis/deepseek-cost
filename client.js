window.__ModuleLoader__.load({
  id: 'deepseek-cost',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement

    const NS = 'deepseekCost'
    const chineseMessages = {
      'cost.title': '会话费用估算',
      'cost.model': '模型：{model}',
      'cost.estimate': '根据 Token 用量和 DeepSeek 官方人民币价格估算，非最终账单。',
      'cost.unknown': '当前模型暂无可用价格。',
      'cost.aria': '会话费用估算（人民币）：{amount}。打开模型价格清单。',
      'cost.pricesTitle': '模型价格',
      'cost.sessionLabel': '本会话费用',
      'cost.currentPeriod': '当前',
      'cost.unit': '人民币 / 百万 tokens',
      'cost.inputHit': '输入 · 缓存命中',
      'cost.inputMiss': '输入 · 缓存未命中',
      'cost.output': '输出',
      'cost.offPeak': '空闲时段',
      'cost.peak': '高峰时段',
      'cost.peakNote': '高峰：北京时间周一至周五 09:00–12:00、14:00–18:00。',
      'cost.unavailable': '当前模型暂无价格清单。',
      'cost.notBill': '仅为估算，非最终账单。',
      'cost.webUsage': '网页调用',
      'cost.webCounts': '搜索 {search} 次 · 抓取 {fetch} 次',
      'cost.webFree': '官方暂免至 {date}',
      'cost.update': '更新价格',
      'cost.updating': '更新中…',
      'cost.updated': '价格已更新并保存到本地，后续请求按新价格计费。',
      'cost.updatedNoModel': '价格已更新并保存，但未找到当前模型的价格。',
      'cost.updatedMemoryOnly': '价格已更新，但本地保存失败；本次运行内有效。',
      'cost.updateFailed': '更新失败：{message}',
      'cost.updateSource': '从 DeepSeek 官方定价页抓取',
    }
    // 该插件按需求固定用中文展示，不随界面语言切换。
    const messages = { en: chineseMessages, zh: chineseMessages }

    const anchorStyle = {
      display: 'inline-flex',
      minWidth: 0,
      fontSize: 'calc(var(--dsh-content-font-size-secondary, 13px) - 1px)',
      lineHeight: 'calc(20px + var(--dsh-content-font-delta-secondary, 0px))',
    }
    const pillStyle = {
      boxSizing: 'border-box',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      maxWidth: '100%',
      padding: '1px 8px',
      border: 'none',
      borderRadius: 'var(--dsw-radius-sm)',
      background: 'transparent',
      color: 'var(--dsw-alias-label-tertiary)',
      font: 'inherit',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 'inherit',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    }
    const amountStyle = {
      overflow: 'hidden',
      minWidth: 0,
      textOverflow: 'ellipsis',
    }
    const panelStyle = {
      position: 'fixed',
      zIndex: 1200,
      boxSizing: 'border-box',
      padding: '14px 16px 12px',
      color: 'var(--dsw-alias-label-primary)',
      background: 'var(--dsw-specific-menu)',
      backdropFilter: 'var(--dsw-menu-backdrop-filter)',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 'var(--dsw-radius-lg)',
      boxShadow: 'var(--dsw-elevation-prominent)',
      fontSize: 13,
      lineHeight: '20px',
      overflowY: 'auto',
      overflowX: 'hidden',
    }
    const headerStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }
    const iconWrapStyle = {
      display: 'grid',
      placeItems: 'center',
      flex: 'none',
      width: 32,
      height: 32,
      borderRadius: 10,
      background: 'var(--dsw-alias-interactive-bg-hover)',
      color: 'var(--dsw-alias-brand-primary)',
      fontSize: 19,
      fontWeight: 700,
      lineHeight: 1,
    }
    const eyebrowStyle = {
      flex: 1,
      minWidth: 0,
      color: 'var(--dsw-alias-label-tertiary)',
      fontSize: 11,
      lineHeight: '16px',
      letterSpacing: '0.04em',
    }
    const sessionPillStyle = {
      display: 'flex',
      flex: 'none',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 0,
      padding: '3px 8px',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 8,
      background: 'var(--dsw-alias-bg-layer-1)',
    }
    const sessionLabelStyle = {
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 10,
      lineHeight: '13px',
    }
    const sessionValueStyle = {
      color: 'var(--dsw-alias-label-primary)',
      fontSize: 12,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: '16px',
    }
    const modelNameStyle = {
      marginTop: 11,
      overflow: 'hidden',
      fontSize: 17,
      fontWeight: 600,
      lineHeight: '24px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }
    const unitRowStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 2,
    }
    const unitStyle = {
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 11,
      lineHeight: '17px',
    }
    const periodChipStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      flex: 'none',
      gap: 5,
      padding: '2px 7px',
      borderRadius: 999,
      background: 'var(--dsw-alias-interactive-bg-hover)',
      fontSize: 10,
      lineHeight: '15px',
    }
    const periodDotStyle = {
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: 'currentColor',
      flex: 'none',
    }
    const tableCardStyle = {
      marginTop: 12,
      overflow: 'hidden',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 10,
      background: 'var(--dsw-alias-bg-layer-1)',
      fontVariantNumeric: 'tabular-nums',
    }
    const tableHeadStyle = {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 88px 88px',
      padding: '7px 10px',
      background: 'var(--dsw-alias-bg-layer-2)',
    }
    const tableRowStyle = {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 88px 88px',
      alignItems: 'center',
      padding: '8px 10px',
      borderTop: '1px solid var(--dsw-alias-border-l1)',
    }
    const tableHeadLabelStyle = {
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.02em',
      lineHeight: '14px',
    }
    const tableHeadPriceStyle = {
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 10,
      fontWeight: 600,
      lineHeight: '14px',
      textAlign: 'right',
    }
    const rowLabelStyle = {
      overflowWrap: 'anywhere',
      color: 'var(--dsw-alias-label-secondary)',
      fontSize: 12,
      lineHeight: '18px',
    }
    const rowPriceStyle = {
      color: 'var(--dsw-alias-label-secondary)',
      fontSize: 12,
      lineHeight: '18px',
      textAlign: 'right',
      whiteSpace: 'nowrap',
    }
    const noteStyle = {
      marginTop: 10,
      padding: '8px 10px',
      borderRadius: 8,
      background: 'var(--dsw-alias-bg-layer-1)',
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 11,
      lineHeight: '16px',
    }
    const webCardStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      marginTop: 10,
      padding: '8px 10px',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 8,
      background: 'var(--dsw-alias-bg-layer-1)',
    }
    const webHeaderStyle = {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 8,
    }
    const webTitleStyle = {
      color: 'var(--dsw-alias-label-primary)',
      fontSize: 12,
      fontWeight: 600,
      lineHeight: '17px',
    }
    const webValueStyle = {
      color: 'var(--dsw-alias-label-primary)',
      fontSize: 11,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: '16px',
      textAlign: 'right',
    }
    const webMetaStyle = {
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 10,
      lineHeight: '15px',
    }
    const footerStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
    }
    const updateButtonStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      flex: 'none',
      padding: '5px 11px',
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: 999,
      background: 'var(--dsw-alias-interactive-bg-hover)',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: 11,
      fontWeight: 500,
      lineHeight: '16px',
      cursor: 'pointer',
    }
    const updateStatusStyle = {
      flex: 1,
      minWidth: 0,
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 11,
      lineHeight: '16px',
      overflowWrap: 'anywhere',
    }

    function formatCny(value) {
      if (!Number.isFinite(value) || value < 0) return '—'
      if (value === 0) return '¥0.0000'
      if (value < 0.0001) return '<¥0.0001'
      if (value < 1) return `¥${value.toFixed(4)}`
      return `¥${value.toFixed(2)}`
    }

    function formatRate(value) {
      return Number.isFinite(value) ? `¥${value.toFixed(2)}` : '—'
    }

    const SHANGHAI_CLOCK = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })

    function isPeakNow() {
      const parts = SHANGHAI_CLOCK.formatToParts(new Date())
      const weekday = parts.find(part => part.type === 'weekday')?.value
      const hour = Number(parts.find(part => part.type === 'hour')?.value)
      const minute = Number(parts.find(part => part.type === 'minute')?.value)
      if (weekday === 'Sat' || weekday === 'Sun') return false
      const minutes = hour * 60 + minute
      return (minutes >= 9 * 60 && minutes < 12 * 60)
        || (minutes >= 14 * 60 && minutes < 18 * 60)
    }

    const SHANGHAI_DATE = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    function formatDate(time) {
      return Number.isFinite(time)
        ? SHANGHAI_DATE.format(new Date(time)).replaceAll('/', '-')
        : '—'
    }

    function RefreshIcon() {
      return h('svg', {
        viewBox: '0 0 16 16',
        width: 12,
        height: 12,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
      },
        h('path', { d: 'M13.2 8a5.2 5.2 0 1 1-1.55-3.68' }),
        h('path', { d: 'M13.2 2.8v4h-4' }))
    }

    // Locale registration can lag one render behind; never leak a raw key.
    function resolveText(t, key, params) {
      let translated
      try {
        translated = t(key, params)
      } catch {
        translated = key
      }
      if (translated !== key) return translated
      let fallback = chineseMessages[key] ?? key
      if (params !== undefined) {
        for (const [name, value] of Object.entries(params)) {
          fallback = fallback.replaceAll(`{${name}}`, String(value))
        }
      }
      return fallback
    }

    function PricePanel({
      cost, t, panelRef, position, remotePricing, refreshing, status, onRefresh,
    }) {
      if (position === null) return null
      const text = (key, params) => resolveText(t, key, params)
      const fetched = cost.model === null ? undefined : remotePricing?.[cost.model]
      const prices = fetched ?? cost.prices
      const shownModelName = fetched?.name ?? cost.modelName ?? cost.model ?? '—'
      const label = text('cost.pricesTitle')
      const peakNow = isPeakNow()
      const periodColor = peakNow
        ? 'var(--dsw-alias-state-warn-primary)'
        : 'var(--dsw-alias-state-success-primary)'
      const priceStyle = active => active
        ? { ...rowPriceStyle, color: 'var(--dsw-alias-label-primary)', fontWeight: 600 }
        : rowPriceStyle
      const headPriceStyle = active => active
        ? { ...tableHeadPriceStyle, color: periodColor }
        : tableHeadPriceStyle
      const priceRow = (key, labelText, rates) => h('div', {
        key,
        style: tableRowStyle,
      },
        h('span', { style: rowLabelStyle }, labelText),
        h('span', { style: priceStyle(!peakNow) }, formatRate(rates.offPeak)),
        h('span', { style: priceStyle(peakNow) }, formatRate(rates.peak)))
      const statusColor = status?.kind === 'error'
        ? 'var(--dsw-alias-state-error-primary)'
        : status?.kind === 'success'
          ? 'var(--dsw-alias-state-success-primary)'
          : 'var(--dsw-alias-label-caption)'
      const web = cost.web
      const webCalls = (web?.searchRequests ?? 0) + (web?.fetchRequests ?? 0)
      const webFree = web !== undefined && web.freeUntil > Date.now()

      const panel = h('div', {
        ref: panelRef,
        role: 'dialog',
        'aria-label': label,
        'data-deepseek-cost-panel': true,
        style: {
          ...panelStyle,
          left: position.left,
          bottom: position.bottom,
          width: position.width,
          maxHeight: position.maxHeight,
        },
      },
        h('div', { style: headerStyle },
          h('span', { style: iconWrapStyle }, '¥'),
          h('span', { style: eyebrowStyle }, label),
          h('span', { style: sessionPillStyle },
            h('span', { style: sessionLabelStyle }, text('cost.sessionLabel')),
            h('span', { style: sessionValueStyle }, formatCny(cost.totalCny)))),
        h('div', { style: modelNameStyle, title: cost.model ?? undefined },
          shownModelName),
        h('div', { style: unitRowStyle },
          h('span', { style: unitStyle }, text('cost.unit')),
          h('span', {
            style: { ...periodChipStyle, color: periodColor },
            title: text('cost.peakNote'),
          },
            h('span', { style: periodDotStyle }),
            h('span', null, text('cost.currentPeriod')),
            h('span', { style: { opacity: 0.55 } }, '·'),
            h('span', null, text(peakNow ? 'cost.peak' : 'cost.offPeak')))),
        prices === null
          ? h('div', { style: { ...noteStyle, marginTop: 12 } }, text('cost.unavailable'))
          : h('div', { style: tableCardStyle },
            h('div', { style: tableHeadStyle },
              h('span', { style: tableHeadLabelStyle }),
              h('span', { style: headPriceStyle(!peakNow) }, text('cost.offPeak')),
              h('span', { style: headPriceStyle(peakNow) }, text('cost.peak'))),
            priceRow('cacheHit', text('cost.inputHit'), prices.cacheHit),
            priceRow('cacheMiss', text('cost.inputMiss'), prices.cacheMiss),
            priceRow('output', text('cost.output'), prices.output)),
        webCalls > 0 && h('div', { style: webCardStyle },
          h('div', { style: webHeaderStyle },
            h('span', { style: webTitleStyle }, text('cost.webUsage')),
            h('span', {
              style: {
                ...webValueStyle,
                color: webFree ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-label-primary)',
              },
            }, webFree
              ? text('cost.webFree', { date: formatDate(web.freeUntil) })
              : formatCny(web.costCny))),
          h('div', { style: webMetaStyle },
            text('cost.webCounts', {
              search: web.searchRequests,
              fetch: web.fetchRequests,
            }))),
        h('div', { style: noteStyle },
          h('div', null, text('cost.peakNote')),
          h('div', { style: { marginTop: 2, opacity: 0.85 } }, text('cost.notBill'))),
        h('div', { style: footerStyle },
          h('button', {
            type: 'button',
            onClick: onRefresh,
            disabled: refreshing,
            style: {
              ...updateButtonStyle,
              opacity: refreshing ? 0.65 : 1,
              cursor: refreshing ? 'progress' : 'pointer',
            },
          },
            h(RefreshIcon),
            h('span', null, text(refreshing ? 'cost.updating' : 'cost.update'))),
          h('span', {
            style: {
              ...updateStatusStyle,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 5,
              color: statusColor,
            },
            title: status?.detail,
          },
            h('span', {
              style: {
                width: 6,
                height: 6,
                marginTop: 5,
                borderRadius: '50%',
                background: statusColor,
                flex: 'none',
              },
            }),
            h('span', { style: { flex: 1, minWidth: 0 } },
              status?.message ?? text('cost.updateSource')))))
      return ReactDOM.createPortal(panel, document.body)
    }

    function CostPill({ useProjection, t }) {
      const text = (key, params) => resolveText(t, key, params)
      const cost = useProjection('deepseekCost')
      const [open, setOpen] = React.useState(false)
      const [hovered, setHovered] = React.useState(false)
      const [focused, setFocused] = React.useState(false)
      const [position, setPosition] = React.useState(null)
      const [remotePricing, setRemotePricing] = React.useState(null)
      const [refreshing, setRefreshing] = React.useState(false)
      const [refreshStatus, setRefreshStatus] = React.useState(null)
      const buttonRef = React.useRef(null)
      const panelRef = React.useRef(null)
      const autoRefreshTried = React.useRef(false)

      React.useEffect(() => {
        if (!open) return undefined
        const close = () => setOpen(false)
        const onPointerDown = (event) => {
          if (buttonRef.current?.contains(event.target)) return
          if (panelRef.current?.contains(event.target)) return
          close()
        }
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return
          close()
          buttonRef.current?.focus()
        }
        const onScroll = (event) => {
          if (panelRef.current?.contains(event.target)) return
          close()
        }
        document.addEventListener('pointerdown', onPointerDown, true)
        document.addEventListener('keydown', onKeyDown)
        window.addEventListener('resize', close)
        window.addEventListener('scroll', onScroll, true)
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true)
          document.removeEventListener('keydown', onKeyDown)
          window.removeEventListener('resize', close)
          window.removeEventListener('scroll', onScroll, true)
        }
      }, [open])

      if (cost === undefined || cost === null) return null
      if (cost.requests === 0 && cost.unpricedRequests === 0) return null

      const amount = cost.requests === 0 ? '—' : formatCny(cost.totalCny)
      const model = cost.model ?? '—'
      const parts = [
        text('cost.title'),
        text('cost.model', { model }),
        text('cost.estimate'),
      ]
      if (cost.unpricedRequests > 0) parts.push(text('cost.unknown'))
      const title = parts.join(' · ')

      const refreshPrices = async () => {
        if (refreshing) return
        setRefreshing(true)
        setRefreshStatus(null)
        try {
          const response = await window.fetch('/deepseek-cost/prices', {
            method: 'GET',
            cache: 'no-store',
          })
          let payload = null
          try {
            payload = await response.json()
          } catch {
            payload = null
          }
          if (!response.ok || payload?.ok !== true) {
            throw new Error(payload?.error ?? `HTTP ${response.status}`)
          }
          if (payload.models === null || typeof payload.models !== 'object' || Array.isArray(payload.models)) {
            throw new Error('返回的价格表格式无效')
          }
          setRemotePricing(payload.models)
          const found = cost.model !== null && payload.models[cost.model] !== undefined
          const messageKey = payload.persisted !== true
            ? 'cost.updatedMemoryOnly'
            : found ? 'cost.updated' : 'cost.updatedNoModel'
          setRefreshStatus({
            kind: 'success',
            message: text(messageKey),
          })
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error)
          setRefreshStatus({
            kind: 'error',
            message: text('cost.updateFailed', { message: detail }),
            detail,
          })
        } finally {
          setRefreshing(false)
        }
      }

      const toggle = () => {
        if (open) {
          setOpen(false)
          return
        }
        const rect = buttonRef.current?.getBoundingClientRect()
        if (rect === undefined) return
        const width = Math.min(380, Math.max(280, window.innerWidth - 16))
        const left = Math.max(8, Math.min(rect.left + rect.width - width, window.innerWidth - width - 8))
        setPosition({
          left,
          width,
          bottom: window.innerHeight - rect.top + 8,
          maxHeight: Math.max(180, rect.top - 16),
        })
        setOpen(true)
        if (!autoRefreshTried.current) {
          autoRefreshTried.current = true
          if (cost.pricingCached !== true || cost.prices === null) void refreshPrices()
        }
      }

      const active = hovered || open
      return h(React.Fragment, null,
        h('span', {
          'data-deepseek-cost': true,
          style: anchorStyle,
        }, h('button', {
          ref: buttonRef,
          type: 'button',
          'aria-haspopup': 'dialog',
          'aria-expanded': open,
          'aria-label': text('cost.aria', { amount }),
          title,
          onClick: toggle,
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => setHovered(false),
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
          style: {
            ...pillStyle,
            background: active ? 'var(--dsw-alias-interactive-bg-hover)' : 'transparent',
            color: active ? 'var(--dsw-alias-label-secondary)' : 'var(--dsw-alias-label-tertiary)',
            boxShadow: focused
              ? '0 0 0 2px var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary))'
              : 'none',
          },
        }, h('span', { style: amountStyle }, amount))),
        open && h(PricePanel, {
          cost,
          t,
          panelRef,
          position,
          remotePricing,
          refreshing,
          status: refreshStatus,
          onRefresh: refreshPrices,
        }))
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, messages), 'deepseek-cost: dictionaries')
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'cost',
          order: 2,
          locale: NS,
        }, CostPill))
      },
    }
  },
})
