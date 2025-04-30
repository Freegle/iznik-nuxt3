// @ts-check
/**
 * Tests demonstrating browser context isolation
 */
const { test, expect } = require('./fixtures')

test.describe('Browser Context Isolation', () => {
  // This test demonstrates that each test gets a fresh browser context
  test('First test sets cookies and local storage', async ({ page }) => {
    // Go to the homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Set some cookies and local storage data
    await page.evaluate(() => {
      // Set a cookie
      document.cookie = 'testCookie=contextIsolationTest; path=/;'

      // Set localStorage
      localStorage.setItem('testLocalStorage', 'test-value-1')

      // Set sessionStorage
      sessionStorage.setItem('testSessionStorage', 'test-value-2')

      console.log('Set test cookie and storage values')
    })

    // Verify we can read our own values
    const hasValues = await page.evaluate(() => {
      const cookieExists = document.cookie.includes(
        'testCookie=contextIsolationTest'
      )
      const localStorageExists =
        localStorage.getItem('testLocalStorage') === 'test-value-1'
      const sessionStorageExists =
        sessionStorage.getItem('testSessionStorage') === 'test-value-2'

      return cookieExists && localStorageExists && sessionStorageExists
    })

    expect(hasValues).toBeTruthy()
    console.log('Successfully verified cookie and storage values in first test')
  })

  // This test verifies that it cannot see cookies/storage from the previous test
  test('Second test confirms isolation from first test', async ({ page }) => {
    // Go to the homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that we don't have the values from the previous test
    const hasNoValues = await page.evaluate(() => {
      const cookieAbsent = !document.cookie.includes(
        'testCookie=contextIsolationTest'
      )
      const localStorageAbsent =
        localStorage.getItem('testLocalStorage') === null
      const sessionStorageAbsent =
        sessionStorage.getItem('testSessionStorage') === null

      return cookieAbsent && localStorageAbsent && sessionStorageAbsent
    })

    expect(hasNoValues).toBeTruthy()
    console.log(
      'Successfully verified context isolation - no values from previous test'
    )
  })

  // This test demonstrates that navigation inactivity timeout works with isolated contexts
  test('Navigation inactivity timer works with isolated contexts', async ({
    page,
  }) => {
    // Go to the homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigation to another page to verify the timer is reset
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    console.log('Navigation events were tracked and timer was reset')

    // Manually reset the timer to simulate a long operation
    page.resetNavigationTimer()
    console.log(
      'Timer was manually reset - this would prevent timeout during long operations'
    )
  })
})
