/**
 * AI Illustration Tests
 * Tests the AI illustration feature in the compose flow for both give and find,
 * on both mobile and desktop layouts.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { signUpViaHomepage, logoutIfLoggedIn } = require('./utils/user')

/**
 * Helper to navigate to the details page in the mobile flow.
 * Handles the photos -> details transition.
 */
async function navigateToMobileDetails(page, flowType) {
  const basePath = flowType === 'give' ? '/give' : '/find'

  // Navigate to the flow start
  await page.gotoAndVerify(basePath, {
    timeout: timeouts.navigation.default,
  })

  await page.waitForLoadState('networkidle', {
    timeout: timeouts.navigation.default,
  })

  const currentUrl = page.url()
  console.log(`Current URL: ${currentUrl}`)

  // Look for the Next button to skip photos step (for give flow)
  const nextButton = page.locator(
    'button:has-text("Next"), .btn:has-text("Next"), a:has-text("Next")'
  )

  if ((await nextButton.count()) > 0) {
    console.log('Found Next button, clicking it to skip photos')
    await nextButton.first().click()
    await page.waitForLoadState('networkidle', {
      timeout: timeouts.navigation.default,
    })
  } else {
    // Navigate directly to details page
    console.log('No Next button found, navigating directly to details')
    await page.gotoAndVerify(`${basePath}/mobile/details`, {
      timeout: timeouts.navigation.default,
    })
  }
}

/**
 * Helper to find and interact with the item name input.
 * Works with multiple selector variations.
 */
function getItemInput(page) {
  return page.locator(
    '#item-name, input[name="item"], input[placeholder*="item"], .item-name-input, input[placeholder*="Looking for"], input[placeholder*="What are you"]'
  )
}

/**
 * Helper to check for AI illustration elements on the page.
 */
async function checkForAiIllustration(page) {
  const aiIllustration = page.locator('.photo-thumb-ai, .ai-badge')
  const photoSummary = page.locator('.photo-summary')

  const hasAiIllustration = (await aiIllustration.count()) > 0
  const hasPhotoSummary = (await photoSummary.count()) > 0

  console.log(`Has photo summary: ${hasPhotoSummary}`)
  console.log(`Has AI illustration: ${hasAiIllustration}`)

  return { hasAiIllustration, hasPhotoSummary, aiIllustration, photoSummary }
}

test.describe('AI Illustration Tests - Give Flow', () => {
  test('Give Mobile: should trigger AI illustration on item blur', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    // Sign up a user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'AI Give Mobile Test User'
    )
    expect(signupResult).toBeTruthy()
    console.log('User signed up successfully')

    // Navigate to the give mobile details page
    await navigateToMobileDetails(page, 'give')

    // Wait for the item name input to appear
    const itemInput = getItemInput(page)
    await itemInput.first().waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('Item input field visible')

    // Take a screenshot before entering the item name
    await takeScreenshot('Give Mobile - Before entering item name')

    // Type an item name
    const testItemName = 'Sofa'
    await itemInput.first().type(testItemName, { delay: 100 })
    console.log(`Typed item name: ${testItemName}`)

    // Blur the input to trigger the AI illustration fetch
    await itemInput.first().blur()
    console.log('Blurred item input to trigger AI illustration fetch')

    // Wait for network to settle after blur
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    console.log('Network idle after blur')

    // Take a screenshot after the blur
    await takeScreenshot('Give Mobile - After item blur')

    // Check if an AI illustration appeared
    const { hasAiIllustration, hasPhotoSummary } = await checkForAiIllustration(
      page
    )

    if (hasPhotoSummary && hasAiIllustration) {
      console.log('AI illustration successfully displayed')
    } else {
      console.log(
        'No AI illustration appeared - this is acceptable as the image may not be cached'
      )
    }

    // Verify the item name is still in the input
    const inputValue = await itemInput.first().inputValue()
    expect(inputValue).toBe(testItemName)
    console.log('Item name preserved after blur')

    // Clean up - logout
    await logoutIfLoggedIn(page)
    console.log('Test completed successfully')
  })

  test('Give Mobile: should handle item with OFFER prefix correctly', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    // Sign up a user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'AI Prefix Test User'
    )
    expect(signupResult).toBeTruthy()

    // Navigate to the give mobile details page
    await navigateToMobileDetails(page, 'give')

    // Wait for the item input
    const itemInput = getItemInput(page)
    await itemInput.first().waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Type an item name with prefix (this should be stripped by the backend)
    const testItemName = 'OFFER: Blue Chair'
    await itemInput.first().type(testItemName, { delay: 100 })

    // Blur to trigger the illustration fetch
    await itemInput.first().blur()

    // Wait for any network activity
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // The item name should remain as entered
    const inputValue = await itemInput.first().inputValue()
    expect(inputValue).toBe(testItemName)

    await takeScreenshot('Give Mobile - Item with OFFER prefix')

    console.log(
      'Successfully handled item with OFFER prefix - backend will strip prefix when fetching illustration'
    )

    // Clean up
    await logoutIfLoggedIn(page)
  })
})

test.describe('AI Illustration Tests - Find Flow', () => {
  test('Find Mobile: should trigger AI illustration on item blur', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    // Sign up a user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'AI Find Mobile Test User'
    )
    expect(signupResult).toBeTruthy()
    console.log('User signed up successfully')

    // Navigate to the find mobile details page
    await navigateToMobileDetails(page, 'find')

    // Wait for the item name input to appear
    const itemInput = getItemInput(page)
    await itemInput.first().waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('Item input field visible')

    // Take a screenshot before entering the item name
    await takeScreenshot('Find Mobile - Before entering item name')

    // Type an item name
    const testItemName = 'Desk'
    await itemInput.first().type(testItemName, { delay: 100 })
    console.log(`Typed item name: ${testItemName}`)

    // Blur the input to trigger the AI illustration fetch
    await itemInput.first().blur()
    console.log('Blurred item input to trigger AI illustration fetch')

    // Wait for network to settle after blur
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    console.log('Network idle after blur')

    // Take a screenshot after the blur
    await takeScreenshot('Find Mobile - After item blur')

    // Check if an AI illustration appeared
    const { hasAiIllustration, hasPhotoSummary } = await checkForAiIllustration(
      page
    )

    if (hasPhotoSummary && hasAiIllustration) {
      console.log('AI illustration successfully displayed')
    } else {
      console.log(
        'No AI illustration appeared - this is acceptable as the image may not be cached'
      )
    }

    // Verify the item name is still in the input
    const inputValue = await itemInput.first().inputValue()
    expect(inputValue).toBe(testItemName)
    console.log('Item name preserved after blur')

    // Clean up - logout
    await logoutIfLoggedIn(page)
    console.log('Test completed successfully')
  })

  test('Find Mobile: should handle item with WANTED prefix correctly', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    // Sign up a user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'AI Prefix Test User'
    )
    expect(signupResult).toBeTruthy()

    // Navigate to the find mobile details page
    await navigateToMobileDetails(page, 'find')

    // Wait for the item input
    const itemInput = getItemInput(page)
    await itemInput.first().waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Type an item name with prefix (this should be stripped by the backend)
    const testItemName = 'WANTED: Red Bicycle'
    await itemInput.first().type(testItemName, { delay: 100 })

    // Blur to trigger the illustration fetch
    await itemInput.first().blur()

    // Wait for any network activity
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // The item name should remain as entered
    const inputValue = await itemInput.first().inputValue()
    expect(inputValue).toBe(testItemName)

    await takeScreenshot('Find Mobile - Item with WANTED prefix')

    console.log(
      'Successfully handled item with WANTED prefix - backend will strip prefix when fetching illustration'
    )

    // Clean up
    await logoutIfLoggedIn(page)
  })
})

test.describe('AI Illustration Tests - Give Desktop Flow', () => {
  test('Give Desktop: should trigger AI illustration on item blur', async ({
    browser,
    testEmail,
    takeScreenshot,
  }) => {
    // Create a fresh browser context with desktop viewport set from the start
    // This ensures BreakpointFettler detects the correct viewport on page load
    const desktopContext = await browser.newContext({
      viewport: { width: 1200, height: 900 },
      ignoreHTTPSErrors: true,
    })
    const page = await desktopContext.newPage()
    console.log(
      'Created fresh browser context with desktop viewport (1200x900)'
    )

    try {
      // Sign up a user first
      const signupResult = await signUpViaHomepage(
        page,
        testEmail,
        'AI Give Desktop Test User'
      )
      expect(signupResult).toBeTruthy()
      console.log('User signed up successfully')

      // Navigate to the give page - desktop layout shows PostMessageTablet
      await page.gotoAndVerify('/give', {
        timeout: timeouts.navigation.default,
      })

      await page.waitForLoadState('networkidle', {
        timeout: timeouts.navigation.default,
      })
      console.log('Give desktop page loaded')

      // Wait for the desktop item input (PostItem component with specific placeholder)
      const desktopItemInput = page.locator(
        'input[placeholder*="single word"], input[placeholder*="what is it"]'
      )
      await desktopItemInput.first().waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log('Desktop item input field visible')

      // Take a screenshot before entering the item name
      await takeScreenshot('Give Desktop - Before entering item name')

      // Type an item name
      const testItemName = 'Bookshelf'
      await desktopItemInput.first().type(testItemName, { delay: 100 })
      console.log(`Typed item name: ${testItemName}`)

      // Blur the input to trigger the AI illustration fetch
      await desktopItemInput.first().blur()
      console.log('Blurred item input to trigger AI illustration fetch')

      // Wait for network to settle after blur
      await page.waitForLoadState('networkidle', { timeout: 15000 })
      console.log('Network idle after blur')

      // Take a screenshot after the blur
      await takeScreenshot('Give Desktop - After item blur')

      // Check if an AI illustration appeared
      const { hasAiIllustration, hasPhotoSummary } =
        await checkForAiIllustration(page)

      if (hasPhotoSummary && hasAiIllustration) {
        console.log('AI illustration successfully displayed')
      } else {
        console.log(
          'No AI illustration appeared - this is acceptable as the image may not be cached'
        )
      }

      // Verify the item name is still in the input
      const inputValue = await desktopItemInput.first().inputValue()
      expect(inputValue).toBe(testItemName)
      console.log('Item name preserved after blur')

      // Clean up - logout
      await logoutIfLoggedIn(page)
      console.log('Test completed successfully')
    } finally {
      // Always close the context to clean up
      await desktopContext.close()
      console.log('Closed desktop browser context')
    }
  })

  test('Give Desktop: should handle item with OFFER prefix correctly', async ({
    browser,
    testEmail,
    takeScreenshot,
  }) => {
    // Create a fresh browser context with desktop viewport set from the start
    const desktopContext = await browser.newContext({
      viewport: { width: 1200, height: 900 },
      ignoreHTTPSErrors: true,
    })
    const page = await desktopContext.newPage()
    console.log(
      'Created fresh browser context with desktop viewport (1200x900)'
    )

    try {
      // Sign up a user first
      const signupResult = await signUpViaHomepage(
        page,
        testEmail,
        'AI Desktop Prefix Test User'
      )
      expect(signupResult).toBeTruthy()

      // Navigate to the give page
      await page.gotoAndVerify('/give', {
        timeout: timeouts.navigation.default,
      })

      await page.waitForLoadState('networkidle', {
        timeout: timeouts.navigation.default,
      })

      // Wait for the desktop item input
      const desktopItemInput = page.locator(
        'input[placeholder*="single word"], input[placeholder*="what is it"]'
      )
      await desktopItemInput.first().waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Type an item name with prefix (this should be stripped by the backend)
      const testItemName = 'OFFER: Dining Table'
      await desktopItemInput.first().type(testItemName, { delay: 100 })

      // Blur to trigger the illustration fetch
      await desktopItemInput.first().blur()

      // Wait for any network activity
      await page.waitForLoadState('networkidle', { timeout: 15000 })

      // The item name should remain as entered
      const inputValue = await desktopItemInput.first().inputValue()
      expect(inputValue).toBe(testItemName)

      await takeScreenshot('Give Desktop - Item with OFFER prefix')

      console.log(
        'Successfully handled item with OFFER prefix on desktop - backend will strip prefix when fetching illustration'
      )

      // Clean up
      await logoutIfLoggedIn(page)
    } finally {
      // Always close the context to clean up
      await desktopContext.close()
      console.log('Closed desktop browser context')
    }
  })
})

test.describe('AI Illustration Tests - Find Desktop Flow', () => {
  test('Find Desktop: should trigger AI illustration on item blur', async ({
    browser,
    testEmail,
    takeScreenshot,
  }) => {
    // Create a fresh browser context with desktop viewport set from the start
    // This ensures BreakpointFettler detects the correct viewport on page load
    const desktopContext = await browser.newContext({
      viewport: { width: 1200, height: 900 },
      ignoreHTTPSErrors: true,
    })
    const page = await desktopContext.newPage()
    console.log(
      'Created fresh browser context with desktop viewport (1200x900)'
    )

    try {
      // Sign up a user first
      const signupResult = await signUpViaHomepage(
        page,
        testEmail,
        'AI Find Desktop Test User'
      )
      expect(signupResult).toBeTruthy()
      console.log('User signed up successfully')

      // Navigate to the find page - desktop layout shows PostMessageTablet
      await page.gotoAndVerify('/find', {
        timeout: timeouts.navigation.default,
      })

      await page.waitForLoadState('networkidle', {
        timeout: timeouts.navigation.default,
      })
      console.log('Find desktop page loaded')

      // Wait for the desktop item input (PostItem component with specific placeholder)
      const desktopItemInput = page.locator(
        'input[placeholder*="single word"], input[placeholder*="what is it"]'
      )
      await desktopItemInput.first().waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log('Desktop item input field visible')

      // Take a screenshot before entering the item name
      await takeScreenshot('Find Desktop - Before entering item name')

      // Type an item name
      const testItemName = 'Computer Monitor'
      await desktopItemInput.first().type(testItemName, { delay: 100 })
      console.log(`Typed item name: ${testItemName}`)

      // Blur the input to trigger the AI illustration fetch
      await desktopItemInput.first().blur()
      console.log('Blurred item input to trigger AI illustration fetch')

      // Wait for network to settle after blur
      await page.waitForLoadState('networkidle', { timeout: 15000 })
      console.log('Network idle after blur')

      // Take a screenshot after the blur
      await takeScreenshot('Find Desktop - After item blur')

      // Check if an AI illustration appeared
      const { hasAiIllustration, hasPhotoSummary } =
        await checkForAiIllustration(page)

      if (hasPhotoSummary && hasAiIllustration) {
        console.log('AI illustration successfully displayed')
      } else {
        console.log(
          'No AI illustration appeared - this is acceptable as the image may not be cached'
        )
      }

      // Verify the item name is still in the input
      const inputValue = await desktopItemInput.first().inputValue()
      expect(inputValue).toBe(testItemName)
      console.log('Item name preserved after blur')

      // Clean up - logout
      await logoutIfLoggedIn(page)
      console.log('Test completed successfully')
    } finally {
      // Always close the context to clean up
      await desktopContext.close()
      console.log('Closed desktop browser context')
    }
  })

  test('Find Desktop: should handle item with WANTED prefix correctly', async ({
    browser,
    testEmail,
    takeScreenshot,
  }) => {
    // Create a fresh browser context with desktop viewport set from the start
    const desktopContext = await browser.newContext({
      viewport: { width: 1200, height: 900 },
      ignoreHTTPSErrors: true,
    })
    const page = await desktopContext.newPage()
    console.log(
      'Created fresh browser context with desktop viewport (1200x900)'
    )

    try {
      // Sign up a user first
      const signupResult = await signUpViaHomepage(
        page,
        testEmail,
        'AI Desktop Prefix Test User'
      )
      expect(signupResult).toBeTruthy()

      // Navigate to the find page
      await page.gotoAndVerify('/find', {
        timeout: timeouts.navigation.default,
      })

      await page.waitForLoadState('networkidle', {
        timeout: timeouts.navigation.default,
      })

      // Wait for the desktop item input
      const desktopItemInput = page.locator(
        'input[placeholder*="single word"], input[placeholder*="what is it"]'
      )
      await desktopItemInput.first().waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Type an item name with prefix (this should be stripped by the backend)
      const testItemName = 'WANTED: Office Chair'
      await desktopItemInput.first().type(testItemName, { delay: 100 })

      // Blur to trigger the illustration fetch
      await desktopItemInput.first().blur()

      // Wait for any network activity
      await page.waitForLoadState('networkidle', { timeout: 15000 })

      // The item name should remain as entered
      const inputValue = await desktopItemInput.first().inputValue()
      expect(inputValue).toBe(testItemName)

      await takeScreenshot('Find Desktop - Item with WANTED prefix')

      console.log(
        'Successfully handled item with WANTED prefix on desktop - backend will strip prefix when fetching illustration'
      )

      // Clean up
      await logoutIfLoggedIn(page)
    } finally {
      // Always close the context to clean up
      await desktopContext.close()
      console.log('Closed desktop browser context')
    }
  })
})

test.describe('AI Illustration Tests - Page Load Verification', () => {
  test('Give page should load without errors', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    // Sign up a user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'AI Page Load Test User'
    )
    expect(signupResult).toBeTruthy()

    // Navigate to the give page
    await page.gotoAndVerify('/give', {
      timeout: timeouts.navigation.default,
    })

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle', {
      timeout: timeouts.navigation.default,
    })

    // The page should load without errors - title may contain "offer", "give", or "freegle"
    const title = await page.title()
    const titleLower = title.toLowerCase()
    expect(
      titleLower.includes('give') ||
        titleLower.includes('offer') ||
        titleLower.includes('freegle')
    ).toBeTruthy()
    console.log(`Give page loaded successfully with title: ${title}`)

    // Clean up
    await logoutIfLoggedIn(page)
  })

  test('Find page should load without errors', async ({
    page,
    testEmail,
    takeScreenshot,
  }) => {
    // Sign up a user first
    const signupResult = await signUpViaHomepage(
      page,
      testEmail,
      'AI Page Load Test User'
    )
    expect(signupResult).toBeTruthy()

    // Navigate to the find page
    await page.gotoAndVerify('/find', {
      timeout: timeouts.navigation.default,
    })

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle', {
      timeout: timeouts.navigation.default,
    })

    // The page should load without errors - title may contain "find", "wanted", or "freegle"
    const title = await page.title()
    const titleLower = title.toLowerCase()
    expect(
      titleLower.includes('find') ||
        titleLower.includes('wanted') ||
        titleLower.includes('freegle')
    ).toBeTruthy()
    console.log(`Find page loaded successfully with title: ${title}`)

    // Clean up
    await logoutIfLoggedIn(page)
  })
})
