/**
 * Logger utility for Playwright that logs commands before execution
 */

// Configuration options
const config = {
  // Set to true to enable command logging
  enabled: true,

  // Timestamp format: 'none', 'simple', 'iso'
  timestampFormat: 'simple',

  // Log level: 'minimal', 'normal', 'verbose'
  level: 'normal',

  // Methods to exclude from logging
  excludeMethods: [
    // These methods generate too much noise in normal logging
    'waitForFunction',
    'waitForSelector',
    'waitForTimeout',
    'waitForLoadState',
  ],

  // Only log these methods if level is 'verbose'
  verboseOnlyMethods: [
    'evaluate',
    'evaluateHandle',
    'press',
    'hover',
    'screenshot',
    'isVisible',
    'isHidden',
    'isEnabled',
    'isDisabled',
    'isChecked',
    'isEditable',
  ],
}

/**
 * Get a timestamp string based on configuration
 * @returns {string} Formatted timestamp or empty string
 */
function getTimestamp() {
  if (config.timestampFormat === 'none') return ''

  const now = new Date()

  if (config.timestampFormat === 'iso') {
    return `[${now.toISOString()}] `
  }

  // Simple timestamp format: HH:MM:SS.mmm
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const millis = String(now.getMilliseconds()).padStart(3, '0')

  return `[${hours}:${minutes}:${seconds}.${millis}] `
}

/**
 * Determine if a method should be logged based on configuration
 * @param {string} methodName - The name of the method being called
 * @returns {boolean} - True if method should be logged
 */
function shouldLogMethod(methodName) {
  if (!config.enabled) return false

  // Check if method is in exclude list
  if (config.excludeMethods.includes(methodName)) {
    return false
  }

  // Check if method should only be logged in verbose mode
  if (
    config.level !== 'verbose' &&
    config.verboseOnlyMethods.includes(methodName)
  ) {
    return false
  }

  return true
}

/**
 * Format arguments for logging
 * @param {Array} args - The arguments passed to the method
 * @returns {string} - Formatted argument string
 */
function formatArgs(args) {
  if (!args || args.length === 0) return ''

  return args
    .map((arg) => {
      // Handle different argument types appropriately
      if (arg === undefined) return 'undefined'
      if (arg === null) return 'null'

      if (typeof arg === 'string') {
        // Truncate long strings
        if (arg.length > 50) {
          return `"${arg.substring(0, 47)}..."`
        }
        return `"${arg}"`
      }

      if (typeof arg === 'object') {
        // Handle locators specially
        if (arg && arg.constructor && arg.constructor.name === 'Locator') {
          return `Locator(${arg.toString()})`
        }

        // For other objects, try to stringify but handle circular references
        try {
          const str = JSON.stringify(arg)
          if (str.length > 50) {
            return `${str.substring(0, 47)}...}`
          }
          return str
        } catch (e) {
          return '[Complex Object]'
        }
      }

      return String(arg)
    })
    .join(', ')
}

/**
 * Create a proxy that logs method calls before executing them
 * @param {Object} target - The target object to proxy
 * @param {string} targetName - Name of the target object for logging
 * @param {Set} visited - Set of already visited objects to prevent infinite recursion
 * @returns {Proxy} - Proxy object that logs method calls
 */
function createLoggingProxy(target, targetName, visited = new Set()) {
  // Skip if null, undefined, or already visited
  if (target === null || target === undefined || visited.has(target)) {
    return target
  }

  // Skip primitive values
  if (typeof target !== 'object' && typeof target !== 'function') {
    return target
  }

  // Skip Playwright Locators because their constructor.name must remain intact
  // to be able to use matchers like toHaveText(), toHaveValue(), etc.
  // This is because these methods check the receiver object's constructor.name:
  // https://github.com/microsoft/playwright/blob/e7bff526433b6dcb02801763ab5b1c6407902d47/packages/playwright/src/util.ts#L191
  if (target.constructor.name === 'Locator') {
    return target
  }

  // Mark as visited to prevent cycles
  visited.add(target)

  return new Proxy(target, {
    get(obj, prop) {
      const value = obj[prop]

      // If property is a method (function), create a logging wrapper
      if (typeof value === 'function' && prop !== 'then' && prop !== 'catch') {
        return function (...args) {
          // Only log if this method should be logged based on config
          if (shouldLogMethod(prop)) {
            const formattedArgs = formatArgs(args)
            console.log(
              `${getTimestamp()}${targetName}.${String(prop)}(${formattedArgs})`
            )
          }

          // Call the original method
          const result = value.apply(obj, args)

          // If result is a Promise, create a proxy for its result too
          if (result instanceof Promise) {
            return result.then((promiseResult) => {
              // Only proxy the result if it's an object (to avoid infinite recursion)
              if (promiseResult && typeof promiseResult === 'object') {
                // For common chained return values, create a proxy with the same target name
                if (promiseResult === obj) {
                  return createLoggingProxy(promiseResult, targetName, visited)
                }

                // For other results, create a proxy with a nested name
                const resultName = `${targetName}.${String(prop)}Result`
                return createLoggingProxy(promiseResult, resultName, visited)
              }
              return promiseResult
            })
          }

          // For non-Promise return values that are objects, create a proxy
          if (result && typeof result === 'object') {
            const resultName = `${targetName}.${String(prop)}Result`
            return createLoggingProxy(result, resultName, visited)
          }

          return result
        }
      }

      // For non-function properties that are objects, create a proxy for them too
      if (value && typeof value === 'object') {
        const propName = `${targetName}.${String(prop)}`
        return createLoggingProxy(value, propName, new Set(visited))
      }

      // Return the original value for non-function, non-object properties
      return value
    },
  })
}

/**
 * Create a logging proxy for a Playwright page
 * @param {Page} page - The Playwright page to wrap
 * @returns {Proxy} - A proxied page that logs commands
 */
function createLoggingPage(page) {
  return createLoggingProxy(page, 'page')
}

/**
 * Create a logging proxy for a Playwright locator
 * @param {Locator} locator - The Playwright locator to wrap
 * @returns {Proxy} - A proxied locator that logs commands
 */
function createLoggingLocator(locator) {
  return createLoggingProxy(locator, 'locator')
}

/**
 * Set logger configuration
 * @param {Object} options - Configuration options to override defaults
 */
function configure(options = {}) {
  Object.assign(config, options)
}

/**
 * Enable or disable logging
 * @param {boolean} enabled - Whether logging should be enabled
 */
function setEnabled(enabled) {
  config.enabled = !!enabled
}

module.exports = {
  createLoggingPage,
  createLoggingLocator,
  configure,
  setEnabled,
}
