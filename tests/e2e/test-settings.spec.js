// @ts-check
/**
 * Tests for the Settings page functionality
 * Focuses on email level settings and their persistence
 */
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { signUpViaHomepage, logoutIfLoggedIn } = require('./utils/user')

/**
 * @returns a promise to monitor network traffic
 * and resolve when all required responses have been received,
 * indicating that the user's new email settings are saved server-side.
 */
function getSaveSettingsPromise(page, level) {
  const responsePromise1 = page.waitForResponse(
    async (response) =>
      response.url().startsWith('http://apiv1.localhost/api/session') &&
      response.status() === 200 &&
      response.request().method() === 'POST' &&
      (await response.request().postDataJSON()).settings?.simplemail ===
        level.value
  )
  const responsePromise2 = page.waitForResponse(
    async (response) =>
      response.url().startsWith('http://apiv2.localhost/api/user') &&
      response.status() === 200 &&
      response.request().method() === 'GET' &&
      (await response.json()).settings?.simplemail === level.value
  )
  const responsePromise3 = page.waitForResponse(
    async (response) =>
      response.url().startsWith('http://apiv1.localhost/api/session') &&
      response.status() === 200 &&
      response.request().method() === 'GET' &&
      (await response.json()).me?.settings?.simplemail === level.value
  )

  const saveSettingsPromise = Promise.all([
    responsePromise1,
    responsePromise2,
    responsePromise3,
  ])

  return saveSettingsPromise
}

// Helper function to test email level settings
async function testEmailLevelSetting(page, testEmail, level, takeScreenshot) {
  console.log(`Testing email level: ${level.text}`)

  // Sign up to access settings page
  await page.gotoAndVerify('/', { waitUntil: 'networkidle' })
  await signUpViaHomepage(page, testEmail, 'Test User')

  // Navigate to settings page
  await page.gotoAndVerify('/settings')

  // Get the email level select element - look for the select near the "Choose your email level" text
  const emailLevelSelect = page.locator('select.simpleEmailSelect')

  // Handle edge case where select value default is equal to target value.
  const selectedLevel = await emailLevelSelect.inputValue()
  if (selectedLevel === level.value) {
    // For now, this allows setting the select back to Standard (the default)
    // and properly sending network events/actually testing that it changes and persists.
    await emailLevelSelect.selectOption('None')
  }

  // Start waiting for network response before changing setting - note no await yet
  const saveSettingsPromise = getSaveSettingsPromise(page, level)
  await emailLevelSelect.selectOption(level.value) // Then select the email level
  await saveSettingsPromise // Then await the network responses indicating settings saved

  // Reload the page to verify persistence
  await page.reload()

  // Verify the selected value persisted
  await expect(emailLevelSelect).toHaveValue(level.value)

  console.log(`✓ Email level ${level.text} saved and persisted correctly`)

  // If not 'None', check for advanced settings functionality
  if (level.value !== 'None') {
    // Look for the "Click to show advanced email settings" button
    console.log('Checking advanced settings...')
    const advancedButton = page.locator(
      'text=Click to show advanced email settings'
    )

    // Click to show advanced settings
    await advancedButton.click()

    // Look for email frequency settings in advanced view
    const emailFrequencySection = page.locator(
      'text=Choose OFFER/WANTED frequency:'
    )

    if (await emailFrequencySection.isVisible()) {
      // Get the current email frequency setting
      const frequencySelect = page
        .locator('select')
        .filter({
          hasText: /Immediate|1 hour|2 hours|4 hours|8 hours|Daily/,
        })
        .first()

      if (await frequencySelect.isVisible()) {
        const currentFrequency = await frequencySelect.inputValue()
        console.log(
          `Current email frequency in advanced settings: ${currentFrequency}`
        )

        // Verify that the frequency setting is reasonable for the selected email level
        if (level.value === 'Basic') {
          // Basic should typically have longer intervals
          expect(['8', '24']).toContain(currentFrequency)
        } else if (level.value === 'Full') {
          // Full can have any frequency including immediate
          expect(['0', '1', '2', '4', '8', '24']).toContain(currentFrequency)
        }

        console.log(
          `✓ Email frequency matches expected range for ${level.text}`
        )
      }
    }
  }

  await logoutIfLoggedIn(page)
}

test.describe('Settings Page - Email Level Settings', () => {
  test('Email level "Off" saves correctly and persists after page reload', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    const level = { value: 'None', text: 'Off' }
    await testEmailLevelSetting(page, testEmail, level, takeScreenshot)
  })

  // TODO: Fix this test - it's failing with timeout issues after user registration
  // The test successfully registers a new user but then fails to properly save/verify email settings
  // Need to investigate why the settings page isn't working correctly after registration
  test('Email level "Basic" saves correctly and persists after page reload', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    const level = { value: 'Basic', text: 'Basic - limited emails' }
    await testEmailLevelSetting(page, testEmail, level, takeScreenshot)
  })

  test('Email level "Standard" saves correctly and persists after page reload', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    const level = { value: 'Full', text: 'Standard - all types of emails' }
    await testEmailLevelSetting(page, testEmail, level, takeScreenshot)
  })

  test('Advanced email settings toggle works correctly', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    // Sign up and navigate to settings
    await page.gotoAndVerify('/', { waitUntil: 'networkidle' })
    await signUpViaHomepage(page, testEmail, 'Test User')
    await page.gotoAndVerify('/settings', { waitUntil: 'networkidle' })

    // Wait for email settings section
    await page.waitForSelector('text=Email Settings', {
      timeout: timeouts.ui.appearance,
    })

    // Ensure we're not on 'None' setting (advanced settings not available for 'None')
    const emailLevelSelect = page
      .locator('text=Choose your email level:')
      .locator('..')
      .locator('select')
      .first()
    await emailLevelSelect.selectOption('Full')

    // Wait for network requests to complete (settings save)
    await page.waitForLoadState('networkidle')

    await page.waitForTimeout(timeouts.ui.settleTime)

    // Check if advanced settings button is visible
    const advancedButton = page.locator(
      'text=Click to show advanced email settings'
    )

    if (await advancedButton.isVisible()) {
      console.log('Testing advanced settings toggle...')

      // Initially, advanced settings should be hidden
      const advancedSection = page.locator(
        'text=Mail me replies from other freeglers'
      )
      await advancedSection.waitFor({
        state: 'hidden',
        timeout: timeouts.ui.appearance,
      })

      // Take screenshot before showing advanced settings
      await takeScreenshot('Advanced Settings Before Toggle')

      // Click to show advanced settings
      await advancedButton.click()
      await page.waitForTimeout(timeouts.ui.transition)

      // Advanced settings should now be visible
      await advancedSection.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Take screenshot after showing advanced settings
      await takeScreenshot('Advanced Settings After Toggle')

      console.log('✓ Advanced settings shown successfully')

      // Verify key advanced settings are present
      const expectedAdvancedSettings = [
        'Mail me replies from other freeglers',
        'email you a copy of your own Chat messages',
        'email you about ChitChat',
        'email you about specific OFFERs/WANTEDs',
        'send occasional newsletters',
        'send occasional mails to encourage',
      ]

      for (const settingText of expectedAdvancedSettings) {
        const setting = page.locator(`*:has-text("${settingText}")`).first()
        await setting.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })
        console.log(`✓ Found advanced setting: ${settingText}`)
      }

      console.log('✓ All expected advanced settings are visible')
    } else {
      console.log(
        'Advanced settings button not found - may already be in advanced mode'
      )
    }
  })

  test('Email settings validation and error handling', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    // Sign up and navigate to settings
    await page.gotoAndVerify('/', { waitUntil: 'networkidle' })
    await signUpViaHomepage(page, testEmail, 'Test User')
    await page.gotoAndVerify('/settings', { waitUntil: 'networkidle' })

    // Wait for email settings section
    await page.waitForSelector('text=Email Settings', {
      timeout: timeouts.ui.appearance,
    })

    // Test that appropriate warnings appear for 'None' setting
    const emailLevelSelect = page
      .locator('text=Choose your email level:')
      .locator('..')
      .locator('select')
      .first()

    // Take screenshot before setting to 'None'
    await takeScreenshot('Validation Before None Setting')

    await emailLevelSelect.selectOption('None')

    // Wait for network requests to complete (settings save)
    await page.waitForLoadState('networkidle')

    await page.waitForTimeout(timeouts.ui.settleTime)

    // Check for warning message about not getting emails
    const warningMessage = page.locator(
      '*:has-text("If people message you, you won\'t get any emails")'
    )
    await warningMessage
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

    // Take screenshot showing the warning message
    await takeScreenshot('Validation None Setting Warning')

    console.log('✓ Warning message appears for "None" email setting')

    // Switch back to a setting that allows emails
    await emailLevelSelect.selectOption('Full')

    // Wait for network requests to complete (settings save)
    await page.waitForLoadState('networkidle')

    await page.waitForTimeout(timeouts.ui.settleTime)

    // Warning should be gone
    await warningMessage.waitFor({
      state: 'hidden',
      timeout: timeouts.ui.appearance,
    })

    // Take screenshot showing warning is gone with 'Full' setting
    await takeScreenshot('Validation Full Setting No Warning')

    console.log('✓ Warning message correctly hidden for "Full" setting')
  })
})
