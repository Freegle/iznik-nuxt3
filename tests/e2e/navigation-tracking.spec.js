// @ts-check
/**
 * Tests demonstrating navigation tracking
 */
const { test, expect } = require('./fixtures')

test.describe('Navigation Tracking', () => {
  test('Tracks different navigation types', async ({ page }) => {
    // Hard navigation (initial page load)
    await page.goto('/')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Get current navigation stats
    let navStats = page.getNavigationSummary()

    // Should have at least 1 hard navigation (the initial page load)
    expect(navStats.hardCount).toBeGreaterThanOrEqual(1)
    console.log(
      `After initial load: ${navStats.hardCount} hard, ${navStats.softCount} soft navigations`
    )

    // Perform a soft navigation (client-side route change) if possible
    // Look for a link to click that would trigger a client-side navigation
    const links = await page.locator('a[href^="/"]').all()
    if (links.length > 0) {
      await links[0].click()
      await page.waitForLoadState('networkidle')

      // Get updated navigation stats
      navStats = page.getNavigationSummary()
      console.log(
        `After clicking link: ${navStats.hardCount} hard, ${navStats.softCount} soft navigations`
      )

      // Log the full navigation history for debugging
      console.log('\nNavigation History:')
      console.log(page.getNavigationHistory())
    } else {
      console.log('No internal links found to test soft navigation')
    }

    // Manually navigate to another page
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    // Get final navigation stats
    navStats = page.getNavigationSummary()
    console.log(
      `Final stats: ${navStats.hardCount} hard, ${navStats.softCount} soft navigations`
    )

    // Example of checking specific navigation patterns
    const aboutNavigations = navStats.all.filter((nav) =>
      nav.url.includes('/about')
    )
    expect(aboutNavigations.length).toBeGreaterThan(0)
  })
})
