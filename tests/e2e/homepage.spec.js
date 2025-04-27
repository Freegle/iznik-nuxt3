// @ts-check
/**
 * @typedef {import('@playwright/test').Page} Page
 */

const { test, expect } = require('./fixtures')

// Environment variables with defaults for location testing - set via CircleCI environment variables
const TEST_POSTCODE = process.env.TEST_POSTCODE || 'EH3 6SS'
const TEST_PLACE = process.env.TEST_PLACE || 'Edinburgh'

/**
 * Bootstrap breakpoints:
 * - xs: < 576px
 * - sm: ≥ 576px and < 768px
 * - md: ≥ 768px and < 992px
 * - lg: ≥ 992px and < 1200px
 * - xl: ≥ 1200px
 * - xxl: ≥ 1400px
 */
const breakpoints = [
  { name: 'xs', width: 414, height: 896 }, // iPhone XR
  { name: 'sm', width: 640, height: 960 },
  { name: 'md', width: 820, height: 1180 }, // iPad Air
  { name: 'lg', width: 1024, height: 768 }, // iPad Pro
  { name: 'xl', width: 1280, height: 800 },
  { name: 'xxl', width: 1920, height: 1080 },
]

test.describe('Homepage tests', () => {
  // Test from the original home.spec.js
  test('homepage should load without console errors', async ({ page }) => {
    await page.gotoAndVerify('/', { timeout: 45000 })

    const title = await page.title()
    expect(title).toBe("Don't throw it away, give it away!")
  })

  // Main test that runs for each breakpoint
  for (const bp of breakpoints) {
    test(`homepage should display correctly at ${bp.name} breakpoint (${bp.width}x${bp.height})`, async ({
      page,
    }) => {
      // Set viewport to match the breakpoint
      await page.setViewportSize({
        width: bp.width,
        height: bp.height,
      })

      // Go to the homepage with extended timeout for initial load
      await page.gotoAndVerify('/', { timeout: 45000 })

      // Verify page title
      const title = await page.title()
      expect(title).toBe("Don't throw it away, give it away!")

      // Check that essential elements that should always be visible are displayed

      // 1. Main buttons should always be visible
      await expect(page.locator('text=Give Stuff')).toBeVisible()
      await expect(page.locator('text=Ask for Stuff')).toBeVisible()

      // 2. PlaceAutocomplete should always be visible
      await expect(
        page.locator("text=See what's being freegled near you")
      ).toBeVisible()

      // 3. App download links should always be visible
      await expect(page.locator('a[href*="play.google.com"]')).toBeVisible()
      await expect(page.locator('a[href*="itunes.apple.com"]')).toBeVisible()

      // 4. Footer should always be visible
      await expect(page.locator('.thefooter')).toBeVisible()

      // Breakpoint-specific tests
      if (bp.name === 'xs') {
        // On mobile (xs) we should see:
        // - Mobile header
        await expect(
          page.locator('text=Freegle - online dating for stuff')
        ).toBeVisible()
        // - Mobile description
        await expect(
          page.locator("text=Got things you don't need? Need stuff?")
        ).toBeVisible()
        // - VisualiseList component should be visible on mobile
        await expect(page.locator('.mt-2.mb-2.d-block.d-sm-none')).toBeVisible()
        // - FreeglerPhotos should NOT be visible
        await expect(page.locator('.ps-4.h-100')).not.toBeVisible()
        // - "Don't throw it away" tagline should NOT be visible
        await expect(
          page.locator("text=Don't throw it away, give it away!")
        ).not.toBeVisible()
      } else {
        // On larger screens (sm and up):
        // - Desktop header
        await expect(
          page.locator('text=Freegle - like online dating for stuff')
        ).toBeVisible()
        // - Desktop description
        await expect(
          page.locator("text=Got stuff you don't need? Looking for something?")
        ).toBeVisible()
        await expect(
          page.locator(
            "text=We'll match you with someone local. All completely free."
          )
        ).toBeVisible()
      }

      // Specific checks for medium and larger screens
      if (
        bp.name === 'md' ||
        bp.name === 'lg' ||
        bp.name === 'xl' ||
        bp.name === 'xxl'
      ) {
        // "Don't throw it away" tagline should be visible on md screens and up
        await expect(
          page.locator("text=Don't throw it away, give it away!")
        ).toBeVisible()
        // "Just looking?" heading should be visible on md screens and up
        await expect(page.locator('text=Just looking?')).toBeVisible()
      }

      // Specific checks for large and larger screens
      if (bp.name === 'lg' || bp.name === 'xl' || bp.name === 'xxl') {
        // FreeglerPhotos should be visible on lg screens and up
        await expect(page.locator('.ps-4.h-100')).toBeVisible()
      }

      // Take a screenshot for visual verification
      await page.screenshot({
        path: `playwright-screenshots/homepage-${bp.name}.png`,
        fullPage: true,
      })
    })
  }

  // Interactive elements test with place autocomplete
  test('homepage interactive elements work correctly', async ({ page }) => {
    // Set a reasonable default viewport
    await page.setViewportSize({ width: 1280, height: 800 })

    // Go to the homepage
    await page.gotoAndVerify('/')

    // Test 1: Clicking "Give Stuff" should navigate to /give
    const giveStuffButton = page.locator('text=Give Stuff')
    await expect(giveStuffButton).toBeVisible()

    // Create a navigation promise before clicking
    const giveStuffNavigation = page.waitForURL('/give')
    await giveStuffButton.click()

    // Wait for navigation to complete
    await giveStuffNavigation
    expect(page.url()).toContain('/give')

    // Go back to homepage
    await page.gotoAndVerify('/')

    // Test 2: Clicking "Ask for Stuff" should navigate to /find
    const askStuffButton = page.locator('text=Ask for Stuff')
    await expect(askStuffButton).toBeVisible()

    // Create a navigation promise before clicking
    const askStuffNavigation = page.waitForURL('/find')
    await askStuffButton.click()

    // Wait for navigation to complete
    await askStuffNavigation
    expect(page.url()).toContain('/find')

    // Go back to homepage again for testing PlaceAutocomplete
    await page.gotoAndVerify('/')
  })

  // Separate test for PlaceAutocomplete to allow focused testing
  test('PlaceAutocomplete should work correctly with configurable location', async ({
    page,
  }) => {
    // Set a reasonable default viewport
    await page.setViewportSize({ width: 1280, height: 800 })

    // Go to the homepage
    await page.gotoAndVerify('/')

    // Locate the PlaceAutocomplete input field
    const placeInput = page.locator('input[placeholder*="Enter your location"]')
    await expect(placeInput).toBeVisible()

    // Clear any existing text and enter the test postcode
    await placeInput.click()
    await placeInput.fill(TEST_POSTCODE)

    // Wait for autocomplete dropdown to appear (might take a moment for API response)
    await page.waitForSelector('li:has-text("' + TEST_PLACE + '")', {
      timeout: 10000,
    })

    // Select the matching location from the dropdown
    const placeOption = page
      .locator('li:has-text("' + TEST_PLACE + '")')
      .first()
    await placeOption.click()

    // Wait for navigation to the explore page
    await page.waitForURL(/\/explore\/place/, { timeout: 10000 })

    // Verify we're on the explore page with our location
    expect(page.url()).toContain('/explore/place/')

    // Verify some content on the explore page related to our location
    // This might need adjustment based on what content is actually shown for this location
    await page.waitForSelector('h1, h2, h3', { timeout: 5000 })

    // Take a screenshot to verify the explore page loaded correctly
    await page.screenshot({
      path: `playwright-screenshots/place-autocomplete-result.png`,
      fullPage: true,
    })
  })
})
