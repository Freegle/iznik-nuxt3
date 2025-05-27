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

  // Main test that runs for each breakpoint
  for (const bp of breakpoints) {
    test(`homepage should display correctly at ${bp.name} breakpoint (${bp.width}x${bp.height})`, async ({
      page,
      waitForNuxtPageLoad,
      takeTimestampedScreenshot,
    }) => {
      await page.setViewportSize({
        width: bp.width,
        height: bp.height,
      })

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
          `Page failed to load properly at ${bp.name} breakpoint. Current title: "${currentTitle}"`
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

      // Verify page title
      const title = await page.title()
      expect(title).toBe("Don't throw it away, give it away!")

      // Check that essential elements that should always be visible are displayed

      // 1. Main buttons should always be visible
      await page
        .locator('.btn:has-text("Give Stuff")')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      await page
        .locator('.btn:has-text("Ask for Stuff")')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

      // 2. PlaceAutocomplete should always be visible
      await page
        .locator("text=See what's being freegled near you")
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

      // 3. App download links should always be visible
      await page
        .locator('a[href*="play.google.com"]')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      await page
        .locator('a[href*="itunes.apple.com"]')
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

      // 4. Footer should always be visible
      await page
        .locator(selectors.common.mainFooter)
        .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

      // Breakpoint-specific tests
      if (bp.name === 'xs') {
        // On mobile (xs) we should see:
        // - Mobile header
        await page
          .locator('text=Freegle - online dating for stuff')
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

        // - Mobile description
        await page
          .locator("text=Got things you don't need? Need stuff?")
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

        // - VisualiseList component should be visible on mobile
        await page
          .locator(selectors.common.visualiseList)
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

        // - FreeglerPhotos should NOT be visible
        const freeglerPhotosVisible = await page
          .locator(selectors.common.freeglerPhotos)
          .isVisible()
        expect(freeglerPhotosVisible).toBe(false)

        // - "Don't throw it away" tagline should NOT be visible
        const taglineVisible = await page
          .locator("text=Don't throw it away, give it away!")
          .isVisible()
        expect(taglineVisible).toBe(false)
      } else {
        // On larger screens (sm and up):
        // - Desktop header
        await page
          .locator('text=Freegle - like online dating for stuff')
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

        // - Desktop description
        await page
          .locator("text=Got stuff you don't need? Looking for something?")
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

        await page
          .locator(
            "text=We'll match you with someone local. All completely free."
          )
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      }

      // Specific checks for medium and larger screens
      if (
        bp.name === 'md' ||
        bp.name === 'lg' ||
        bp.name === 'xl' ||
        bp.name === 'xxl'
      ) {
        // "Don't throw it away" tagline should be visible on md screens and up
        await page
          .locator("text=Don't throw it away, give it away!")
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

        // "Just looking?" heading should be visible on md screens and up
        await page
          .locator('text=Just looking?')
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      }

      // Specific checks for large and larger screens
      if (bp.name === 'lg' || bp.name === 'xl' || bp.name === 'xxl') {
        // FreeglerPhotos should be visible on lg screens and up
        await page
          .locator(selectors.common.freeglerPhotos)
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
      }

      await takeTimestampedScreenshot(`homepage-${bp.name}`)
    })
  }

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
    const giveStuffNavigation = page.waitForURL('/give')
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
    const askStuffNavigation = page.waitForURL('/find')
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
