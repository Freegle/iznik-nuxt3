// @ts-check
/**
 * @typedef {import('@playwright/test').Page} Page
 */

const { test, expect } = require('./fixtures')
const { signUpViaHomepage, unsubscribeManually } = require('./helpers')

/**
 * Test that demonstrates the full user journey:
 * 1. Sign up with a test email using the helper function
 * 2. Receive confirmation
 * 3. Manually unsubscribe the email using the helper function
 *
 * This test validates both the sign up flow and the unsubscribe functionality
 */
test('signup and unsubscribe flow works correctly', async ({
  page,
  testEmail,
}) => {
  // Set a reasonable viewport size
  await page.setViewportSize({ width: 1280, height: 800 })

  // Step 1: Perform signup using the helper function
  console.log(`Starting signup process with email: ${testEmail}`)
  const displayName = `Test User ${Date.now()}`

  // The helper function handles the entire signup process
  const signupSuccessful = await signUpViaHomepage(page, testEmail, displayName)

  // Take a screenshot after registration
  await page.screenshot({
    path: `playwright-screenshots/after-signup-${Date.now()}.png`,
    fullPage: true,
  })

  // Assert that registration was successful
  expect(signupSuccessful).toBe(true, 'Registration should succeed')

  // Step 2: Unsubscribe the email using the helper function
  console.log(`Starting unsubscribe process for email: ${testEmail}`)

  // The helper function handles the entire unsubscribe process
  const unsubscribeSuccessful = await unsubscribeManually(page, testEmail)

  // Assert that unsubscription was successful
  expect(unsubscribeSuccessful).toBe(true, 'Unsubscription should succeed')

  console.log('Successfully completed sign up and unsubscribe test')

  // The test email is already registered for cleanup through the testEmail fixture
  // The automatic unsubscribe process would also handle it, but we manually unsubscribed in this test
})
