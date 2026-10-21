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
      'cost.sessionTotal': '本会话：{amount}',
      'cost.unit': '人民币 / 百万 tokens',
      'cost.inputHit': '输入 · 缓存命中',
      'cost.inputMiss': '输入 · 缓存未命中',
      'cost.output': '输出',
      'cost.offPeak': '空闲时段',
      'cost.peak': '高峰时段',
      'cost.peakNote': '高峰：北京时间周一至周五 09:00–12:00、14:00–18:00。',
      'cost.unavailable': '当前模型暂无价格清单。',
      'cost.notBill': '仅为估算，非最终账单。',
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
      padding: '12px 14px',
      color: 'var(--dsw-alias-label-primary)',
      background: 'var(--dsw-specific-menu)',
      backdropFilter: 'var(--dsw-menu-backdrop-filter)',
      border: '1px solid var(--dsw-alias-border-l1)',
      borderRadius: 'var(--dsw-radius-lg)',
      boxShadow: 'var(--dsw-elevation-prominent)',
      fontSize: 13,
      lineHeight: '20px',
      overflowY: 'auto',
    }
    const panelTopStyle = {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 12,
      color: 'var(--dsw-alias-label-tertiary)',
      fontSize: 12,
      lineHeight: '18px',
    }
    const modelNameStyle = {
      marginTop: 2,
      overflow: 'hidden',
      fontSize: 15,
      fontWeight: 600,
      lineHeight: '22px',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }
    const unitStyle = {
      marginTop: 1,
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 12,
      lineHeight: '18px',
    }
    const tableStyle = {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 86px 86px',
      columnGap: 8,
      marginTop: 10,
      paddingTop: 8,
      borderTop: '1px solid var(--dsw-alias-border-l1)',
      fontVariantNumeric: 'tabular-nums',
    }
    const headStyle = {
      paddingBottom: 4,
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 11,
      lineHeight: '16px',
      textAlign: 'right',
    }
    const rowLabelStyle = {
      padding: '5px 0',
      color: 'var(--dsw-alias-label-secondary)',
      lineHeight: '18px',
      overflowWrap: 'anywhere',
      whiteSpace: 'normal',
    }
    const rowPriceStyle = {
      padding: '5px 0',
      textAlign: 'right',
      whiteSpace: 'nowrap',
    }
    const noteStyle = {
      marginTop: 8,
      paddingTop: 8,
      borderTop: '1px solid var(--dsw-alias-border-l1)',
      color: 'var(--dsw-alias-label-caption)',
      fontSize: 11,
      lineHeight: '17px',
    }
    const footerStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 8,
      paddingTop: 8,
      borderTop: '1px solid var(--dsw-alias-border-l1)',
    }
    const updateButtonStyle = {
      flex: 'none',
      padding: '4px 10px',
      border: '1px solid var(--dsw-alias-border-l2)',
      borderRadius: 'var(--dsw-radius-sm)',
      background: 'var(--dsw-alias-interactive-bg-hover)',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: 12,
      lineHeight: '18px',
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
        h('div', { style: panelTopStyle },
          h('span', null, label),
          h('span', { style: { fontVariantNumeric: 'tabular-nums' } },
            text('cost.sessionTotal', { amount: formatCny(cost.totalCny) }))),
        h('div', { style: modelNameStyle, title: cost.model ?? undefined },
          shownModelName),
        h('div', { style: unitStyle }, text('cost.unit')),
        prices === null
          ? h('div', { style: { ...noteStyle, borderTop: 'none' } }, text('cost.unavailable'))
          : h('div', { style: tableStyle },
            h('span', null),
            h('span', { style: headStyle }, text('cost.offPeak')),
            h('span', { style: headStyle }, text('cost.peak')),
            h('span', { style: rowLabelStyle }, text('cost.inputHit')),
            h('span', { style: rowPriceStyle }, formatRate(prices.cacheHit.offPeak)),
            h('span', { style: rowPriceStyle }, formatRate(prices.cacheHit.peak)),
            h('span', { style: rowLabelStyle }, text('cost.inputMiss')),
            h('span', { style: rowPriceStyle }, formatRate(prices.cacheMiss.offPeak)),
            h('span', { style: rowPriceStyle }, formatRate(prices.cacheMiss.peak)),
            h('span', { style: rowLabelStyle }, text('cost.output')),
            h('span', { style: rowPriceStyle }, formatRate(prices.output.offPeak)),
            h('span', { style: rowPriceStyle }, formatRate(prices.output.peak))),
        h('div', { style: noteStyle },
          h('div', null, text('cost.peakNote')),
          h('div', null, text('cost.notBill'))),
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
          }, text(refreshing ? 'cost.updating' : 'cost.update')),
          h('span', {
            style: {
              ...updateStatusStyle,
              color: status?.kind === 'error'
                ? 'var(--dsw-alias-state-error-primary)'
                : status?.kind === 'success'
                  ? 'var(--dsw-alias-state-success-primary)'
                  : 'var(--dsw-alias-label-caption)',
            },
            title: status?.detail,
          }, status?.message ?? text('cost.updateSource'))))
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
        const width = Math.min(360, Math.max(260, window.innerWidth - 16))
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
