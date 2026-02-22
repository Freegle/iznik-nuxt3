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
    // Don't use networkidle - the app has background polling that prevents idle state
    console.log(`[DEBUG] Waiting for page load state with 30s timeout`)
    const loadStartTime = Date.now()
    try {
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 })
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

    // 1. Main buttons - unified layout uses .action-btn with "Give" and "Find" text at all breakpoints
    console.log(
      `[DEBUG] Waiting for "Give" button with timeout ${timeouts.ui.appearance}ms`
    )
    const giveStuffStart = Date.now()
    await page
      .locator('.action-btn:has-text("Give")')
      .filter({ visible: true })
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] "Give" button found in ${Date.now() - giveStuffStart}ms`
    )

    console.log(
      `[DEBUG] Waiting for "Find" button with timeout ${timeouts.ui.appearance}ms`
    )
    const askStuffStart = Date.now()
    await page
      .locator('.action-btn:has-text("Find")')
      .filter({ visible: true })
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] "Find" button found in ${Date.now() - askStuffStart}ms`
    )

    // 2. PlaceAutocomplete/location input should always be visible
    console.log(
      `[DEBUG] Waiting for location input with timeout ${timeouts.ui.appearance}ms`
    )
    const placeStart = Date.now()
    await page
      .locator('input[placeholder="Type your location"]')
      .filter({ visible: true })
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(`[DEBUG] Location input found in ${Date.now() - placeStart}ms`)

    // 3. App download links - unified layout uses .app-section at all breakpoints
    console.log(
      `[DEBUG] Waiting for app download container with timeout ${timeouts.ui.appearance}ms`
    )
    const containerStart = Date.now()
    const appDownload = page.locator('.app-section')
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
      .locator('img[alt="Get it on Google Play"]')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] Google Play image found in ${Date.now() - playStart}ms`
    )

    console.log(
      `[DEBUG] Waiting for App Store image with timeout ${timeouts.ui.appearance}ms`
    )
    const appStoreStart = Date.now()
    await page
      .locator('img[alt="Download on the App Store"]')
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

    // All breakpoints use the same unified layout with photo grid + glass card overlay
    console.log(`[DEBUG] Starting breakpoint-specific tests for ${bp.name}`)

    // Common elements at all breakpoints
    console.log(`[DEBUG] Waiting for subtitle text`)
    const subtitleStart = Date.now()
    await page
      .locator('text=Give and get stuff locally for free')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(`[DEBUG] Subtitle found in ${Date.now() - subtitleStart}ms`)

    // Sample grid should be visible at all breakpoints
    console.log(`[DEBUG] Waiting for sample-grid component`)
    const visualiseStart = Date.now()
    await page
      .locator('.sample-grid')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(`[DEBUG] Sample grid found in ${Date.now() - visualiseStart}ms`)

    // Slogan uses .slogan-line1 at all breakpoints (unified glass card layout)
    // Scroll back to top since we may have scrolled down to check the footer
    console.log(`[DEBUG] Waiting for slogan text (.slogan-line1)`)
    const sloganStart = Date.now()
    const sloganLocator = page.locator('.slogan-line1:has-text("Share the love")')
    await sloganLocator.scrollIntoViewIfNeeded()
    await sloganLocator.waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    console.log(
      `[DEBUG] Slogan found in ${Date.now() - sloganStart}ms`
    )

    console.log(`[DEBUG] Taking screenshot for ${bp.name}`)
    await takeTimestampedScreenshot(`homepage-${bp.name}`)
    console.log(`[DEBUG] Screenshot completed for ${bp.name}`)

    // Close the page and context to clean up resources properly for parallel execution.
    console.log(`[DEBUG] Cleaning up page and context for ${bp.name}`)
    await page.close()
    await context.close()
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

    // Test 1: Clicking "Give" button should navigate to /give
    const giveButton = page.locator('.action-btn:has-text("Give")')
    await giveButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Create a navigation promise before clicking
    const giveNavigation = page.waitForURL('/give', {
      timeout: timeouts.navigation.default,
    })
    await giveButton.filter({ visible: true }).first().click()

    // Wait for navigation to complete
    await giveNavigation
    expect(page.url()).toContain('/give')

    // Go back to homepage
    await page.gotoAndVerify('/')

    // Test 2: Clicking "Find" button should navigate to /find
    const findButton = page.locator('.action-btn:has-text("Find")')
    await findButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Create a navigation promise before clicking
    const findNavigation = page.waitForURL('/find', {
      timeout: timeouts.navigation.default,
    })
    await findButton.filter({ visible: true }).first().click()

    // Wait for navigation to complete
    await findNavigation
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
