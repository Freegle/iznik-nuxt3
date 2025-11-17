import { test, expect } from '@playwright/test'

test.describe('Sentry Issue: googletag.pubads is not a function', () => {
  test('should fail when GPT library is not loaded but pubads() is called', async ({
    page,
  }) => {
    // Navigate to a page that displays ads
    await page.goto('http://freegle-prod.localhost/')

    // Wait for the page to load and JavaScript to initialize
    await page.waitForLoadState('networkidle')

    // Check if googletag is initialized (it should be from nuxt.config.ts)
    const hasGoogletag = await page.evaluate(() => {
      return typeof window.googletag !== 'undefined'
    })
    expect(hasGoogletag).toBe(true)

    // Check if googletag.cmd exists (it should be initialized)
    const hasCmdQueue = await page.evaluate(() => {
      return Array.isArray(window.googletag?.cmd)
    })
    expect(hasCmdQueue).toBe(true)

    // This is the critical check - pubads should be a function if GPT library loaded
    // But since the script loading is commented out, this should FAIL
    const pubadsType = await page.evaluate(() => {
      return typeof window.googletag?.pubads
    })

    // This assertion expects pubads to be a function (which it should be)
    // But it will FAIL because GPT library is not loaded, proving the bug
    expect(pubadsType).toBe('function')

    // Additional verification: try to call pubads() and expect it to work
    // This will throw the exact error from Sentry if GPT is not loaded
    const canCallPubads = await page.evaluate(() => {
      try {
        // This is what OurPrebidDa.vue does at line 120, 172, etc.
        const result = window.googletag.pubads()
        return { success: true, result: typeof result }
      } catch (error) {
        return { success: false, error: error.message }
      }
    })

    // Expect this to succeed (pubads() should return an object)
    // But it will FAIL with the exact Sentry error, proving the bug exists
    expect(canCallPubads.success).toBe(true)
    expect(canCallPubads.error).toBeUndefined()
  })

  test('should fail when refreshing ads without GPT library', async ({
    page,
  }) => {
    // Set up console error monitoring to catch the actual error
    const consoleErrors = []
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    // Navigate to a page with ads
    await page.goto('http://freegle-prod.localhost/')
    await page.waitForLoadState('networkidle')

    // Wait a bit for any ad components to mount and try to initialize
    await page.waitForTimeout(5000)

    // Check if we captured the pubads error
    const hasPubadsError = consoleErrors.some(
      (msg) =>
        msg.includes('pubads is not a function') ||
        (msg.includes('pubads') && msg.includes('undefined'))
    )

    // This should be false (no errors), but will be true, proving the bug
    expect(hasPubadsError).toBe(false)
  })
})
