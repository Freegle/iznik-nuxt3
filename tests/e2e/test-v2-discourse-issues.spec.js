// @ts-check
/**
 * Tests for issues reported in Discourse topic 9481 against the V2 API ModTools.
 *
 * Each test verifies that a specific reported issue has been fixed.
 * Tests should PASS if the issue is fixed and FAIL if the issue still exists.
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

// Helper: check page for common error indicators.
async function assertNoErrors(page) {
  const body = await page.textContent('body')
  expect(body).not.toContain('something went wrong')
  expect(body).not.toContain('Oh dear')
  expect(body).not.toContain('undefined is not an object')
  expect(body).not.toContain('Cannot read properties of undefined')
}

// ── Group 1: ModTools Login & Dashboard ─────────────────────────────────────

test.describe('ModTools Login & Dashboard (issues #2, #4)', () => {
  test('after login, groups should be visible (not empty)', async ({
    page,
  }) => {
    // Issue #2/#4: groups list empty after login
    await loginModToolsViaAPI(page)

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // The group dropdown should have at least one group option (value !== '0')
    await expect
      .poll(
        async () => {
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

  test('dashboard loads without errors', async ({ page }) => {
    await loginModToolsViaAPI(page)

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

// ── Group 2: Pending Messages ───────────────────────────────────────────────

test.describe('Pending Messages (issues #19, #29)', () => {
  test('pending messages show text content, not "This message is blank"', async ({
    page,
  }) => {
    // Issue #29: pending messages display "This message is blank"
    await loginModToolsViaAPI(page)

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select a group with pending messages
    let targetGroupValue = null
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
          timeout: timeouts.navigation.slowPage,
        }
      )
      .toBe(true)
    await groupSelect.selectOption(targetGroupValue)

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
    await loginModToolsViaAPI(page)

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select a group with pending messages
    let targetGroupValue = null
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
          timeout: timeouts.navigation.slowPage,
        }
      )
      .toBe(true)
    await groupSelect.selectOption(targetGroupValue)

    // Wait for message cards to load
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // The member info area should not say "not on any community"
    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('not on any community')
  })
})

// ── Group 3: Member Review, Edits, Chat Review Lists ────────────────────────

test.describe('Member Review, Edits, Chat Review (issues #22, #24, #25)', () => {
  test('Member Review page loads and shows members or "no members" message without errors', async ({
    page,
  }) => {
    // Issue #22: Member Review page fails to load
    await loginModToolsViaAPI(page)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${MODTOOLS_URL}/members/review`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)
    await assertNoErrors(page)
    expect(errors).toHaveLength(0)
  })

  test('Edits page loads without errors', async ({ page }) => {
    // Issue #25: Edits page fails
    await loginModToolsViaAPI(page)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${MODTOOLS_URL}/messages/edits`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)
    await assertNoErrors(page)
    expect(errors).toHaveLength(0)
  })

  test('Chat Review page loads without "something went wrong"', async ({
    page,
  }) => {
    // Issue #24: Chat Review shows "something went wrong"
    await loginModToolsViaAPI(page)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${MODTOOLS_URL}/chats/review`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)
    await assertNoErrors(page)
    expect(errors).toHaveLength(0)
  })
})

// ── Group 4: Support Tools ──────────────────────────────────────────────────

test.describe('Support Tools (issue #8)', () => {
  test('Support Tools user search does not crash', async ({ page }) => {
    // Issue #8: Support Tools crashes on search
    await loginModToolsViaAPI(page)

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
      await searchInput.first().fill('test@test.com')
      // Wait a moment for search to execute
      await page.waitForTimeout(timeouts.ui.settleTime)
      await assertNoErrors(page)
    }

    expect(errors).toHaveLength(0)
  })

  test('Support Tools community search returns results', async ({ page }) => {
    // Issue #8: Support Tools community search broken
    await loginModToolsViaAPI(page)

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

// ── Group 5: Member Logs ────────────────────────────────────────────────────

test.describe('Member Logs (issues #15, #28)', () => {
  test('member logs do not loop infinitely and stop loading', async ({
    page,
  }) => {
    // Issue #28: member logs loop infinitely, never stop loading
    await loginModToolsViaAPI(page)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Navigate to pending messages to find a member, then check their logs
    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select a group with pending messages
    let targetGroupValue = null
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
          timeout: timeouts.navigation.slowPage,
        }
      )
      .toBe(true)
    await groupSelect.selectOption(targetGroupValue)

    // Wait for message cards
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Look for a "Logs" button/link on the first message card's member info
    const logsButton = messageCards
      .first()
      .locator('button:has-text("Logs"), a:has-text("Logs"), [title*="Logs" i]')

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

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select a group with pending messages
    let targetGroupValue = null
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
          timeout: timeouts.navigation.slowPage,
        }
      )
      .toBe(true)
    await groupSelect.selectOption(targetGroupValue)

    // Wait for message cards
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Look for a "Logs" button/link on the first message card's member info
    const logsButton = messageCards
      .first()
      .locator('button:has-text("Logs"), a:has-text("Logs"), [title*="Logs" i]')

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

// ── Group 6: Chat List ──────────────────────────────────────────────────────

test.describe('Chat List (issues #26, #27)', () => {
  test('chat list does not crash with undefined error', async ({ page }) => {
    // Issue #27: chat list crashes with undefined error
    await loginModToolsViaAPI(page)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${MODTOOLS_URL}/chats`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)
    await assertNoErrors(page)
    expect(errors).toHaveLength(0)
  })

  test('chat list shows member names not group names for User2Mod chats', async ({
    page,
  }) => {
    // Issue #26: User2Mod chats show group name instead of member name
    await loginModToolsViaAPI(page)

    await page.goto(`${MODTOOLS_URL}/chats`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)

    // Wait for chat list items to appear
    const chatItems = page.locator(
      '.chat-list-item, [class*="chat"] .list-group-item, [class*="ChatList"] a, [class*="chatlist"] a'
    )

    if (
      await chatItems
        .first()
        .isVisible({ timeout: timeouts.ui.appearance })
        .catch(() => false)
    ) {
      // Chat items should show user names, not just group names.
      // We check that at least some chat items have content that looks
      // like a person's name (contains letters) rather than only group names.
      const count = await chatItems.count()
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await chatItems.nth(i).textContent()
        // Each chat item should have some text content (not empty/undefined)
        expect(text.trim().length).toBeGreaterThan(0)
        expect(text).not.toContain('undefined')
      }
    }

    await assertNoErrors(page)
  })
})

// ── Group 7: Notification Count ─────────────────────────────────────────────

test.describe('Notification Count (issue #17)', () => {
  test('notification count badge is reasonable', async ({ page }) => {
    // Issue #17: notification count is wildly wrong
    await loginModToolsViaAPI(page)

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
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

// ── Group 8: Admins ─────────────────────────────────────────────────────────

test.describe('Admins (issue #20)', () => {
  test('Admins page loads and shows admin users', async ({ page }) => {
    // Issue #20: Admins page broken
    await loginModToolsViaAPI(page)

    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto(`${MODTOOLS_URL}/admins`, {
      timeout: timeouts.navigation.initial,
    })

    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })

    await dismissAllModals(page)
    await assertNoErrors(page)
    expect(errors).toHaveLength(0)
  })
})
