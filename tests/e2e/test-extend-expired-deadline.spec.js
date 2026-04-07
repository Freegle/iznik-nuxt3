/**
 * Extend Expired Deadline Test
 *
 * Reproduces (Wendy_B, Discourse #9548): when a post is expired (hasoutcome=1
 * in the API) and appears in "Old Posts" on /myposts, editing the deadline to
 * a future date should move the post back to "Active Posts".
 *
 * Root cause: the Go API correctly clears the Expired outcome from
 * messages_outcomes when a future deadline is PATCHed.  However, the frontend
 * message store's patch() method calls fetch(id) which updates this.list[id]
 * but does NOT sync the new state into byUserList.  myposts.vue reads from
 * byUserList, so the post stays in Old Posts.
 *
 * Fix: patch() now syncs this.list[id] → byUserList after the re-fetch.
 *
 * Test strategy:
 * - page.route() intercepts the client-side fetchByUser call that myposts.vue
 *   makes on hydration (the watcher uses { immediate: true } so it always
 *   fires client-side even when SSR has already populated the state).
 * - Verification is DOM-only: the "N old" toolbar toggle appears when
 *   hasoutcome=1 and must disappear after the deadline PATCH clears it.
 *   No Pinia / Vue internals are accessed.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Extend expired deadline', () => {
  test('extending deadline on expired post moves it back to active posts', async ({
    page,
    testEmail,
    postMessage,
  }) => {
    // Post a message — this also logs in the user and leaves them on /myposts.
    const posted = await postMessage({
      type: 'OFFER',
      item: `ExpiredDeadlineTest ${Date.now()}`,
      description: 'Testing extend deadline on expired post',
      email: testEmail,
    })
    expect(posted.id).toBeTruthy()
    console.log(`Posted message id=${posted.id}`)

    // Intercept the client-side fetchByUser API call and mark our test post
    // as expired (hasoutcome=1).  The myposts.vue watcher uses
    // { immediate: true }, so it fires on every hydration and calls
    // fetchByUser client-side — this browser request is interceptable even
    // though the initial SSR fetch is not.
    await page.route('**/apiv2/user/*/message*', async (route) => {
      const response = await route.fetch()
      const body = await response.json()
      if (Array.isArray(body)) {
        body.forEach((msg) => {
          if (msg.id === posted.id) msg.hasoutcome = 1
        })
      }
      await route.fulfill({
        status: response.status(),
        headers: Object.fromEntries(response.headers()),
        body: JSON.stringify(body),
      })
    })

    // Navigate to /myposts.  On hydration the route intercept fires and
    // sets hasoutcome=1 for our post in byUserList.
    await page.gotoAndVerify('/myposts', {
      timeout: timeouts.navigation.default,
    })

    // The "N old" toolbar toggle button appears when oldPosts.length > 0.
    // Its presence confirms our post was classified as expired.
    const oldToggle = page.locator('.toolbar-toggle')
    await expect(oldToggle).toBeVisible({ timeout: timeouts.ui.appearance })
    console.log('Old posts toggle visible — post classified as expired ✓')

    // Click the toggle to reveal old posts, then find our post card.
    await oldToggle.click()
    const postCard = page
      .locator('.message-card')
      .filter({ hasText: posted.item })
      .first()
    await expect(postCard).toBeVisible({ timeout: timeouts.ui.appearance })
    console.log('Post visible in old posts section ✓')

    // Click Edit to open the edit modal.
    const editBtn = postCard.locator('button:has-text("Edit")').first()
    await expect(editBtn).toBeVisible({ timeout: timeouts.ui.appearance })
    await editBtn.click()

    const editModal = page.locator('.modal.show')
    await expect(editModal).toBeVisible({ timeout: timeouts.ui.appearance })

    // Set a future deadline.
    const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10)
    const deadlineInput = editModal.locator('input[type="date"]').first()
    await expect(deadlineInput).toBeVisible({ timeout: timeouts.ui.appearance })
    await deadlineInput.fill(futureDeadline)
    console.log(`Set future deadline: ${futureDeadline}`)

    // Remove the route intercept before saving so the re-fetch triggered by
    // patch() gets real server data (hasoutcome=0/undefined — the server
    // clears the Expired outcome when a future deadline is set).
    await page.unroute('**/apiv2/user/*/message*')

    // Capture the PATCH request.
    const patchPromise = page.waitForResponse(
      (r) => r.url().includes('/message') && r.request().method() === 'PATCH',
      { timeout: timeouts.api.slowApi }
    )

    await editModal.locator('button:has-text("Save")').first().click()
    const patchResp = await patchPromise
    expect(patchResp.status()).toBe(200)
    console.log('PATCH saved with future deadline')

    await expect(editModal).not.toBeVisible({ timeout: timeouts.api.default })

    // KEY ASSERTION (DOM-only): after patch() syncs the real server state
    // back into byUserList, oldPosts becomes empty and the "N old" toggle
    // disappears.
    //
    // Without the fix: byUserList retains hasoutcome=1 (patch() doesn't
    // sync), the old posts toggle stays visible — test fails.
    // With the fix:    byUserList is updated to hasoutcome=0, oldPosts is
    // empty, toggle is removed from the DOM — test passes.
    await expect(oldToggle).not.toBeVisible({ timeout: timeouts.ui.appearance })
    console.log('Old posts toggle gone — post moved back to active ✓')
  })
})
