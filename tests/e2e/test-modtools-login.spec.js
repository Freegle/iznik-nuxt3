// @ts-check
/**
 * @typedef {import('@playwright/test').Page} Page
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')

test.describe('ModTools login tests', () => {
  test('root path should show login modal for unauthenticated users', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    // Navigate to ModTools root path (use absolute URL since this test is for ModTools)
    await page.goto(`${environment.modtoolsBaseUrl}/`, {
      timeout: timeouts.navigation.initial,
    })

    // The layout shows LoginModal inline for unauthenticated users (no redirect)
    const loginModal = page.locator(
      '#loginModal, .modal-content:has-text("Join the Reuse Revolution")'
    )
    await loginModal.first().waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Verify the login modal is displayed and we stayed on the root path
    const isModalVisible = await loginModal.first().isVisible()
    expect(isModalVisible).toBe(true)
    expect(page.url()).toContain(environment.modtoolsBaseUrl)
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

    // Wait for the login modal to appear (ModTools shows LoginModal for unauthenticated users)
    // The modal shows "Join the Reuse Revolution!" text
    const loginModal = page.locator(
      '#loginModal, .modal-content:has-text("Join the Reuse Revolution")'
    )
    await loginModal.first().waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Verify the login modal is displayed
    const isModalVisible = await loginModal.first().isVisible()
    expect(isModalVisible).toBe(true)
  })
})
