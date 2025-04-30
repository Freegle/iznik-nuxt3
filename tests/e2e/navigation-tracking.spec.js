// @ts-check
/**
 * Tests demonstrating navigation tracking and inactivity timeout
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

  // This test demonstrates how to manually reset the navigation timer during long operations
  test('Can handle long operations without navigation by resetting timer', async ({
    page,
  }) => {
    // Go to the homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    console.log('Starting a long operation with no navigation...')

    // Simulate some long-running operation that doesn't trigger navigation
    // In a real test, this might be complex DOM manipulation, calculations, etc.
    for (let i = 1; i <= 5; i++) {
      // Wait for 5 seconds - in a real test this might be a long operation
      await page.waitForTimeout(5000)

      // Log progress
      console.log(`Long operation step ${i}/5 completed`)

      // Manually reset the navigation timer to prevent timeout
      // This prevents the test from failing due to no navigation
      page.resetNavigationTimer()

      // Note: In real tests, you'd only reset the timer when performing long operations
      // that legitimately don't involve navigation, but the test is still running normally
    }

    // Complete the test with a final navigation to verify everything still works
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    // Verify we're on the about page
    expect(page.url()).toContain('/about')
  })
})
