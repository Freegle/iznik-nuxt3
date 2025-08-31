// @ts-check
/**
 * Tests for the Settings page functionality
 * Focuses on email level settings and their persistence
 */
const fs = require('fs')
const path = require('path')
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { signUpViaHomepage, logoutIfLoggedIn } = require('./utils/user')

// Ensure test-results directory exists
const testResultsDir = path.join(__dirname, '../../test-results')
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true })
}

// Helper function to test email level settings
async function testEmailLevelSetting(page, testEmail, level) {
  console.log(`Testing email level: ${level.text}`)

  // Sign up to access settings page
  await page.gotoAndVerify('/', { waitUntil: 'networkidle' })
  await signUpViaHomepage(page, testEmail, 'Test User')

  // Navigate to settings page
  await page.gotoAndVerify('/settings', { waitUntil: 'networkidle' })

  // Wait for the email settings section to load
  await page.waitForSelector('text=Email Settings', {
    timeout: timeouts.ui.appearance,
  })

  // Get the email level select element - look for the select near the "Choose your email level" text
  let emailLevelSelect = page.locator('.simpleEmailSelect')

  // Wait for page to be fully loaded before screenshot
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)

  // Take screenshot before changing the setting
  await page.screenshot({
    path: path.join(
      testResultsDir,
      `email-level-before-${level.value}.png`
    ),
    fullPage: true,
  })

  // Select the email level
  await emailLevelSelect.selectOption(level.value)

  // Wait for network requests to complete (settings save)
  await page.waitForLoadState('networkidle')

  // Wait for the change to be processed
  await page.waitForTimeout(timeouts.ui.settleTime)

  // Take screenshot after changing the setting
  await page.screenshot({
    path: path.join(testResultsDir, `email-level-after-${level.value}.png`),
    fullPage: true,
  })

  // Reload the page to verify persistence
  await page.reload({ waitUntil: 'networkidle' })

  // Wait for settings to load again
  await page.waitForSelector('text=Email Settings', {
    timeout: timeouts.ui.appearance,
  })

  emailLevelSelect = page.locator('.simpleEmailSelect')

  // Wait for the select element to be ready
  await emailLevelSelect.waitFor({ state: 'visible' })

  // Take screenshot after page reload to verify persistence
  await page.screenshot({
    path: path.join(
      testResultsDir,
      `email-level-persisted-${level.value}.png`
    ),
    fullPage: true,
  })

  // Verify the selected value persisted
  await page.waitForTimeout(timeouts.ui.settleTime)
  const selectedValue = await emailLevelSelect.inputValue()
  expect(selectedValue).toBe(level.value)

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

    // Wait for advanced settings to appear
    await page.waitForTimeout(timeouts.ui.transition)

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
          expect(['0', '1', '2', '4', '8', '24']).toContain(
            currentFrequency
          )
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
  }) => {
    const level = { value: 'None', text: 'Off' }
    await testEmailLevelSetting(page, testEmail, level)
  })

  test('Email level "Basic" saves correctly and persists after page reload', async ({
    page,
    testEmail,
  }) => {
    const level = { value: 'Basic', text: 'Basic - limited emails' }
    await testEmailLevelSetting(page, testEmail, level)
  })

  test('Email level "Standard" saves correctly and persists after page reload', async ({
    page,
    testEmail,
  }) => {
    const level = { value: 'Full', text: 'Standard - all types of emails' }
    await testEmailLevelSetting(page, testEmail, level)
  })

  test('Advanced email settings toggle works correctly', async ({
    page,
    testEmail,
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
      await page.screenshot({
        path: path.join(testResultsDir, 'advanced-settings-before-toggle.png'),
        fullPage: true,
      })

      // Click to show advanced settings
      await advancedButton.click()
      await page.waitForTimeout(timeouts.ui.transition)

      // Advanced settings should now be visible
      await advancedSection.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Take screenshot after showing advanced settings
      await page.screenshot({
        path: path.join(testResultsDir, 'advanced-settings-after-toggle.png'),
        fullPage: true,
      })

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
    await page.screenshot({
      path: path.join(testResultsDir, 'validation-before-none-setting.png'),
      fullPage: true,
    })

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
    await page.screenshot({
      path: path.join(testResultsDir, 'validation-none-setting-warning.png'),
      fullPage: true,
    })

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
    await page.screenshot({
      path: path.join(testResultsDir, 'validation-full-setting-no-warning.png'),
      fullPage: true,
    })

    console.log('✓ Warning message correctly hidden for "Full" setting')
  })
})
