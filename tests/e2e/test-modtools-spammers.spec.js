// @ts-check
/**
 * Tests for ModTools Spammer List functionality.
 *
 * Covers:
 *   - SpamAdmin users can see PendingAdd tab and entries
 *   - Hold does not crash with a 400 (Sentry issue: missing id in request)
 *   - After Hold, held state is reflected in UI (heldby propagated through addAll)
 *   - Confirm does not crash with a 400
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')
const { loginViaModTools } = require('./utils/user')

const MODTOOLS_URL = environment.modtoolsBaseUrl

// Dismiss Vue/Bootstrap modals that may overlay the page.
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

// Navigate to the spammers page and wait for PendingAdd entries to load.
// Returns after the list has at least one member card visible.
async function goToSpammersPage(page) {
  await page.goto(`${MODTOOLS_URL}/spammers`, {
    waitUntil: 'domcontentloaded',
    timeout: timeouts.navigation.initial,
  })
  await dismissAllModals(page)

  // Wait for at least one member card to be rendered.
  // The PendingAdd tab panel uses Bootstrap `fade` without `show` until JS fires,
  // so checking its visibility is unreliable.  Waiting for .member-card is sufficient.
  await expect(page.locator('.member-card').first()).toBeVisible({
    timeout: timeouts.navigation.slowPage,
  })
}

test.describe('ModTools Spammer List', () => {
  test.describe.configure({ mode: 'serial' })

  test('SpamAdmin user sees PendingAdd tab and test entries', async ({
    page,
    testEnv,
  }) => {
    await loginViaModTools(page, testEnv.mod.email)

    // Reset all test spammers to PendingAdd with no hold so subsequent tests
    // in this serial suite start from a known clean state.  Previous runs may
    // have held or confirmed these entries, so we always reset before proceeding.
    const jwt = await page.evaluate(() => {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      return auth?.auth?.jwt
    })
    if (jwt && testEnv.spammers) {
      for (const sid of testEnv.spammers) {
        await page.request
          .patch('http://apiv2.localhost/api/modtools/spammers', {
            data: { id: sid, collection: 'PendingAdd', heldby: null },
            headers: { Authorization: jwt },
          })
          .catch(() => {})
      }
    }

    await goToSpammersPage(page)

    // The Pending Add tab should be active for SpamAdmin users.
    const pendingAddTab = page.locator('h2:has-text("Pending Add")')
    await expect(pendingAddTab).toBeVisible()

    // Test entries should be visible (created by create-test-env.php).
    const memberCards = page.locator('.member-card')
    await expect(memberCards.first()).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })
  })

  test('Hold button does not crash with a 400 (id present in request)', async ({
    page,
    testEnv,
  }) => {
    const [spamId] = testEnv.spammers
    expect(spamId).toBeTruthy()

    await loginViaModTools(page, testEnv.mod.email)

    // Capture page errors (JS crashes) and network 400s.
    const pageErrors = []
    const badResponses = []
    page.on('pageerror', (err) => pageErrors.push(err.message))
    page.on('response', (resp) => {
      if (resp.url().includes('/spammers') && resp.status() >= 400) {
        badResponses.push({ url: resp.url(), status: resp.status() })
      }
    })

    // Capture outgoing PATCH bodies to verify id is included.
    const patchBodies = []
    page.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/spammers')) {
        try {
          patchBodies.push(JSON.parse(req.postData() || '{}'))
        } catch {
          patchBodies.push({})
        }
      }
    })

    await goToSpammersPage(page)

    // If all visible cards are held, release one first to create a Hold-able card.
    // Previous test runs may have held many entries leaving no Hold buttons visible.
    const holdBtn = page.locator('.member-card button:has-text("Hold")').first()
    const holdVisible = await holdBtn.isVisible().catch(() => false)

    if (!holdVisible) {
      const releaseBtn = page
        .locator('.member-card button:has-text("Release")')
        .first()
      await expect(releaseBtn).toBeVisible({ timeout: timeouts.ui.appearance })
      await releaseBtn.click()

      // Wait for the store to refresh and Hold button to appear
      await expect(holdBtn).toBeVisible({
        timeout: timeouts.navigation.slowPage,
      })
    }

    await holdBtn.click()

    // Wait for the PATCH request to be sent.
    await expect
      .poll(() => patchBodies.length, {
        message: 'Waiting for PATCH /spammers request',
        timeout: timeouts.api.slowApi,
      })
      .toBeGreaterThan(0)

    // Verify the request body contains a valid spam_users.id (not 0/undefined).
    const body = patchBodies[0]
    expect(body.id).toBeTruthy()

    // No 400 or other error responses.
    expect(badResponses).toHaveLength(0)

    // No JS crashes.
    expect(pageErrors).toHaveLength(0)
  })

  test('After Hold, held entry does not show Hold button (heldby reflected in UI)', async ({
    page,
    testEnv,
  }) => {
    // This test verifies that after the previous test held an entry, the spammer
    // store correctly propagates heldby into the member object so the template
    // hides the Hold/Confirm/Reject buttons (v-if="!member.heldby").
    //
    // Bug: addAll() was not including item.heldby in the member object,
    // so member.heldby was always undefined and the Hold button always showed.
    //
    // NOTE: This test does NOT hold any entries itself — it verifies the state
    // left by the previous test. This leaves one entry unheld for the Confirm test.

    await loginViaModTools(page, testEnv.mod.email)
    await goToSpammersPage(page)

    const totalCards = await page.locator('.member-card').count()
    const holdBtns = await page
      .locator('.member-card button:has-text("Hold")')
      .count()

    // After the previous test held at least one entry, there should be
    // fewer Hold buttons than member cards.
    expect(holdBtns).toBeLessThan(totalCards)
  })

  test('Confirm button does not crash with a 400 (id present in request)', async ({
    page,
    testEnv,
  }) => {
    const [, spamId2] = testEnv.spammers
    expect(spamId2).toBeTruthy()

    await loginViaModTools(page, testEnv.mod.email)

    const pageErrors = []
    const badResponses = []
    page.on('pageerror', (err) => pageErrors.push(err.message))
    page.on('response', (resp) => {
      if (resp.url().includes('/spammers') && resp.status() >= 400) {
        badResponses.push({ url: resp.url(), status: resp.status() })
      }
    })

    const patchBodies = []
    page.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/spammers')) {
        try {
          patchBodies.push(JSON.parse(req.postData() || '{}'))
        } catch {
          patchBodies.push({})
        }
      }
    })

    // Ensure at least one entry is unheld so the Confirm button is available.
    // Previous test runs (or the Hold test above) may have held all entries.
    // Reset heldby on the first spammer via the Go API.
    const [spamId1] = testEnv.spammers
    const jwt = await page.evaluate(() => {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      return auth?.auth?.jwt
    })
    if (jwt && spamId1) {
      await page.request
        .patch('http://apiv2.localhost/api/modtools/spammers', {
          data: { id: spamId1, collection: 'PendingAdd', heldby: null },
          headers: { Authorization: jwt },
        })
        .catch(() => {})
    }

    await goToSpammersPage(page)

    // If all visible cards are held, release one first.
    const confirmBtn = page
      .locator('.member-card button:has-text("Confirm add to spammer list")')
      .first()
    const confirmVisible = await confirmBtn.isVisible().catch(() => false)

    if (!confirmVisible) {
      const releaseBtn = page
        .locator('.member-card button:has-text("Release")')
        .first()
      await expect(releaseBtn).toBeVisible({ timeout: timeouts.ui.appearance })
      await releaseBtn.click()
      await expect(confirmBtn).toBeVisible({
        timeout: timeouts.navigation.slowPage,
      })
    }

    await confirmBtn.click()

    // Wait for PATCH to be sent.
    await expect
      .poll(() => patchBodies.length, {
        message: 'Waiting for PATCH /spammers request from Confirm',
        timeout: timeouts.api.slowApi,
      })
      .toBeGreaterThan(0)

    // Verify id is present.
    expect(patchBodies[0].id).toBeTruthy()

    // No 400 errors.
    expect(badResponses).toHaveLength(0)
    expect(pageErrors).toHaveLength(0)
  })

  test('Reject button sends DELETE with valid id (no 400)', async ({
    page,
    testEnv,
  }) => {
    // This test covers the bug where member.spammer?.id was undefined
    // because the enriched spammer object was overwritten by a boolean,
    // causing DELETE to send {id: null} and get a 400 "Missing id".

    await loginViaModTools(page, testEnv.mod.email)

    // Reset test spammers to PendingAdd with no hold so Reject button is visible.
    const jwt = await page.evaluate(() => {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}')
      return auth?.auth?.jwt
    })
    if (jwt && testEnv.spammers) {
      for (const sid of testEnv.spammers) {
        await page.request
          .patch('http://apiv2.localhost/api/modtools/spammers', {
            data: { id: sid, collection: 'PendingAdd', heldby: null },
            headers: { Authorization: jwt },
          })
          .catch(() => {})
      }
    }

    const pageErrors = []
    const badResponses = []
    page.on('pageerror', (err) => pageErrors.push(err.message))
    page.on('response', (resp) => {
      if (resp.url().includes('/spammers') && resp.status() >= 400) {
        badResponses.push({ url: resp.url(), status: resp.status() })
      }
    })

    // Capture DELETE request bodies to verify id is included.
    const deleteBodies = []
    page.on('request', (req) => {
      if (req.method() === 'DELETE' && req.url().includes('/spammers')) {
        try {
          deleteBodies.push(JSON.parse(req.postData() || '{}'))
        } catch {
          deleteBodies.push({})
        }
      }
    })

    await goToSpammersPage(page)

    // If all visible cards are held, release one first.
    const rejectBtn = page
      .locator('.member-card button:has-text("Reject add to spammer list")')
      .first()
    const rejectVisible = await rejectBtn.isVisible().catch(() => false)

    if (!rejectVisible) {
      const releaseBtn = page
        .locator('.member-card button:has-text("Release")')
        .first()
      await expect(releaseBtn).toBeVisible({ timeout: timeouts.ui.appearance })
      await releaseBtn.click()
      await expect(rejectBtn).toBeVisible({
        timeout: timeouts.navigation.slowPage,
      })
    }

    await rejectBtn.click()

    // Wait for the DELETE request to be sent.
    await expect
      .poll(() => deleteBodies.length, {
        message: 'Waiting for DELETE /spammers request',
        timeout: timeouts.api.slowApi,
      })
      .toBeGreaterThan(0)

    // Verify the request body contains a valid spam_users.id.
    const body = deleteBodies[0]
    expect(body.id).toBeTruthy()

    // No 400 or other error responses.
    expect(badResponses).toHaveLength(0)
    expect(pageErrors).toHaveLength(0)
  })
})
