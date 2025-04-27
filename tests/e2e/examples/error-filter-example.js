const { test } = require('../fixtures')

test.describe('Error filtering examples', () => {
  test('using predefined allowed error patterns', async ({ page }) => {
    // The core allowed error patterns are already defined in fixtures.js:
    // - Provider's accounts list is empty
    // - Failed to load resource: net::ERR_FAILED
    // - Loading chunk .* failed
    // - ResizeObserver loop limit exceeded

    await page.gotoAndVerify('/')

    // This will pass even if the above errors occur
    await page.expectNoConsoleErrors()
  })

  test('adding page-specific allowed error pattern', async ({ page }) => {
    // Add a custom allowed error pattern just for this test
    page.addAllowedErrorPattern(/Google Maps API error/)

    // You can also use a string (exact match)
    page.addAllowedErrorPattern('Missing API key for Google Maps')

    await page.gotoAndVerify('/explore/place/someplace')

    // This will not fail on Google Maps API errors
    await page.expectNoConsoleErrors()
  })

  test('using error summary for debugging', async ({ page }) => {
    await page.gotoAndVerify('/')

    // Get a summary of errors to examine
    const summary = page.getErrorSummary()

    console.log(`Total errors: ${summary.total}`)
    console.log(`Allowed errors: ${summary.allowedCount}`)
    console.log(`Non-allowed errors: ${summary.notAllowedCount}`)

    // Can look at specific errors
    if (summary.notAllowed.length > 0) {
      console.log('First non-allowed error:', summary.notAllowed[0].text)
    }

    // The actual test assertion
    await page.expectNoConsoleErrors()
  })
})
