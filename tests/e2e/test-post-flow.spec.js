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
    const uniqueItem = `test-offer-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
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
    await page.waitForSelector('.messagecard, .card-body', {
      timeout: timeouts.ui.appearance,
    })
    
    // Look for our specific unique item in the message cards.
    const itemLocator = page.locator('.messagecard, .card-body').filter({ hasText: uniqueItem })
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
    const uniqueItem = `test-reply-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
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
    await page.waitForSelector('.chatentry', {
      timeout: timeouts.background,
    })

    // Check that there's one chat entry (the reply)
    const chatEntries = page.locator('.chatentry').filter({ visible: true })
    const chatCount = await chatEntries.count()
    expect(chatCount).toEqual(1)
    console.log(`Found ${chatCount} chat entries in /chats`)

    // Click on the chat entry to open the conversation
    console.log('Opening chat conversation to reply back')
    await chatEntries.first().click()
    await page.waitForTimeout(timeouts.ui.transition)

    // Wait for the chat conversation to load
    await page.waitForSelector('#chatmessage', {
      timeout: timeouts.ui.appearance,
    })

    // Send a reply back to the person who messaged
    const replyMessage =
      'Thank you for your interest! When would be a good time to collect?'
    const replyTextarea = page.locator('#chatmessage')
    await replyTextarea.fill(replyMessage)
    console.log('Filled reply message from original user')

    // Click the send button
    const sendButton = page
      .locator('.btn:has-text("Send")')
      .filter({ hasText: /send/i })
      .first()
    await sendButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await sendButton.click()
    console.log('Sent reply from original user')

    // Wait for the reply to be sent
    await page.waitForTimeout(timeouts.ui.transition)

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
    const uniqueItem = `test-wanted-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
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

    // Navigate to /browse and verify a post is visible
    console.log('Navigating to /browse to verify WANTED post visibility')
    await page.gotoAndVerify('/browse', {
      timeout: timeouts.navigation.default,
    })

    // Wait for message cards and verify our specific item is visible
    await page.waitForSelector('.messagecard, .card-body', {
      timeout: timeouts.ui.appearance,
    })
    
    // Look for our specific unique item in the message cards
    const itemLocator = page.locator('.messagecard, .card-body').filter({ hasText: uniqueItem })
    await itemLocator.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log(`Found our test WANTED item "${uniqueItem}" on browse page`)

    // Use the fixture to withdraw the post
    await withdrawPost({ item: result.item })
  })
})
