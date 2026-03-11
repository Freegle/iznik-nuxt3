// @ts-check
/**
 * Test that the Hold and Release buttons work on the ModTools pending page.
 *
 * Uses testmod@test.com (created by testenv.php) which is a moderator of
 * FreeglePlayground, with pending test messages.
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')
const { loginModToolsViaAPI } = require('./utils/user')

const MODTOOLS_URL = environment.modtoolsBaseUrl

test.describe('ModTools hold and release message', () => {
  test('holding a pending message should show Release button, releasing should restore Hold button', async ({
    page,
  }) => {
    // Step 1: Log in via API and inject auth tokens
    await loginModToolsViaAPI(page)

    // Step 2: Navigate to pending messages
    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    // Wait for group select to appear (indicates page is loaded and authenticated)
    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Select FreeglePlayground
    const playgroundOption = groupSelect.locator(
      'option:has-text("FreeglePlayground")'
    )
    await expect(playgroundOption.first()).toBeAttached({
      timeout: timeouts.ui.appearance,
    })
    const playgroundValue = await playgroundOption.first().getAttribute('value')
    expect(playgroundValue).toBeTruthy()
    await groupSelect.selectOption(playgroundValue)

    // Wait for message cards to load
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Step 3: Click the first message to expand it
    await messageCards.first().click()

    // Step 4: Find and click the Hold button
    const holdButton = page.locator('button:has-text("Hold")').first()
    await expect(holdButton).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // Listen for errors
    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await holdButton.click()

    // Step 5: After holding, the Release button should appear
    const releaseButton = page.locator('button:has-text("Release")').first()
    await expect(releaseButton).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // The Hold button should no longer be visible (replaced by Release)
    await expect(holdButton).not.toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // Step 6: Click Release to restore the message
    await releaseButton.click()

    // Step 7: After releasing, the Hold button should reappear
    const holdButtonAfter = page.locator('button:has-text("Hold")').first()
    await expect(holdButtonAfter).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // No page errors should have occurred
    expect(errors).toHaveLength(0)
  })
})
