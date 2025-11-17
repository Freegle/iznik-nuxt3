import { test, expect } from '@playwright/test'

test.describe('Chat polling unhandled promise fix', () => {
  test('should not generate unhandled promise errors during chat polling', async ({
    page,
  }) => {
    const unhandledRejections = []
    page.on('pageerror', (error) => {
      if (
        error.message.includes('Unhandled') ||
        error.message.includes('promise')
      ) {
        unhandledRejections.push(error.message)
      }
    })

    await page.goto('http://freegle-prod.localhost/')

    await page.waitForTimeout(1000)

    const loginButton = page.locator('text=Sign in').first()
    if (await loginButton.isVisible()) {
      await loginButton.click()
      await page.waitForTimeout(500)

      await page.fill('input[type="email"]', 'test@test.com')
      await page.fill('input[type="password"]', 'testpass')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
    }

    await page.goto('http://freegle-prod.localhost/chats/')
    await page.waitForTimeout(35000)

    expect(unhandledRejections.length).toBe(0)
  })
})
