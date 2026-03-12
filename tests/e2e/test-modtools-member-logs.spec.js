// @ts-check
/**
 * Tests for ModTools member logs display and behavior.
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')
const { loginModToolsViaAPI } = require('./utils/user')

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

test.describe('ModTools Member Logs', () => {
  test('member logs do not loop infinitely and stop loading', async ({
    page,
  }) => {
    // Issue #28: member logs loop infinitely, never stop loading
    await loginModToolsViaAPI(page)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Navigate to approved members (always has data, unlike pending)
    await page.goto(`${MODTOOLS_URL}/members/approved`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select the first available group
    let targetGroupValue = null
    await expect
      .poll(
        async () => {
          const options = await groupSelect.locator('option').all()
          for (const option of options) {
            const value = await option.getAttribute('value')
            if (value && value !== '0' && !value.includes('Please')) {
              targetGroupValue = value
              return true
            }
          }
          return false
        },
        {
          message: 'Waiting for group options',
          timeout: timeouts.navigation.slowPage,
        }
      )
      .toBe(true)
    await groupSelect.selectOption(targetGroupValue)

    // Wait for member cards to load
    const memberCards = page.locator('.card, .list-group-item')
    await expect(memberCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Look for a "View logs" link on a member
    const logsButton = page.locator(
      'a:has-text("View logs"), button:has-text("Logs"), a:has-text("Logs"), [title*="Logs" i]'
    )

    if (
      await logsButton
        .first()
        .isVisible({ timeout: timeouts.ui.appearance })
        .catch(() => false)
    ) {
      await logsButton.first().click()

      // Track API calls to detect infinite looping
      let apiCallCount = 0
      page.on('request', (request) => {
        if (request.url().includes('/logs') || request.url().includes('log')) {
          apiCallCount++
        }
      })

      // Wait for logs to load, then check that API calls stabilize
      await page.waitForTimeout(timeouts.ui.appearance)

      // If loading infinitely, apiCallCount would be very high (>20).
      // A reasonable load should make fewer than 20 log API calls.
      expect(apiCallCount).toBeLessThan(20)
    }

    expect(errors).toHaveLength(0)
  })

  test('member logs show subject lines for messages', async ({ page }) => {
    // Issue #15: member logs missing subject lines
    await loginModToolsViaAPI(page)

    // Navigate to approved members (always has data)
    await page.goto(`${MODTOOLS_URL}/members/approved`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select the first available group
    let targetGroupValue = null
    await expect
      .poll(
        async () => {
          const options = await groupSelect.locator('option').all()
          for (const option of options) {
            const value = await option.getAttribute('value')
            if (value && value !== '0' && !value.includes('Please')) {
              targetGroupValue = value
              return true
            }
          }
          return false
        },
        {
          message: 'Waiting for group options',
          timeout: timeouts.navigation.slowPage,
        }
      )
      .toBe(true)
    await groupSelect.selectOption(targetGroupValue)

    // Wait for member cards to load
    const memberCards = page.locator('.card, .list-group-item')
    await expect(memberCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Look for a "View logs" link on a member
    const logsButton = page.locator(
      'a:has-text("View logs"), button:has-text("Logs"), a:has-text("Logs"), [title*="Logs" i]'
    )

    if (
      await logsButton
        .first()
        .isVisible({ timeout: timeouts.ui.appearance })
        .catch(() => false)
    ) {
      await logsButton.first().click()

      // Wait for log entries to appear
      await page.waitForTimeout(timeouts.ui.settleTime)

      // Log entries that reference messages should have subject lines,
      // not empty or "undefined" subjects
      const logArea = page.locator(
        '.modal.show, [class*="log"], [class*="Log"]'
      )
      if (
        await logArea
          .first()
          .isVisible({ timeout: timeouts.ui.appearance })
          .catch(() => false)
      ) {
        const logText = await logArea.first().textContent()
        // Subject lines should not show as "undefined" or be completely absent
        // when there are message-related log entries
        expect(logText).not.toContain('Subject: undefined')
        expect(logText).not.toContain('subject undefined')
      }
    }
  })
})
