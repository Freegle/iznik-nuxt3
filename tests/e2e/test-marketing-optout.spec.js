const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Marketing opt-out page', () => {
  test('should load and show failure for missing params', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/marketing-optout')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Without valid u/k params, should show failure message.
    await expect(page.locator('h1')).toContainText('Opt-out failed', {
      timeout: timeouts.ui.appearance,
    })

    // Should show link to settings page.
    await expect(page.locator('a[href*="settings"]')).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
  })

  test('should show failure for invalid key', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/marketing-optout?u=999999&k=invalidkey')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Invalid credentials should show failure message.
    await expect(page.locator('h1')).toContainText('Opt-out failed', {
      timeout: timeouts.ui.appearance,
    })
  })
})
