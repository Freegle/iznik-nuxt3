import { test, expect } from '@playwright/test'

test.describe('Google Tag Manager pubads error', () => {
  test('should fail when pubads is not loaded but components try to use it', async ({
    page,
  }) => {
    // Navigate to a page that shows ads
    await page.goto('http://freegle-prod.localhost/')

    // Wait for googletag to be initialized
    await page.waitForTimeout(2000)

    // Check that googletag exists but pubads is undefined
    const pubadsExists = await page.evaluate(() => {
      return (
        typeof window.googletag !== 'undefined' &&
        typeof window.googletag.pubads === 'function'
      )
    })

    // This should fail because pubads() is not loaded
    // The test expects pubads to exist, but it doesn't, proving the bug
    expect(pubadsExists).toBe(true)
  })

  test('should reproduce the actual error when ad refresh is called', async ({
    page,
  }) => {
    const errors = []

    // Capture console errors
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Navigate to page with ads
    await page.goto('http://freegle-prod.localhost/')

    // Wait for potential ad rendering and refresh (31 seconds)
    await page.waitForTimeout(35000)

    // Check if the error occurred
    const hasError = errors.some(
      (err) =>
        err.includes('pubads is not a function') ||
        err.includes('window.googletag.pubads')
    )

    // This should fail because the error should occur, proving the bug exists
    expect(hasError).toBe(false)
  })
})
