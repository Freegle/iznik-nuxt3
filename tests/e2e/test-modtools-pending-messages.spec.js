// @ts-check
/**
 * Tests for ModTools pending messages display and notification counts.
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

// Helper: select a group with pending messages, with fallback if work counts don't load.
async function selectGroupWithPendingMessages(page, groupSelect) {
  let targetGroupValue = null

  // First attempt: poll for a group with counts (shorter timeout)
  try {
    await expect
      .poll(
        async () => {
          const options = await groupSelect.locator('option').all()
          for (const option of options) {
            const text = await option.textContent()
            const value = await option.getAttribute('value')
            if (value && value !== '0' && /\(\d+\)/.test(text)) {
              targetGroupValue = value
              return true
            }
          }
          return false
        },
        {
          message: 'Waiting for group options with pending message counts',
          timeout: 30000,
          intervals: [1000, 2000, 5000],
        }
      )
      .toBe(true)
  } catch {
    // Fallback: try each non-zero group until one shows message cards
    console.log('Work counts did not load in time, trying groups individually')
    const options = await groupSelect.locator('option').all()
    for (const option of options) {
      const value = await option.getAttribute('value')
      if (value && value !== '0') {
        await groupSelect.selectOption(value)
        try {
          await page
            .locator('.card')
            .first()
            .waitFor({ state: 'visible', timeout: 10000 })
          targetGroupValue = value
          break
        } catch {
          // No messages in this group, try next
        }
      }
    }
    if (!targetGroupValue) {
      throw new Error(
        'No group with pending messages found (counts never loaded and no group had visible messages)'
      )
    }
  }

  await groupSelect.selectOption(targetGroupValue)
  return targetGroupValue
}

test.describe('ModTools Pending Messages', () => {
  test('pending messages show text content, not "This message is blank"', async ({
    page,
  }) => {
    // Issue #29: pending messages display "This message is blank"
    await loginViaModTools(page, 'testmod@test.com')

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select a group with pending messages
    await selectGroupWithPendingMessages(page, groupSelect)

    // Wait for message cards to load
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Verify no message shows "This message is blank"
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('This message is blank')
  })

  test('pending messages show correct group membership, not "not on any community"', async ({
    page,
  }) => {
    // Issue #19: member info shows "not on any community"
    await loginViaModTools(page, 'testmod@test.com')

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select a group with pending messages
    await selectGroupWithPendingMessages(page, groupSelect)

    // Wait for message cards to load
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // The member info area should not say "not on any community"
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('not on any community')
  })

  test('notification count badge is reasonable', async ({ page }) => {
    // Issue #17: notification count is wildly wrong
    await loginViaModTools(page, 'testmod@test.com')

    await page.goto(`${MODTOOLS_URL}/modtools/dashboard`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)

    // Look for notification badges in the navbar
    const badges = page.locator(
      '.badge, [class*="notification"] .badge, nav .badge'
    )

    if (
      await badges
        .first()
        .isVisible({ timeout: timeouts.ui.appearance })
        .catch(() => false)
    ) {
      const count = await badges.count()
      for (let i = 0; i < count; i++) {
        const text = await badges.nth(i).textContent()
        const num = parseInt(text.trim(), 10)
        if (!isNaN(num)) {
          // Notification counts should be reasonable (not in the millions)
          expect(num).toBeLessThan(10000)
          expect(num).toBeGreaterThanOrEqual(0)
        }
      }
    }

    await assertNoErrors(page)
  })
})
