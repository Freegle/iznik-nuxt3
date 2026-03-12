/**
 * Tests for the post flow - posting OFFER and WANTED items to Freegle
 */

const { test, expect } = require('./fixtures')
const { environment, timeouts } = require('./config')
const { loginViaHomepage, logoutIfLoggedIn } = require('./utils/user')

test.describe('Post flow tests', () => {
  test('Logged out, new user, basic OFFER post, no attachment', async ({
    page,
    testEmail,
    postMessage,
    withdrawPost,
  }) => {
    // Use the fixture to post a message with unique item name
    const uniqueItem = `test-offer-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: `Created by automated test at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`Post result: ${JSON.stringify(result)}`)

    // Check that the result has an id
    expect(result.id).toBeTruthy()
    expect(result.id).not.toBe(null)
    console.log(`Post created with ID: ${result.id}`)

    // Navigate to /browse and verify a post is visible
    console.log('Navigating to /browse to verify post visibility')
    await page.gotoAndVerify('/browse', {
      timeout: timeouts.navigation.default,
    })

    // Wait for message cards and verify our specific item is visible
    // Note: Browse page uses MessageSummaryMobile with .message-summary-mobile class
    await page.waitForSelector('.message-summary-mobile, .messagecard', {
      timeout: timeouts.ui.appearance,
    })

    // Look for our specific unique item in the message cards.
    const itemLocator = page
      .locator('.message-summary-mobile, .messagecard')
      .filter({ hasText: uniqueItem })
    await itemLocator.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log(`Found our test item "${uniqueItem}" on browse page`)

    // Use the fixture to withdraw the post
    await withdrawPost({ item: result.item })
  })

  test('Post message and reply', async ({
    page,
    testEmail,
    getTestEmail,
    postMessage,
    withdrawPost,
    takeScreenshot,
    replyToMessageWithSignup,
  }) => {
    const replyEmail = getTestEmail('reply')

    // Post a message using the logged-out user flow with unique item name
    const uniqueItem = `test-reply-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: `Created by automated test at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`Post result: ${JSON.stringify(result)}`)
    expect(result.id).toBeTruthy()
    console.log(`Post created with ID: ${result.id}`)

    // Clear session data to simulate logout
    await logoutIfLoggedIn(page)

    // Use the fixture to reply to the message with signup
    await replyToMessageWithSignup({
      messageId: result.id,
      itemName: result.item,
      email: replyEmail,
    })

    // Now log back in as the original user and withdraw the post
    console.log('Logging in as original user to withdraw the post')
    await logoutIfLoggedIn(page)
    const loginSuccess = await loginViaHomepage(page, testEmail)
    if (!loginSuccess) {
      // Capture screenshot for debugging
      await page.screenshot({
        path: `playwright-screenshots/logging-back-in-${Date.now()}.png`,
        fullPage: true,
      })
      throw new Error('Failed to login as original user')
    }
    console.log('Successfully logged in as original user')

    // Go to /chats and verify the reply is visible
    console.log('Navigating to /chats to check for reply')
    await page.gotoAndVerify('/chats')

    // Wait for the chat list to load and look for a chat entry
    await page.waitForSelector('.chat-entry', {
      timeout: timeouts.background,
    })

    // Check that there's one chat entry (the reply)
    const chatEntries = page.locator('.chat-entry').filter({ visible: true })
    const chatCount = await chatEntries.count()
    expect(chatCount).toEqual(1)
    console.log(`Found ${chatCount} chat entries in /chats`)

    // Click on the chat entry to open the conversation
    console.log('Opening chat conversation to reply back')
    await chatEntries.first().click()

    // Wait for the chat conversation to load
    await expect(page.locator('#chatmessage')).toBeVisible()

    // Send a reply back to the person who messaged
    const replyMessage =
      'Thank you for your interest! When would be a good time to collect?'
    const replyTextarea = page.locator('#chatmessage')
    await replyTextarea.fill(replyMessage)
    console.log('Filled reply message from original user')

    // Click the send button
    const sendButton = page.getByRole('button', { name: 'Send' })
    // Start waiting for network response before clicking send - note no await yet
    const sendMessageResponse = page.waitForResponse(
      async (response) =>
        response.url().startsWith('http://apiv2.localhost/api/chat') &&
        response.status() === 200 &&
        response.request().method() === 'POST' &&
        (await response.request().postDataJSON()).message === replyMessage
    )
    await sendButton.click() // Then send the message
    console.log('Sent reply from original user')
    await sendMessageResponse // Then await the network response indicating message sent

    // Now withdraw the post using the fixture
    await withdrawPost({ item: result.item })
    console.log('Original user successfully withdrew the post')
  })

  test('Logged out, new user, basic WANTED post, no attachment', async ({
    page,
    testEmail,
    postMessage,
    withdrawPost,
  }) => {
    // Use the fixture to post a WANTED message with unique item name
    const uniqueItem = `test-wanted-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`
    const result = await postMessage({
      type: 'WANTED',
      item: uniqueItem,
      description: `Created by automated test at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`WANTED post result: ${JSON.stringify(result)}`)

    // Check that the result has an id
    expect(result.id).toBeTruthy()
    expect(result.id).not.toBe(null)
    console.log(`WANTED post created with ID: ${result.id}`)

    // Navigate to /myposts and verify the post is visible there
    // (We use /myposts instead of /browse because /browse may have many posts
    // and the newly created one might not be immediately visible without scrolling)
    console.log('Navigating to /myposts to verify WANTED post visibility')
    await page.gotoAndVerify('/myposts', {
      timeout: timeouts.navigation.default,
    })

    // Wait for message cards and verify our specific item is visible
    // Note: My Posts uses .message-card class (with hyphen)
    await page.waitForSelector('.message-card, .card-body', {
      timeout: timeouts.ui.appearance,
    })

    // Look for our specific unique item in the message cards
    const itemLocator = page
      .locator('.message-card, .card-body')
      .filter({ hasText: uniqueItem })
    await itemLocator.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log(`Found our test WANTED item "${uniqueItem}" on myposts page`)

    // Use the fixture to withdraw the post
    await withdrawPost({ item: result.item })
  })

  test("Email existence check - prevents posting with someone else's email", async ({
    page,
    testEmail,
    postMessage,
    withdrawPost,
  }) => {
    // First, create a user by posting with a specific email
    const uniqueItem = `test-email-check-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: `Created by automated test at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`Created post with email ${testEmail}, ID: ${result.id}`)
    expect(result.id).toBeTruthy()

    // Log out to simulate a different user trying to use this email
    await logoutIfLoggedIn(page)
    console.log(
      'Logged out, now attempting to post with the same email as a different user'
    )

    // Navigate to the give page to start a new post
    await page.gotoAndVerify('/give', {
      timeout: timeouts.navigation.initial,
    })

    // Fill in the item name
    await page
      .locator('[id^="what"], .type-input, input[placeholder*="give"]')
      .click()
    await page
      .locator('[id^="what"], .type-input, input[placeholder*="give"]')
      .clear()
    await page
      .locator('[id^="what"], .type-input, input[placeholder*="give"]')
      .type('test item for email check', { delay: 100 })

    // Fill in the description
    await page.waitForSelector(
      '[id^="description"], textarea.description, textarea.form-control',
      { timeout: timeouts.ui.appearance }
    )
    await page
      .locator(
        '[id^="description"], textarea.description, textarea.form-control'
      )
      .click()
    await page
      .locator(
        '[id^="description"], textarea.description, textarea.form-control'
      )
      .clear()
    await page
      .locator(
        '[id^="description"], textarea.description, textarea.form-control'
      )
      .type('Test description for email check', { delay: 50 })

    // Wait for Next button to be enabled
    await page.waitForFunction(
      () => {
        const allButtons = document.querySelectorAll('.btn, button')
        let mobileBtn = null
        let desktopBtn = null

        for (const btn of allButtons) {
          if (btn.textContent && btn.textContent.includes('Next')) {
            if (
              btn.closest('.d-block.d-md-none') ||
              btn.classList.contains('d-md-none')
            ) {
              mobileBtn = btn
            }
            if (
              btn.closest('.d-none.d-md-flex') ||
              (btn.classList.contains('d-none') &&
                btn.classList.contains('d-md-flex'))
            ) {
              desktopBtn = btn
            }
            if (!mobileBtn && !desktopBtn) {
              mobileBtn = btn
            }
          }
        }

        return (
          (mobileBtn && !mobileBtn.disabled) ||
          (desktopBtn && desktopBtn.offsetParent !== null)
        )
      },
      { timeout: timeouts.ui.appearance }
    )

    // Scroll and click Next to go to location page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.locator('.next-btn:has-text("Next")').click()

    // Fill in postcode
    await page.waitForSelector('.pcinp, input[placeholder="Type postcode"]', {
      timeout: timeouts.ui.appearance,
    })
    await page
      .locator('.pcinp, input[placeholder="Type postcode"]')
      .fill(environment.postcode)

    // Wait for location confirmation
    const confirmationIcon = page.locator(
      '.validation-tick, .text-success.fa-bh, .fa-check-circle, .v-icon[icon="check-circle"]'
    )
    await confirmationIcon.waitFor({
      state: 'visible',
      timeout: timeouts.api.default,
    })

    // Scroll and click Next to go to email page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.locator('.next-btn:has-text("Next")').click()

    // Fill in the email that already belongs to someone else
    console.log(`Filling in email ${testEmail} that belongs to existing user`)
    const emailInput = page
      .locator('input[name="email"], input.email, input[type="email"]')
      .first()
    await emailInput.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await emailInput.click()
    await emailInput.fill(testEmail)

    // Wait for the "Freegle it!" button to appear (email passes basic validation)
    console.log('Waiting for Freegle it button to appear')
    const freegleButton = page.locator('button:has-text("Freegle it!")')
    await freegleButton.first().waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Click the button to trigger email existence check
    console.log('Clicking Freegle it button to trigger email existence check')
    await freegleButton.first().click()

    // Wait for the error message to appear after the API check
    console.log('Waiting for email validation error message to appear')
    const errorMessage = page.locator('text=belongs to an existing account')
    await expect(errorMessage).toBeVisible()
    console.log(
      'Email existence check working correctly - error message displayed'
    )

    // Verify the "Freegle it!" button is no longer visible after error
    const isButtonVisible = await freegleButton
      .first()
      .isVisible()
      .catch(() => false)

    // The button should no longer be visible after the error appears
    expect(isButtonVisible).toBe(false)
    console.log(
      'Freegle it button is hidden as expected after email conflict detected'
    )

    // Clean up - log back in and withdraw the original post
    console.log('Logging back in to clean up the test post')
    const loginSuccess = await loginViaHomepage(page, testEmail)
    if (!loginSuccess) {
      throw new Error('Failed to login for cleanup')
    }

    await withdrawPost({ item: result.item })
    console.log('Test completed - email existence check verified successfully')
  })
})
