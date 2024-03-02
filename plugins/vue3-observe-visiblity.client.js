const observers = new WeakMap()

const intersectionObserverDirective = {
  beforeMount(el, binding) {
    let callback
    let options = {}
    let entryTopWasVisible = false
    let entryBottomWasVisible = false
    let entryWasObserved = false

    // Check if binding.value is a function or an object
    if (typeof binding.value === 'function') {
      callback = binding.value
    } else {
      ;({ callback, options } = binding.value)
    }
    let timer

    const observerCallback = (entries, observer) => {
      entries.forEach((entry) => {
        const isVisible = entry.isIntersecting
        const { boundingClientRect, intersectionRect } = entry

        // Calculate visibility of the top and bottom of the element
        const isTopVisible =
          isVisible && intersectionRect.top >= boundingClientRect.top
        const isBottomVisible =
          isVisible && intersectionRect.bottom >= boundingClientRect.bottom

        if (options.observeFullElement && entry.isIntersecting) {
          if (entry.target.classList.contains('top-sentinel')) {
            entryTopWasVisible = true
          } else if (entry.target.classList.contains('bottom-sentinel')) {
            entryBottomWasVisible = true
          }

          entryWasObserved = entryTopWasVisible && entryBottomWasVisible
        }

        const cb = () => {
          callback(isVisible, {
            isTopVisible,
            isBottomVisible,
            entryWasObserved,
            entry,
            observer,
          })
        }

        const executeCallback = () => {
          if (options.observeFullElement) {
            entryWasObserved && cb()
            entryWasObserved = false
          } else {
            cb()
          }
        }

        // Throttle callback execution
        if (timer === undefined && options.throttle) {
          timer = window.setTimeout(() => {
            // Provide additional visibility info in the callback
            executeCallback()
            timer = undefined
          }, options.throttle || 0)
        } else {
          executeCallback()
        }
        // Provide additional visibility info in the callback
        if (options.observeFullElement) {
          entryWasObserved && cb()
          entryWasObserved = false
        } else {
          cb()
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, options)

    if (options.observeFullElement) {
      const topSentinel = document.createElement('div')
      topSentinel.classList.add('top-sentinel')
      el.prepend(topSentinel)

      const bottomSentinel = document.createElement('div')
      bottomSentinel.classList.add('bottom-sentinel')
      el.appendChild(bottomSentinel)

      const sentinels = [topSentinel, bottomSentinel]
      sentinels.forEach((item, index) => {
        item.style.height = '1px'
        item.style.width = '1px'
        item.style.position = 'absolute'
        item.style[index === 0 ? 'top' : 'bottom'] = '0'
        observer.observe(item)
      })
      return
    }

    observers.set(el, observer)
    observer.observe(el)
  },
  unmounted(el) {
    const observer = observers.get(el)
    if (observer) {
      observer.disconnect()
      observers.delete(el)
    }
  },
}

// Usage with Nuxt.js or Vue application
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('observe-visibility', intersectionObserverDirective)
})
