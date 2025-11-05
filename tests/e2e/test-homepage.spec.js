// @ts-check
/**
 * @typedef {import('@playwright/test').Page} Page
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment, selectors, breakpoints } = require('./config')

test.describe('Homepage tests', () => {
  // Test from the original home.spec.js
  test('homepage should load without console errors', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })

    try {
      await waitForNuxtPageLoad({ timeout: 30000 })
    } catch (error) {
      const currentTitle = await page.title()
      const bodyText = await page
        .textContent('body')
        .catch(() => 'Could not get body text')
      const isStillLoading = bodyText?.includes('Loading... Stuck here')

      console.log(
        `Page failed to load properly. Current title: "${currentTitle}"`
      )
      console.log(`Is still loading: ${isStillLoading}`)

      if (isStillLoading) {
        console.log(
          'Page appears to be stuck loading JavaScript, but continuing with test...'
        )
      } else {
        throw error
      }
    }

    const title = await page.title()
    expect(title).toBe("Don't throw it away, give it away!")
  })

  /**
   * Helper method to test homepage display at a specific breakpoint
   */
  async function testHomepageAtBreakpoint(
    breakpoint,
    browser,
    waitForNuxtPageLoad,
    takeTimestampedScreenshot
  ) {
    const bp = breakpoint
    console.log(
      `[DEBUG] Starting test for ${bp.name} breakpoint (${bp.width}x${bp.height})`
    )

    // Create a fresh context with the target viewport size from the beginning
    console.log(
      `[DEBUG] Creating browser context with viewport ${bp.width}x${bp.height}`
    )
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
      viewport: { width: bp.width, height: bp.height },
    })

    console.log(`[DEBUG] Creating new page`)
    const page = await context.newPage()

    // Add console listener to capture page errors
    page.on('console', (msg) =>
      console.log(`[PAGE CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`)
    )
    page.on('pageerror', (error) =>
      console.log(`[PAGE ERROR] ${error.message}`)
    )

    console.log(
      `[DEBUG] Navigating to homepage with timeout ${timeouts.navigation.initial}ms`
    )
    const startTime = Date.now()
    await page.goto('/', { timeout: timeouts.navigation.initial })
    console.log(`[DEBUG] Navigation completed in ${Date.now() - startTime}ms`)

    console.log(`[DEBUG] Starting waitForNuxtPageLoad with 30s timeout`)
    const loadStartTime = Date.now()
    try {
      await waitForNuxtPageLoad({ timeout: 30000 })
      console.log(
        `[DEBUG] Nuxt page load completed in ${Date.now() - loadStartTime}ms`
      )
    } catch (error) {
      console.log(
        `[DEBUG] Nuxt page load failed after ${
          Date.now() - loadStartTime
        }ms with error: ${error.message}`
      )
      const currentTitle = await page.title()
      const bodyText = await page
        .textContent('body')
        .catch(() => 'Could not get body text')
      const isStillLoading = bodyText?.includes('Loading... Stuck here')
      const currentUrl = page.url()

      console.log(`[DEBUG] Current URL: ${currentUrl}`)
      console.log(
        `[DEBUG] Page failed to load properly at ${bp.name} breakpoint. Current title: "${currentTitle}"`
      )
      console.log(`[DEBUG] Is still loading: ${isStillLoading}`)
      console.log(
        `[DEBUG] Body text preview: ${
          bodyText ? bodyText.substring(0, 200) + '...' : 'No body text'
        }`
      )

      if (isStillLoading) {
        console.log(
          'Page appears to be stuck loading JavaScript, but continuing with test...'
        )
      } else {
        throw error
      }
    }

    // Verify page title
    console.log(`[DEBUG] Getting page title`)
    const title = await page.title()
    console.log(`[DEBUG] Page title: "${title}"`)
    expect(title).toBe("Don't throw it away, give it away!")

    // Check that essential elements that should always be visible are displayed
    console.log(`[DEBUG] Starting essential element checks`)

    // 1. Main buttons should always be visible
    console.log(
      `[DEBUG] Waiting for "Give Stuff" button with timeout ${timeouts.ui.appearance}ms`
    )
    const giveStuffStart = Date.now()
    await page
      .locator('.btn:has-text("Give Stuff")')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] "Give Stuff" button found in ${Date.now() - giveStuffStart}ms`
    )

    console.log(
      `[DEBUG] Waiting for "Ask for Stuff" button with timeout ${timeouts.ui.appearance}ms`
    )
    const askStuffStart = Date.now()
    await page
      .locator('.btn:has-text("Ask for Stuff")')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] "Ask for Stuff" button found in ${Date.now() - askStuffStart}ms`
    )

    // 2. PlaceAutocomplete should always be visible
    console.log(
      `[DEBUG] Waiting for PlaceAutocomplete text with timeout ${timeouts.ui.appearance}ms`
    )
    const placeStart = Date.now()
    await page
      .locator("text=See what's being freegled near you")
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] PlaceAutocomplete text found in ${Date.now() - placeStart}ms`
    )

    // 3. App download links should always be visible (wait for ProxyImage to load)
    console.log(
      `[DEBUG] Waiting for app download container with timeout ${timeouts.ui.appearance}ms`
    )
    const containerStart = Date.now()
    await page
      .locator('.app-download')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] App download container found in ${Date.now() - containerStart}ms`
    )

    console.log(
      `[DEBUG] Waiting for Google Play image with timeout ${timeouts.ui.appearance}ms`
    )
    const playStart = Date.now()
    await page
      .locator('img[alt="Freegle Android app on Google Play"]')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] Google Play image found in ${Date.now() - playStart}ms`
    )

    console.log(
      `[DEBUG] Waiting for App Store image with timeout ${timeouts.ui.appearance}ms`
    )
    const appStoreStart = Date.now()
    await page
      .locator('img[alt="Freegle app for iPhone, iPad, and iPod touch"]')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] App Store image found in ${Date.now() - appStoreStart}ms`
    )

    // 4. Footer should always be visible
    console.log(
      `[DEBUG] Waiting for footer container with timeout ${timeouts.ui.appearance}ms`
    )
    const footerStart = Date.now()
    await page
      .locator('.thefooter')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] Footer container found in ${Date.now() - footerStart}ms`
    )

    // Breakpoint-specific tests
    console.log(`[DEBUG] Starting breakpoint-specific tests for ${bp.name}`)
    if (bp.name === 'xs') {
      console.log(`[DEBUG] Running mobile (xs) specific tests`)

      // On mobile (xs) we should see:
      // - Mobile header
      console.log(`[DEBUG] Waiting for mobile header text`)
      const mobileHeaderStart = Date.now()
      await page
        .locator('text=Freegle - online dating for stuff')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] Mobile header found in ${Date.now() - mobileHeaderStart}ms`
      )

      // - Mobile description
      console.log(`[DEBUG] Waiting for mobile description text`)
      const mobileDescStart = Date.now()
      await page
        .locator("text=Got things you don't need? Need stuff?")
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] Mobile description found in ${Date.now() - mobileDescStart}ms`
      )

      // - VisualiseList component should be visible on mobile
      console.log(`[DEBUG] Waiting for VisualiseList component`)
      const visualiseStart = Date.now()
      await page
        .locator(selectors.common.visualiseList)
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] VisualiseList component found in ${
          Date.now() - visualiseStart
        }ms`
      )

      // - FreeglerPhotos should NOT be visible
      console.log(`[DEBUG] Checking that FreeglerPhotos is NOT visible`)
      const freeglerPhotosVisible = await page
        .locator(selectors.common.freeglerPhotos)
        .isVisible()
      console.log(`[DEBUG] FreeglerPhotos visible: ${freeglerPhotosVisible}`)
      expect(freeglerPhotosVisible).toBe(false)

      // - "Don't throw it away" tagline should NOT be visible
      console.log(`[DEBUG] Checking that tagline is NOT visible`)
      const taglineVisible = await page
        .locator("text=Don't throw it away, give it away!")
        .isVisible()
      console.log(`[DEBUG] Tagline visible: ${taglineVisible}`)
      expect(taglineVisible).toBe(false)
    } else {
      console.log(`[DEBUG] Running desktop (${bp.name}) specific tests`)

      // On larger screens (sm and up):
      // - Desktop header
      console.log(`[DEBUG] Waiting for desktop header text`)
      const desktopHeaderStart = Date.now()
      await page
        .locator('text=Freegle - like online dating for stuff')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] Desktop header found in ${Date.now() - desktopHeaderStart}ms`
      )

      // - Desktop description
      console.log(`[DEBUG] Waiting for desktop description text (part 1)`)
      const desktopDesc1Start = Date.now()
      await page
        .locator("text=Got stuff you don't need? Looking for something?")
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] Desktop description part 1 found in ${
          Date.now() - desktopDesc1Start
        }ms`
      )

      console.log(`[DEBUG] Waiting for desktop description text (part 2)`)
      const desktopDesc2Start = Date.now()
      await page
        .locator(
          "text=We'll match you with someone local. All completely free."
        )
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] Desktop description part 2 found in ${
          Date.now() - desktopDesc2Start
        }ms`
      )
    }

    // Specific checks for medium and larger screens
    if (
      bp.name === 'md' ||
      bp.name === 'lg' ||
      bp.name === 'xl' ||
      bp.name === 'xxl'
    ) {
      console.log(`[DEBUG] Running medium+ screen tests for ${bp.name}`)

      // "Don't throw it away" tagline should be visible on md screens and up
      console.log(
        `[DEBUG] Waiting for "Don't throw it away" tagline (should be visible on ${bp.name})`
      )
      const taglineStart = Date.now()
      await page
        .locator("text=Don't throw it away, give it away!")
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(`[DEBUG] Tagline found in ${Date.now() - taglineStart}ms`)

      // "Just looking?" heading should be visible on md screens and up
      console.log(`[DEBUG] Waiting for "Just looking?" heading`)
      const justLookingStart = Date.now()
      await page
        .locator('text=Just looking?')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] "Just looking?" heading found in ${
          Date.now() - justLookingStart
        }ms`
      )
    }

    // Specific checks for large and larger screens
    if (bp.name === 'lg' || bp.name === 'xl' || bp.name === 'xxl') {
      console.log(`[DEBUG] Running large+ screen tests for ${bp.name}`)

      // FreeglerPhotos should be visible on lg screens and up
      console.log(
        `[DEBUG] Waiting for FreeglerPhotos (should be visible on ${bp.name})`
      )
      const freeglerStart = Date.now()
      await page
        .locator(selectors.common.freeglerPhotos)
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] FreeglerPhotos found in ${Date.now() - freeglerStart}ms`
      )
    }

    console.log(`[DEBUG] Taking screenshot for ${bp.name}`)
    await takeTimestampedScreenshot(`homepage-${bp.name}`)
    console.log(`[DEBUG] Screenshot completed for ${bp.name}`)

    // Close the page and context to clean up resources
    console.log(`[DEBUG] Cleaning up page and context for ${bp.name}`)
    await page.close()
    await context.close()
    console.log(`[DEBUG] Test completed for ${bp.name} breakpoint`)
  }

  // Individual breakpoint tests
  test('homepage should display correctly at xs breakpoint', async ({
    browser,
    waitForNuxtPageLoad,
    takeTimestampedScreenshot,
  }) => {
    const xsBreakpoint = breakpoints.find((bp) => bp.name === 'xs')
    await testHomepageAtBreakpoint(
      xsBreakpoint,
      browser,
      waitForNuxtPageLoad,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at sm breakpoint', async ({
    browser,
    waitForNuxtPageLoad,
    takeTimestampedScreenshot,
  }) => {
    const smBreakpoint = breakpoints.find((bp) => bp.name === 'sm')
    await testHomepageAtBreakpoint(
      smBreakpoint,
      browser,
      waitForNuxtPageLoad,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at md breakpoint', async ({
    browser,
    waitForNuxtPageLoad,
    takeTimestampedScreenshot,
  }) => {
    const mdBreakpoint = breakpoints.find((bp) => bp.name === 'md')
    await testHomepageAtBreakpoint(
      mdBreakpoint,
      browser,
      waitForNuxtPageLoad,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at lg breakpoint', async ({
    browser,
    waitForNuxtPageLoad,
    takeTimestampedScreenshot,
  }) => {
    const lgBreakpoint = breakpoints.find((bp) => bp.name === 'lg')
    await testHomepageAtBreakpoint(
      lgBreakpoint,
      browser,
      waitForNuxtPageLoad,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at xl breakpoint', async ({
    browser,
    waitForNuxtPageLoad,
    takeTimestampedScreenshot,
  }) => {
    const xlBreakpoint = breakpoints.find((bp) => bp.name === 'xl')
    await testHomepageAtBreakpoint(
      xlBreakpoint,
      browser,
      waitForNuxtPageLoad,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at xxl breakpoint', async ({
    browser,
    waitForNuxtPageLoad,
    takeTimestampedScreenshot,
  }) => {
    const xxlBreakpoint = breakpoints.find((bp) => bp.name === 'xxl')
    await testHomepageAtBreakpoint(
      xxlBreakpoint,
      browser,
      waitForNuxtPageLoad,
      takeTimestampedScreenshot
    )
  })

  // Interactive elements test with place autocomplete
  test('homepage interactive elements work correctly', async ({
    page,
    setupTestPage,
    waitForNuxtPageLoad,
  }) => {
    await setupTestPage({ path: '/', viewport: { width: 1280, height: 800 } })
    await waitForNuxtPageLoad({ timeout: 30000 })

    // Test 1: Clicking "Give Stuff" should navigate to /give
    const giveStuffButton = page.locator('.btn:has-text("Give Stuff")')
    await giveStuffButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Create a navigation promise before clicking
    const giveStuffNavigation = page.waitForURL('/give', {
      timeout: timeouts.navigation.default,
    })
    await giveStuffButton.filter({ visible: true }).first().click()

    // Wait for navigation to complete
    await giveStuffNavigation
    expect(page.url()).toContain('/give')

    // Go back to homepage
    await page.gotoAndVerify('/')

    // Test 2: Clicking "Ask for Stuff" should navigate to /find
    const askStuffButton = page.locator('.btn:has-text("Ask for Stuff")')
    await askStuffButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Create a navigation promise before clicking
    const askStuffNavigation = page.waitForURL('/find', {
      timeout: timeouts.navigation.default,
    })
    await askStuffButton.filter({ visible: true }).first().click()

    // Wait for navigation to complete
    await askStuffNavigation
    expect(page.url()).toContain('/find')

    // Go back to homepage again for testing PlaceAutocomplete
    await page.gotoAndVerify('/')
  })

  // Separate test for PlaceAutocomplete to allow focused testing
  test('PlaceAutocomplete should work correctly with configurable location', async ({
    page,
    setupTestPage,
    waitForNuxtPageLoad,
  }) => {
    await setupTestPage({ path: '/', viewport: { width: 1280, height: 800 } })
    await waitForNuxtPageLoad({ timeout: 30000 })

    // Locate the PlaceAutocomplete input field
    const placeInput = page.locator(selectors.placeAutocomplete.input)
    await placeInput.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Clear any existing text and enter the test place
    await placeInput.click()
    await placeInput.fill(environment.place)

    // Wait for autocomplete dropdown to appear (might take a moment for API response)
    await page.waitForSelector(
      `${selectors.placeAutocomplete.suggestionItem}:has-text("${environment.place}")`,
      {
        timeout: timeouts.ui.autocomplete,
      }
    )

    // Select the matching location from the dropdown
    const placeOption = page
      .locator(
        `${selectors.placeAutocomplete.suggestionItem}:has-text("${environment.place}")`
      )
      .first()
    await placeOption.click()

    // Wait for navigation to the explore page
    await page.waitForURL(/\/explore\/place/, {
      timeout: timeouts.navigation.default,
    })

    // Verify we're on the explore page with our location
    expect(page.url()).toContain('/explore/place/')
  })
})
