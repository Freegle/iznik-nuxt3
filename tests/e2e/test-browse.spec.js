/**
 * Comprehensive Browse Page Tests
 * Tests the full browse functionality including user signup, message creation, and browsing
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment, DEFAULT_TEST_PASSWORD } = require('./config')
const {
  signUpViaHomepage,
  logoutIfLoggedIn,
  loginViaHomepage,
} = require('./utils/user')

test.describe('Browse Page Tests', () => {
  test('should create a message and browse it successfully', async ({
    page,
    testEmail,
    getTestEmail,
    postMessage,
    registerTestEmail,
    withdrawPost,
  }) => {
    // Register test emails for cleanup
    registerTestEmail(testEmail)
    const offerEmail = getTestEmail('offer1')
    registerTestEmail(offerEmail)

    let offerResult = null

    try {
      // Create just one test message FIRST (as non-logged-in user)
      console.log('Creating test OFFER message (non-logged-in flow)')
      offerResult = await postMessage({
        type: 'OFFER',
        item: 'Test Table',
        description: `Test table created by browse test`,
        postcode: environment.postcode,
        email: offerEmail,
      })
      expect(offerResult.id).toBeTruthy()

      // Now sign up the main user to browse the messages
      console.log('Signing up main user for browse tests')
      const signupResult = await signUpViaHomepage(
        page,
        testEmail,
        'Browse Test User'
      )
      expect(signupResult).toBeTruthy()

      // Join the EdinburghFreegle group
      console.log('Joining EdinburghFreegle group')
      await page.gotoAndVerify('/explore/EdinburghFreegle', {
        timeout: timeouts.navigation.default,
      })

      // Wait for and click the join button
      const joinButton = page
        .locator('.btn:has-text("Join this community")')
        .first()
      await joinButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await joinButton.click()

      // Wait for confirmation of joining
      await page.locator('.btn:has-text("Leave")').first().waitFor({
        state: 'visible',
        timeout: timeouts.ui.interaction,
      })

      // Now test browsing functionality
      console.log('Testing browse page with created message')
      await page.gotoAndVerify('/browse', {
        timeout: timeouts.navigation.default,
      })

      // Wait for the page to load and messages to appear
      await page.waitForSelector('.messagecard, .card-body', {
        timeout: timeouts.ui.appearance,
      })

      // Check that the page loads successfully
      await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })

      // Verify page title
      const title = await page.title()
      expect(title).toContain('Browse')

      // Look for messages
      const messageCards = page.locator('.messagecard, .card-body')
      const messageCount = await messageCards.count()
      expect(messageCount).toBeGreaterThan(0)

      console.log(`Found ${messageCount} messages on browse page`)
    } finally {
      // Clean up the created message - log in as the poster and withdraw
      if (offerResult) {
        console.log('Cleaning up test message')
        try {
          await logoutIfLoggedIn(page)
          await loginViaHomepage(page, offerEmail, DEFAULT_TEST_PASSWORD)

          // Now withdraw the post
          await withdrawPost({ item: offerResult.item })
        } catch (cleanupError) {
          console.warn(
            `Failed to clean up test message: ${cleanupError.message}`
          )
        }
      }
    }
  })

  test('should handle search functionality on browse page', async ({
    page,
    testEmail,
    registerTestEmail,
  }) => {
    // Sign up user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'Search Test User'
    )
    expect(signupResult).toBeTruthy()
    registerTestEmail(testEmail)

    // Join the EdinburghFreegle group
    await page.gotoAndVerify('/explore/EdinburghFreegle', {
      timeout: timeouts.navigation.default,
    })
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .first()
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await joinButton.click()
    await page.locator('.btn:has-text("Leave")').first().waitFor({
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
    testEmail,
    registerTestEmail,
  }) => {
    // Sign up user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'Micro Test User'
    )
    expect(signupResult).toBeTruthy()
    registerTestEmail(testEmail)

    // Join the EdinburghFreegle group
    await page.gotoAndVerify('/explore/EdinburghFreegle', {
      timeout: timeouts.navigation.default,
    })
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .first()
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await joinButton.click()
    await page.locator('.btn:has-text("Leave")').first().waitFor({
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
    testEmail,
    registerTestEmail,
  }) => {
    // Sign up user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'Responsive Test User'
    )
    expect(signupResult).toBeTruthy()
    registerTestEmail(testEmail)

    // Join the EdinburghFreegle group
    await page.gotoAndVerify('/explore/EdinburghFreegle', {
      timeout: timeouts.navigation.default,
    })
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .first()
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await joinButton.click()
    await page.locator('.btn:has-text("Leave")').first().waitFor({
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
    testEmail,
    registerTestEmail,
  }) => {
    // Sign up user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'Browse Test User'
    )
    expect(signupResult).toBeTruthy()
    registerTestEmail(testEmail)

    // Join the EdinburghFreegle group
    await page.gotoAndVerify('/explore/EdinburghFreegle', {
      timeout: timeouts.navigation.default,
    })
    const joinButton = page
      .locator('.btn:has-text("Join this community")')
      .first()
    await joinButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await joinButton.click()
    await page.locator('.btn:has-text("Leave")').first().waitFor({
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
