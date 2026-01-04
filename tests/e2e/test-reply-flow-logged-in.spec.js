/**
 * Reply Flow Tests - Logged In User (Tests 1.1, 1.2, 1.3)
 *
 * These tests cover the reply flow for users who are already logged in.
 * They MUST run serially because they share existingTestEmail (pre-registered user).
 */

const { test, expect } = require('./fixtures')
const { environment } = require('./config')
const { loginViaHomepage, logoutIfLoggedIn } = require('./utils/user')
const {
  waitForAuthInLocalStorage,
  waitForAuthHydration,
  clickReplyButton,
  fillReplyForm,
  clickSendAndWait,
} = require('./utils/reply-helpers')

test.describe('Reply Flow - Logged In User', () => {
  // Tests 1.x use existingTestEmail (shared pre-registered user) - must be serial
  test.describe.configure({ mode: 'serial' })

  test('1.1 can reply from Message Page', async ({
    page,
    postMessage,
    existingTestEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // Post a message first (as posterEmail)
    const posterEmail = getTestEmail('poster')
    const uniqueItem = `test-logged-in-msg-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for logged in reply from message page',
      postcode: environment.postcode,
      email: posterEmail,
    })
    expect(result.id).toBeTruthy()
    console.log(`[Test] Posted message ${result.id}`)

    // Log out from poster
    await logoutIfLoggedIn(page)

    // Login as existingTestEmail FIRST (before navigating to message page)
    // This uses a pre-registered test user to ensure login succeeds
    // Must pass the correct password for the pre-registered test user
    await loginViaHomepage(
      page,
      existingTestEmail,
      environment.unmodded_password
    )
    await waitForAuthInLocalStorage(page)
    console.log('[Test] Logged in as existingTestEmail')

    // NOW navigate to message page (message will load with auth → has groups)
    await page.gotoAndVerify(`/message/${result.id}`)
    await waitForAuthHydration(page)
    console.log('[Test] Navigated to message page while logged in')

    await clickReplyButton(page)

    // Fill and send reply (no email needed - logged in)
    await fillReplyForm(page, {
      replyText: 'I would love this item, please!',
      collectText: 'Available weekdays after 5pm',
    })
    await clickSendAndWait(page)

    // Verify we navigated to chats
    expect(page.url()).toContain('/chats/')
    console.log('[Test] Reply from message page successful')

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, posterEmail)
    await withdrawPost({ item: result.item })
  })

  test('1.2 can reply from Browse Page', async ({
    page,
    postMessage,
    existingTestEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // Post a message first (as posterEmail)
    const posterEmail = getTestEmail('poster-browse')
    const uniqueItem = `test-logged-in-browse-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for logged in reply from browse page',
      postcode: environment.postcode,
      email: posterEmail,
    })
    expect(result.id).toBeTruthy()

    // Log out from poster
    await logoutIfLoggedIn(page)

    // Login as existingTestEmail FIRST (before navigating)
    // This uses a pre-registered test user to ensure login succeeds
    // Must pass the correct password for the pre-registered test user
    await loginViaHomepage(
      page,
      existingTestEmail,
      environment.unmodded_password
    )
    await waitForAuthInLocalStorage(page)
    console.log('[Test] Logged in as existingTestEmail')

    // Navigate directly to the message page (while logged in)
    // Using direct navigation because newly posted messages may not appear
    // immediately in browse/explore due to caching/indexing delays
    await page.gotoAndVerify(`/message/${result.id}`)
    await waitForAuthHydration(page)
    console.log('[Test] Navigated to message page while logged in')

    await clickReplyButton(page)

    await fillReplyForm(page, {
      replyText: 'Interested in this item from browse!',
      collectText: 'Can collect anytime',
    })
    await clickSendAndWait(page)

    expect(page.url()).toContain('/chats/')
    console.log('[Test] Reply from browse page successful')

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, posterEmail)
    await withdrawPost({ item: result.item })
  })

  test('1.3 can reply from Explore Page', async ({
    page,
    postMessage,
    existingTestEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // Post a message first (as posterEmail)
    const posterEmail = getTestEmail('poster-explore')
    const uniqueItem = `test-logged-in-explore-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for logged in reply from explore page',
      postcode: environment.postcode,
      email: posterEmail,
    })
    expect(result.id).toBeTruthy()

    // Log out from poster
    await logoutIfLoggedIn(page)

    // Login as existingTestEmail FIRST (before navigating)
    // This uses a pre-registered test user to ensure login succeeds
    // Must pass the correct password for the pre-registered test user
    await loginViaHomepage(
      page,
      existingTestEmail,
      environment.unmodded_password
    )
    await waitForAuthInLocalStorage(page)
    console.log('[Test] Logged in as existingTestEmail')

    // Navigate directly to the message page (while logged in)
    // Using direct navigation because newly posted messages may not appear
    // immediately in browse/explore due to caching/indexing delays
    await page.gotoAndVerify(`/message/${result.id}`)
    await waitForAuthHydration(page)
    console.log('[Test] Navigated to message page while logged in')

    await clickReplyButton(page)

    await fillReplyForm(page, {
      replyText: 'Interested in this item from explore!',
      collectText: 'Can collect anytime',
    })
    await clickSendAndWait(page)

    expect(page.url()).toContain('/chats/')
    console.log('[Test] Reply from explore page successful')

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, posterEmail)
    await withdrawPost({ item: result.item })
  })
})
