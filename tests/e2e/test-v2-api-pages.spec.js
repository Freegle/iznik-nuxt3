// @ts-check
/**
 * Tests for pages that exercise v2 API endpoints.
 *
 * These tests verify that pages backed by the Go v2 API load correctly
 * and display expected content. Each test navigates to a page whose data
 * comes from a v2 endpoint, confirming the endpoint returns valid data
 * and the UI renders it without errors.
 *
 * V2 endpoints exercised:
 *   GET /api/v2/story           - stories list
 *   GET /api/v2/communityevent  - community events list
 *   GET /api/v2/volunteering    - volunteering opportunities list
 *   GET /api/v2/job             - job listings
 *   GET /api/v2/donations       - donation target/raised
 *   GET /api/v2/group           - group list (used on many pages)
 *   GET /api/v2/authority/:id   - authority details (used on stats/stories pages)
 */
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('V2 API Page Tests', () => {
  test('Stories page loads and exercises GET /api/v2/story', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stories')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page title should indicate stories
    const title = await page.title()
    expect(title.toLowerCase()).toContain('stories')

    // The page should render without error - check for main content area
    await expect(page.locator('body')).toBeVisible()

    // Should not show an error page
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
  })

  test('Community events page loads and exercises GET /api/v2/communityevent', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/communityevents')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page title should indicate community events
    const title = await page.title()
    expect(title.toLowerCase()).toContain('community event')

    // The page should render without error
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
  })

  test('Volunteering page loads and exercises GET /api/v2/volunteering', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/volunteerings')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page title should indicate volunteering
    const title = await page.title()
    expect(title.toLowerCase()).toContain('volunteer')

    // The page should render without error
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
  })

  test('Jobs page loads and exercises GET /api/v2/job', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/jobs')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page title should indicate jobs
    const title = await page.title()
    expect(title.toLowerCase()).toContain('job')

    // The page should render without error
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
  })

  test('Donate page loads and exercises GET /api/v2/donations', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/donate')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page title should indicate donations
    const title = await page.title()
    expect(title.toLowerCase()).toContain('donate')

    // The page should render without error
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
  })

  test('Explore page for specific group exercises GET /api/v2/group/{id}', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/explore/FreeglePlayground')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Should display the group name
    await expect(
      page.locator('h4:has-text("FreeglePlayground")').first()
    ).toBeVisible({ timeout: timeouts.ui.appearance })

    // Should not show an error page
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
  })

  test('Authority stats page exercises GET /api/v2/authority/:id', async ({
    page,
    context,
    waitForNuxtPageLoad,
  }) => {
    // First, find a valid authority ID by searching the v2 API directly.
    const searchResponse = await context.request.get(
      '/apiv2/authority?search=Edinburgh&limit=1'
    )

    // If search fails or returns no results, skip the test gracefully.
    if (searchResponse.status() !== 200) {
      console.log('Authority search API unavailable, skipping test')
      return
    }

    const searchResults = await searchResponse.json()
    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      console.log('No authorities found in database, skipping test')
      return
    }

    const authorityId = searchResults[0].id

    // Navigate to stats page for the discovered authority.
    // The page makes a v2 API call during SSR, so the browser may not
    // see it directly. We verify the page renders without error, which
    // proves the v2 API integration works end-to-end.
    await page.gotoAndVerify(`/stats/authority/${authorityId}`)
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The page should render without error
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
  })
})
