/**
 * Tests for user ratings functionality
 * - Give thumbs up to a user
 * - Remove a rating (click again to show remove modal)
 * Updated: 2026-01-11 - Removed ClientOnly wrapper, using native buttons
 */

const { test, expect } = require('./fixtures')
const { environment, timeouts } = require('./config')
const { loginViaHomepage, logoutIfLoggedIn } = require('./utils/user')

test.describe('User ratings tests', () => {
  test('Rate and unrate a user via chat', async ({
    page,
    testEmail,
    getTestEmail,
    postMessage,
    withdrawPost,
    replyToMessageWithSignup,
  }) => {
    // User A posts a message
    const uniqueItem = `test-rating-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`

    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: `Rating test post at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`Post created with ID: ${result.id}`)
    expect(result.id).toBeTruthy()

    // User B replies to the message (creates a new user)
    const replyEmail = getTestEmail('rater')
    await logoutIfLoggedIn(page)

    await replyToMessageWithSignup({
      messageId: result.id,
      itemName: result.item,
      email: replyEmail,
    })

    console.log('User B replied successfully')

    // Log back in as User A to see the chat with User B
    await logoutIfLoggedIn(page)
    const loginSuccess = await loginViaHomepage(page, testEmail)
    if (!loginSuccess) {
      throw new Error('Failed to login as User A')
    }
    console.log('Logged in as User A')

    // Set up console listener BEFORE navigating - must capture hydration logs
    const consoleLogs = []
    page.on('console', (msg) => {
      const text = msg.text()
      // Capture all UserRatings logs and also hydration warnings
      if (text.includes('UserRatings') || text.includes('hydration') || text.includes('Hydration')) {
        consoleLogs.push(text)
        console.log('BROWSER CONSOLE:', text)
      }
    })

    // Navigate to /chats
    await page.gotoAndVerify('/chats')

    // Wait for chat entry to appear
    await page.waitForSelector('.chat-entry', {
      timeout: timeouts.background,
    })

    // Click on the chat entry to open the conversation
    const chatEntry = page.locator('.chat-entry').first()
    await chatEntry.click()
    await page.waitForTimeout(timeouts.ui.transition)

    // Dismiss the "Contact details" modal if it appears.
    const contactDetailsModal = page.locator(
      '.modal-content:has-text("Contact details")'
    )
    try {
      await contactDetailsModal.waitFor({
        state: 'visible',
        timeout: 5000,
      })
      console.log('Contact details modal appeared - dismissing it')
      const cancelButton = contactDetailsModal.locator(
        'button:has-text("Cancel")'
      )
      await cancelButton.click()
      await contactDetailsModal.waitFor({ state: 'hidden', timeout: 5000 })
      console.log('Contact details modal dismissed')
    } catch (e) {
      console.log('Contact details modal did not appear - continuing')
    }

    // Wait for the UserRatings component to be visible
    const userRatings = page.locator('.user-ratings')
    await userRatings.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Wait for network to be idle to ensure hydration is complete
    await page.waitForLoadState('networkidle', { timeout: 30000 })

    // First button is thumbs-up
    const thumbsUpButton = userRatings.locator('button').first()
    await thumbsUpButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Get the initial thumbs up count
    const initialUpCount = await thumbsUpButton.textContent()
    const initialCount = parseInt(initialUpCount.replace(/\D/g, '')) || 0
    console.log(`Initial thumbs up count: ${initialCount}`)

    // Check if button is disabled
    const isDisabled = await thumbsUpButton.isDisabled()
    console.log(`Button disabled: ${isDisabled}`)

    // Get button HTML for debugging
    const buttonHtml = await thumbsUpButton.evaluate((el) => el.outerHTML)
    console.log(`Button HTML: ${buttonHtml}`)

    // Wait a bit to see if any mounting logs appear
    await page.waitForTimeout(500)
    console.log(`UserRatings console logs so far: ${consoleLogs.length}`)

    // Click thumbs up to rate the user
    console.log('Clicking thumbs up button...')
    await thumbsUpButton.click()

    // Wait a bit and check console logs
    await page.waitForTimeout(1000)
    console.log(`Console logs after click: ${consoleLogs.join(' | ')}`)

    // Wait for the count to update
    const expectedCount = initialCount + 1
    await page.waitForFunction(
      (expected) => {
        const btn = document.querySelector('.user-ratings button')
        if (!btn) return false
        const text = btn.textContent || ''
        const count = parseInt(text.replace(/\D/g, '')) || 0
        return count === expected
      },
      expectedCount,
      { timeout: timeouts.background }
    )

    // Verify the count increased
    const updatedUpCount = await thumbsUpButton.textContent()
    const updatedCount = parseInt(updatedUpCount.replace(/\D/g, '')) || 0
    console.log(`Updated thumbs up count: ${updatedCount}`)
    expect(updatedCount).toBe(initialCount + 1)

    // Now click again to show the remove modal
    await thumbsUpButton.click()
    console.log('Clicked thumbs up button again to show remove modal')

    // Wait for the remove rating modal to appear
    const removeModal = page.locator('.modal-dialog').filter({
      hasText: 'Removing a rating',
    })
    await removeModal.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('Remove rating modal appeared')

    // Click the "Remove rating" button in the modal
    const removeButton = removeModal.locator('button').filter({
      hasText: 'Remove rating',
    })
    await removeButton.click()
    console.log('Clicked Remove rating button')

    // Wait for the modal to close and rating to be removed
    await page.waitForTimeout(timeouts.ui.transition)

    // Wait for the count to go back to original
    await page.waitForFunction(
      (expected) => {
        const btn = document.querySelector('.user-ratings button')
        if (!btn) return false
        const text = btn.textContent || ''
        const count = parseInt(text.replace(/\D/g, '')) || 0
        return count === expected
      },
      initialCount,
      { timeout: timeouts.background }
    )

    // Verify the count went back to original
    const finalUpCount = await thumbsUpButton.textContent()
    const finalCount = parseInt(finalUpCount.replace(/\D/g, '')) || 0
    console.log(`Final thumbs up count: ${finalCount}`)
    expect(finalCount).toBe(initialCount)

    console.log('Successfully rated and unrated user')

    // Clean up - withdraw the post
    await withdrawPost({ item: result.item })
    console.log('Test completed - post withdrawn')
  })
})
// Trigger rebuild 20260111042927
// Build 1768109740
