// @ts-check
/**
 * @typedef {import('@playwright/test').Page} Page
 */

const { test, expect } = require('./fixtures')
const { signUpViaHomepage, unsubscribeManually } = require('./helpers')

test('signup and unsubscribe flow works correctly', async ({
  page,
  testEmail,
  takeTimestampedScreenshot,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })

  console.log(`Starting signup process with email: ${testEmail}`)
  const displayName = `Test User ${Date.now()}`

  const signupSuccessful = await signUpViaHomepage(page, testEmail, displayName)

  await takeTimestampedScreenshot('after-signup')

  expect(signupSuccessful).toBe(true, 'Registration should succeed')

  console.log(`Starting unsubscribe process for email: ${testEmail}`)

  const unsubscribeSuccessful = await unsubscribeManually(page, testEmail)

  expect(unsubscribeSuccessful).toBe(true, 'Unsubscription should succeed')

  console.log('Successfully completed sign up and unsubscribe test')
})
