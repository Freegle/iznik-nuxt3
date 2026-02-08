// @ts-check
/**
 * Tests for v2 community event write endpoints.
 *
 * V2 endpoints exercised:
 *   POST   /api/communityevent      - create community event
 *   PATCH  /api/communityevent      - update/action on community event
 *   DELETE /api/communityevent/:id  - delete community event
 */
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

// The Go v2 API is at apiv2.localhost, not the Playwright baseURL
const APIV2_BASE = 'http://apiv2.localhost/api'

test.describe('V2 Community Event Write API Tests', () => {
  test('Unauthenticated POST to v2 communityevent returns 401', async ({
    context,
  }) => {
    const response = await context.request.post(
      `${APIV2_BASE}/communityevent`,
      {
        data: {
          title: 'Test',
          location: 'Test',
          description: 'Test',
        },
      }
    )
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated PATCH to v2 communityevent returns 401', async ({
    context,
  }) => {
    const response = await context.request.patch(
      `${APIV2_BASE}/communityevent`,
      {
        data: { id: 1, title: 'Updated' },
      }
    )
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated DELETE to v2 communityevent returns 401', async ({
    context,
  }) => {
    const response = await context.request.delete(
      `${APIV2_BASE}/communityevent/1`
    )
    expect(response.status()).toBe(401)
  })

  test('Community events page loads without errors with v2 write API', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/communityevents')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The page should render without error
    await expect(page.locator('body')).toBeVisible()
    await expect(
      page.locator('text=Something went wrong')
    ).not.toBeVisible()
  })
})
