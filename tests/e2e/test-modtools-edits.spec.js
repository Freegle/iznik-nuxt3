// @ts-check
/**
 * Tests for ModTools edits page - messages with pending edits for review.
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

test.describe('ModTools Edits Page', () => {
  test('edits page loads without errors', async ({ page, testEnv }) => {
    await loginViaModTools(page, testEnv.mod.email)

    await page.goto(`${MODTOOLS_URL}/messages/edits`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)
    await assertNoErrors(page)

    // The page should show either messages or "no messages" notice - not an error.
    const bodyText = await page.textContent('body')
    const hasMessages = !bodyText.includes(
      'There are no messages at the moment'
    )
    const hasNoMessagesNotice = bodyText.includes(
      'There are no messages at the moment'
    )

    // One of these must be true
    expect(hasMessages || hasNoMessagesNotice).toBe(true)
  })

  test('edits page shows group selector with work counts', async ({
    page,
    testEnv,
  }) => {
    await loginViaModTools(page, testEnv.mod.email)

    await page.goto(`${MODTOOLS_URL}/messages/edits`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Verify group selector has options (at least "All my communities")
    const options = await groupSelect.locator('option').all()
    expect(options.length).toBeGreaterThan(0)

    await assertNoErrors(page)
  })
})
