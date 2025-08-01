// @ts-nocheck
/**
 * Tests for the Settings page functionality
 * Focuses on email level settings and their persistence
 */
const fs = require('fs')
const path = require('path')
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { signUpViaHomepage, loginViaHomepage } = require('./utils/user')
const { scrollIntoViewAndWait } = require('./utils/ui')

// Ensure test-results directory exists
const testResultsDir = path.join(__dirname, '../../test-results')
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true })
}

test.describe('Settings Page - Email Level Settings', () => {
  test('Email level settings save correctly and persist after page reload', async ({
    browser,
    testEmail,
  }) => {
    // Define the email level options to test
    const emailLevels = [
      { value: 'None', text: 'Off' },
      { value: 'Basic', text: 'Basic - limited emails' },
      { value: 'Full', text: 'Standard - all types of emails' },
    ]

    for (const level of emailLevels) {
      console.log(`Testing email level: ${level.text}`)

      // Create initial context and page
      const context = await browser.newContext()
      const page = await context.newPage()

      // Add gotoAndVerify method to page (from fixtures)
      page.gotoAndVerify = async (path, options = {}) => {
        const timeout = options.timeout || timeouts.navigation.default
        await page.goto(path, { timeout })
        await page.waitForLoadState('networkidle', {
          timeout: Math.min(timeout, timeouts.navigation.default),
        })
      }

      // Sign up to access settings page
      await page.gotoAndVerify('/')
      await signUpViaHomepage(page, testEmail, 'Test User')

      // Navigate to settings page
      await page.gotoAndVerify('/settings')

      // Wait for the email settings section to load and scroll into view
      const emailSettingsSection = page.locator('h2:has-text("Email Settings")')
      await scrollIntoViewAndWait(emailSettingsSection)

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

      // Create a new context and page to verify persistence (more reliable than page reload)
      await context.close()
      const newContext = await browser.newContext()
      const newPage = await newContext.newPage()

      // Add gotoAndVerify method to new page (from fixtures)
      newPage.gotoAndVerify = async (path, options = {}) => {
        const timeout = options.timeout || timeouts.navigation.default
        await newPage.goto(path, { timeout })
        await newPage.waitForLoadState('networkidle', {
          timeout: Math.min(timeout, timeouts.navigation.default),
        })
      }

      // Login with the same user to verify settings persistence
      await newPage.gotoAndVerify('/')
      await loginViaHomepage(newPage, testEmail, 'Test User')

      // Navigate to settings page in new context
      await newPage.gotoAndVerify('/settings')

      // Wait for settings to load again and scroll into view
      const newEmailSettingsSection = newPage.locator(
        'h2:has-text("Email Settings")'
      )
      await scrollIntoViewAndWait(newEmailSettingsSection)

      emailLevelSelect = newPage.locator('.simpleEmailSelect')

      // Wait for the select element to be ready
      await emailLevelSelect.waitFor({ state: 'visible' })

      // Take screenshot after login to verify persistence
      await newPage.screenshot({
        path: path.join(
          testResultsDir,
          `email-level-persisted-${level.value}.png`
        ),
        fullPage: true,
      })

      // Verify the selected value persisted
      await newPage.waitForTimeout(timeouts.ui.settleTime)
      const selectedValue = await emailLevelSelect.inputValue()
      expect(selectedValue).toBe(level.value)

      console.log(`✓ Email level ${level.text} saved and persisted correctly`)

      // If not 'None', check for advanced settings functionality
      if (level.value !== 'None') {
        // Look for the "Click to show advanced email settings" button
        console.log('Checking advanced settings...')
        const advancedButton = newPage.locator(
          'text=Click to show advanced email settings'
        )

        // Click to show advanced settings
        await advancedButton.click()

        // Wait for advanced settings to appear
        await newPage.waitForTimeout(timeouts.ui.transition)

        // Look for email frequency settings in advanced view
        const emailFrequencySection = newPage.locator(
          'text=Choose OFFER/WANTED frequency:'
        )

        if (await emailFrequencySection.isVisible()) {
          // Get the current email frequency setting
          const frequencySelect = newPage
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

      // Clean up the new context
      await newContext.close()
    }

    console.log('✓ All email level settings tested successfully')
  })

  test('Advanced email settings toggle works correctly', async ({
    page,
    testEmail,
  }) => {
    // Sign up and navigate to settings
    await page.gotoAndVerify('/', { waitUntil: 'networkidle' })
    await signUpViaHomepage(page, testEmail, 'Test User')
    await page.gotoAndVerify('/settings', { waitUntil: 'networkidle' })

    // Wait for email settings section and scroll into view
    const emailSettingsSection = page.locator('h2:has-text("Email Settings")')
    await scrollIntoViewAndWait(emailSettingsSection)

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

    // Wait for email settings section and scroll into view
    const emailSettingsSection = page.locator('h2:has-text("Email Settings")')
    await scrollIntoViewAndWait(emailSettingsSection)

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
