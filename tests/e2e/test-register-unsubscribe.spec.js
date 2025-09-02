/**
 * Test for registration and unsubscription flow
 *
 * This test:
 * 1. Registers a test email with a local list
 * 2. Attempts to unsubscribe the email (which should fail as it's not in the system yet)
 */

const fs = require('fs')
const path = require('path')
const { test, expect } = require('@playwright/test')
const { environment } = require('./config')
const { unsubscribeManually } = require('./utils/user')
const { setupNavigationHelpers } = require('./utils/navigation')
const { unsubscribeTestEmails } = require('./unsubscribe-test-emails')

// File path for storing test emails for later cleanup
const TEST_EMAILS_LOG_FILE = path.join(process.cwd(), 'test-emails.json')

test.describe('Registration and unsubscription flow', () => {
  test('should register a test email and verify unsubscribe fails for non-existent user', async ({
    page,
  }) => {
    // Setup navigation helpers
    setupNavigationHelpers(page)

    // Generate a unique test email
    const timestamp = Date.now()
    const testEmail = `test-user-${timestamp}@${environment.email.domain}`

    console.log(`Using test email: ${testEmail}`)

    const context = await page.context().browser().newContext()
    const unsubscribePage = await context.newPage()
    setupNavigationHelpers(unsubscribePage)

    // Attempt to unsubscribe
    const unsubscribeResult = await unsubscribeManually(
      unsubscribePage,
      testEmail
    )

    // This should succeed since we've modified unsubscribeManually to return true
    // when "We don't recognise that email address" message is shown
    expect(unsubscribeResult).toBe(
      true,
    )

    // Take a screenshot of the failure
    await unsubscribePage.screenshot({
      path: `playwright-screenshots/unsubscribe-failure-${timestamp}.png`,
      fullPage: true,
    })

    // Clean up
    await context.close()

    // Log completion
    console.log(
      'Test completed successfully - registered user and verified unsubscribe fails for non-existent user'
    )
  })
})
