// @ts-check
/**
 * Test that moving a message between groups in ModTools does not cause
 * a full-page "Cannot read properties of undefined (reading 'turl')" error.
 *
 * Uses testEnv fixture for isolated test group and moderator.
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')
const { loginViaModTools } = require('./utils/user')

const MODTOOLS_URL = environment.modtoolsBaseUrl

test.describe('ModTools move message', () => {
  test('moving a message between groups should not cause turl error', async ({
    page,
    testEnv,
  }) => {
    const msgId = testEnv.messages?.offer
    const group1Id = testEnv.group?.id
    const group2Id = testEnv.group2?.id

    // Step 1: Log in
    await loginViaModTools(page, testEnv.mod.email)

    // Step 2: Ensure the message is approved (on whichever group it's on).
    // A previous run may have left it Pending.
    const jwt = await page.evaluate(() => {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      return auth?.auth?.jwt
    })

    if (jwt && msgId) {
      // Approve without groupid — approves on whichever group it's on.
      // Go router: rg.Post("/message", PostMessage) handles all action-based
      // mod operations (Approve, Reject, etc.).  Must use POST, not PATCH.
      // Must call the Go API at http://apiv2.localhost directly (Playwright's
      // page.request runs in Node.js context that can reach Docker services).
      // Authorization is a raw JWT string — no "Bearer " prefix.
      await page.request
        .post('http://apiv2.localhost/api/message', {
          data: { id: msgId, action: 'Approve' },
          headers: { Authorization: jwt },
        })
        .catch(() => {})
    }

    // Step 3: Try both groups — the message may be on either one from a previous run.
    // Navigate to the group that has the approved message.
    let foundGroup = null

    for (const gid of [group1Id, group2Id]) {
      await page.goto(`${MODTOOLS_URL}/messages/approved/${gid}`, {
        timeout: timeouts.navigation.initial,
      })

      // Wait for page to load
      await expect(page.locator('#communitieslist')).toBeVisible({
        timeout: timeouts.navigation.slowPage,
      })

      // Dismiss modals
      await page.evaluate(() => {
        const modal = document.getElementById('modcakemodal')
        if (modal) {
          modal.classList.remove('show')
          modal.style.display = 'none'
        }
        document
          .querySelectorAll('.modal-backdrop')
          .forEach((el) => el.remove())
        document.body.classList.remove('modal-open')
        document.body.style.removeProperty('overflow')
        document.body.style.removeProperty('padding-right')
      })

      // Check if messages are visible (short timeout)
      try {
        await expect(page.locator('.card').first()).toBeVisible({
          timeout: 15000,
        })
        foundGroup = gid
        console.log(`Found approved messages on group ${gid}`)
        break
      } catch {
        console.log(`No approved messages on group ${gid}, trying next...`)
      }
    }

    expect(foundGroup).toBeTruthy()

    // Step 4: Click on the first message to expand it
    const messageCards = page.locator('.card')
    await messageCards.first().click()

    // Step 5: Click the Edit button
    const editButton = page.locator('button:has-text("Edit")').first()
    await expect(editButton).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    await editButton.click()

    // Step 6: Find the group select inside the message card and change group
    const editGroupSelect = page
      .locator('[id^="msg-"] select#communitieslist')
      .first()
    await expect(editGroupSelect).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    const currentGroupId = await editGroupSelect.inputValue()
    const options = await editGroupSelect.locator('option').all()

    let targetGroupId = null
    for (const option of options) {
      const value = await option.getAttribute('value')
      if (value && value !== '0' && value !== currentGroupId) {
        targetGroupId = value
        break
      }
    }

    expect(targetGroupId).toBeTruthy()

    // Step 7: Change the group (triggers move on save)
    await editGroupSelect.selectOption(targetGroupId)

    // Step 8: Listen for errors before clicking Save
    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Click Save
    const saveButton = page.locator('button:has-text("Save")').first()
    await expect(saveButton).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    await saveButton.click()

    // Step 9: Wait and verify no turl error
    await page.waitForTimeout(timeouts.ui.settleTime)

    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('Oh dear')
    expect(bodyText).not.toContain(
      "Cannot read properties of undefined (reading 'turl')"
    )

    const turlErrors = errors.filter((e) => e.includes('turl'))
    expect(turlErrors).toHaveLength(0)
  })
})
