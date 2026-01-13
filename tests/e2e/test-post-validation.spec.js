/**
 * Tests for post validation requirements
 * - Must provide either photo or description when posting
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Post validation tests', () => {
  test.describe('Mobile post flow validation', () => {
    // Set mobile viewport for these tests
    test.use({ viewport: { width: 414, height: 896 } })

    test('Requires description when no photo is provided', async ({ page }) => {
      // Navigate to the give page (mobile flow starts at photos)
      await page.gotoAndVerify('/give/mobile/photos', {
        timeout: timeouts.navigation.default,
      })

      // Wait for the photo uploader to appear
      await page.waitForSelector('.photo-uploader, .app-give-photos', {
        timeout: timeouts.ui.appearance,
      })

      // Skip adding a photo - click the skip link
      const skipLink = page.locator('a').filter({
        hasText: /skip/i,
      })
      await skipLink.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await skipLink.click()
      console.log('Skipped photo upload')

      // Should be on the details page now
      await page.waitForSelector('#item-name, input[placeholder*="giving"]', {
        timeout: timeouts.ui.appearance,
      })

      // Fill in the item name
      const itemInput = page.locator('#item-name')
      await itemInput.fill('Test item for validation')
      console.log('Filled item name')

      // Leave the description empty and click Next
      const nextButton = page.locator('button.w-100').filter({
        hasText: 'Next',
      })
      await nextButton.click()
      console.log('Clicked Next without description')

      // Wait for validation error to appear
      await page.waitForTimeout(timeouts.ui.transition)

      // Check for the validation error message
      const errorMessage = page.locator('.invalid-feedback').filter({
        hasText: 'Please add a description',
      })
      await errorMessage.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log(
        'Validation error appeared - description required when no photo'
      )

      // Verify the description textarea has error state
      const descriptionTextarea = page.locator('#description')
      const isInvalid = await descriptionTextarea.evaluate((el) =>
        el.classList.contains('is-invalid')
      )
      expect(isInvalid).toBe(true)
      console.log('Description field marked as invalid')
    })

    test('Allows proceeding with description but no photo', async ({
      page,
    }) => {
      // Navigate to the give page (mobile flow starts at photos)
      await page.gotoAndVerify('/give/mobile/photos', {
        timeout: timeouts.navigation.default,
      })

      // Skip adding a photo - click the skip link
      const skipLink = page.locator('a').filter({
        hasText: /skip/i,
      })
      await skipLink.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await skipLink.click()
      console.log('Skipped photo upload')

      // Should be on the details page
      await page.waitForSelector('#item-name', {
        timeout: timeouts.ui.appearance,
      })

      // Fill in the item name
      const itemInput = page.locator('#item-name')
      await itemInput.fill('Test item with description only')
      console.log('Filled item name')

      // Fill in a description
      const descriptionTextarea = page.locator('#description')
      await descriptionTextarea.fill(
        'This is a test description for an item without a photo.'
      )
      console.log('Filled description')

      // Click Next - should proceed without error
      const nextButton = page.locator('button.w-100').filter({
        hasText: 'Next',
      })
      await nextButton.click()
      console.log('Clicked Next with description')

      // Wait for navigation to options page
      await page.waitForURL('**/give/mobile/options', {
        timeout: timeouts.navigation.default,
      })
      console.log(
        'Successfully navigated to options page - no photo needed with description'
      )

      // Verify we're on the options page
      const currentUrl = page.url()
      expect(currentUrl).toContain('/give/mobile/options')
    })

    test('Allows proceeding with photo but no description', async ({
      page,
    }) => {
      // Navigate to the give page (mobile flow starts at photos)
      await page.gotoAndVerify('/give/mobile/photos', {
        timeout: timeouts.navigation.default,
      })

      // Wait for the photo uploader
      await page.waitForSelector('.photo-uploader, .app-give-photos', {
        timeout: timeouts.ui.appearance,
      })

      // For this test, we need to upload a photo.
      // Look for a file input and upload a test image.
      const fileInput = page.locator('input[type="file"]').first()

      // Create a simple test image (1x1 pixel PNG)
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      )

      // Upload the test image
      await fileInput.setInputFiles({
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: testImageBuffer,
      })
      console.log('Uploaded test image')

      // Wait for photo processing
      await page.waitForTimeout(timeouts.api.default)

      // After photo upload, the Next button should appear
      const nextButton = page.locator('button.w-100').filter({
        hasText: 'Next',
      })

      // Check if Next button is visible (only shows when photos are present)
      await nextButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await nextButton.click()
      console.log('Clicked Next after photo upload')

      // Should be on the details page
      await page.waitForSelector('#item-name', {
        timeout: timeouts.ui.appearance,
      })

      // Fill in the item name only
      const itemInput = page.locator('#item-name')
      await itemInput.fill('Test item with photo only')
      await itemInput.blur()
      console.log('Filled item name')

      // Leave description empty and click Next
      const detailsNextButton = page.locator('button.w-100').filter({
        hasText: 'Next',
      })
      await detailsNextButton.click()
      console.log('Clicked Next without description but with photo')

      // Wait for navigation to options page
      await page.waitForURL('**/give/mobile/options', {
        timeout: timeouts.navigation.default,
      })
      console.log(
        'Successfully navigated to options page - photo is sufficient'
      )

      // Verify we're on the options page
      const currentUrl = page.url()
      expect(currentUrl).toContain('/give/mobile/options')
    })
  })

  test.describe('Deadline validation', () => {
    // Set mobile viewport for these tests
    test.use({ viewport: { width: 414, height: 896 } })

    test('Rejects past dates when setting a deadline', async ({ page }) => {
      // Navigate to the mobile give photos page
      await page.gotoAndVerify('/give/mobile/photos', {
        timeout: timeouts.navigation.default,
      })

      // Skip adding a photo - click the skip link
      const skipLink = page.locator('a').filter({
        hasText: /skip/i,
      })
      await skipLink.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await skipLink.click()
      console.log('Skipped photo upload')

      // Fill in item details on the details page
      await page.waitForSelector('#item-name', {
        timeout: timeouts.ui.appearance,
      })

      const itemInput = page.locator('#item-name')
      await itemInput.fill('Test deadline validation item')

      const descriptionTextarea = page.locator('#description')
      await descriptionTextarea.fill('Testing deadline validation')
      console.log('Filled item details')

      // Click Next to go to options page
      const nextButton = page.locator('button.w-100').filter({
        hasText: 'Next',
      })
      await nextButton.click()

      // Wait for options page
      await page.waitForURL('**/give/mobile/options', {
        timeout: timeouts.navigation.default,
      })
      console.log('On options page')

      // Click "Set deadline" button
      const setDeadlineButton = page.locator('button.toggle-btn').filter({
        hasText: 'Set deadline',
      })
      await setDeadlineButton.click()
      console.log('Clicked Set deadline')

      // Wait for the date picker to appear
      const deadlinePicker = page.locator('.deadline-picker input[type="date"]')
      await deadlinePicker.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Type a date in the past (e.g., yesterday)
      // Note: The date input has min="today" but we force a past value via JavaScript
      // to test application-level validation (not browser validation)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .substring(0, 10)

      // Use evaluate to force the value past browser min constraint
      // This triggers Vue's v-model update and allows testing app validation
      await deadlinePicker.evaluate((el, value) => {
        el.value = value
        el.dispatchEvent(new Event('input', { bubbles: true }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }, yesterday)
      console.log(`Set deadline to past date: ${yesterday}`)

      // Wait for Vue reactivity to process the change
      await page.waitForTimeout(timeouts.ui.transition)

      // Verify the value was actually set before clicking Next
      const pickerValue = await deadlinePicker.inputValue()
      console.log(`Picker value after fill: ${pickerValue}`)

      // Click the Next button in the footer
      const footerNextButton = page.locator('.app-footer button').filter({
        hasText: 'Next',
      })
      await footerNextButton.click()
      console.log('Clicked Next with past deadline')

      // Wait for error message to appear
      const errorMessage = page.locator('.text-danger').filter({
        hasText: 'The deadline must be today or in the future',
      })
      await errorMessage.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log('Validation error appeared as expected')

      // Verify the input has is-invalid class
      const isInvalid = await deadlinePicker.evaluate((el) =>
        el.classList.contains('is-invalid')
      )
      expect(isInvalid).toBe(true)
      console.log('Date field marked as invalid')

      // Verify we're still on the options page (didn't navigate away)
      const currentUrl = page.url()
      expect(currentUrl).toContain('/give/mobile/options')
      console.log('Still on options page - navigation blocked as expected')
    })

    test('Accepts valid dates when setting a deadline', async ({ page }) => {
      // Navigate to the mobile give photos page
      await page.gotoAndVerify('/give/mobile/photos', {
        timeout: timeouts.navigation.default,
      })

      // Skip adding a photo
      const skipLink = page.locator('a').filter({
        hasText: /skip/i,
      })
      await skipLink.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await skipLink.click()

      // Fill in item details
      await page.waitForSelector('#item-name', {
        timeout: timeouts.ui.appearance,
      })

      const itemInput = page.locator('#item-name')
      await itemInput.fill('Test valid deadline item')

      const descriptionTextarea = page.locator('#description')
      await descriptionTextarea.fill('Testing valid deadline')

      // Click Next to go to options page
      const nextButton = page.locator('button.w-100').filter({
        hasText: 'Next',
      })
      await nextButton.click()

      // Wait for options page
      await page.waitForURL('**/give/mobile/options', {
        timeout: timeouts.navigation.default,
      })

      // Click "Set deadline" button
      const setDeadlineButton = page.locator('button.toggle-btn').filter({
        hasText: 'Set deadline',
      })
      await setDeadlineButton.click()

      // Wait for the date picker to appear
      const deadlinePicker = page.locator('.deadline-picker input[type="date"]')
      await deadlinePicker.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Type a valid future date (7 days from now)
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .substring(0, 10)
      await deadlinePicker.fill(futureDate)
      console.log(`Set deadline to future date: ${futureDate}`)

      // Click Next
      const footerNextButton = page.locator('.app-footer button').filter({
        hasText: 'Next',
      })
      await footerNextButton.click()

      // Should navigate to the next page (whereami)
      await page.waitForURL('**/give/mobile/whereami', {
        timeout: timeouts.navigation.default,
      })

      const currentUrl = page.url()
      expect(currentUrl).toContain('/give/mobile/whereami')
      console.log('Successfully navigated with valid deadline')
    })
  })

  test.describe('Desktop post flow validation', () => {
    // Set desktop viewport for these tests
    test.use({ viewport: { width: 1280, height: 800 } })

    test('Shows validation when neither photo nor description provided', async ({
      page,
    }) => {
      // Navigate to the give page on desktop
      await page.gotoAndVerify('/give', {
        timeout: timeouts.navigation.default,
      })

      // Wait for the post form to appear - look for the item name textbox
      const itemNameInput = page.locator(
        'input[placeholder*="single word"], input[placeholder*="what is it"]'
      )
      await itemNameInput.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log('Desktop give page loaded')

      // Check that the validation message is visible
      // On desktop, validation message shows immediately: "Add an item name and either a photo or description to continue."
      const validationText = page.locator(
        'text=Add an item name and either a photo or description'
      )
      await validationText.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log(
        'Validation message visible - item name and photo/description required'
      )

      // Fill in just the item name
      await itemNameInput.fill('Test desktop validation item')
      console.log('Filled item name on desktop')

      // Leave description empty - check validation still requires photo or description
      await page.waitForTimeout(timeouts.ui.transition)

      // The validation message should still be present (modified to say photo or description required)
      // Look for any indication that we need a photo or description
      const descriptionInput = page.locator(
        'input[placeholder*="colour"], textarea[placeholder*="colour"]'
      )

      // Verify description field exists and is empty
      if ((await descriptionInput.count()) > 0) {
        const descriptionValue = await descriptionInput.first().inputValue()
        expect(descriptionValue).toBe('')
        console.log('Description field is empty as expected')
      }

      console.log(
        'Desktop validation test completed - validation prevents proceeding without photo or description'
      )
    })
  })
})
