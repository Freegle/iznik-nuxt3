const { test, expect } = require('@playwright/test')
const {
  logoutIfLoggedIn,
  signUpViaHomepage,
  loginViaHomepage,
} = require('./utils/user')
const { setupNavigationHelpers } = require('./utils/navigation')
const { clickToggle } = require('./utils/ui')
const { testUsers, timeouts } = require('./config')

// Helper function to verify marketing consent in settings
async function verifyMarketingConsentInSettings(page, expectedChecked) {
  await page.goto('/settings')
  await page.waitForLoadState('networkidle')

  // First, try to find the "Keeping in touch" text - scroll if needed
  const keepingInTouchText = page.locator('h3:has-text("Keeping in touch")')

  try {
    // Wait briefly to see if it's already visible
    await keepingInTouchText.waitFor({
      state: 'visible',
      timeout: 2000,
    })
  } catch {
    // If not visible, scroll the element into view
    console.log('Scrolling "Keeping in touch" setting into view')
    await keepingInTouchText.scrollIntoViewIfNeeded()

    // Wait for it to become visible after scrolling
    await keepingInTouchText.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
  }

  // Now find the toggle associated with "Keeping in touch"
  // Look for the specific "Keeping in touch" header in the settings section, then find its form group
  const toggleSection = page
    .locator('h3:has-text("Keeping in touch")')
    .locator('..')
  const ourToggle = toggleSection

  const toggleContainer = ourToggle.locator('.toggle-container')
  await toggleContainer.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })

  // Check the toggle state by looking for the 'toggle-on' or 'toggle-off' class
  const innerToggle = toggleContainer.locator('.toggle')
  const isToggleOn = await innerToggle.evaluate((el) => {
    return el.classList.contains('toggle-on')
  })

  if (expectedChecked) {
    expect(isToggleOn).toBe(true)
  } else {
    expect(isToggleOn).toBe(false)
  }

  return ourToggle
}

// Data provider for marketing consent test scenarios
const marketingConsentScenarios = [
  { name: 'enabled', value: true, description: 'enabled' },
  { name: 'disabled', value: false, description: 'disabled' },
]

test.describe('Marketing Consent', () => {
  test.beforeEach(async ({ page }) => {
    setupNavigationHelpers(page)
    await logoutIfLoggedIn(page)
    await page.goto('/')
  })

  test.afterEach(async ({ page }) => {
    await logoutIfLoggedIn(page)
  })

  marketingConsentScenarios.forEach((scenario) => {
    test(`signup with marketing consent ${scenario.description} should show ${scenario.description} in settings`, async ({
      page,
    }) => {
      const testUser = testUsers.getRandomUser()

      // Use enhanced signUpViaHomepage with marketing consent parameter
      const success = await signUpViaHomepage(
        page,
        testUser.email,
        testUser.fullName,
        testUser.password,
        scenario.value
      )
      expect(success).toBe(true)

      // Verify in settings
      await verifyMarketingConsentInSettings(page, scenario.value)
    })
  })

  marketingConsentScenarios.forEach((scenario) => {
    test(`login with marketing consent ${scenario.description} should show ${scenario.description} in settings`, async ({
      page,
    }) => {
      const testUser = testUsers.getRandomUser()

      // First create user account with specified marketing consent
      const signupSuccess = await signUpViaHomepage(
        page,
        testUser.email,
        testUser.fullName,
        testUser.password,
        scenario.value
      )
      expect(signupSuccess).toBe(true)

      await logoutIfLoggedIn(page)

      // Now login again and verify consent state persists using enhanced loginViaHomepage
      const loginSuccess = await loginViaHomepage(
        page,
        testUser.email,
        testUser.password,
        scenario.value // expectedMarketingConsent
      )
      expect(loginSuccess).toBe(true)

      // Verify in settings
      await verifyMarketingConsentInSettings(page, scenario.value)
    })
  })

  test('toggling marketing consent in settings should persist after page refresh', async ({
    page,
  }) => {
    const testUser = testUsers.getRandomUser()

    // Create account with default marketing consent (enabled)
    const success = await signUpViaHomepage(
      page,
      testUser.email,
      testUser.fullName,
      testUser.password,
      true // marketingConsent enabled
    )
    expect(success).toBe(true)

    // Navigate to settings and get initial toggle
    let settingsToggle = await verifyMarketingConsentInSettings(page, true)

    // Toggle it off using the clickToggle utility
    await clickToggle(settingsToggle)

    // Wait for the change to be saved
    await page.waitForTimeout(timeouts.ui.settleTime)

    // Refresh and verify persistence
    await page.reload()
    settingsToggle = await verifyMarketingConsentInSettings(page, false)

    // Toggle it back on using the clickToggle utility
    await clickToggle(settingsToggle)

    // Wait and refresh again
    await page.waitForTimeout(timeouts.ui.settleTime)
    await page.reload()
    await verifyMarketingConsentInSettings(page, true)
  })
})
