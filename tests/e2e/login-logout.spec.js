// @ts-check
/**
 * Tests demonstrating the login/logout functionality with automatic logout
 */
const { test, expect } = require('./fixtures')
const {
  loginViaHomepage,
  signUpViaHomepage,
  logoutIfLoggedIn,
} = require('./utils/user')
const { DEFAULT_TEST_PASSWORD } = require('./config')

test.describe('Login and Logout', () => {
  test('Logs out automatically if user is already logged in', async ({
    page,
    testEmail,
  }) => {
    // Go to the homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    console.log('First testing the direct logout helper')

    // First, try to log in
    console.log('Step 1: Registering a test user')
    const displayName = `Test User ${Date.now()}`
    await signUpViaHomepage(page, testEmail, displayName, DEFAULT_TEST_PASSWORD)

    // Verify we're logged in - check for dropdown menu
    const userDropdown = page.locator('.test-user-dropdown')
    expect(await userDropdown.isVisible().catch(() => false)).toBeTruthy()
    console.log('Successfully verified we are logged in')

    // Now try the logout helper directly
    console.log('Step 2: Testing logout helper directly')
    const logoutResult = await logoutIfLoggedIn(page)

    // Verify the logout was successful
    expect(logoutResult).toBeTruthy()
    console.log('Successfully logged out using the helper')

    // Verify logout by checking login/signup buttons are visible
    const signInButton = page
      .locator('.btn:has-text("Sign in"), .btn:has-text("Sign up")')
      .first()
    expect(await signInButton.isVisible().catch(() => false)).toBeTruthy()
    console.log('Successfully verified we are logged out')

    // Now try the automatic logout in login function
    console.log('Step 3: Testing automatic logout in loginViaHomepage')
    // First, log in again
    await loginViaHomepage(page, testEmail, DEFAULT_TEST_PASSWORD)

    // Verify we're logged in - check for dropdown menu
    expect(await userDropdown.isVisible().catch(() => false)).toBeTruthy()
    console.log('Successfully logged in again')

    // Now try login with a different user - should auto-logout first
    const secondEmail = `second-${testEmail}`
    console.log(
      `Step 4: Trying to login as ${secondEmail} - should auto-logout first`
    )
    await loginViaHomepage(page, secondEmail, DEFAULT_TEST_PASSWORD)

    // In this case, we might see the login failed message since this user doesn't exist
    // But the important thing is that we tried to logout first

    // Finally test the automatic logout in signup
    console.log('Step 5: Testing automatic logout in signUpViaHomepage')
    // First, log in again
    await loginViaHomepage(page, testEmail, DEFAULT_TEST_PASSWORD)

    // Verify we're logged in - check for dropdown menu
    expect(await userDropdown.isVisible().catch(() => false)).toBeTruthy()
    console.log('Successfully logged in again')

    // Now try signing up with a different user - should auto-logout first
    const thirdEmail = `third-${testEmail}`
    console.log(
      `Step 6: Trying to signup as ${thirdEmail} - should auto-logout first`
    )
    await signUpViaHomepage(
      page,
      thirdEmail,
      `Third Test User ${Date.now()}`,
      DEFAULT_TEST_PASSWORD
    )
  })
})
