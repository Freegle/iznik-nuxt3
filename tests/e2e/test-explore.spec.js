// @ts-check
/**
 * Tests for the Explore page functionality
 * Tests navigation to explore pages and join button functionality
 */
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { signUpViaHomepage } = require('./utils/user')

test.describe('Explore Page Tests', () => {
  test('Navigate to explore page and test join button', async ({
    page,
    testEmail,
    testEnv,
  }) => {
    // Sign up a new user first
    const displayName = 'Test User'
    const signupResult = await signUpViaHomepage(page, testEmail, displayName)
    expect(signupResult).toBeTruthy()

    // Navigate to the explore page with the configured test group
    const explorePath = `/explore/${testEnv.group.name}`
    await page.gotoAndVerify(explorePath)

    // Wait for the page to load completely
    await page.waitForTimeout(timeouts.ui.settleTime)

    // Look for the join button - it should be a .btn element
    // Use filter({ visible: true }) to avoid hidden mobile variant
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .filter({ visible: true })
      .first()

    // Wait for the join button to be visible
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Click the join button
    await joinButton.click()

    // Wait for the Leave button to appear, indicating successful join
    // Use filter({ visible: true }) to avoid hidden mobile variant
    const leaveButton = page
      .locator('.btn:has-text("Leave")')
      .filter({ visible: true })
      .first()

    // After clicking Join, wait for either Leave (success) or login modal (auth lost)
    const loginModal = page.locator(
      '#loginModal, .modal-dialog:has-text("Join the Reuse Revolution")'
    )
    await expect(leaveButton.or(loginModal)).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    if (await loginModal.isVisible().catch(() => false)) {
      // Session was lost — dismiss modal and skip this test iteration
      console.log('Login modal appeared after Join click — session lost')
      throw new Error(
        'Session lost during join — login modal appeared instead of Leave button'
      )
    }

    // Click the Leave button to test the leave functionality
    await leaveButton.click()

    // Wait for the Join button to reappear, indicating successful leave
    const joinButtonAfterLeave = page
      .locator('.btn:has-text("Join this community")')
      .filter({ visible: true })
      .first()

    // Wait for the Join button to be visible again as confirmation of successful leave
    await joinButtonAfterLeave.waitFor({
      state: 'visible',
      timeout: timeouts.ui.interaction,
    })
  })

  test('Explore page displays group information', async ({ page, testEnv }) => {
    // Navigate to the explore page
    const explorePath = `/explore/${testEnv.group.name}`
    await page.gotoAndVerify(explorePath)

    // Wait for content to load
    await page.waitForTimeout(timeouts.ui.settleTime)

    // Check that the page contains the group name in heading
    await page
      .locator(`h4:has-text("${testEnv.group.name}")`)
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })
})
