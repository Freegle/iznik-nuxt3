// @ts-check
/**
 * Test that the Hold and Release buttons work on the ModTools pending page.
 *
 * Uses testmod@test.com (created by testenv.php) which is a moderator of
 * FreeglePlayground and FreeglePlayground2, with pending test messages on Playground2.
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

    // Dismiss the cake modal if it appears (it overlays the page after load).
    // Use JS to remove the modal and backdrop since clicking Close can leave
    // the backdrop behind due to animation timing.
    await page.evaluate(() => {
      const modal = document.getElementById('modcakemodal')
      if (modal) {
        modal.classList.remove('show')
        modal.style.display = 'none'
      }
      document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('padding-right')
    })
    await page.waitForTimeout(500)

    // Select a group that has pending messages.
    // Find first group option that has a count indicator (e.g. "Freegle Playground2 (2)")
    const groupOptions = await groupSelect.locator('option').all()
    let targetGroupValue = null
    for (const option of groupOptions) {
      const text = await option.textContent()
      const value = await option.getAttribute('value')
      if (value && value !== '0' && /\(\d+\)/.test(text)) {
        targetGroupValue = value
        break
      }
    }
    expect(targetGroupValue).toBeTruthy()
    await groupSelect.selectOption(targetGroupValue)

    // Wait for message cards to load
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Listen for errors
    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Step 3: Scope Hold/Release to the first message card
    const firstCard = messageCards.first()

    // Find and click the Hold button within the first card
    const holdButton = firstCard.locator('button:has-text("Hold")')
    await expect(holdButton).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    await holdButton.click()

    // Handle confirmation dialog if it appears
    const confirmButton = page.locator(
      '.modal button:has-text("Confirm"), dialog button:has-text("Confirm")'
    )
    try {
      await confirmButton.first().waitFor({ state: 'visible', timeout: 5000 })
      await confirmButton.first().click()
    } catch {
      // No confirmation needed
    }

    // Step 4: After holding, the Release button should appear within the first card
    const releaseButton = firstCard.locator('button:has-text("Release")')
    await expect(releaseButton).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // The Hold button within the first card should no longer be visible
    await expect(holdButton).not.toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // Step 5: Click Release to restore the message
    await releaseButton.click()

    // Handle confirmation dialog if it appears
    try {
      await confirmButton.first().waitFor({ state: 'visible', timeout: 5000 })
      await confirmButton.first().click()
    } catch {
      // No confirmation needed
    }

    // Step 6: After releasing, the Hold button should reappear within the first card
    await expect(holdButton).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // No page errors should have occurred
    expect(errors).toHaveLength(0)
  })
})
