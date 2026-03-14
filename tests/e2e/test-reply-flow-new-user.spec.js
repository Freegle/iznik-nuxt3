/**
 * Reply Flow Tests - New User Registration (Tests 2.1, 2.2, 2.3)
 *
 * These tests cover the reply flow for new users who register during reply.
 * Each test creates unique users - can run in PARALLEL.
 */

const { test, expect } = require('./fixtures')
const { environment } = require('./config')
const { loginViaHomepage, logoutIfLoggedIn } = require('./utils/user')
const {
  navigateToMessageViaBrowse,
  navigateToMessageViaExplore,
  clickReplyButton,
  fillReplyForm,
  clickSendAndWait,
} = require('./utils/reply-helpers')

test.describe('Reply Flow - New User Registration', () => {
  test('2.1 can register and reply from Message Page', async ({
    page,
    postMessage,
    testEmail,
    getTestEmail,
    replyToMessageWithSignup,
    withdrawPost,
  }) => {
    // Use the existing fixture which handles new user registration
    const uniqueItem = `test-newuser-msg-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for new user registration reply',
      postcode: environment.postcode,
      email: testEmail,
    })
    expect(result.id).toBeTruthy()

    // Clear session to simulate new user
    await logoutIfLoggedIn(page)

    // Use the fixture to reply with signup
    const replyEmail = getTestEmail('newuser')
    await replyToMessageWithSignup({
      messageId: result.id,
      itemName: result.item,
      email: replyEmail,
    })

    console.log('[Test] New user registration from message page successful')

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, testEmail)
    await withdrawPost({ item: result.item })
  })

  test('2.2 can register and reply from Browse Page', async ({
    page,
    postMessage,
    testEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // Post a message first
    const uniqueItem = `test-newuser-browse-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for new user registration from browse page',
      postcode: environment.postcode,
      email: testEmail,
    })
    expect(result.id).toBeTruthy()

    // Clear session to simulate new user
    await logoutIfLoggedIn(page)

    // Navigate via browse page (use specific group since /browse might be empty)
    await navigateToMessageViaBrowse(
      page,
      result.id,
      'FreeglePlayground',
      uniqueItem
    )
    await clickReplyButton(page)

    // Fill in reply as new user
    const replyEmail = getTestEmail('newuser-browse')
    await fillReplyForm(page, {
      email: replyEmail,
      replyText: 'Interested in this item as a new user from browse!',
      collectText: 'Can collect anytime',
    })
    await clickSendAndWait(page, { expectWelcomeModal: true })

    expect(page.url()).toContain('/chats/')
    console.log('[Test] New user registration from browse page successful')

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, testEmail)
    await withdrawPost({ item: result.item })
  })

  test('2.3 can register and reply from Explore Page', async ({
    page,
    postMessage,
    testEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // Post a message first
    const uniqueItem = `test-newuser-explore-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for new user registration from explore page',
      postcode: environment.postcode,
      email: testEmail,
    })
    expect(result.id).toBeTruthy()

    // Clear session to simulate new user
    await logoutIfLoggedIn(page)

    // Navigate via explore page and find our specific message
    await navigateToMessageViaExplore(page, 'FreeglePlayground', uniqueItem)
    await clickReplyButton(page)

    // Fill in reply as new user
    const replyEmail = getTestEmail('newuser-explore')
    await fillReplyForm(page, {
      email: replyEmail,
      replyText: 'Interested in this item as a new user from explore!',
      collectText: 'Can collect anytime',
    })
    await clickSendAndWait(page, { expectWelcomeModal: true })

    expect(page.url()).toContain('/chats/')
    console.log('[Test] New user registration from explore page successful')

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, testEmail)
    await withdrawPost({ item: result.item })
  })
})
