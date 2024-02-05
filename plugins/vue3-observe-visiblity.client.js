const observers = new WeakMap()

const intersectionObserverDirective = {
  beforeMount(el, binding) {
    let callback
    let options = {}
    let throttle = 0

    // Check if binding.value is a function or an object
    if (typeof binding.value === 'function') {
      callback = binding.value
    } else {
      ;({ callback, options, throttle } = binding.value)
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

        // Throttle callback execution
        if (timer === undefined) {
          timer = window.setTimeout(() => {
            // Provide additional visibility info in the callback
            callback(isVisible, {
              isTopVisible,
              isBottomVisible,
              entry,
              observer,
            })
            timer = undefined
          }, throttle || 0)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, options)

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
