/**
 * ModTools Edits Flow Test
 *
 * Tests the full edit review lifecycle through the UI only:
 * 1. Post a message as a new user (auto-joins test group)
 * 2. Edit the message text on My Posts page
 * 3. Log in as a mod via ModTools, see the edit on the edits page
 * 4. Approve the edit via the UI, verify it disappears
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')
const { loginViaModTools } = require('./utils/user')

const MODTOOLS_URL = environment.modtoolsBaseUrl

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

test.describe('ModTools Edits Flow', () => {
  test('post message, edit it, mod sees edit on edits page, approve clears it', async ({
    page,
    testEnv,
    testEmail,
    postMessage,
  }) => {
    const modEmail = testEnv.mod.email

    console.log('=== EDITS FLOW TEST ===')
    console.log(`New user: ${testEmail}, Mod: ${modEmail}`)
    console.log(
      `Test group: ${testEnv.group.name}, postcode: ${testEnv.postcode}`
    )

    // Step 1: Post a message as a new user.
    console.log('\n--- Step 1: Post message as new user ---')
    const posted = await postMessage({
      type: 'OFFER',
      item: `EditTest ${Date.now()}`,
      description: 'Original description for edit test',
      email: testEmail,
    })
    console.log(`Posted: id=${posted.id}, item=${posted.item}`)

    // Step 2: Edit the message on My Posts page.
    console.log('\n--- Step 2: Edit message on My Posts ---')
    await expect(page).toHaveURL(/\/myposts/, {
      timeout: timeouts.navigation.default,
    })

    const messageCard = page
      .locator(`.message-card:has-text("${posted.item}")`)
      .first()
    await expect(messageCard).toBeVisible({ timeout: timeouts.ui.appearance })

    const editButton = messageCard.locator('button:has-text("Edit")').first()
    await expect(editButton).toBeVisible({ timeout: timeouts.ui.appearance })
    await editButton.click()

    const editModal = page.locator('.modal.show')
    await expect(editModal).toBeVisible({ timeout: timeouts.ui.appearance })

    const editText = `Edited at ${new Date().toISOString()}`
    const textarea = editModal.locator('textarea').first()
    await expect(textarea).toBeVisible({ timeout: timeouts.ui.appearance })
    await textarea.clear()
    await textarea.fill(editText)

    // Wait for the PATCH to succeed
    const patchPromise = page.waitForResponse(
      (r) => r.url().includes('/message') && r.request().method() === 'PATCH',
      { timeout: timeouts.api.slowApi }
    )

    const saveButton = editModal.locator('button:has-text("Save")').first()
    await saveButton.click()

    const patchResponse = await patchPromise
    expect(patchResponse.status()).toBe(200)

    await expect(editModal).not.toBeVisible({ timeout: timeouts.api.default })
    console.log('Edit saved successfully')

    // Step 3: Log in as mod and verify edit appears on the edits page.
    console.log('\n--- Step 3: Check edits page as mod ---')
    console.log(`Message ID: ${posted.id}, Edit text: ${editText}`)
    await page.context().clearCookies()
    await loginViaModTools(page, modEmail)

    await page.goto(`${MODTOOLS_URL}/messages/edits`, {
      timeout: timeouts.navigation.initial,
      waitUntil: 'domcontentloaded',
    })

    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })
    await dismissAllModals(page)

    // Check for edits — try selecting groups with work counts if needed
    let pollAttempts = 0
    await expect
      .poll(
        async () => {
          pollAttempts++
          const bodyText = await page.textContent('body')
          const hasNoMessages = bodyText.includes(
            'There are no messages at the moment'
          )

          if (pollAttempts <= 3 || pollAttempts % 10 === 0) {
            console.log(
              `Poll #${pollAttempts}: noMessages=${hasNoMessages}, URL=${page.url()}`
            )
            // List available groups
            const options = await groupSelect.locator('option').all()
            const groupTexts = []
            for (const opt of options.slice(0, 5)) {
              groupTexts.push(await opt.textContent())
            }
            console.log(`Groups: ${groupTexts.join(' | ')}`)
          }

          if (!hasNoMessages) {
            return true
          }

          // Try selecting a group with edits work count
          const options = await groupSelect.locator('option').all()
          for (const option of options) {
            const text = await option.textContent()
            const value = await option.getAttribute('value')
            if (value && value !== '0' && /\(\d+\)/.test(text)) {
              console.log(`Selecting group: ${text}`)
              await groupSelect.selectOption(value)
              return false // will re-poll
            }
          }
          return false
        },
        {
          message: 'Waiting for edit to appear on edits page',
          timeout: timeouts.navigation.slowPage,
        }
      )
      .toBe(true)

    console.log('Edit visible on edits page')

    await page.screenshot({
      path: 'playwright-screenshots/edits-page-with-edit.png',
      fullPage: true,
    })

    // Step 4: Approve the edit via the UI "Accept Edit" button.
    console.log('\n--- Step 4: Approve edit via UI ---')

    // The Accept Edit button may take a moment to render after the message
    // card expands. Use getByRole for more reliable matching.
    const acceptButton = page
      .getByRole('button', { name: /Accept Edit/i })
      .first()
    await expect(acceptButton).toBeVisible({ timeout: timeouts.ui.appearance })
    console.log('Accept Edit button found')

    // Wait for the POST to succeed (ApproveEdits action)
    const approvePromise = page.waitForResponse(
      (r) => r.url().includes('/message') && r.request().method() === 'POST',
      { timeout: timeouts.api.slowApi }
    )

    await acceptButton.click()
    console.log('Clicked Accept Edit')

    const approveResponse = await approvePromise
    console.log(`Approve response: ${approveResponse.status()}`)
    expect(approveResponse.status()).toBe(200)

    // Verify the edit disappears from the page — the message card should
    // no longer be visible after approval removes it from the store.
    await expect(page.getByText(editText)).not.toBeVisible({
      timeout: timeouts.api.slowApi,
    })

    console.log('Edit approved and cleared from edits page')
    console.log('\n=== TEST COMPLETE ===')
  })
})
