export default defineNuxtPlugin(() => {
  if (typeof PerformanceObserver === 'undefined') return

  let clsValue = 0
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
              : el.className
                ? el.tagName.toLowerCase() +
                  '.' +
                  String(el.className).split(' ').slice(0, 2).join('.')
                : el.tagName.toLowerCase()
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

        console.warn(
          `[CLS] shift=${entry.value.toFixed(4)} cumulative=${clsValue.toFixed(4)} time=${Math.round(entry.startTime)}ms`,
          details
        )
      }
    }
  })

  observer.observe({ type: 'layout-shift', buffered: true })

  window.__getCLS = () => {
    console.table(shifts)
    return { cls: clsValue.toFixed(4), shifts }
  }
})
