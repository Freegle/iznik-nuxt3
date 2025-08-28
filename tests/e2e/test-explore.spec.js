// @ts-check
/**
 * Tests for the Explore page functionality
 * Tests navigation to explore pages and join button functionality
 */
const { test, expect } = require('./fixtures')
const { environment, timeouts } = require('./config')
const { signUpViaHomepage } = require('./utils/user')

test.describe('Explore Page Tests', () => {
  test('Navigate to explore page and test join button', async ({
    page,
    testEmail,
  }) => {
    // Sign up a new user first
    const displayName = 'Test User'
    const signupResult = await signUpViaHomepage(page, testEmail, displayName)
    expect(signupResult).toBeTruthy()

    // Navigate to the explore page with the configured test group
    const explorePath = `/explore/${environment.testgroup}`
    await page.gotoAndVerify(explorePath)

    // Wait for the page to load completely
    await page.waitForTimeout(timeouts.ui.settleTime)

    // Look for the join button - it should be a .btn element
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .first()

    // Wait for the join button to be visible
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Click the join button
    await joinButton.click()

    // Wait for the Leave button to appear, indicating successful join
    const leaveButton = page.locator('.btn:has-text("Leave")').first()

    // Wait for the Leave button to be visible as confirmation of successful join
    await leaveButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.interaction,
    })

    // Click the Leave button to test the leave functionality
    await leaveButton.click()

    // Wait for the Join button to reappear, indicating successful leave
    const joinButtonAfterLeave = page
      .locator('.btn:has-text("Join this community")')
      .first()

    // Wait for the Join button to be visible again as confirmation of successful leave
    await joinButtonAfterLeave.waitFor({
      state: 'visible',
      timeout: timeouts.ui.interaction,
    })
  })

  test('Explore page displays group information', async ({ page }) => {
    // Navigate to the explore page
    const explorePath = `/explore/${environment.testgroup}`
    await page.gotoAndVerify(explorePath)

    // Wait for content to load
    await page.waitForTimeout(timeouts.ui.settleTime)

    // Check that the page contains the group name in heading
    await page
      .locator(`h4:has-text("${environment.testgroup}")`)
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

    // Check for common explore page elements
    const expectedElements = ['text=/freeglers/i', 'text=/founded/i']

    for (const selector of expectedElements) {
      const element = page.locator(selector).first()
      await element.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
    }
  })
})
