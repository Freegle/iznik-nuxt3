// @ts-check
/**
 * Tests for v2 newsfeed write endpoints.
 *
 * V2 endpoints exercised:
 *   POST   /api/newsfeed      - actions (Love, Unlove, Seen, Report, etc.)
 *   PATCH  /api/newsfeed      - edit post
 *   DELETE /api/newsfeed/:id  - delete post
 */
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

// The Go v2 API is at apiv2.localhost, not the Playwright baseURL
const APIV2_BASE = 'http://apiv2.localhost/api'

test.describe('V2 Newsfeed Write API Tests', () => {
  test('Unauthenticated POST to v2 newsfeed returns 401', async ({
    context,
  }) => {
    const response = await context.request.post(`${APIV2_BASE}/newsfeed`, {
      data: { id: 1, action: 'Love' },
    })
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated PATCH to v2 newsfeed returns 401', async ({
    context,
  }) => {
    const response = await context.request.patch(`${APIV2_BASE}/newsfeed`, {
      data: { id: 1, message: 'Updated' },
    })
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated DELETE to v2 newsfeed returns 401', async ({
    context,
  }) => {
    const response = await context.request.delete(
      `${APIV2_BASE}/newsfeed/1`
    )
    expect(response.status()).toBe(401)
  })

  test('ChitChat page loads without errors with v2 newsfeed API', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/chitchat')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The page should render without error
    await expect(page.locator('body')).toBeVisible()
    await expect(
      page.locator('text=Something went wrong')
    ).not.toBeVisible()
  })
})
