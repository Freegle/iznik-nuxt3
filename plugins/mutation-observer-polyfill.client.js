// MutationObserver polyfill to prevent TypeError with invalid Node parameters
// This runs early in the application lifecycle, before other libraries load

export default defineNuxtPlugin(() => {
  // Only run on client-side
  if (process.client) {
    // Store the original observe method
    const originalObserve = MutationObserver.prototype.observe

    // Override the observe method with parameter validation
    MutationObserver.prototype.observe = function (target, options) {
      // Check if target is a valid Node before calling original observe
      if (!target || typeof target.nodeType !== 'number') {
        console.warn(
          'MutationObserver.observe called with invalid target, ignoring:',
          target
        )
        return
      }

      // Call the original observe method with validated parameters
      return originalObserve.call(this, target, options)
    }

    console.log(
      'MutationObserver polyfill loaded - invalid Node parameters will be handled gracefully'
    )
  }
})
