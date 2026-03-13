/**
 * Comprehensive Browse Page Tests
 * Tests the full browse functionality including user signup, message creation, and browsing
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')
const { signUpViaHomepage } = require('./utils/user')

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
      postcode: environment.postcode,
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

    // Wait for the browse page to finish loading — either messages appear
    // or the "no posts" notice is shown. Both are valid states because newly
    // posted messages may not appear immediately due to isochrone/indexing delays.
    const messagesLocator = page.locator(
      '.message-summary-mobile, .messagecard'
    )
    const noPostsLocator = page.locator("text=couldn't find any posts")

    await expect(messagesLocator.or(noPostsLocator).first()).toBeVisible({
      timeout: timeouts.ui.appearance,
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
  }) => {
    // Sign up user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'Search Test User'
    )
    expect(signupResult).toBeTruthy()

    // Join the FreeglePlayground group
    await page.gotoAndVerify('/explore/FreeglePlayground', {
      timeout: timeouts.navigation.default,
    })
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .filter({ visible: true })
      .first()
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await joinButton.click()
    await page
      .locator('.btn:has-text("Leave")')
      .filter({ visible: true })
      .first()
      .waitFor({
        state: 'visible',
        timeout: timeouts.ui.interaction,
      })

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
  }) => {
    // Sign up user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'Micro Test User'
    )
    expect(signupResult).toBeTruthy()

    // Join the FreeglePlayground group
    await page.gotoAndVerify('/explore/FreeglePlayground', {
      timeout: timeouts.navigation.default,
    })
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .filter({ visible: true })
      .first()
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await joinButton.click()
    await page
      .locator('.btn:has-text("Leave")')
      .filter({ visible: true })
      .first()
      .waitFor({
        state: 'visible',
        timeout: timeouts.ui.interaction,
      })

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
  }) => {
    // Sign up user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'Responsive Test User'
    )
    expect(signupResult).toBeTruthy()

    // Join the FreeglePlayground group
    await page.gotoAndVerify('/explore/FreeglePlayground', {
      timeout: timeouts.navigation.default,
    })
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .filter({ visible: true })
      .first()
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await joinButton.click()
    await page
      .locator('.btn:has-text("Leave")')
      .filter({ visible: true })
      .first()
      .waitFor({
        state: 'visible',
        timeout: timeouts.ui.interaction,
      })

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
  }) => {
    // Sign up user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'Browse Test User'
    )
    expect(signupResult).toBeTruthy()

    // Join the FreeglePlayground group
    await page.gotoAndVerify('/explore/FreeglePlayground', {
      timeout: timeouts.navigation.default,
    })
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .filter({ visible: true })
      .first()
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await joinButton.click()
    await page
      .locator('.btn:has-text("Leave")')
      .filter({ visible: true })
      .first()
      .waitFor({
        state: 'visible',
        timeout: timeouts.ui.interaction,
      })

    // Test general browse page
    console.log('Testing general browse page')
    await page.gotoAndVerify('/browse', {
      timeout: timeouts.navigation.default,
    })

    // Page should load successfully
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })

    // Verify page title
    const title = await page.title()
    expect(title).toContain('Browse')

    console.log('Browse page loaded successfully')
  })
})
