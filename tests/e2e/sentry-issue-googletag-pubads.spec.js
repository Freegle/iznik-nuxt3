import { test, expect } from '@playwright/test'

test.describe('Sentry Issue: googletag.pubads is not a function', () => {
  test('should fail when GPT library is not loaded but pubads is called', async ({
    page,
  }) => {
    const consoleErrors = []
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    await page.goto('http://freegle-prod.localhost/')

    await page.waitForTimeout(2000)

    await page.evaluate(() => {
      const hasGoogletag = typeof window.googletag !== 'undefined'
      const hasPubadsFunction =
        hasGoogletag && typeof window.googletag.pubads === 'function'

      if (hasGoogletag && !hasPubadsFunction) {
        throw new Error('window.googletag exists but pubads is not a function')
      }
    })

    const errorFound = consoleErrors.some(
      (msg) =>
        msg.includes('pubads is not a function') ||
        msg.includes('googletag.pubads')
    )

    expect(errorFound).toBe(false)
  })

  test('should verify GPT library loads before ads are rendered', async ({
    page,
  }) => {
    await page.goto('http://freegle-prod.localhost/browse')

    await page.waitForTimeout(3000)

    const gptStatus = await page.evaluate(() => {
      return {
        googletag: typeof window.googletag,
        pubads: typeof window.googletag?.pubads,
        cmd: Array.isArray(window.googletag?.cmd),
      }
    })

    expect(gptStatus.googletag).toBe('object')
    expect(gptStatus.pubads).toBe('function')
    expect(gptStatus.cmd).toBe(true)
  })
})
