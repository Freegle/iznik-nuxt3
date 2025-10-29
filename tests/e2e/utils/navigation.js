/**
 * Navigation utility functions for Playwright tests
 */

const { timeouts } = require('../config')

/**
 * Extends the Page object with custom navigation helpers
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
function setupNavigationHelpers(page) {
  /**
   * Navigate to a URL and verify it loaded correctly
   * @param {string} url - URL to navigate to
   * @param {Object} [options] - Navigation options
   * @returns {Promise<boolean>} - Whether navigation was successful
   */
  page.gotoAndVerify = async function (url, options = {}) {
    const response = await this.goto(url, {
      timeout: options.timeout || timeouts.navigation.default,
      waitUntil: options.waitUntil || 'domcontentloaded',
    })

    // Wait for the page to be ready - try multiple strategies
    // Skip additional waiting if specific waitUntil was provided
    if (options.waitUntil && options.waitUntil !== 'domcontentloaded') {
      return response?.ok() ?? false
    }

    try {
      // First try waiting for load state if not already specified
      await this.waitForLoadState('load', { timeout: timeouts.ui.appearance })
    } catch (error) {
      console.log(
        'Load state wait failed, continuing without additional wait:',
        error.message
      )
      // Don't use any timer fallback - just continue
    }

    return response?.ok() ?? false
  }

  /**
   * Navigate to a URL and wait for a specific element to be visible
   * @param {string} url - URL to navigate to
   * @param {string} waitForSelector - Selector to wait for after navigation
   * @param {Object} [options] - Navigation options
   * @returns {Promise<boolean>} - Whether navigation was successful
   */
  page.gotoAndWaitFor = async function (url, waitForSelector, options = {}) {
    await this.goto(url, {
      timeout: options.timeout || timeouts.navigation.default,
    })

    await this.waitForSelector(waitForSelector, {
      state: 'visible',
      timeout: options.elementTimeout || timeouts.ui.appearance,
    })

    return true
  }

  /**
   * Manually wait for network requests to be completed
   * @param {Object} [options] - Options for waiting
   * @returns {Promise<void>}
   */
  page.waitForNetworkIdle = function (options = {}) {
    const timeout = options.timeout || timeouts.api.default
    const idlePeriod = options.idlePeriod || 500

    return new Promise((resolve) => {
      let isIdle = false
      let pendingRequests = 0
      let resolveTimeout = null

      const checkCompletion = () => {
        if (isIdle && pendingRequests === 0) {
          clearTimeout(resolveTimeout)
          resolveTimeout = setTimeout(resolve, idlePeriod)
        } else {
          clearTimeout(resolveTimeout)
        }
      }

      this.on('request', () => {
        pendingRequests++
        isIdle = false
        clearTimeout(resolveTimeout)
      })

      this.on('requestfinished', () => {
        pendingRequests--
        checkCompletion()
      })

      this.on('requestfailed', () => {
        pendingRequests--
        checkCompletion()
      })

      setTimeout(() => {
        console.log('Network idle wait timed out')
        resolve()
      }, timeout)

      // Initially we're idle until a request comes in
      isIdle = true
      checkCompletion()
    })
  }

  return page
}

module.exports = {
  setupNavigationHelpers,
}
