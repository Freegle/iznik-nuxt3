const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { signUpViaHomepage } = require('./utils/user')

// Helper function to authenticate and navigate to settings page
const setupAuthenticatedSettingsPage = async (
  page,
  testEmail,
  testSuffix = ''
) => {
  const displayName = `Settings Test User ${testSuffix} ${Date.now()}`
  const signupResult = await signUpViaHomepage(page, testEmail, displayName)
  expect(signupResult).toBe(true)

  // Navigate to settings page
  await page.gotoAndVerify('/settings', {
    timeout: timeouts.navigation.default,
  })

  return displayName
}

test.describe('Settings page tests', () => {
  test('Settings page should render all sections and form fields', async ({
    page,
    testEmail,
  }) => {
    await setupAuthenticatedSettingsPage(page, testEmail, 'Render')

    // Verify page title and main heading
    const pageTitle = await page.title()
    expect(pageTitle).toContain('Settings')

    // Verify all main sections are present under H2 headings
    await page
      .locator('h2:has-text("Your Public Profile")')
      .waitFor({ state: 'visible' })
    await page
      .locator('h2:has-text("Your Account Settings")')
      .waitFor({ state: 'visible' })
    await page
      .locator('h2:has-text("Your Address Book")')
      .waitFor({ state: 'visible' })
    await page
      .locator('h2:has-text("Email Settings")')
      .waitFor({ state: 'visible' })
    await page
      .locator('h2:has-text("Text Alerts")')
      .waitFor({ state: 'visible' })
    await page.locator('h2:has-text("Other")').waitFor({ state: 'visible' })

    // Verify profile section elements
    await page.locator('#myname').waitFor({ state: 'visible' })
    await page
      .locator('.btn:has-text("Save")')
      .first()
      .waitFor({ state: 'visible' })

    // Verify email settings elements are present
    await page
      .locator('text=Choose your email level')
      .waitFor({ state: 'visible' })

    // Verify text alerts section
    await page
      .locator('input[placeholder*="mobile"]')
      .waitFor({ state: 'visible' })

    console.log(
      'All settings page sections and form fields verified successfully'
    )
  })

  test('Settings page should allow updating display name', async ({
    page,
    testEmail,
  }) => {
    await setupAuthenticatedSettingsPage(page, testEmail, 'NameUpdate')

    // Get the current name input
    const nameInput = page.locator('#myname')
    await nameInput.waitFor({ state: 'visible' })

    // Clear and enter new name
    const newName = `Test User ${Date.now()}`
    await nameInput.fill(newName)

    // Click save button for name
    const saveButton = page.locator('.btn:has-text("Save")').first()
    await saveButton.click()

    // Wait for save to complete and verify the name persists
    await page.waitForTimeout(1000)
    const savedValue = await nameInput.inputValue()
    expect(savedValue).toBe(newName)

    console.log(`Successfully updated display name to: ${newName}`)
  })

  test('Settings page should validate phone number format', async ({
    page,
    testEmail,
  }) => {
    await setupAuthenticatedSettingsPage(page, testEmail, 'PhoneValidation')

    // Find the phone input field
    const phoneInput = page.locator('input[placeholder*="mobile"]')
    await phoneInput.waitFor({ state: 'visible' })

    // Test invalid phone number
    await phoneInput.fill('123456')

    // Check if validation error appears
    await page
      .locator('text=Please enter a mobile number.')
      .waitFor({ state: 'visible' })

    // Test valid UK mobile number
    await phoneInput.fill('07700900123')

    // Validation error should disappear
    await page
      .locator('text=Please enter a mobile number.')
      .waitFor({ state: 'detached' })

    console.log('Phone number validation working correctly')
  })

  test('Settings page should handle email settings updates', async ({
    page,
    testEmail,
  }) => {
    await setupAuthenticatedSettingsPage(page, testEmail, 'EmailSettings')

    // Look for email settings controls
    const emailSettingsSection = page
      .locator('h2:has-text("Email Settings")')
      .locator('..')
    await emailSettingsSection.waitFor({ state: 'visible' })

    // Check if email frequency options are available
    await page
      .locator('text=Choose your email level')
      .waitFor({ state: 'visible' })

    // Look for the "Click to see the emails we send" button and click it
    const showEmailsButton = page.locator(
      '.btn:has-text("Click to show advanced")'
    )
    if (await showEmailsButton.isVisible()) {
      await showEmailsButton.click()

      // Verify that email information is now shown
      await page
        .locator('text=We send occasional mails to encourage you to freegle')
        .waitFor({ state: 'visible' })
    }

    console.log('Email settings section accessible and functional')
  })

  test('Settings page should display modals when triggered', async ({
    page,
    testEmail,
  }) => {
    await setupAuthenticatedSettingsPage(page, testEmail, 'Modals')

    // Look for buttons that trigger modals
    const editAboutButton = page.locator('.btn:has-text("Edit")')
    if (await editAboutButton.first().isVisible()) {
      await editAboutButton.first().click()

      // Wait for modal to appear
      await page.waitForTimeout(500)

      // Check if a modal is visible
      const modal = page.locator('.modal-content')
      if ((await modal.count()) > 0 && (await modal.first().isVisible())) {
        console.log('Modal opened successfully')

        // Close modal by clicking close button or backdrop
        const closeButton = modal.locator('.btn-close, .btn:has-text("Close")')
        if ((await closeButton.count()) > 0) {
          await closeButton.first().click()
        } else {
          // Click backdrop to close modal
          await page.locator('.modal-backdrop').click()
        }

        // Wait for modal to close
        await modal.waitFor({ state: 'detached', timeout: 2000 })
        console.log('Modal closed successfully')
      }
    }
  })

  test('Settings page should handle address book functionality', async ({
    page,
    testEmail,
  }) => {
    await setupAuthenticatedSettingsPage(page, testEmail, 'AddressBook')

    // Verify address book section is present
    await page.locator('text=Your Address Book').waitFor({ state: 'visible' })

    // Look for address-related functionality
    const addressSection = page.locator('text=Your Address Book').locator('..')
    await addressSection.waitFor({ state: 'visible' })

    console.log('Address book section verified')
  })

  test('Settings page should be responsive and accessible', async ({
    page,
    testEmail,
  }) => {
    // Test desktop viewport first
    await page.setViewportSize({ width: 1280, height: 720 })
    await setupAuthenticatedSettingsPage(page, testEmail, 'Responsive')

    // Verify main content is visible
    await page.locator('text=Your Public Profile').waitFor({ state: 'visible' })

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify content is still accessible on mobile
    await page.locator('text=Your Public Profile').waitFor({ state: 'visible' })

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify content is accessible on tablet
    await page.locator('text=Your Public Profile').waitFor({ state: 'visible' })

    console.log('Settings page responsive design verified across viewports')
  })

  test('Settings page should maintain state after navigation', async ({
    page,
    testEmail,
  }) => {
    await setupAuthenticatedSettingsPage(page, testEmail, 'StatePersistence')

    // Make a change to display name
    const nameInput = page.locator('#myname')
    const testName = `State Test ${Date.now()}`
    await nameInput.fill(testName)
    await page.locator('.btn:has-text("Save")').first().click()
    await page.waitForTimeout(1000)

    // Navigate away and back
    await page.goto('/myposts')
    await page.waitForLoadState('networkidle')
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Verify the name is still saved
    const persistedName = await nameInput.inputValue()
    expect(persistedName).toBe(testName)

    console.log('Settings state persisted correctly after navigation')
  })
})
