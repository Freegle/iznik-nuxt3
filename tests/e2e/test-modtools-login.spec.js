// @ts-check
/**
 * @typedef {import('@playwright/test').Page} Page
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')

test.describe('ModTools login tests', () => {
  test('root path should redirect to login page for unauthenticated users', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    // Navigate to ModTools root path (use absolute URL since this test is for ModTools)
    await page.goto(`${environment.modtoolsBaseUrl}/`, {
      timeout: timeouts.navigation.initial,
    })

    // Wait for redirect to login page (client-side redirect after initial page load)
    await page.waitForURL('**/login**', {
      timeout: timeouts.navigation.initial,
    })

    // Check that we were redirected to the login page with return parameter
    const currentUrl = page.url()
    expect(currentUrl).toContain('/login')
    expect(currentUrl).toContain('return=/')

    // Wait for the "Let's get freegling!" text to appear
    const loginText = page.locator("text=Let's get freegling!")
    await loginText.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Verify the login text is displayed
    const isLoginVisible = await loginText.isVisible()
    expect(isLoginVisible).toBe(true)
  })

  test('login page should display login prompt', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    // Navigate directly to ModTools login page (use absolute URL since this test is for ModTools)
    await page.goto(`${environment.modtoolsBaseUrl}/login`, {
      timeout: timeouts.navigation.initial,
    })

    try {
      await waitForNuxtPageLoad({ timeout: 30000 })
    } catch (error) {
      const currentTitle = await page.title()
      const bodyText = await page
        .textContent('body')
        .catch(() => 'Could not get body text')
      const isStillLoading = bodyText?.includes('Loading... Stuck here')

      console.log(
        `Page failed to load properly. Current title: "${currentTitle}"`
      )
      console.log(`Is still loading: ${isStillLoading}`)

      if (isStillLoading) {
        console.log(
          'Page appears to be stuck loading JavaScript, but continuing with test...'
        )
      } else {
        throw error
      }
    }

    // Wait for the "Let's get freegling!" text to appear
    const loginText = page.locator("text=Let's get freegling!")
    await loginText.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Verify the login text is displayed
    const isLoginVisible = await loginText.isVisible()
    expect(isLoginVisible).toBe(true)
  })
})
