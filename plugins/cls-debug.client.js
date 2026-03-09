export default defineNuxtPlugin(() => {
  if (typeof PerformanceObserver === 'undefined') return

  const CLS_THRESHOLD = 0.1
  let clsValue = 0
  let reported = false
  const shifts = []

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value

        const sources = entry.sources || []
        const details = sources.map((s) => {
          const el = s.node
          const selector = el
            ? el.id
              ? '#' + el.id
              : el.className && el.tagName
              ? el.tagName.toLowerCase() +
                '.' +
                String(el.className).split(' ').slice(0, 2).join('.')
              : (el.tagName || 'unknown').toLowerCase()
            : '(removed)'
          return {
            selector,
            previousRect: `${s.previousRect.width}x${s.previousRect.height} @ ${s.previousRect.x},${s.previousRect.y}`,
            currentRect: `${s.currentRect.width}x${s.currentRect.height} @ ${s.currentRect.x},${s.currentRect.y}`,
          }
        })

        shifts.push({
          value: entry.value.toFixed(4),
          cumulative: clsValue.toFixed(4),
          time: Math.round(entry.startTime),
          sources: details,
        })
      }
    }
  })

  observer.observe({ type: 'layout-shift', buffered: true })

  function reportToSentry() {
    if (reported || clsValue < CLS_THRESHOLD) return
    reported = true

    const top5 = shifts
      .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
      .slice(0, 5)

    import('@sentry/browser').then((Sentry) => {
      Sentry.withScope((scope) => {
        scope.setLevel('warning')
        scope.setTag('cls_value', clsValue.toFixed(3))
        scope.setTag('viewport', `${window.innerWidth}x${window.innerHeight}`)
        scope.setContext('cls_shifts', {
          total_cls: clsValue.toFixed(4),
          shift_count: shifts.length,
          top_shifts: top5.map(
            (s) =>
              `${s.value} @ ${s.time}ms: ${s.sources
                .map((src) => src.selector)
                .join(', ')}`
          ),
        })
        Sentry.captureMessage(`CLS ${clsValue.toFixed(3)} exceeds threshold`)
      })
    })
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportToSentry()
    }
  })

  window.__getCLS = () => {
    console.table(shifts)
    return { cls: clsValue.toFixed(4), shifts }
  }
})
