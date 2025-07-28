/**
 * Script to unsubscribe all test emails stored in the test-emails.json file
 * This helps clean up test accounts by simulating clicking unsubscribe links
 */

const fs = require('fs')
const path = require('path')
const { chromium } = require('@playwright/test')
const { unsubscribeManually, loginViaHomepage } = require('./utils/user')
const { DEFAULT_TEST_PASSWORD } = require('./config')

// File path for stored test emails
const TEST_EMAILS_LOG_FILE = path.join(process.cwd(), 'test-emails.json')

/**
 * Main function to unsubscribe all test emails
 */
async function unsubscribeTestEmails() {
  // Check if the test emails file exists
  if (!fs.existsSync(TEST_EMAILS_LOG_FILE)) {
    console.log('No test emails file found. Nothing to unsubscribe.')
    return
  }

  // Load the test emails
  let testEmails = []
  try {
    const data = JSON.parse(fs.readFileSync(TEST_EMAILS_LOG_FILE, 'utf-8'))
    if (data.emails && Array.isArray(data.emails)) {
      testEmails = data.emails
    }
  } catch (error) {
    console.error(`Failed to load test emails: ${error.message}`)
    return
  }

  if (testEmails.length === 0) {
    console.log('No test emails found to unsubscribe')
    return
  }

  console.log(`Found ${testEmails.length} test emails to unsubscribe`)

  // Launch a browser
  const browser = await chromium.launch({ headless: true })

  // Track successful unsubscriptions
  const successfulUnsubscribes = []
  const failedUnsubscribes = []

  // Process each email
  for (const email of testEmails) {
    let result = false

    try {
      console.log(`Attempting to unsubscribe email: ${email}`)
      // Create a new context for each email to ensure clean state
      const context = await browser.newContext({
        baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
      })
      const page = await context.newPage()

      // Add gotoAndVerify navigation helper method
      page.gotoAndVerify = async function (url, options) {
        await this.goto(url, options)
        return this.url().includes(url)
      }

      // First try to log in with this account to see if it still exists
      console.log(`Attempting to log in with email: ${email}`)
      const loginSuccessful = await loginViaHomepage(
        page,
        email,
        DEFAULT_TEST_PASSWORD
      )

      if (loginSuccessful) {
        console.log(
          `Login successful for ${email}, proceeding with unsubscribe`
        )
        // Use unsubscribeManually helper function
        result = await unsubscribeManually(page, email)
      } else {
        console.log(`Login failed for ${email}, account may no longer exist`)
        // Add to successful unsubscribes since the account is gone anyway
        result = true
      }

      // Close the context when done
      await context.close()
    } catch (e) {
      console.log(`Error unsubscribing ${email}: ${e.message}`)
    }

    if (result) {
      console.log(`✓ Successfully unsubscribed: ${email}`)
      successfulUnsubscribes.push(email)
    } else {
      console.log(`✗ Failed to unsubscribe: ${email}`)
      failedUnsubscribes.push({ email, error: 'Unsubscribe process failed' })
    }
  }

  // Close the browser
  await browser.close()

  // Print summary
  console.log('\nUnsubscribe Summary:')
  console.log(
    `✓ Successfully unsubscribed: ${successfulUnsubscribes.length} emails`
  )
  console.log(`✗ Failed to unsubscribe: ${failedUnsubscribes.length} emails`)

  // If any unsubscribes failed, throw an error to fail the test
  if (failedUnsubscribes.length > 0) {
    const errorMessage = `Failed to unsubscribe ${
      failedUnsubscribes.length
    } test emails: ${failedUnsubscribes.map((f) => f.email).join(', ')}`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  // Update the test emails file to remove successful unsubscribes
  if (successfulUnsubscribes.length > 0) {
    const remainingEmails = testEmails.filter(
      (email) => !successfulUnsubscribes.includes(email)
    )

    if (remainingEmails.length > 0) {
      fs.writeFileSync(
        TEST_EMAILS_LOG_FILE,
        JSON.stringify(
          { emails: remainingEmails, timestamp: new Date().toISOString() },
          null,
          2
        )
      )
      console.log(
        `Updated test-emails.json with ${remainingEmails.length} remaining emails`
      )
    } else {
      // If all emails were successfully unsubscribed, remove the file
      fs.unlinkSync(TEST_EMAILS_LOG_FILE)
      console.log('All emails unsubscribed, removed test-emails.json')
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  unsubscribeTestEmails()
    .then(() => {
      console.log('Unsubscribe process completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error(`Unsubscribe process failed: ${error.message}`)
      process.exit(1) // Exit with error code to indicate failure
    })
}

// Export for use in fixtures.js
module.exports = { unsubscribeTestEmails }
