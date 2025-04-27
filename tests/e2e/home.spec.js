const { test, expect } = require('./fixtures')

test.describe('Basic tests', () => {
  test('homepage should load without console errors', async ({ page }) => {
    await page.gotoAndVerify('/', { timeout: 45000 })

    const title = await page.title()
    expect(title).toBe("Don't throw it away, give it away!")
  })
})
