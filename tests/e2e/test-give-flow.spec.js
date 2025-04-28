// @ts-check
/**
 * Tests for the give flow - posting items to Freegle
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')

test.describe('Give flow tests', () => {
  test('Basic post, no attachment', async ({ page, testEmail }) => {
    // Create a unique description with timestamp to identify this specific post
    const itemDescription = `Created by automated test at ${new Date().toISOString()}`

    // Step 1: Navigate to the give page
    await page.gotoAndVerify('/give', { timeout: timeouts.navigation.initial })

    // Step 2: Verify we're on the give page by checking the title or some distinctive element
    const pageTitle = await page.title()
    expect(pageTitle).toContain('OFFER')

    // Step 3: Fill in the item type (item)
    await page
      .locator('[id^="what"], .type-input, input[placeholder*="give"]')
      .click()
    await page
      .locator('[id^="what"], .type-input, input[placeholder*="give"]')
      .fill('test post - please delete')

    // Step 4: Fill in the post details
    // Wait for the next section to appear after selecting type
    await page.waitForSelector(
      '[id^="description"], textarea.description, textarea.form-control',
      { timeout: timeouts.ui.appearance }
    )

    // Add the description
    await page
      .locator(
        '[id^="description"], textarea.description, textarea.form-control'
      )
      .fill(itemDescription)

    // Step 5: Click the Next/Continue button to go to location page
    await page
      .locator('.btn:has-text("Next")')
      .filter({ visible: true })
      .first()
      .click()

    // Step 6: Fill in location details
    // Wait for the location section to appear
    await page.waitForSelector('.pcinp, input[placeholder="Type postcode"]', {
      timeout: timeouts.ui.appearance,
    })

    // Fill in the postcode
    await page
      .locator('.pcinp, input[placeholder="Type postcode"]')
      .fill(environment.postcode)

    // Wait for the location to be confirmed (look for the check icon or group selection)
    await page.waitForSelector(
      '.text-success.fa-bh, .fa-check-circle, .v-icon[icon="check-circle"]',
      { timeout: timeouts.api.default }
    )

    // Click the Next/Continue button to go to email page
    await page
      .locator('.btn:has-text("Next")')
      .filter({ visible: true })
      .first()
      .click()

    // Step 7: Fill in the email (final step)
    // Wait for the email input to appear
    await page.waitForSelector(
      'input[name="email"], input.email, input[type="email"]',
      { timeout: timeouts.ui.appearance }
    )

    // Fill in our generated test email
    await page
      .locator('input[name="email"], input.email, input[type="email"]')
      .fill(testEmail)

    // Click the Submit/Post button to finalize
    await page
      .locator('.btn:has-text("Freegle it!")')
      .filter({ visible: true })
      .first()
      .click()

    // Step 8: Verify the post was successful
    // First look for the progress bar as an indicator of submission
    await page.waitForSelector('.progress-bar', {
      timeout: timeouts.api.default,
    })

    // Then wait for redirect to the success page or message
    await page.waitForNavigation({
      timeout: timeouts.api.slowApi,
      waitUntil: 'networkidle',
    })

    // Generate a timestamp for the screenshot
    const screenshotTimestamp = new Date().toISOString().replace(/[:.]/g, '-')

    // Take a screenshot of the success
    await page.screenshot({
      path: `playwright-screenshots/item-post-success-${screenshotTimestamp}.png`,
      fullPage: true,
    })

    // Verify we're on the success page (usually my posts page after successful submission)
    expect(page.url()).toContain('myposts')

    // Check for the posted item somewhere on the page
    // This could be a message or div containing our description
    // Use a partial match since the full description might be truncated
    const descriptionShort = itemDescription.substring(0, 30) // First 30 chars should be unique enough

    await page.waitForSelector(
      `.messagecard:has-text("${descriptionShort}"), .mypost:has-text("${descriptionShort}")`,
      { timeout: timeouts.ui.appearance }
    )

    // Optional: Try to get the post ID if it's shown on the page
    try {
      const messageCard = await page
        .locator(
          `.messagecard:has-text("${descriptionShort}"), .mypost:has-text("${descriptionShort}")`
        )
        .first()

      // Look for post ID in the element's attributes or content
      const postId =
        (await messageCard.getAttribute('data-id')) ||
        (await messageCard.getAttribute('id'))

      if (postId) {
        console.log(`Successfully created post with ID: ${postId}`)
      } else {
        console.log('Post created successfully but could not extract post ID')
      }
    } catch (error) {
      console.log(
        'Post appears to be created but could not find details:',
        error.message
      )
    }

    // Final assertion that we can see our post on the page
    expect(
      await page
        .locator(
          `.messagecard:has-text("${descriptionShort}"), .mypost:has-text("${descriptionShort}")`
        )
        .isVisible()
    ).toBeTruthy()
  })
})
