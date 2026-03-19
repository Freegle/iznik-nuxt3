/**
 * ModTools Edit Message Tests
 * Tests editing a message's subject/title from the pending messages page.
 * Uses the pre-created pending message from create-test-env.php.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { loginViaModTools } = require('./utils/user')

const MODTOOLS_URL = 'http://modtools-prod-local.localhost'

async function dismissAllModals(page) {
  // Dismiss modals and wait for backdrop to be fully removed.
  // Vue may re-render backdrops, so retry until clear.
  for (let i = 0; i < 5; i++) {
    const removed = await page.evaluate(() => {
      let found = false
      document
        .querySelectorAll('.modal.show, .modal[style*="display: block"]')
        .forEach((el) => {
          el.classList.remove('show')
          el.style.display = 'none'
          found = true
        })
      document.querySelectorAll('.modal-backdrop').forEach((el) => {
        el.remove()
        found = true
      })
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('padding-right')
      return found
    })
    if (!removed) break
    await page.waitForTimeout(300)
  }
}

async function selectGroupWithPendingMessages(page, groupSelect) {
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
  return targetGroupValue
}

test.describe('ModTools Edit Message', () => {
  test('editing a pending message title should save successfully', async ({
    page,
    testEnv,
  }) => {
    expect(testEnv.pending.offer).toBeTruthy()
    console.log(
      `Using pending message ${testEnv.pending.offer} on group ${testEnv.group.name}`
    )

    await loginViaModTools(page, testEnv.mod.email)

    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    await dismissAllModals(page)

    // Select a group that has pending messages
    await selectGroupWithPendingMessages(page, groupSelect)

    // Wait for message cards to appear
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Find and click the Edit button on the first message
    const editButton = page
      .locator('button:has-text("Edit"), .btn:has-text("Edit")')
      .first()
    await expect(editButton).toBeVisible({ timeout: timeouts.ui.appearance })
    // force: true bypasses actionability check — modal backdrop from login
    // can persist through dismissAllModals retries due to Vue re-rendering.
    await editButton.click({ force: true })

    // Wait for the edit form — the subject input appears (either well-structured
    // item/location inputs or a plain subject input with size="lg")
    const subjectInput = page
      .locator('input[size="lg"], input.form-control-lg')
      .first()
    await expect(subjectInput).toBeVisible({ timeout: timeouts.ui.appearance })

    // Read the original subject
    const originalSubject = await subjectInput.inputValue()
    console.log(`Original subject: "${originalSubject}"`)

    // Change the subject
    const newSubject = `Edited ${Date.now()}`
    await subjectInput.clear()
    await subjectInput.fill(newSubject)

    // Click Save
    const saveButton = page
      .locator('button:has-text("Save"), .btn-primary:has-text("Save")')
      .first()
    await expect(saveButton).toBeVisible({ timeout: timeouts.ui.appearance })
    await saveButton.click()

    // Wait for edit mode to close — the Save button should disappear.
    // If it doesn't, the save failed (spinner stuck — bug we're testing for).
    await expect(saveButton).not.toBeVisible({
      timeout: timeouts.api.default,
    })

    // Verify the edited text appears in the page. For well-structured messages,
    // the subject is rebuilt as "TYPE: item (location)", so the item name
    // should appear somewhere in the message display.
    await expect(page.locator(`text=/${newSubject}/i`).first()).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    console.log(`Successfully edited message to: "${newSubject}"`)
  })
})
