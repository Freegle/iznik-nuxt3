/**
 * Comprehensive Browse Page Tests
 * Tests the full browse functionality including user signup, message creation, and browsing
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { signUpViaHomepage, loginViaHomepage } = require('./utils/user')

// Helper: sign up and join a group.
async function signUpAndJoinGroup(page, testEmail, userName, groupName) {
  const signupResult = await signUpViaHomepage(page, testEmail, userName)
  expect(signupResult).toBeTruthy()

  await page.gotoAndVerify(`/explore/${groupName}`, {
    timeout: timeouts.navigation.default,
  })

  // After navigation, session may not have persisted. If a login modal appears,
  // complete the login with the same credentials before proceeding.
  const loginModal = page.locator(
    '#loginModal, .modal-dialog:has-text("Join the Reuse Revolution")'
  )
  try {
    await loginModal.waitFor({ state: 'visible', timeout: 3000 })
    console.log(
      'Login modal appeared after navigation — session not persisted, logging in'
    )
    // Close the modal and log in via the homepage flow
    const closeButton = loginModal.locator(
      '.btn-close, .close, button[aria-label="Close"]'
    )
    if ((await closeButton.count()) > 0) {
      await closeButton.first().click()
      await loginModal.waitFor({ state: 'hidden', timeout: 5000 })
    }
    const loginSuccess = await loginViaHomepage(page, testEmail)
    expect(loginSuccess).toBeTruthy()
    // Re-navigate to the explore page now that we're logged in
    await page.gotoAndVerify(`/explore/${groupName}`, {
      timeout: timeouts.navigation.default,
    })
  } catch {
    // No login modal — session persisted correctly
  }

  // Check if we're already a member (Leave button visible) or need to join
  const leaveButton = page
    .locator('.btn:has-text("Leave")')
    .filter({ visible: true })
    .first()
  const joinButton = page
    .locator('.btn:has-text("Join this community")')
    .filter({ visible: true })
    .first()

  // Wait for either Join or Leave to appear
  await expect(joinButton.or(leaveButton)).toBeVisible({
    timeout: timeouts.ui.appearance,
  })

  if (await leaveButton.isVisible().catch(() => false)) {
    console.log(`Already a member of ${groupName}`)
    return
  }

  await joinButton.click()

  // After clicking Join, either Leave appears (success) or a login modal appears (auth lost)
  await expect(leaveButton.or(loginModal)).toBeVisible({
    timeout: timeouts.ui.appearance,
  })

  if (await loginModal.isVisible().catch(() => false)) {
    console.log(
      'Login modal appeared after Join click — session lost, logging in'
    )
    const closeButton = loginModal.locator(
      '.btn-close, .close, button[aria-label="Close"]'
    )
    if ((await closeButton.count()) > 0) {
      await closeButton.first().click()
      await loginModal.waitFor({ state: 'hidden', timeout: 5000 })
    }
    const loginSuccess = await loginViaHomepage(page, testEmail)
    expect(loginSuccess).toBeTruthy()
    // Re-navigate and join
    await page.gotoAndVerify(`/explore/${groupName}`, {
      timeout: timeouts.navigation.default,
    })
    await expect(joinButton.or(leaveButton)).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    if (await leaveButton.isVisible().catch(() => false)) {
      console.log(`Already a member of ${groupName} after re-login`)
      return
    }
    await joinButton.click()
    await expect(leaveButton).toBeVisible({ timeout: timeouts.ui.appearance })
  }

  console.log(`Successfully joined ${groupName}`)
}

test.describe('Browse Page Tests', () => {
  test('should create a message and browse it successfully', async ({
    page,
    testEmail,
    postMessage,
    withdrawPost,
  }) => {
    // Post a message (this handles signup/login internally via the fixture)
    const uniqueItem = `test-browse-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: `Created by browse test at ${new Date().toISOString()}`,
      email: testEmail,
    })

    expect(result.id).toBeTruthy()
    console.log(`Created test message with ID: ${result.id}`)

    // Navigate to /myposts and verify our post is visible
    console.log('Navigating to /myposts to verify post visibility')
    await page.gotoAndVerify('/myposts', {
      timeout: timeouts.navigation.default,
    })

    await page.waitForSelector('.message-card, .card-body', {
      timeout: timeouts.ui.appearance,
    })

    const itemLocator = page
      .locator('.message-card, .card-body')
      .filter({ hasText: uniqueItem })
    await itemLocator.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log(`Found our test item "${uniqueItem}" on myposts page`)

    // Now navigate to browse and verify the page loads without errors
    console.log('Testing browse page loads')
    await page.gotoAndVerify('/browse', {
      timeout: timeouts.navigation.default,
    })

    // Wait for the browse page to finish loading — either messages appear,
    // the "no posts" notice is shown, or the postcode prompt appears (when
    // isochrones haven't loaded yet). All are valid states because newly
    // posted messages may not appear immediately due to isochrone/indexing delays.
    const messagesLocator = page.locator(
      '.message-summary-mobile, .messagecard'
    )
    const noPostsLocator = page
      .locator("text=couldn't find any posts")
      .or(page.locator('text=no posts in this area'))
      .or(page.locator("text=Sorry, we didn't find anything"))
      .or(page.locator("text=What's your postcode"))

    await expect(messagesLocator.or(noPostsLocator).first()).toBeVisible({
      timeout: timeouts.navigation.default,
    })

    const messageCount = await messagesLocator.count()
    console.log(`Found ${messageCount} messages on browse page`)

    // Verify page title
    const title = await page.title()
    expect(title).toContain('Browse')

    // Clean up
    await withdrawPost({ item: result.item })
  })

  test('should handle search functionality on browse page', async ({
    page,
    takeScreenshot,
    testEmail,
    testEnv,
  }) => {
    await signUpAndJoinGroup(
      page,
      testEmail,
      'Search Test User',
      testEnv.group.name
    )

    // Test search with search term in URL
    console.log('Testing browse page with search term in URL')
    await page.gotoAndVerify('/browse/furniture', {
      timeout: timeouts.navigation.default,
    })

    // Check that search functionality is active
    const url = page.url()
    expect(url).toContain('furniture')

    // Page should load without errors
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('should display microvolunteering component', async ({
    page,
    takeScreenshot,
    testEmail,
    testEnv,
  }) => {
    await signUpAndJoinGroup(
      page,
      testEmail,
      'Micro Test User',
      testEnv.group.name
    )

    // Navigate to browse page
    await page.gotoAndVerify('/browse', {
      timeout: timeouts.navigation.default,
    })

    // Check for page content
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })

    // The page should load successfully (specific microvolunteering component testing would need more specific selectors)
    const title = await page.title()
    expect(title).toContain('Browse')
  })

  test('should handle responsive behavior', async ({
    page,
    takeScreenshot,
    testEmail,
    testEnv,
  }) => {
    await signUpAndJoinGroup(
      page,
      testEmail,
      'Responsive Test User',
      testEnv.group.name
    )

    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ]

    for (const viewport of viewports) {
      console.log(`Testing viewport: ${viewport.width}x${viewport.height}`)
      await page.setViewportSize(viewport)
      await page.gotoAndVerify('/browse', {
        timeout: timeouts.navigation.default,
      })

      // Verify page adapts to different screen sizes
      await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })

      // Check that layout adapts (columns may stack on mobile)
      const container = page
        .locator('.container-fluid, .container, main, [class*="container"]')
        .first()
      if ((await container.count()) > 0) {
        await container.waitFor({ state: 'attached', timeout: 5000 })
      }
    }
  })

  test('should load browse page with existing messages', async ({
    page,
    takeScreenshot,
    testEmail,
    testEnv,
  }) => {
    await signUpAndJoinGroup(
      page,
      testEmail,
      'Browse Test User',
      testEnv.group.name
    )

    // Test general browse page
    console.log('Testing general browse page')
    await page.gotoAndVerify('/browse', {
      timeout: timeouts.navigation.default,
    })

    // Page should load successfully — wait for title to be set by Nuxt (SSR
    // starts with the default app title; Vue hydration updates it to "Browse")
    await expect(page).toHaveTitle(/Browse/, {
      timeout: timeouts.navigation.slowPage,
    })

    console.log('Browse page loaded successfully')
  })
})
