import { test, expect } from '@playwright/test'

const APIV2_BASE = 'http://apiv2.localhost/api'

test.describe('V2 Comment Write API', () => {
  test('POST /comment returns 401 without auth', async ({ request }) => {
    const response = await request.post(`${APIV2_BASE}/comment`, {
      data: { userid: 1, groupid: 1, user1: 'Test' },
    })
    expect(response.status()).toBe(401)
  })

  test('PATCH /comment returns 401 without auth', async ({ request }) => {
    const response = await request.patch(`${APIV2_BASE}/comment`, {
      data: { id: 1, user1: 'Updated' },
    })
    expect(response.status()).toBe(401)
  })

  test('DELETE /comment/:id returns 401 without auth', async ({ request }) => {
    const response = await request.delete(`${APIV2_BASE}/comment/1`)
    expect(response.status()).toBe(401)
  })
})
