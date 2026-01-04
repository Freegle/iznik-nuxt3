/**
 * Reply Flow Tests - Existing User Forced Login (Tests 3.1, 3.2, 3.3)
 *
 * These tests cover the reply flow for existing users who are forced to login.
 * Each test creates unique users - can run in PARALLEL.
 */

const { test, expect } = require('./fixtures')
const { environment, timeouts, DEFAULT_TEST_PASSWORD } = require('./config')
const {
  loginViaHomepage,
  logoutIfLoggedIn,
  signUpViaHomepage,
} = require('./utils/user')
const {
  navigateToMessageViaBrowse,
  navigateToMessageViaExplore,
  clickReplyButton,
  fillReplyForm,
} = require('./utils/reply-helpers')

test.describe('Reply Flow - Existing User Forced Login', () => {
  test('3.1 can login and reply from Message Page', async ({
    page,
    postMessage,
    testEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // First create a user by signing up (this will be the "existing" user who will reply)
    const existingEmail = getTestEmail('existing')
    await signUpViaHomepage(page, existingEmail)

    // Log out so we can post as a different user (the poster)
    await logoutIfLoggedIn(page)

    // Post a message as the poster (testEmail)
    const uniqueItem = `test-existing-msg-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for existing user forced login reply',
      postcode: environment.postcode,
      email: testEmail,
    })
    expect(result.id).toBeTruthy()

    // Log out from poster to simulate session expiry for the existing user
    await logoutIfLoggedIn(page)

    // Navigate to message page
    await page.gotoAndVerify(`/message/${result.id}`)
    await clickReplyButton(page)

    // Fill in reply with existing user's email - should trigger login flow
    await fillReplyForm(page, {
      email: existingEmail,
      replyText: 'I want this item (existing user logging back in)!',
      collectText: 'Can collect anytime',
    })

    // Click send - this should trigger the forced login flow
    const sendButton = page
      .locator('.btn:has-text("Send your reply")')
      .filter({ visible: true })
    await sendButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await sendButton.click()

    // Wait for login modal to appear
    const loginModal = page.locator('.modal-content').filter({
      hasText: 'Log in',
    })
    await loginModal.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('[Test] Login modal appeared for existing user')

    // Complete login - need to fill both email and password
    const emailInput = loginModal.locator('input[type="email"]')
    await emailInput.fill(existingEmail)
    console.log(`[Test] Filled login email: ${existingEmail}`)

    const passwordInput = loginModal.locator('input[type="password"]')
    await passwordInput.fill(DEFAULT_TEST_PASSWORD)
    console.log('[Test] Filled login password')

    // Press Enter to submit the form (more reliable than clicking button)
    await passwordInput.press('Enter')
    console.log('[Test] Pressed Enter to submit login form')

    // Wait for login modal to close (login success)
    await loginModal.waitFor({
      state: 'hidden',
      timeout: timeouts.navigation.default,
    })
    console.log('[Test] Login modal closed')

    // After forced login, the state machine should resume automatically.
    // But if the page refreshed or state was lost, we might need to click Send again.
    // Wait for either navigation to /chats/ OR the reply section to still be visible
    const currentUrl = page.url()
    if (!currentUrl.includes('/chats/')) {
      console.log(
        '[Test] Not navigated to chats yet, checking if need to click Send again'
      )

      // Check if Send button is visible (state machine might need manual trigger)
      const sendButtonAgain = page
        .locator('.btn:has-text("Send your reply")')
        .filter({ visible: true })
      if (await sendButtonAgain.isVisible()) {
        console.log('[Test] Send button visible, clicking it')
        await sendButtonAgain.click()
      }
    }

    // Wait for navigation to chats
    await page.waitForURL(/\/chats\//, {
      timeout: timeouts.navigation.default,
    })

    // Should navigate to chats after successful login and reply
    expect(page.url()).toContain('/chats/')
    console.log(
      '[Test] Existing user forced login from message page successful'
    )

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, testEmail)
    await withdrawPost({ item: result.item })
  })

  test('3.2 can login and reply from Browse Page', async ({
    page,
    postMessage,
    testEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // First create a user by signing up (this will be the "existing" user who will reply)
    const existingEmail = getTestEmail('existing-browse')
    await signUpViaHomepage(page, existingEmail)

    // Log out so we can post as a different user (the poster)
    await logoutIfLoggedIn(page)

    // Post a message as the poster (testEmail)
    const uniqueItem = `test-existing-browse-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for existing user forced login from browse',
      postcode: environment.postcode,
      email: testEmail,
    })
    expect(result.id).toBeTruthy()

    // Log out from poster
    await logoutIfLoggedIn(page)

    // Navigate via browse page (use specific group since /browse might be empty)
    await navigateToMessageViaBrowse(
      page,
      result.id,
      'FreeglePlayground',
      uniqueItem
    )
    await clickReplyButton(page)

    // Fill in reply with existing user's email
    await fillReplyForm(page, {
      email: existingEmail,
      replyText: 'I want this item from browse (existing user)!',
      collectText: 'Can collect anytime',
    })

    // Click send
    const sendButton = page
      .locator('.btn:has-text("Send your reply")')
      .filter({ visible: true })
    await sendButton.click()

    // Wait for login modal
    const loginModal = page.locator('.modal-content').filter({
      hasText: 'Log in',
    })
    await loginModal.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('[Test] Login modal appeared')

    // Complete login - need to fill both email and password
    const emailInput = loginModal.locator('input[type="email"]')
    await emailInput.fill(existingEmail)
    console.log(`[Test] Filled login email: ${existingEmail}`)

    const passwordInput = loginModal.locator('input[type="password"]')
    await passwordInput.fill(DEFAULT_TEST_PASSWORD)
    console.log('[Test] Filled login password')

    // Press Enter to submit the form
    await passwordInput.press('Enter')
    console.log('[Test] Pressed Enter to submit login form')

    // Wait for login modal to close
    await loginModal.waitFor({
      state: 'hidden',
      timeout: timeouts.navigation.default,
    })
    console.log('[Test] Login modal closed')

    // After forced login, may need to click Send again
    const currentUrl = page.url()
    if (!currentUrl.includes('/chats/')) {
      console.log(
        '[Test] Not navigated to chats yet, checking if need to click Send again'
      )
      const sendButtonAgain = page
        .locator('.btn:has-text("Send your reply")')
        .filter({ visible: true })
      if (await sendButtonAgain.isVisible()) {
        console.log('[Test] Send button visible, clicking it')
        await sendButtonAgain.click()
      }
    }

    // Wait for navigation to chats
    await page.waitForURL(/\/chats\//, {
      timeout: timeouts.navigation.default,
    })

    expect(page.url()).toContain('/chats/')
    console.log('[Test] Existing user forced login from browse page successful')

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, testEmail)
    await withdrawPost({ item: result.item })
  })

  test('3.3 can login and reply from Explore Page', async ({
    page,
    postMessage,
    testEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // First create a user by signing up (this will be the "existing" user who will reply)
    const existingEmail = getTestEmail('existing-explore')
    await signUpViaHomepage(page, existingEmail)

    // Log out so we can post as a different user (the poster)
    await logoutIfLoggedIn(page)

    // Post a message as the poster (testEmail)
    const uniqueItem = `test-existing-explore-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for existing user forced login from explore',
      postcode: environment.postcode,
      email: testEmail,
    })
    expect(result.id).toBeTruthy()

    // Log out from poster
    await logoutIfLoggedIn(page)

    // Navigate via explore page
    await navigateToMessageViaExplore(page, 'FreeglePlayground')
    await clickReplyButton(page)

    // Fill in reply with existing user's email
    await fillReplyForm(page, {
      email: existingEmail,
      replyText: 'I want this item from explore (existing user)!',
      collectText: 'Can collect anytime',
    })

    // Click send
    const sendButton = page
      .locator('.btn:has-text("Send your reply")')
      .filter({ visible: true })
    await sendButton.click()

    // Wait for login modal
    const loginModal = page.locator('.modal-content').filter({
      hasText: 'Log in',
    })
    await loginModal.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('[Test] Login modal appeared')

    // Complete login - need to fill both email and password
    const emailInput = loginModal.locator('input[type="email"]')
    await emailInput.fill(existingEmail)
    console.log(`[Test] Filled login email: ${existingEmail}`)

    const passwordInput = loginModal.locator('input[type="password"]')
    await passwordInput.fill(DEFAULT_TEST_PASSWORD)
    console.log('[Test] Filled login password')

    // Press Enter to submit the form
    await passwordInput.press('Enter')
    console.log('[Test] Pressed Enter to submit login form')

    // Wait for login modal to close
    await loginModal.waitFor({
      state: 'hidden',
      timeout: timeouts.navigation.default,
    })
    console.log('[Test] Login modal closed')

    // After forced login, may need to click Send again
    const currentUrl = page.url()
    if (!currentUrl.includes('/chats/')) {
      console.log(
        '[Test] Not navigated to chats yet, checking if need to click Send again'
      )
      const sendButtonAgain = page
        .locator('.btn:has-text("Send your reply")')
        .filter({ visible: true })
      if (await sendButtonAgain.isVisible()) {
        console.log('[Test] Send button visible, clicking it')
        await sendButtonAgain.click()
      }
    }

    // Wait for navigation to chats
    await page.waitForURL(/\/chats\//, {
      timeout: timeouts.navigation.default,
    })

    expect(page.url()).toContain('/chats/')
    console.log(
      '[Test] Existing user forced login from explore page successful'
    )

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, testEmail)
    await withdrawPost({ item: result.item })
  })
})
