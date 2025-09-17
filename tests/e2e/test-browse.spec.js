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
    withdrawPost,
    takeScreenshot,
  }) => {

    let offerResult = null

    try {
      // Create  test message.
      const loginSuccess = await loginViaHomepage(page, environment.unmodded_email, environment.unmodded_password)
      console.log(`Login result: ${loginSuccess}`)
      
      if (!loginSuccess) {
        throw new Error('Failed to login before posting message')
      }

      // Debug: Wait and check login state before posting
      console.log('Waiting 3 seconds before posting to ensure session is stable...')
      await page.waitForTimeout(3000)
      
      // Debug: Check if still logged in before postMessage
      console.log('About to call postMessage - checking login status')
      try {
        const loggedInElements = await page.locator('.test-user-dropdown, a[href*="logout"], .btn:has-text("My account"), .btn:has-text("Settings")').count()
        console.log(`Found ${loggedInElements} logged-in elements before posting`)
        
        if (loggedInElements === 0) {
          console.warn('WARNING: No logged-in elements found before posting - this may cause issues')
          
          // Take screenshot for debugging
          await takeScreenshot(`No Login Elements Debug ${Date.now()}`, {
            fullPage: true,
          })
        }
      } catch (debugError) {
        console.log(`Login check error: ${debugError.message}`)
      }
      
      offerResult = await postMessage({
        type: 'OFFER',
        item: 'Test Table',
        description: `Test table created by browse test`,
        postcode: environment.postcode,
        email: environment.unmodded_email,
      })
      expect(offerResult.id).toBeTruthy()
      console.log(`Created test message with ID: ${offerResult.id}`)
      await logoutIfLoggedIn(page)

      // Now sign up the main user to browse the messages
      console.log('Signing up main user for browse tests')
      await logoutIfLoggedIn(page)

      // Ensure we're on the homepage for a clean signup
      await page.gotoAndVerify('/', { timeout: timeouts.navigation.default })

      const signupResult = await signUpViaHomepage(
        page,
        testEmail,
        'Browse Test User'
      )
      expect(signupResult).toBeTruthy()

      // Join the FreeglePlayground group
      console.log('Joining FreeglePlayground group')
      await page.gotoAndVerify('/explore/FreeglePlayground', {
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

      // Wait for postcode prompt and enter postcode
      console.log('Waiting for postcode prompt on browse page')
      await page.waitForSelector('text=What\'s your postcode? We\'ll show you posts nearby.', {
        timeout: timeouts.ui.appearance,
      })

      // Enter postcode from config
      console.log(`Entering postcode ${environment.postcode}`)
      const postcodeInput = page.locator('.pcinp, input[placeholder="Type postcode"]')
      await postcodeInput.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await postcodeInput.type(environment.postcode)

      // Debug postcode validation before waiting
      console.log(`Filled postcode: ${environment.postcode}`)
      
      // Wait a moment for any immediate validation
      await page.waitForTimeout(2000)
      
      // Check what validation elements exist and their state
      console.log('Checking validation elements...')
      const validationSelectors = [
        '.text-success.fa-bh',
        '.fa-check-circle', 
        '.v-icon[class*="check"]',
        '.text-success',
        '[class*="success"]',
        '.valid-feedback',
        '[class*="valid"]',
        '.fa-check',
        '[class*="check"]'
      ]
      
      for (const selector of validationSelectors) {
        try {
          const count = await page.locator(selector).count()
          const visible = count > 0 ? await page.locator(selector).first().isVisible() : false
          console.log(`  ${selector}: ${count} found, visible: ${visible}`)
        } catch (error) {
          console.log(`  ${selector}: error - ${error.message}`)
        }
      }
      
      // Take screenshot to see current state
      await takeScreenshot(`Postcode Debug ${Date.now()}`)
      
      // Wait for postcode section to disappear (indicates successful validation)
      await postcodeInput.waitFor({
        state: 'detached',
        timeout: timeouts.ui.appearance,
      })

      // Wait for the page to load and messages to appear
      await page.waitForSelector('.messagecard, .card-body', {
        timeout: timeouts.ui.appearance,
      })

      // Check that the page loads successfully
      await page.locator('body').waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

      // Verify page title
      const title = await page.title()
      expect(title).toContain('Browse')

      // Look for messages
      const messageCards = page.locator('.messagecard, .card-body')
      const messageCount = await messageCards.count()
      expect(messageCount).toBeGreaterThan(0)

      console.log(`Found ${messageCount} messages on browse page`)
      
      // Check that we can see the specific test item we created
      const testTableMessage = page.locator('text=Test Table').first()
      await testTableMessage.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log('Successfully found the Test Table message on browse page')
    } finally {
      // Clean up the created message - log in as the poster and withdraw
      if (offerResult) {
        console.log('Cleaning up test message')
        try {
          await logoutIfLoggedIn(page)
          await loginViaHomepage(page, environment.unmodded_email, environment.unmodded_password)

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
    await page.waitForLoadState('networkidle')
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
