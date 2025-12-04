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
    const baseURL =
      process.env.TEST_BASE_URL || 'http://freegle-prod-local.localhost'
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
      viewport: { width: bp.width, height: bp.height },
      baseURL,
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

    // Wait for page to fully load - using the new page directly instead of fixture's waitForNuxtPageLoad
    console.log(`[DEBUG] Waiting for page load state with 30s timeout`)
    const loadStartTime = Date.now()
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 })
      // Also wait for network to settle
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      console.log(
        `[DEBUG] Page load completed in ${Date.now() - loadStartTime}ms`
      )
    } catch (error) {
      console.log(
        `[DEBUG] Page load failed after ${
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

    // 1. Main buttons should always be visible (filter for visible to handle client-only/fallback elements)
    // Note: Mobile layout (xs, sm) uses .action-btn class with "Give" and "Find" text
    // Desktop layout (md+) uses .btn class with "Give Stuff" and "Ask for Stuff" text
    // Bootstrap breakpoints: mobile-layout visible below md (768px), desktop-layout visible at md+
    const isMobileLayout = bp.name === 'xs' || bp.name === 'sm'
    const giveButtonText = isMobileLayout ? 'Give' : 'Give Stuff'
    const findButtonText = isMobileLayout ? 'Find' : 'Ask for Stuff'
    const buttonClass = isMobileLayout ? '.action-btn' : '.btn'

    console.log(
      `[DEBUG] Waiting for "${giveButtonText}" button with timeout ${timeouts.ui.appearance}ms`
    )
    const giveStuffStart = Date.now()
    await page
      .locator(`${buttonClass}:has-text("${giveButtonText}")`)
      .filter({ visible: true })
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] "${giveButtonText}" button found in ${
        Date.now() - giveStuffStart
      }ms`
    )

    console.log(
      `[DEBUG] Waiting for "${findButtonText}" button with timeout ${timeouts.ui.appearance}ms`
    )
    const askStuffStart = Date.now()
    await page
      .locator(`${buttonClass}:has-text("${findButtonText}")`)
      .filter({ visible: true })
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] "${findButtonText}" button found in ${
        Date.now() - askStuffStart
      }ms`
    )

    // 2. PlaceAutocomplete/location input should always be visible
    // On mobile: "Just browsing? See what's near you." with "Type your location" input
    // On desktop: "See what's being freegled near you:" label with input
    console.log(
      `[DEBUG] Waiting for location input with timeout ${timeouts.ui.appearance}ms`
    )
    const placeStart = Date.now()
    // Look for the location input placeholder which is consistent
    // Filter for visible since there are mobile and desktop variants
    await page
      .locator('input[placeholder="Type your location"]')
      .filter({ visible: true })
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(`[DEBUG] Location input found in ${Date.now() - placeStart}ms`)

    // 3. App download links should always be visible
    // Mobile uses .app-section (within mobile-layout), desktop uses .app-download (within desktop-layout)
    const appSectionSelector = isMobileLayout ? '.app-section' : '.app-download'
    // Mobile uses different alt text than desktop
    const googlePlayAlt = isMobileLayout
      ? 'Get it on Google Play'
      : 'Freegle Android app on Google Play'
    const appStoreAlt = isMobileLayout
      ? 'Download on the App Store'
      : 'Freegle app for iPhone, iPad, and iPod touch'

    console.log(
      `[DEBUG] Waiting for app download container (${appSectionSelector}) with timeout ${timeouts.ui.appearance}ms`
    )
    const containerStart = Date.now()
    const appDownload = page.locator(appSectionSelector)
    // May need scroll on mobile
    await appDownload.scrollIntoViewIfNeeded()
    await appDownload.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log(
      `[DEBUG] App download container found in ${Date.now() - containerStart}ms`
    )

    console.log(
      `[DEBUG] Waiting for Google Play image with timeout ${timeouts.ui.appearance}ms`
    )
    const playStart = Date.now()
    await page
      .locator(`img[alt="${googlePlayAlt}"]`)
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] Google Play image found in ${Date.now() - playStart}ms`
    )

    console.log(
      `[DEBUG] Waiting for App Store image with timeout ${timeouts.ui.appearance}ms`
    )
    const appStoreStart = Date.now()
    await page
      .locator(`img[alt="${appStoreAlt}"]`)
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] App Store image found in ${Date.now() - appStoreStart}ms`
    )

    // 4. Footer should always be visible
    // Filter for visible footer since both mobile and desktop layouts exist in DOM
    console.log(
      `[DEBUG] Waiting for footer container with timeout ${timeouts.ui.appearance}ms`
    )
    const footerStart = Date.now()
    const footer = page.locator('.thefooter').filter({ visible: true }).first()
    await footer.scrollIntoViewIfNeeded()
    await footer.waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] Footer container found in ${Date.now() - footerStart}ms`
    )

    // Breakpoint-specific tests
    console.log(`[DEBUG] Starting breakpoint-specific tests for ${bp.name}`)
    if (isMobileLayout) {
      console.log(`[DEBUG] Running mobile (${bp.name}) specific tests`)

      // On mobile (xs/sm) we should see:
      // - Mobile slogan in the hero frame
      console.log(`[DEBUG] Waiting for mobile slogan text`)
      const mobileHeaderStart = Date.now()
      await page
        .locator('text=Share the love')
        .first()
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] Mobile slogan found in ${Date.now() - mobileHeaderStart}ms`
      )

      // - Mobile description
      console.log(`[DEBUG] Waiting for mobile description text`)
      const mobileDescStart = Date.now()
      await page
        .locator('text=Give and get stuff locally for free')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] Mobile description found in ${Date.now() - mobileDescStart}ms`
      )

      // - MobileVisualiseList component should be visible on mobile (uses class="sample-grid")
      console.log(
        `[DEBUG] Waiting for MobileVisualiseList component (sample-grid)`
      )
      const visualiseStart = Date.now()
      await page
        .locator('.sample-grid')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] MobileVisualiseList component found in ${
          Date.now() - visualiseStart
        }ms`
      )

      // - Desktop FreeglerPhotos (in .eyecandy) should NOT be visible on mobile
      // Note: Mobile has its own FreeglerPhotos with .hero-photos class in the hero-frame
      console.log(`[DEBUG] Checking that desktop FreeglerPhotos is NOT visible`)
      const desktopFreeglerPhotosVisible = await page
        .locator('.eyecandy .test-freegler-photos')
        .isVisible()
      console.log(
        `[DEBUG] Desktop FreeglerPhotos visible: ${desktopFreeglerPhotosVisible}`
      )
      expect(desktopFreeglerPhotosVisible).toBe(false)

      // - "Don't throw it away" tagline should NOT be visible
      console.log(`[DEBUG] Checking that tagline is NOT visible`)
      const taglineVisible = await page
        .locator("text=Don't throw it away, give it away!")
        .isVisible()
      console.log(`[DEBUG] Tagline visible: ${taglineVisible}`)
      expect(taglineVisible).toBe(false)
    } else {
      console.log(`[DEBUG] Running desktop (${bp.name}) specific tests`)

      // On desktop (md and up):
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
      // Use the desktop-specific selector (.eyecandy) since both mobile and desktop elements exist in DOM
      console.log(
        `[DEBUG] Waiting for FreeglerPhotos (should be visible on ${bp.name})`
      )
      const freeglerStart = Date.now()
      await page
        .locator('.eyecandy .test-freegler-photos')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      console.log(
        `[DEBUG] FreeglerPhotos found in ${Date.now() - freeglerStart}ms`
      )
    }

    console.log(`[DEBUG] Taking screenshot for ${bp.name}`)
    await takeTimestampedScreenshot(`homepage-${bp.name}`)
    console.log(`[DEBUG] Screenshot completed for ${bp.name}`)

    // Close the page and context to clean up resources.  Don't await, though, in case it hangs.
    console.log(`[DEBUG] Cleaning up page and context for ${bp.name}`)
    page.close()
    context.close()
    console.log(`[DEBUG] Test completed for ${bp.name} breakpoint`)
  }

  // Individual breakpoint tests
  test('homepage should display correctly at xs breakpoint', async ({
    browser,
    takeTimestampedScreenshot,
  }) => {
    const xsBreakpoint = breakpoints.find((bp) => bp.name === 'xs')
    await testHomepageAtBreakpoint(
      xsBreakpoint,
      browser,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at sm breakpoint', async ({
    browser,
    takeTimestampedScreenshot,
  }) => {
    const smBreakpoint = breakpoints.find((bp) => bp.name === 'sm')
    await testHomepageAtBreakpoint(
      smBreakpoint,
      browser,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at md breakpoint', async ({
    browser,
    takeTimestampedScreenshot,
  }) => {
    const mdBreakpoint = breakpoints.find((bp) => bp.name === 'md')
    await testHomepageAtBreakpoint(
      mdBreakpoint,
      browser,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at lg breakpoint', async ({
    browser,
    takeTimestampedScreenshot,
  }) => {
    const lgBreakpoint = breakpoints.find((bp) => bp.name === 'lg')
    await testHomepageAtBreakpoint(
      lgBreakpoint,
      browser,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at xl breakpoint', async ({
    browser,
    takeTimestampedScreenshot,
  }) => {
    const xlBreakpoint = breakpoints.find((bp) => bp.name === 'xl')
    await testHomepageAtBreakpoint(
      xlBreakpoint,
      browser,
      takeTimestampedScreenshot
    )
  })

  test('homepage should display correctly at xxl breakpoint', async ({
    browser,
    takeTimestampedScreenshot,
  }) => {
    const xxlBreakpoint = breakpoints.find((bp) => bp.name === 'xxl')
    await testHomepageAtBreakpoint(
      xxlBreakpoint,
      browser,
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

    // Locate the PlaceAutocomplete input field (filter for visible to handle mobile/desktop variants)
    const placeInput = page
      .locator(selectors.placeAutocomplete.input)
      .filter({ visible: true })
      .first()
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
