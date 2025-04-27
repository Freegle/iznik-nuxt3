const base = require('@playwright/test')

// Define a custom test function that wraps the base test to add automatic screenshot capture
const test = base.test.extend({
  page: async ({ page }, use) => {
    const consoleErrors = []

    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push({
          text: message.text(),
          location: message.location(),
        })
      }
    })

    page.consoleErrors = () => consoleErrors

    // Method to get all console errors grouped by allowed vs non-allowed
    page.getErrorSummary = () => {
      const allowed = consoleErrors.filter((err) => isAllowedError(err.text))
      const notAllowed = consoleErrors.filter(
        (err) => !isAllowedError(err.text)
      )

      return {
        allowed,
        notAllowed,
        total: consoleErrors.length,
        allowedCount: allowed.length,
        notAllowedCount: notAllowed.length,
      }
    }

    // List of allowed console error patterns (using regex)
    const allowedErrorPatterns = [
      /%cssr:error%c API count went negative/, // Low importance and not visible to client.
      /Provider's accounts list is empty/, // Google Pay related error - can happen in dev
      /FedCM get\(\) rejects with NetworkError/, // Not available in test
      /Hydration completed but contains mismatches/, // Not ideal, but not visible to user
      /ResizeObserver loop limit exceeded/, // Non-critical UI warning
    ]

    // Method to add additional allowed error patterns for specific tests
    page.addAllowedErrorPattern = (pattern) => {
      if (pattern instanceof RegExp) {
        allowedErrorPatterns.push(pattern)
      } else if (typeof pattern === 'string') {
        // If a string is provided, convert it to a RegExp that matches the exact string
        allowedErrorPatterns.push(
          new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        )
      } else {
        throw new TypeError('Error pattern must be a RegExp or string')
      }
    }

    // Helper to check if an error message matches any allowed pattern
    const isAllowedError = (errorText) => {
      return allowedErrorPatterns.some((pattern) => pattern.test(errorText))
    }

    page.checkTestRanOK = async () => {
      // Get error summary
      const { allowed, notAllowed, allowedCount, notAllowedCount, total } =
        page.getErrorSummary()

      // If there are relevant (non-allowed) errors, fail the test
      if (notAllowedCount > 0) {
        // Take a screenshot when console errors are found
        await page.screenshot({
          path: `console-errors-${Date.now()}.png`,
          fullPage: true,
        })

        const errorDetails = notAllowed
          .map((err) => {
            const location = err.location
              ? `${err.location.url}:${err.location.lineNumber}`
              : 'unknown location'
            return `  • ${err.text} (at ${location})`
          })
          .join('\n')

        throw new Error(
          `Found ${notAllowedCount} console errors (${total} total, ${allowedCount} allowed):\n${errorDetails}`
        )
      }
    }

    // For backwards compatibility
    page.expectNoConsoleErrors = page.checkTestRanOK

    page.gotoAndVerify = async (path, options = {}) => {
      const timeout = options.timeout || 30000

      try {
        // Navigate with timeout
        await page.goto(path, { timeout })

        // Wait for network idle with timeout
        await page.waitForLoadState('networkidle', { timeout })

        // Verify page content is visible
        const body = page.locator('body')
        await body.waitFor({ state: 'visible', timeout })

        // Check if page contains error messages
        const errorTextContent = await page.textContent('body')

        // Check for general error message
        if (errorTextContent.includes('Something went wrong')) {
          // Take a screenshot of the error page
          await page.screenshot({
            path: `error-page-${Date.now()}.png`,
            fullPage: true,
          })
          throw new Error(
            `Page loaded with 'Something went wrong' error message at ${path}`
          )
        }

        // Check for 404 error message
        if (
          errorTextContent.includes("Oh no! That page doesn't seem to exist")
        ) {
          // Take a screenshot of the 404 page
          await page.screenshot({
            path: `404-error-${Date.now()}.png`,
            fullPage: true,
          })
          throw new Error(
            `Page loaded with '404 page not found' error message at ${path}`
          )
        }
      } catch (error) {
        // Take a screenshot if navigation fails
        await page.screenshot({ path: `navigation-error-${Date.now()}.png` })

        // Re-throw with more context
        throw new Error(`Failed to navigate to ${path}: ${error.message}`)
      }

      return page
    }

    // Internal method to handle teardown with error handling
    const performTeardown = async (options = {}) => {
      const timeout = options.timeout || 5000
      try {
        await page.waitForLoadState('networkidle', { timeout })
        return true
      } catch (error) {
        console.warn(`Teardown warning: ${error.message}`)
        // Take a screenshot if network doesn't become idle
        await page.screenshot({ path: `teardown-warning-${Date.now()}.png` })
        return false
      }
    }

    // Public method for manual teardown invocation
    page.waitForTeardown = async (options = {}) => {
      return await performTeardown(options)
    }

    // Wrap the use() call in a try-catch block to add automatic screenshot capturing
    try {
      // Call use() to run the test
      await use(page)

      // Automatically check for console errors at the end of each test
      await page.checkTestRanOK()
    } catch (error) {
      // Take a full page screenshot on any test failure
      const screenshotPath = `test-failure-${Date.now()}.png`
      await page.screenshot({ path: screenshotPath, fullPage: true })

      // Log the error with screenshot info
      console.error(
        `Test failed: ${error.message}\nScreenshot saved to: ${screenshotPath}`
      )

      // Re-throw the error to fail the test
      throw error
    } finally {
      // Always perform teardown operations, regardless of test success/failure
      await performTeardown()
    }
  },
})

// Export our enhanced test function and expect
exports.test = test
exports.expect = base.expect
