/**
 * Shared helper functions for reply flow tests
 */

const { timeouts, environment } = require('../config')

/**
 * Helper: Wait for auth to be stored in localStorage after login
 * This ensures auth is persisted before navigating to a new page
 * The auth store persists with structure: { auth: { jwt, persistent }, userlist, loginCount, ... }
 */
async function waitForAuthInLocalStorage(page) {
  console.log('[Auth] Waiting for auth to be stored in localStorage...')
  await page.waitForFunction(
    () => {
      try {
        const authData = localStorage.getItem('auth')
        if (!authData) return false
        const parsed = JSON.parse(authData)
        // Check the nested auth object for jwt or persistent token
        const tokens = parsed?.auth
        return !!(tokens?.jwt || tokens?.persistent)
      } catch (e) {
        return false
      }
    },
    { timeout: timeouts.ui.appearance }
  )
  console.log('[Auth] Auth found in localStorage')
}

/**
 * Helper: Wait for auth to be hydrated after page load
 * This waits for the page to stabilize and gives the Pinia persistence
 * plugin time to hydrate auth from localStorage.
 */
async function waitForAuthHydration(page) {
  console.log('[Auth] Waiting for page to stabilize and auth to hydrate...')
  await page.waitForLoadState('networkidle', {
    timeout: timeouts.navigation.default,
  })
  console.log('[Auth] Page stabilized')
}

/**
 * Helper: Dismiss login modal if it appears
 * Browse and explore pages show a signup modal for non-logged-in users
 */
async function dismissLoginModalIfPresent(page) {
  // Check if login modal is visible (it appears on browse/explore for non-logged-in users)
  const loginModal = page.locator(
    '#loginModal, .modal-content:has-text("Join the Reuse Revolution")'
  )

  try {
    await loginModal.waitFor({ state: 'visible', timeout: 3000 })
    console.log('[Auth] Login modal detected, dismissing...')

    // Click the close button in the modal header
    const closeButton = page.locator(
      '.modal-header .btn-close, .modal-header button[aria-label="Close"]'
    )
    if (await closeButton.isVisible()) {
      await closeButton.click()
      console.log('[Auth] Clicked modal close button')
    } else {
      // Try clicking outside the modal to dismiss it
      await page.keyboard.press('Escape')
      console.log('[Auth] Pressed Escape to dismiss modal')
    }

    // Wait for modal to close
    await loginModal.waitFor({
      state: 'hidden',
      timeout: timeouts.ui.appearance,
    })
    console.log('[Auth] Login modal dismissed')
  } catch (e) {
    // Modal not visible or already closed - this is fine
    console.log('[Auth] No login modal to dismiss (or already closed)')
  }
}

/**
 * Helper: Navigate to a message via the browse page and open reply section
 * @param {Page} page - Playwright page
 * @param {number} messageId - ID of the message to find
 * @param {string} groupName - Optional group name to browse (if not specified, uses /browse)
 */
async function navigateToMessageViaBrowse(
  page,
  messageId,
  groupName = null,
  itemText = null
) {
  const browsePath = groupName ? `/explore/${groupName}` : '/browse'
  console.log(
    `[Browse] Navigating to ${browsePath} to find message ${messageId}`
  )
  await page.gotoAndVerify(browsePath, { timeout: timeouts.navigation.default })

  // Dismiss login modal if it appears (browse page shows signup modal for non-logged-in users)
  await dismissLoginModalIfPresent(page)

  // Wait for message cards to load
  await page.waitForSelector('.message-summary-mobile, .messagecard', {
    timeout: timeouts.ui.appearance,
  })

  // Try to find the specific message by item text or fall back to first card
  let messageCard
  if (itemText) {
    console.log(`[Browse] Looking for message with text: ${itemText}`)
    // Look for a card containing the unique item text
    messageCard = page
      .locator(
        `.message-summary-mobile:has-text("${itemText}"), .messagecard:has-text("${itemText}")`
      )
      .first()

    // Check if found
    const count = await messageCard.count()
    if (count === 0) {
      console.log(
        `[Browse] Message with "${itemText}" not found, using first card`
      )
      messageCard = page
        .locator('.message-summary-mobile, .messagecard')
        .first()
    }
  } else {
    messageCard = page.locator('.message-summary-mobile, .messagecard').first()
  }

  await messageCard.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await messageCard.click()
  console.log('[Browse] Clicked on message card')

  // Wait for the message modal or expanded view
  // Use a more specific selector to avoid matching login modals
  await page.waitForSelector(
    '.message-expanded-wrapper, .modal-content:has(.message-header), .modal-content:has(.message-photo)',
    {
      timeout: timeouts.ui.appearance,
    }
  )
  console.log('[Browse] Message expanded/modal visible')
}

/**
 * Helper: Navigate to a message via the explore page and open reply section
 */
async function navigateToMessageViaExplore(page, groupName) {
  console.log(`[Explore] Navigating to /explore/${groupName}`)
  await page.gotoAndVerify(`/explore/${groupName}`, {
    timeout: timeouts.navigation.default,
  })

  // Dismiss login modal if it appears (explore page shows signup modal for non-logged-in users)
  await dismissLoginModalIfPresent(page)

  // Wait for message list to load
  await page.waitForSelector('.message-summary-mobile, .messagecard', {
    timeout: timeouts.ui.appearance,
  })

  // Click on a message to expand it
  const messageCard = page
    .locator('.message-summary-mobile, .messagecard')
    .first()
  await messageCard.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await messageCard.click()
  console.log('[Explore] Clicked on message card')

  // Wait for the message to expand (use specific selector to avoid matching login modal)
  await page.waitForSelector(
    '.message-expanded-wrapper, .modal-content:has(.message-header), .modal-content:has(.message-photo)',
    {
      timeout: timeouts.ui.appearance,
    }
  )
  console.log('[Explore] Message expanded')
}

/**
 * Helper: Fill in the reply form and click Send
 */
async function fillReplyForm(
  page,
  { email = null, replyText, collectText = null }
) {
  // Fill email if provided (not logged in)
  if (email) {
    const emailInput = page
      .locator('.test-email-reply-validator input[type="email"]')
      .filter({ visible: true })
    await emailInput.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await emailInput.fill(email)
    console.log(`[Reply] Filled email: ${email}`)
  }

  // Fill reply message
  const replyTextarea = page
    .locator('textarea[name="reply"]')
    .filter({ visible: true })
  await replyTextarea.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await replyTextarea.fill(replyText)
  console.log('[Reply] Filled reply message')

  // Fill collection details if provided
  if (collectText) {
    const collectTextarea = page
      .locator('textarea[name="collect"]')
      .filter({ visible: true })
    try {
      await collectTextarea.waitFor({ state: 'visible', timeout: 3000 })
      await collectTextarea.fill(collectText)
      console.log('[Reply] Filled collection details')
    } catch (e) {
      console.log(
        '[Reply] Collection textarea not visible (may be WANTED message)'
      )
    }
  }
}

/**
 * Helper: Click the Reply button to expand reply section
 */
async function clickReplyButton(page) {
  // Wait for page to be stable before trying to interact
  // This prevents "Execution context was destroyed" errors after navigation
  await page.waitForLoadState('domcontentloaded')

  // Try footer reply button first (mobile/single column), then inline
  let replyButton = page.locator('.app-footer .reply-button:has-text("Reply")')

  // Use a safer approach - wait for any reply button to exist first
  const anyReplyButton = page.locator('.reply-button:has-text("Reply")').first()
  await anyReplyButton.waitFor({
    state: 'attached',
    timeout: timeouts.ui.appearance,
  })

  // Now check which button to use
  const footerButtonCount = await replyButton.count()
  const footerButtonVisible =
    footerButtonCount > 0 && (await replyButton.isVisible())
  if (!footerButtonVisible) {
    replyButton = anyReplyButton
  }

  await replyButton.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await replyButton.click()
  console.log('[Reply] Clicked Reply button')

  // Wait for reply section to expand
  await page.locator('textarea[name="reply"]').waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  console.log('[Reply] Reply section expanded')
}

/**
 * Helper: Click Send and wait for result
 */
async function clickSendAndWait(
  page,
  { expectWelcomeModal = false, email = null } = {}
) {
  const sendButton = page
    .locator('.btn:has-text("Send your reply")')
    .filter({ visible: true })
  await sendButton.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await sendButton.click()
  console.log('[Reply] Clicked Send your reply')

  if (expectWelcomeModal) {
    // First check for "Welcome back" modal (loggedInEver is true in fresh context)
    const welcomeBackModal = page.locator('.modal-content').filter({
      hasText: 'Welcome back',
    })
    const welcomeBackVisible = await welcomeBackModal
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false)

    if (welcomeBackVisible) {
      console.log(
        '[Reply] LoginModal appeared in "Welcome back" mode - switching to signup'
      )

      // Click the "Join" button to switch to signup mode
      const joinButton = welcomeBackModal.locator('button:has-text("Join")')
      await joinButton.click()
      console.log('[Reply] Clicked Join button to switch to signup mode')

      // After clicking Join, use #loginModal selector (text filter becomes stale)
      const signupModal = page.locator('#loginModal .modal-content')

      // Wait for fullname field and fill signup form
      const nameInput = signupModal.locator(
        'input#fullname, input[name="fullname"]'
      )
      await nameInput.waitFor({ state: 'visible', timeout: 10000 })
      await nameInput.fill('Test User')
      console.log('[Reply] Filled name in signup form')

      // Email should already be filled, but verify
      const emailInput = signupModal.locator('input[type="email"]')
      const emailValue = await emailInput.inputValue()
      if (!emailValue && email) {
        await emailInput.fill(email)
        console.log('[Reply] Filled email in signup form')
      }

      // Fill password
      const passwordInput = signupModal
        .locator('input[type="password"], input[placeholder*="password" i]')
        .first()
      await passwordInput.waitFor({ state: 'visible', timeout: 5000 })
      await passwordInput.fill('testpassword123')
      console.log('[Reply] Filled password in signup form')

      // Click Join Freegle button
      const joinFreegleButton = signupModal.locator(
        'button:has-text("Join Freegle")'
      )
      await joinFreegleButton.click()
      console.log('[Reply] Clicked Join Freegle button')

      // Navigation will happen after signup - handled below
    } else {
      // Check for "Welcome to Freegle" modal (normal new user flow)
      const welcomeModal = page.locator('.modal-content').filter({
        hasText: 'Welcome to Freegle',
      })

      try {
        await welcomeModal.waitFor({
          state: 'visible',
          timeout: 10000,
        })
        console.log('[Reply] Welcome modal appeared')

        // Close the modal
        const closeButton = welcomeModal.locator(
          '.btn:has-text("Close and Continue")'
        )
        await closeButton.click()
        console.log('[Reply] Closed welcome modal')
      } catch {
        console.log('[Reply] Welcome modal did not appear, continuing...')
      }
    }
  }

  // Wait for navigation to chats (the successful reply destination)
  await page.waitForURL(/\/chats\//, {
    timeout: timeouts.navigation.default,
  })
  console.log('[Reply] Navigated to chats')

  // Handle any post-login modals that might appear (e.g., Contact details postcode modal)
  const contactDetailsModal = page.locator('.modal-content').filter({
    hasText: 'Contact details',
  })
  try {
    await contactDetailsModal.waitFor({
      state: 'visible',
      timeout: 3000, // short timeout, may not appear
    })
    console.log('[Reply] Contact details modal appeared')

    // Fill postcode if needed
    const postcodeInput = contactDetailsModal.locator(
      'input[placeholder*="postcode"], input[type="text"]'
    )
    if (await postcodeInput.isVisible()) {
      await postcodeInput.fill(environment.postcode)
      console.log('[Reply] Filled postcode in contact details modal')
    }

    // Click OK to close
    const okButton = contactDetailsModal.locator('.btn:has-text("OK")')
    await okButton.click()
    console.log('[Reply] Closed contact details modal')
  } catch {
    // Modal didn't appear, that's fine
  }
}

module.exports = {
  waitForAuthInLocalStorage,
  waitForAuthHydration,
  dismissLoginModalIfPresent,
  navigateToMessageViaBrowse,
  navigateToMessageViaExplore,
  fillReplyForm,
  clickReplyButton,
  clickSendAndWait,
}
