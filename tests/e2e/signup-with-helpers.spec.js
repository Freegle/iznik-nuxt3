// @ts-check
/**
 * @typedef {import('@playwright/test').Page} Page
 */

const { test, expect } = require('./fixtures')
const { signUpViaHomepage, unsubscribeManually } = require('./helpers')

/**
 * Test that demonstrates the full user journey using helper functions:
 * 1. Sign up with a test email via the helper function
 * 2. Receive confirmation
 * 3. Manually unsubscribe the email via the helper function
 *
 * This test validates both the sign up flow and the unsubscribe functionality
 * while demonstrating the use of reusable helpers
 */
test('signup and unsubscribe flow using helpers works correctly', async ({
  page,
  testEmail,
}) => {
  // Set a reasonable viewport size
  await page.setViewportSize({ width: 1280, height: 800 })

  // Step 1: Sign up via the homepage login modal using the helper function
  const displayName = `Test User ${Date.now()}`
  console.log(`Signing up with email ${testEmail} and name ${displayName}`)

  const signUpSuccessful = await signUpViaHomepage(page, testEmail, displayName)

  // Take a screenshot after registration
  await page.screenshot({
    path: `playwright-screenshots/after-signup-helpers-${Date.now()}.png`,
    fullPage: true,
  })

  // Assert that registration was successful
  expect(signUpSuccessful).toBe(true, 'Registration should succeed')

  // Step 2: Manually unsubscribe the email using the helper function
  console.log(`Now unsubscribing email ${testEmail}`)

  const unsubscribeSuccessful = await unsubscribeManually(page, testEmail)

  // Take a screenshot after unsubscribe
  await page.screenshot({
    path: `playwright-screenshots/after-unsubscribe-helpers-${Date.now()}.png`,
    fullPage: true,
  })

  // Assert that unsubscription was successful
  expect(unsubscribeSuccessful).toBe(true, 'Unsubscription should succeed')

  console.log(
    'Successfully completed sign up and unsubscribe test using helpers'
  )

  // The test email is already registered for cleanup through the testEmail fixture
  // The automatic unsubscribe process would also handle it, but we manually unsubscribed in this test
})
