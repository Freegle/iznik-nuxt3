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

test.describe('ModTools Edit Message', () => {
  test('editing a pending message title should save successfully', async ({
    page,
    testEnv,
  }) => {
    // testEnv.pending.offer is a pre-created pending message ID
    expect(testEnv.pending.offer).toBeTruthy()
    console.log(
      `Using pre-created pending message ${testEnv.pending.offer} on group ${testEnv.group.name}`
    )

    // Log into ModTools as the moderator
    await loginViaModTools(page, testEnv.mod.email)

    // Navigate to pending messages for the test group
    await page.goto(`${MODTOOLS_URL}/messages/pending`, {
      timeout: timeouts.navigation.initial,
    })
    await page.waitForLoadState('domcontentloaded', {
      timeout: timeouts.navigation.default,
    })
    await dismissAllModals(page)

    // Wait for a message card to appear
    const messageCard = page.locator('.card, .message-card').first()
    await expect(messageCard).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Find and click the Edit button on the first message
    const editButton = page
      .locator('button:has-text("Edit"), .btn:has-text("Edit")')
      .first()
    await expect(editButton).toBeVisible({ timeout: timeouts.ui.appearance })
    await editButton.click()

    // Wait for the edit form — the subject input appears
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

    // Wait for edit mode to close — the Save button should disappear
    // If it doesn't disappear within timeout, the save failed (spinner stuck)
    await expect(saveButton).not.toBeVisible({
      timeout: timeouts.api.default,
    })

    // Verify the new subject is displayed
    await expect(page.locator(`text=${newSubject}`).first()).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    console.log(`Successfully edited message to: "${newSubject}"`)
  })
})
