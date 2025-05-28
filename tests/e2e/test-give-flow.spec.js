// @ts-check
/**
 * Tests for the give flow - posting OFFER items to Freegle
 */

const { test, expect } = require('./fixtures')
const { environment, timeouts } = require('./config')
const { loginViaHomepage, logoutIfLoggedIn } = require('./utils/user')

test.describe('Give flow tests', () => {
  test('Logged out, new user, basic OFFER post, no attachment', async ({
    page,
    testEmail,
    postMessage,
    registerTestEmail,
    withdrawPost,
  }) => {
    // Register the automatically generated test email for cleanup
    registerTestEmail(testEmail)

    // Use the fixture to post a message
    const result = await postMessage({
      type: 'OFFER',
      item: 'test post - please delete',
      description: `Created by automated test at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`Post result: ${JSON.stringify(result)}`)

    // Check that the result has an id
    expect(result.id).toBeTruthy()
    expect(result.id).not.toBe(null)
    console.log(`Post created with ID: ${result.id}`)

    // Use the fixture to withdraw the post
    await withdrawPost({ item: result.item })
  })

  test('Post message and reply', async ({
    page,
    testEmail,
    getTestEmail,
    postMessage,
    registerTestEmail,
    withdrawPost,
    replyToMessageWithSignup,
  }) => {
    // Register test emails for cleanup
    registerTestEmail(testEmail)
    const replyEmail = getTestEmail('reply')
    registerTestEmail(replyEmail)

    // Post a message using the logged-out user flow
    const result = await postMessage({
      type: 'OFFER',
      item: 'test item for reply - please delete',
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
    await page.waitForSelector('.chatentry', {
      timeout: timeouts.background,
    })

    // Check that there's one chat entry (the reply)
    const chatEntries = page.locator('.chatentry').filter({ visible: true })
    const chatCount = await chatEntries.count()
    expect(chatCount).toEqual(1)
    console.log(`Found ${chatCount} chat entries in /chats`)

    // Now withdraw the post using the fixture
    await withdrawPost({ item: result.item })
    console.log('Original user successfully withdrew the post')
  })
})
