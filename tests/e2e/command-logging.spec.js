// @ts-check
/**
 * Test to demonstrate command logging and post flow with modals
 */
const fs = require('fs')
const path = require('path')
const { test } = require('./fixtures')
const { environment, timeouts } = require('./config')

// Helper for screenshot path generation (copied from fixtures.js for convenience)
const SCREENSHOTS_DIR = path.join(process.cwd(), 'playwright-screenshots')

const ensureScreenshotsDir = () => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    try {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
      console.log(`Created screenshots directory: ${SCREENSHOTS_DIR}`)
    } catch (error) {
      console.error(`Failed to create screenshots directory: ${error.message}`)
    }
  }
  return SCREENSHOTS_DIR
}

const getScreenshotPath = (filename) => {
  ensureScreenshotsDir()
  return path.join(SCREENSHOTS_DIR, filename)
}

test.describe('Command Logging Demo with Post Flow', () => {
  test('should create a post and handle subsequent modals', async ({
    page,
    registerTestEmail,
  }) => {
    // The page is already wrapped with the logging proxy in fixtures.js

    // Log that we're starting the test
    console.log('Starting post flow test with command logging')

    // Generate a unique test email and register it for cleanup
    const testEmail = `test-${Date.now()}@${environment.email.domain}`
    registerTestEmail(testEmail)
    console.log(`Using test email: ${testEmail}`)

    // Go to the give page
    await page.goto('/give')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Fill in the item name (what field)
    await page
      .locator('[id^="what"], .type-input, input[placeholder*="give"]')
      .click()
    await page
      .locator('[id^="what"], .type-input, input[placeholder*="give"]')
      .fill('test item - please delete')

    // Fill in the description
    await page
      .locator(
        '[id^="description"], textarea.description, textarea.form-control'
      )
      .fill(
        `Test description created at ${new Date().toISOString()} - please delete`
      )

    // Click the Next button
    await page
      .locator('.btn:has-text("Next")')
      .filter({ visible: true })
      .first()
      .click()

    // Fill in postcode/location field
    await page
      .locator('.pcinp, input[placeholder="Type postcode"]')
      .fill(environment.postcode)

    // Wait for the location to be confirmed
    const confirmationIcon = page.locator(
      '.text-success.fa-bh, .fa-check-circle, .v-icon[icon="check-circle"]'
    )
    await confirmationIcon.waitFor({
      state: 'visible',
      timeout: timeouts.api.default,
    })

    // Click the Next button again
    await page
      .locator('.btn:has-text("Next")')
      .filter({ visible: true })
      .first()
      .click()

    // Fill in email field
    const emailField = page
      .locator('input[name="email"], input.email, input[type="email"]')
      .first()
    await emailField.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await emailField.click()
    await emailField.fill(testEmail)

    // Trigger validation
    await emailField.press('Tab')
    await page.evaluate(() => {
      const emailInput = document.querySelector(
        'input[name="email"], input.email, input[type="email"]'
      )
      if (emailInput) {
        emailInput.dispatchEvent(new Event('blur'))
        emailInput.dispatchEvent(new Event('change'))
      }
    })

    // Wait for the Freegle it button and click it
    const freegleButton = page
      .locator('.btn:has-text("Freegle it!")')
      .filter({ visible: true })
      .first()

    // Make sure to use base.expect or the imported expect, not the global expect
    await freegleButton.waitFor({
      state: 'visible',
      timeout: timeouts.api.default,
    })
    console.log('Freegle it button is visible')
    await freegleButton.click()

    // Wait for redirect to My Posts page
    await page.waitForNavigation({
      timeout: timeouts.api.slowApi,
      waitUntil: 'networkidle',
    })

    console.log('After post creation, handling modals...')

    // Take a screenshot of the page after the redirection
    await page.screenshot({
      path: getScreenshotPath(`after-redirect-${Date.now()}.png`),
      fullPage: true,
    })

    // Give the page a moment to settle and any modals to appear
    await page.waitForTimeout(timeouts.ui.settleTime || 1000)

    // Handle the first modal - Deadline
    console.log('Looking for deadline modal...')
    if (
      await page
        .locator(
          '.modal-dialog:has-text("deadline"), .modal-dialog:has-text("Deadline")'
        )
        .isVisible({
          timeout: timeouts.ui.appearance,
        })
    ) {
      console.log('Deadline modal is visible')

      // Take a screenshot of the deadline modal
      await page.screenshot({
        path: getScreenshotPath(`deadline-modal-${Date.now()}.png`),
        fullPage: true,
      })

      // Find and click the "No deadline" button
      const noDeadlineButton = page.locator(
        'button:has-text("No deadline"), button:has-text("No Deadline")'
      )

      // Log that we found the button
      console.log(
        'No deadline button visible:',
        await noDeadlineButton.isVisible()
      )

      // Click the button
      await noDeadlineButton.click()
      console.log('Clicked No deadline button')

      // Wait a moment for the modal to close and next modal to appear
      await page.waitForTimeout(timeouts.ui.transition || 500)
    } else {
      console.error('Deadline modal did not appear')
    }

    // Handle the second modal - Delivery
    console.log('Looking for delivbery modal...')
    if (
      await page
        .locator('.modal-dialog:has-text("Could you deliver")')
        .isVisible({
          timeout: timeouts.ui.appearance,
        })
    ) {
      console.log('Delivery modal is visible')

      // Take a screenshot of the expected replies modal
      await page.screenshot({
        path: getScreenshotPath(`delivery-modal-${Date.now()}.png`),
        fullPage: true,
      })

      // Find and click the "Maybe" button
      const maybeButton = page.locator('button:has-text("Maybe")')

      // Log that we found the button
      console.log('Maybe button visible:', await maybeButton.isVisible())

      // Click the button
      await maybeButton.click()
      console.log('Clicked Maybe button')

      // Wait a moment for the modal to close
      await page.waitForTimeout(timeouts.ui.transition || 500)
    } else {
      // Fail with error
      console.error('Delivery modal did not appear')
    }

    // Wait a moment to ensure modals are fully processed
    await page.waitForTimeout(timeouts.ui.settleTime || 1000)

    // Verify we're on the My Posts page
    console.log('Verifying we are on My Posts page:', page.url())

    // Look for our posted item on the page
    const postedItem = page
      .locator(':has-text("test item - please delete")')
      .first()
    await postedItem.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('Posted item is visible on My Posts page')

    console.log('Post flow completed successfully')
  })
})
