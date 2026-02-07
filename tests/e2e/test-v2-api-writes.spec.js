// @ts-check
/**
 * Tests for v2 API write endpoints.
 *
 * These tests verify that v2 write endpoints work correctly by making
 * API calls and checking that pages using these endpoints load without errors.
 *
 * V2 write endpoints exercised:
 *   POST   /apiv2/address        - create address
 *   PATCH  /apiv2/address        - update address
 *   DELETE /apiv2/address/:id    - delete address
 */
const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('V2 API Write Endpoints', () => {
  test('Unauthenticated POST to v2 address returns 401', async ({
    context,
  }) => {
    const response = await context.request.post('/apiv2/address', {
      data: { pafid: 1 },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated DELETE to v2 address returns 401', async ({
    context,
  }) => {
    const response = await context.request.delete('/apiv2/address/1')
    expect(response.status()).toBe(401)
  })

  test('Unauthenticated PATCH to v2 address returns 401', async ({
    context,
  }) => {
    const response = await context.request.patch('/apiv2/address', {
      data: { id: 1, instructions: 'test' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(response.status()).toBe(401)
  })

  test('Browse page loads without errors with v2 address API', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    // The browse page may trigger address-related API calls.
    // This verifies the v2 switchover doesn't cause errors.
    await page.gotoAndVerify('/browse')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    await expect(page.locator('body')).toBeVisible()
    await expect(
      page.locator('text=Something went wrong')
    ).not.toBeVisible()
  })
})
