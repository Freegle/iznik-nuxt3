// @ts-check
/**
 * Test that moving a message between groups in ModTools does not cause
 * a full-page "Cannot read properties of undefined (reading 'turl')" error.
 *
 * Uses testmod@test.com (created by testenv.php) which is a moderator of
 * FreeglePlayground and FreeglePlayground2, with approved test messages.
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')

const MODTOOLS_URL = environment.modtoolsBaseUrl

// testmod@test.com is created by testenv.php with password 'freegle'
const MOD_EMAIL = 'testmod@test.com'
const MOD_PASSWORD = 'freegle'

/**
 * Log in via the API and inject auth tokens into localStorage.
 * This bypasses the UI login which is unreliable on dev containers due to HMR.
 */
async function loginViaAPI(page) {
  // First navigate to ModTools so localStorage is on the correct origin
  await page.goto(`${MODTOOLS_URL}/login`, {
    timeout: timeouts.navigation.initial,
    waitUntil: 'domcontentloaded',
  })

  // Call the login API from within the page context (same origin for cookies)
  const authData = await page.evaluate(
    async ({ email, password }) => {
      const res = await fetch('http://apiv1.localhost/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, modtools: true }),
      })
      const data = await res.json()
      if (data.ret !== 0) {
        throw new Error(`Login failed: ${data.status}`)
      }
      return { jwt: data.jwt, persistent: data.persistent }
    },
    { email: MOD_EMAIL, password: MOD_PASSWORD }
  )

  // Inject auth tokens into localStorage (matching the Pinia auth store format)
  await page.evaluate((tokens) => {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        auth: {
          jwt: tokens.jwt,
          persistent: tokens.persistent,
        },
      })
    )
  }, authData)
}

test.describe('ModTools move message', () => {
  test('moving a message between groups should not cause turl error', async ({
    page,
  }) => {
    // Step 1: Log in via API and inject auth tokens
    await loginViaAPI(page)

    // Step 2: Navigate to approved messages (auth tokens in localStorage)
    await page.goto(`${MODTOOLS_URL}/messages/approved`, {
      timeout: timeouts.navigation.initial,
    })

    // Wait for page to load and be authenticated
    // The communities dropdown appears when logged in as a moderator
    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Find the FreeglePlayground option
    const playgroundOption = groupSelect.locator(
      'option:has-text("FreeglePlayground")'
    )
    await expect(playgroundOption.first()).toBeAttached({
      timeout: timeouts.ui.appearance,
    })
    const playgroundValue = await playgroundOption.first().getAttribute('value')
    expect(playgroundValue).toBeTruthy()
    await groupSelect.selectOption(playgroundValue)

    // Wait for messages to load — look for message cards
    const messageCards = page.locator('.card')
    await expect(messageCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Step 3: Click on the first message to expand it
    await messageCards.first().click()

    // Step 4: Click the Edit button
    const editButton = page.locator('button:has-text("Edit")').first()
    await expect(editButton).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    await editButton.click()

    // Step 5: The group select inside the message edit form should be visible
    // There are two #communitieslist selects on the page: the page-level filter
    // and the one inside the message card. Scope to the message card.
    const editGroupSelect = page
      .locator('[id^="msg-"] select#communitieslist')
      .first()
    await expect(editGroupSelect).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // Get the current group and find a different one
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

    // Step 6: Change the group (triggers move on save)
    await editGroupSelect.selectOption(targetGroupId)

    // Step 7: Listen for errors before clicking Save
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

    // Step 8: Wait and verify no turl error
    await page.waitForTimeout(timeouts.ui.settleTime)

    const bodyText = await page.textContent('body')
    expect(bodyText).not.toContain('Oh dear')
    expect(bodyText).not.toContain(
      "Cannot read properties of undefined (reading 'turl')"
    )

    const turlErrors = errors.filter((e) => e.includes('turl'))
    expect(turlErrors).toHaveLength(0)

    // Step 9: Move message back to original group to avoid side effects
    const editButtonAfter = page.locator('button:has-text("Edit")').first()

    if (await editButtonAfter.isVisible().catch(() => false)) {
      await editButtonAfter.click()

      const groupSelectAfter = page
        .locator('[id^="msg-"] select#communitieslist')
        .first()
      await expect(groupSelectAfter).toBeVisible({
        timeout: timeouts.ui.appearance,
      })

      await groupSelectAfter.selectOption(currentGroupId)

      const saveButtonAfter = page.locator('button:has-text("Save")').first()
      await saveButtonAfter.click()

      await page.waitForTimeout(timeouts.ui.settleTime)

      const bodyTextAfter = await page.textContent('body')
      expect(bodyTextAfter).not.toContain('Oh dear')
    }
  })
})
