// @ts-check
/**
 * Tests for ModTools Support Tools functionality.
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')
const { loginViaModTools } = require('./utils/user')

const MODTOOLS_URL = environment.modtoolsBaseUrl

// Helper: dismiss any overlay modals (cake modal, etc.) that block interaction.
async function dismissAllModals(page) {
  await page.evaluate(() => {
    document
      .querySelectorAll('.modal.show, .modal[style*="display: block"]')
      .forEach((el) => {
        el.classList.remove('show')
        el.style.display = 'none'
      })
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  })
}

// Helper: check page for common error indicators.
async function assertNoErrors(page) {
  const body = await page.textContent('body')
  expect(body).not.toContain('something went wrong')
  expect(body).not.toContain('Oh dear')
  expect(body).not.toContain('undefined is not an object')
  expect(body).not.toContain('Cannot read properties of undefined')
}

test.describe('ModTools Support Tools', () => {
  test('Support Tools user search does not crash', async ({
    page,
    testEnv,
  }) => {
    // Issue #8: Support Tools crashes on search
    await loginViaModTools(page, testEnv.mod.email)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${MODTOOLS_URL}/support`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)

    // Look for a user search input and type a test query
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[placeholder*="user" i], input[placeholder*="email" i], input[type="search"]'
    )

    if (
      await searchInput
        .first()
        .isVisible({ timeout: timeouts.ui.appearance })
        .catch(() => false)
    ) {
      await searchInput.first().fill(testEnv.user.email)
      // Wait a moment for search to execute
      await page.waitForTimeout(timeouts.ui.settleTime)
      await assertNoErrors(page)
    }

    expect(errors).toHaveLength(0)
  })

  test('Support Tools community search returns results', async ({
    page,
    testEnv,
  }) => {
    // Issue #8: Support Tools community search broken
    await loginViaModTools(page, testEnv.mod.email)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${MODTOOLS_URL}/support`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)

    // Look for a community/group search input
    const searchInputs = page.locator(
      'input[placeholder*="community" i], input[placeholder*="group" i]'
    )

    if (
      await searchInputs
        .first()
        .isVisible({ timeout: timeouts.ui.appearance })
        .catch(() => false)
    ) {
      await searchInputs.first().fill('Freegle')
      await page.waitForTimeout(timeouts.ui.settleTime)

      // Should see some search results (autocomplete suggestions or result list)
      const results = page.locator(
        '.autocomplete-result, .dropdown-item, .list-group-item, [class*="suggestion"]'
      )
      await expect(results.first()).toBeVisible({
        timeout: timeouts.ui.autocomplete,
      })
    }

    expect(errors).toHaveLength(0)
  })
})
