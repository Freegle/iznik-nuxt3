const { test, expect } = require('@playwright/test')
const { logoutIfLoggedIn, signUpViaHomepage } = require('./utils/user')
const { setupNavigationHelpers } = require('./utils/navigation')
const { clickToggle } = require('./utils/ui')
const { testUsers, timeouts } = require('./config')

// Helper function to verify marketing consent in settings.
async function verifyMarketingConsentInSettings(page, expectedChecked) {
  console.log(
    `[DEBUG] verifyMarketingConsentInSettings: Expected consent = ${expectedChecked}`
  )

  await page.waitForLoadState('networkidle')
  await page.goto('/settings')
  await page.waitForLoadState('networkidle')
  console.log('[DEBUG] Navigated to /settings and waited for networkidle')

  // First, try to find the "Keeping in touch" text - scroll if needed
  const keepingInTouchText = page.locator('h3:has-text("Keeping in touch")')

  try {
    // Wait briefly to see if it's already visible
    await keepingInTouchText.waitFor({
      state: 'visible',
      timeout: 2000,
    })
    console.log('[DEBUG] "Keeping in touch" header found immediately')
  } catch {
    // If not visible, scroll the element into view
    console.log('[DEBUG] Scrolling "Keeping in touch" setting into view')
    await keepingInTouchText.scrollIntoViewIfNeeded()

    // Wait for it to become visible after scrolling
    await keepingInTouchText.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('[DEBUG] "Keeping in touch" header found after scrolling')
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
  console.log('[DEBUG] Toggle container is visible')

  // Check the toggle state by looking for the 'toggle-on' or 'toggle-off' class
  const innerToggle = toggleContainer.locator('.toggle')
  const isToggleOn = await innerToggle.evaluate((el) => {
    return el.classList.contains('toggle-on')
  })

  console.log(
    `[DEBUG] Toggle state: isToggleOn = ${isToggleOn}, expected = ${expectedChecked}`
  )

  // Get toggle classes for debugging
  const toggleClasses = await innerToggle.evaluate((el) => {
    return el.className
  })
  console.log(`[DEBUG] Toggle classes: "${toggleClasses}"`)

  if (expectedChecked) {
    expect(isToggleOn).toBe(true)
  } else {
    expect(isToggleOn).toBe(false)
  }

  console.log(`[DEBUG] Marketing consent verification completed successfully`)
  return ourToggle
}

// Helper function for signup marketing consent tests
async function testSignupWithMarketingConsent(
  page,
  marketingConsentValue,
  description
) {
  const testUser = testUsers.getRandomUser()

  // Use enhanced signUpViaHomepage with marketing consent parameter
  const success = await signUpViaHomepage(
    page,
    testUser.email,
    testUser.fullName,
    testUser.password,
    marketingConsentValue
  )
  expect(success).toBe(true)

  // Verify in settings
  await verifyMarketingConsentInSettings(page, marketingConsentValue)
}

// Helper function for login marketing consent tests
async function testLoginWithMarketingConsent(
  page,
  marketingConsentValue,
  description
) {
  console.log(
    `[DEBUG] testLoginWithMarketingConsent: Starting test with consent = ${marketingConsentValue}`
  )
  const testUser = testUsers.getRandomUser()
  console.log(`[DEBUG] Created test user: ${testUser.email}`)

  // First create user account with specified marketing consent
  console.log(`[DEBUG] Starting signup phase...`)
  const signupSuccess = await signUpViaHomepage(
    page,
    testUser.email,
    testUser.fullName,
    testUser.password,
    marketingConsentValue
  )
  expect(signupSuccess).toBe(true)
  console.log(`[DEBUG] Signup completed successfully`)

  // Verify in settings
  console.log(`[DEBUG] Starting settings verification...`)
  await verifyMarketingConsentInSettings(page, marketingConsentValue)
  console.log(`[DEBUG] testLoginWithMarketingConsent completed successfully`)
}

test.describe('Marketing Consent', () => {
  test.beforeEach(async ({ page }) => {
    setupNavigationHelpers(page)
    await logoutIfLoggedIn(page)
    await page.goto('/')
  })

  test.afterEach(async ({ page }) => {
    await logoutIfLoggedIn(page)
  })

  test('signup with marketing consent enabled should show enabled in settings', async ({
    page,
  }) => {
    await testSignupWithMarketingConsent(page, true, 'enabled')
  })

  test('signup with marketing consent disabled should show disabled in settings', async ({
    page,
  }) => {
    await testSignupWithMarketingConsent(page, false, 'disabled')
  })

  test('login with marketing consent enabled should show enabled in settings', async ({
    page,
  }) => {
    await testLoginWithMarketingConsent(page, true, 'enabled')
  })

  test('login with marketing consent disabled should show disabled in settings', async ({
    page,
  }) => {
    await testLoginWithMarketingConsent(page, false, 'disabled')
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
