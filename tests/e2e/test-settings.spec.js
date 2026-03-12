// @ts-check
/**
 * Tests for the Settings page functionality
 * Focuses on email level settings and their persistence
 */
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { signUpViaHomepage, logoutIfLoggedIn } = require('./utils/user')

// Helper function to test email level settings
async function testEmailLevelSetting(page, testEmail, level, takeScreenshot) {
  console.log(`Testing email level: ${level.text}`)

  // Sign up to access settings page
  await page.gotoAndVerify('/')
  await signUpViaHomepage(page, testEmail, 'Test User')

  // Navigate to settings page
  await page.gotoAndVerify('/settings')

  // Get the email level select element
  const emailLevelSelect = page.locator('.email-select')
  await emailLevelSelect.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })

  // Handle edge case where select value default is equal to target value.
  const selectedLevel = await emailLevelSelect.inputValue()
  if (selectedLevel === level.value) {
    // Change to something else first so we can test setting it back
    const savePromise1 = page.waitForResponse(
      (response) =>
        response.url().includes('/api/session') &&
        response.status() === 200 &&
        response.request().method() === 'POST'
    )
    await emailLevelSelect.selectOption('None')
    await savePromise1
    console.log('Reset to None first since default matches target')
  }

  // Wait for the POST that saves the setting
  const savePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/session') &&
      response.status() === 200 &&
      response.request().method() === 'POST'
  )
  await emailLevelSelect.selectOption(level.value)
  await savePromise
  console.log(`Setting saved via POST, now verifying with reload`)

  // Reload the page to verify persistence
  await page.reload()

  // Verify the selected value persisted (allow time for component to hydrate)
  await expect(emailLevelSelect).toHaveValue(level.value, {
    timeout: timeouts.ui.appearance,
  })

  console.log(`✓ Email level ${level.text} saved and persisted correctly`)

  // If not 'None', check for advanced settings functionality
  if (level.value !== 'None') {
    // Look for the "Show advanced settings" button
    console.log('Checking advanced settings...')
    const advancedButton = page.locator('text=Show advanced settings')

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
    // Don't use networkidle - the app has background polling that prevents idle state
    await page.gotoAndVerify('/')
    await signUpViaHomepage(page, testEmail, 'Test User')
    await page.gotoAndVerify('/settings')

    // Wait for email settings section
    await page.waitForSelector('text=Email Settings', {
      timeout: timeouts.ui.appearance,
    })

    // Ensure we're not on 'None' setting (advanced settings not available for 'None')
    const emailLevelSelect = page.locator('.email-select')
    await emailLevelSelect.selectOption('Full')

    // Wait for the setting to be saved
    await page.waitForTimeout(timeouts.ui.settleTime)

    // Check if advanced settings button is visible
    const advancedButton = page.locator('text=Show advanced settings')

    if (await advancedButton.isVisible()) {
      console.log('Testing advanced settings toggle...')

      // Initially, advanced settings should be hidden
      const advancedSection = page.locator('text=Email me replies to my posts')
      await advancedSection.waitFor({
        state: 'hidden',
        timeout: timeouts.ui.appearance,
      })

      // Take screenshot before showing advanced settings
      await takeScreenshot('Advanced Settings Before Toggle')

      // Click to show advanced settings
      await advancedButton.click()

      // Advanced settings should now be visible
      await expect(advancedSection).toBeVisible()

      // Take screenshot after showing advanced settings
      await takeScreenshot('Advanced Settings After Toggle')

      console.log('✓ Advanced settings shown successfully')

      // Verify key advanced settings are present
      const expectedAdvancedSettings = [
        'Email me replies to my posts',
        'Copy of my sent messages',
        'ChitChat & notifications',
        'Suggested posts for you',
        'Newsletters & stories',
        'Encouragement emails',
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
    // Don't use networkidle - the app has background polling that prevents idle state
    await page.gotoAndVerify('/')
    await signUpViaHomepage(page, testEmail, 'Test User')
    await page.gotoAndVerify('/settings')

    // Wait for email settings section
    await page.waitForSelector('text=Email Settings', {
      timeout: timeouts.ui.appearance,
    })

    // Test that appropriate warnings appear for 'None' setting
    const emailLevelSelect = page.locator('.email-select')

    // Take screenshot before setting to 'None'
    await takeScreenshot('Validation Before None Setting')

    await emailLevelSelect.selectOption('None')

    // Wait for the setting to be saved
    await page.waitForTimeout(timeouts.ui.settleTime)

    // Check for warning message about not getting emails
    const warningMessage = page.locator(
      '*:has-text("You won\'t get email notifications")'
    )
    await warningMessage
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

    // Take screenshot showing the warning message
    await takeScreenshot('Validation None Setting Warning')

    console.log('✓ Warning message appears for "None" email setting')

    // Switch back to a setting that allows emails
    await emailLevelSelect.selectOption('Full')

    // Wait for the setting to be saved
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
