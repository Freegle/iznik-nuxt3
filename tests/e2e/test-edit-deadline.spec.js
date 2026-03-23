/**
 * Freegle Edit Deadline Test
 *
 * Tests that editing a deadline on the Freegle My Posts page saves
 * correctly, persists immediately, and survives a page reload.
 *
 * Reported in Discourse #9481 post #251: "It's not holding onto the
 * deadline date. Selected a date to begin with and not on post. Edited
 * via FD and date is showing at DD/MM/YYYY - selected a date and saved
 * but it's not saving it."
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Freegle Edit Deadline', () => {
  test('editing a deadline saves and persists after reload', async ({
    page,
    testEnv,
    testEmail,
    postMessage,
  }) => {
    // Post a message
    const posted = await postMessage({
      type: 'OFFER',
      item: `DeadlineTest ${Date.now()}`,
      description: 'Testing deadline edit persistence',
      email: testEmail,
    })
    expect(posted.id).toBeTruthy()
    console.log(`Posted: id=${posted.id}`)

    // Should be on /myposts after posting
    await expect(page).toHaveURL(/\/myposts/, {
      timeout: timeouts.navigation.default,
    })

    // Find and click Edit on our message
    const messageCard = page
      .locator(`.message-card:has-text("${posted.item}")`)
      .first()
    await expect(messageCard).toBeVisible({ timeout: timeouts.ui.appearance })
    await messageCard.locator('button:has-text("Edit")').first().click()

    const editModal = page.locator('.modal.show')
    await expect(editModal).toBeVisible({ timeout: timeouts.ui.appearance })

    // Set a deadline date (30 days from now)
    const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10)
    const deadlineInput = editModal.locator('input[type="date"]').first()
    await expect(deadlineInput).toBeVisible({ timeout: timeouts.ui.appearance })
    await deadlineInput.fill(deadlineDate)
    console.log(`Set deadline to: ${deadlineDate}`)

    // Intercept the PATCH request to verify deadline is included
    const patchPromise = page.waitForResponse(
      (r) => r.url().includes('/message') && r.request().method() === 'PATCH',
      { timeout: timeouts.api.slowApi }
    )

    await editModal.locator('button:has-text("Save")').first().click()

    const patchResponse = await patchPromise
    expect(patchResponse.status()).toBe(200)

    // Verify the PATCH request body included the deadline
    const patchBody = JSON.parse(patchResponse.request().postData())
    expect(patchBody.deadline).toBe(deadlineDate)
    console.log(`PATCH body deadline: ${patchBody.deadline}`)

    await expect(editModal).not.toBeVisible({ timeout: timeouts.api.default })
    console.log('Deadline saved')

    // Re-open edit modal and verify the deadline persisted immediately
    await messageCard.locator('button:has-text("Edit")').first().click()
    const editModal2 = page.locator('.modal.show')
    await expect(editModal2).toBeVisible({ timeout: timeouts.ui.appearance })

    const deadlineInput2 = editModal2.locator('input[type="date"]').first()
    await expect(deadlineInput2).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    const savedDeadline = await deadlineInput2.inputValue()
    expect(savedDeadline).toBe(deadlineDate)
    console.log(`Re-opened modal shows deadline: ${savedDeadline}`)

    // Close modal
    await editModal2.locator('button:has-text("Cancel")').first().click()

    // Reload and verify it still persists
    await page.reload({ timeout: timeouts.navigation.initial })
    await expect(page).toHaveURL(/\/myposts/, {
      timeout: timeouts.navigation.default,
    })

    const messageCardAfterReload = page
      .locator(`.message-card:has-text("${posted.item}")`)
      .first()
    await expect(messageCardAfterReload).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    await messageCardAfterReload
      .locator('button:has-text("Edit")')
      .first()
      .click()
    const editModal3 = page.locator('.modal.show')
    await expect(editModal3).toBeVisible({ timeout: timeouts.ui.appearance })

    const deadlineInput3 = editModal3.locator('input[type="date"]').first()
    await expect(deadlineInput3).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    const reloadedDeadline = await deadlineInput3.inputValue()
    expect(reloadedDeadline).toBe(deadlineDate)
    console.log(`After reload, deadline persists: ${reloadedDeadline}`)
  })
})
