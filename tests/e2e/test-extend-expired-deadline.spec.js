/**
 * Extend Expired Deadline Test
 *
 * Reproduces (Wendy_B, Discourse #9548): when a post is expired (hasoutcome=1
 * in the API) and appears in "Old Posts" on /myposts, editing the deadline to
 * a future date should move the post back to "Active Posts".
 *
 * Root cause: the Go API correctly clears the Expired outcome from
 * messages_outcomes when a future deadline is PATCHed (PR #62).  However, the
 * frontend message store's patch() method calls fetch(id) which updates
 * this.list[id] but does NOT sync the new state into byUserList.  myposts.vue
 * reads from byUserList, so the post stays in Old Posts.
 *
 * Fix: patch() now syncs this.list[id] → byUserList after the re-fetch.
 *
 * Test strategy: use page.route() to intercept the fetchByUser API call and
 * inject hasoutcome=1 for our test message.  This populates byUserList
 * correctly (as if the post were genuinely expired) and is stable against
 * background re-fetches.  After the deadline PATCH the real server data
 * (hasoutcome=0) is synced into byUserList by the fixed patch() method.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Extend expired deadline', () => {
  test('extending deadline on expired post moves it back to active posts', async ({
    page,
    testEmail,
    postMessage,
  }) => {
    // Post a message — this also logs in the user and leaves them on /myposts
    const posted = await postMessage({
      type: 'OFFER',
      item: `ExpiredDeadlineTest ${Date.now()}`,
      description: 'Testing extend deadline on expired post',
      email: testEmail,
    })
    expect(posted.id).toBeTruthy()
    console.log(`Posted message id=${posted.id}`)

    // Intercept the fetchByUser API call (/apiv2/user/{uid}/message) and
    // inject hasoutcome=1 for our test message.  This is stable — every call
    // returns the intercepted response — so background re-fetches don't reset
    // the expired state before we save the new deadline.
    await page.route('**/apiv2/user/*/message*', async (route) => {
      const response = await route.fetch()
      const body = await response.json()

      // body is an array of messages — mark our test message as expired
      if (Array.isArray(body)) {
        for (const msg of body) {
          if (msg.id === posted.id) {
            msg.hasoutcome = 1
          }
        }
      }

      await route.fulfill({
        status: response.status(),
        headers: Object.fromEntries(response.headers()),
        body: JSON.stringify(body),
      })
    })

    // Navigate to /myposts — with the intercept active, our post should appear
    // in the Old Posts section (hasoutcome=1).
    await page.gotoAndVerify('/myposts', {
      timeout: timeouts.navigation.default,
    })

    // The post must appear somewhere on the page first (active or old section)
    const postCard = page
      .locator('.message-card')
      .filter({ hasText: posted.item })
      .first()
    await expect(postCard).toBeVisible({ timeout: timeouts.ui.appearance })
    console.log('Post visible on /myposts')

    // Verify the post is in Old Posts (hasoutcome=1 injected by route intercept)
    const isInOldPosts = await page.evaluate((msgId) => {
      const stores = window.__pinia?.state?.value
      if (!stores?.message?.byUserList) return null
      for (const userId in stores.message.byUserList) {
        const msg = stores.message.byUserList[userId].find(
          (m) => m.id === msgId
        )
        if (msg) return !!msg.hasoutcome
      }
      return null
    }, posted.id)
    console.log(`Post hasoutcome in byUserList: ${isInOldPosts}`)
    expect(isInOldPosts).toBeTruthy()

    // Find the Edit button on the post
    const editBtn = page
      .locator('.message-card')
      .filter({ hasText: posted.item })
      .first()
      .locator('button:has-text("Edit")')
      .first()
    await expect(editBtn).toBeVisible({ timeout: timeouts.ui.appearance })

    // Open the edit modal and set a future deadline
    await editBtn.click()
    const editModal = page.locator('.modal.show')
    await expect(editModal).toBeVisible({ timeout: timeouts.ui.appearance })

    const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10)
    const deadlineInput = editModal.locator('input[type="date"]').first()
    await expect(deadlineInput).toBeVisible({ timeout: timeouts.ui.appearance })
    await deadlineInput.fill(futureDeadline)
    console.log(`Set future deadline: ${futureDeadline}`)

    // Intercept PATCH to confirm the deadline is sent
    const patchPromise = page.waitForResponse(
      (r) => r.url().includes('/message') && r.request().method() === 'PATCH',
      { timeout: timeouts.api.slowApi }
    )

    // Remove the fetchByUser intercept before saving so the re-fetch triggered
    // by patch() gets real server data (hasoutcome=0 — server clears Expired
    // when a future deadline is set).
    await page.unroute('**/apiv2/user/*/message*')

    await editModal.locator('button:has-text("Save")').first().click()
    const patchResp = await patchPromise
    expect(patchResp.status()).toBe(200)
    console.log('PATCH saved with future deadline')

    await expect(editModal).not.toBeVisible({ timeout: timeouts.api.default })

    // KEY ASSERTION: after patch(), byUserList must be synced with the fresh
    // server state (hasoutcome=false).  Without the fix, byUserList is not
    // updated by patch() so the post stays in Old Posts.
    const hasOutcomeAfter = await page.evaluate((msgId) => {
      const stores = window.__pinia?.state?.value
      if (!stores?.message?.byUserList) return null
      for (const userId in stores.message.byUserList) {
        const msg = stores.message.byUserList[userId].find(
          (m) => m.id === msgId
        )
        if (msg) return msg.hasoutcome
      }
      return null
    }, posted.id)

    console.log(`hasoutcome in byUserList after patch: ${hasOutcomeAfter}`)
    expect(hasOutcomeAfter).toBeFalsy()
    console.log('Post has hasoutcome=false in byUserList after patch ✓')
  })
})
