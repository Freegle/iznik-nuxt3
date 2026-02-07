// @ts-check
/**
 * Tests for v2 volunteering write endpoints.
 *
 * V2 endpoints exercised:
 *   POST   /apiv2/volunteering      - create volunteering opportunity
 *   PATCH  /apiv2/volunteering      - update/action on volunteering
 *   DELETE /apiv2/volunteering/:id  - delete volunteering opportunity
 */
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('V2 Volunteering Write API Tests', () => {
  test('Unauthenticated POST to v2 volunteering returns 401', async ({
    context,
  }) => {
    const response = await context.request.post('/apiv2/volunteering', {
      data: {
        title: 'Test',
        location: 'Test',
        description: 'Test',
      },
    })
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated PATCH to v2 volunteering returns 401', async ({
    context,
  }) => {
    const response = await context.request.patch('/apiv2/volunteering', {
      data: { id: 1, title: 'Updated' },
    })
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated DELETE to v2 volunteering returns 401', async ({
    context,
  }) => {
    const response = await context.request.delete('/apiv2/volunteering/1')
    expect(response.status()).toBe(401)
  })

  test('Volunteering page loads without errors with v2 write API', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/volunteerings')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The page should render without error
    await expect(page.locator('body')).toBeVisible()
    await expect(
      page.locator('text=Something went wrong')
    ).not.toBeVisible()
  })
})
