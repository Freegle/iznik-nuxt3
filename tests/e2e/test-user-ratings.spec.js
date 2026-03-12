/**
 * Tests for user ratings functionality
 * - Give thumbs up to a user
 * - Remove a rating (click again to show remove modal)
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

    // Navigate to /chats
    await page.gotoAndVerify('/chats')

    // Wait for chat entry to appear and click it
    const chatEntry = page.locator('.chat-entry').first()
    await chatEntry.waitFor({ state: 'visible', timeout: timeouts.background })
    await chatEntry.click()
    await page.waitForTimeout(timeouts.ui.transition)

    // Dismiss the "Contact details" modal if it appears
    const contactDetailsModal = page.locator(
      '.modal-content:has-text("Contact details")'
    )
    try {
      await contactDetailsModal.waitFor({ state: 'visible', timeout: 5000 })
      console.log('Contact details modal appeared - dismissing it')
      await contactDetailsModal.locator('button:has-text("Cancel")').click()
      await contactDetailsModal.waitFor({ state: 'hidden', timeout: 5000 })
    } catch (e) {
      // Modal didn't appear, continue
    }

    // Find the visible UserRatings component
    const userRatings = page
      .locator('.user-ratings')
      .filter({ visible: true })
      .first()
    await userRatings.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('UserRatings component visible')

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

    // Click thumbs up using Playwright's click (not manual MouseEvent dispatch)
    await thumbsUpButton.scrollIntoViewIfNeeded()
    await thumbsUpButton.click({ force: true })
    console.log('Clicked thumbs up button')

    // Wait for the count to update
    const expectedCount = initialCount + 1
    await expect
      .poll(
        async () => {
          const text = await thumbsUpButton.textContent()
          return parseInt(text.replace(/\D/g, '')) || 0
        },
        { timeout: timeouts.background }
      )
      .toBe(expectedCount)
    console.log(`Thumbs up count updated to ${expectedCount}`)

    // Click again to show the remove modal
    await thumbsUpButton.click({ force: true })

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
    await removeModal
      .locator('button')
      .filter({ hasText: 'Remove rating' })
      .click()

    // Wait for the count to go back to original
    await expect
      .poll(
        async () => {
          const text = await thumbsUpButton.textContent()
          return parseInt(text.replace(/\D/g, '')) || 0
        },
        { timeout: timeouts.background }
      )
      .toBe(initialCount)
    console.log(`Thumbs up count back to ${initialCount}`)

    console.log('Successfully rated and unrated user')

    // Clean up - withdraw the post
    await withdrawPost({ item: result.item })
    console.log('Test completed - post withdrawn')
  })
})
