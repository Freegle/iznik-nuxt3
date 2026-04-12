// @ts-check
/**
 * Tests for ModTools dashboard and post-login group visibility.
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

test.describe('ModTools Dashboard', () => {
  test('after login, groups should be visible (not empty)', async ({
    page,
    testEnv,
  }) => {
    // Issue #2/#4: groups list empty after login
    await loginViaModTools(page, testEnv.mod.email)

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    await dismissAllModals(page)

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // The group dropdown should have at least one group option (value !== '0').
    // Dismiss modals on each poll iteration — the cake modal can appear after
    // initial page load and blocks checkWork from fetching groups.
    await expect
      .poll(
        async () => {
          await dismissAllModals(page)
          const options = await groupSelect.locator('option').all()
          let groupCount = 0
          for (const option of options) {
            const value = await option.getAttribute('value')
            if (value && value !== '0') {
              groupCount++
            }
          }
          return groupCount
        },
        {
          message: 'Expected at least one group in the dropdown',
          timeout: timeouts.navigation.slowPage,
        }
      )
      .toBeGreaterThan(0)
  })

  test('dashboard loads without errors', async ({ page, testEnv }) => {
    await loginViaModTools(page, testEnv.mod.email)

    // Collect page errors
    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${MODTOOLS_URL}/modtools/dashboard`, {
      timeout: timeouts.navigation.initial,
    })

    // Wait for the page to have meaningful content
    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)
    await assertNoErrors(page)
    expect(errors).toHaveLength(0)
  })
})
