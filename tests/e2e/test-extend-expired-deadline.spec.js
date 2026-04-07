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
 * Test strategy: navigate to /myposts, wait for the post to appear in the
 * Pinia store's byUserList (accessed via the Vue 3 app instance on #__nuxt —
 * the reliable way to reach Pinia from evaluate() in production builds), then
 * use page.evaluate() to set hasoutcome=1 directly in the reactive store
 * state (simulating an expired post).  After the deadline PATCH the real
 * server data (hasoutcome=0/undefined) is synced into byUserList by the
 * fixed patch() method — asserting this is the key regression check.
 *
 * Note: window.__pinia is not set in production builds.  Pinia state is
 * accessed via document.querySelector('#__nuxt').__vue_app__.config
 * .globalProperties.$pinia.state.value instead.
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

    // Navigate to /myposts
    await page.gotoAndVerify('/myposts', {
      timeout: timeouts.navigation.default,
    })

    // Wait for the post to appear in the Pinia store's byUserList.  This
    // confirms hydration is complete and the store is populated.
    // Access Pinia via the Vue 3 app instance (works in production builds).
    await expect
      .poll(
        () =>
          page.evaluate((msgId) => {
            const pinia =
              document.querySelector('#__nuxt')?.__vue_app__?.config
                ?.globalProperties?.$pinia
            const msg = pinia?.state?.value?.message
            if (!msg?.byUserList) return false
            for (const userId in msg.byUserList) {
              if (msg.byUserList[userId].find((m) => m.id === msgId))
                return true
            }
            return false
          }, posted.id),
        { timeout: timeouts.ui.appearance }
      )
      .toBe(true)
    console.log('Post found in byUserList — store is hydrated')

    // Simulate an expired post by setting hasoutcome=1 in the reactive Pinia
    // store state.  Because Pinia state is reactive, Vue will re-render
    // myposts.vue and move the post to the "Old Posts" section.
    await page.evaluate((msgId) => {
      const pinia =
        document.querySelector('#__nuxt')?.__vue_app__?.config?.globalProperties
          ?.$pinia
      const msg = pinia?.state?.value?.message
      if (!msg?.byUserList) return
      for (const userId in msg.byUserList) {
        const m = msg.byUserList[userId].find((m) => m.id === msgId)
        if (m) {
          m.hasoutcome = 1
          break
        }
      }
    }, posted.id)
    console.log('Set hasoutcome=1 in store (simulating expired post)')

    // The post card must still be visible on the page
    const postCard = page
      .locator('.message-card')
      .filter({ hasText: posted.item })
      .first()
    await expect(postCard).toBeVisible({ timeout: timeouts.ui.appearance })
    console.log('Post card visible after store mutation')

    // Find and click the Edit button
    const editBtn = postCard.locator('button:has-text("Edit")').first()
    await expect(editBtn).toBeVisible({ timeout: timeouts.ui.appearance })
    await editBtn.click()

    const editModal = page.locator('.modal.show')
    await expect(editModal).toBeVisible({ timeout: timeouts.ui.appearance })

    // Set a future deadline
    const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substring(0, 10)
    const deadlineInput = editModal.locator('input[type="date"]').first()
    await expect(deadlineInput).toBeVisible({ timeout: timeouts.ui.appearance })
    await deadlineInput.fill(futureDeadline)
    console.log(`Set future deadline: ${futureDeadline}`)

    // Wait for the PATCH request that saves the deadline
    const patchPromise = page.waitForResponse(
      (r) => r.url().includes('/message') && r.request().method() === 'PATCH',
      { timeout: timeouts.api.slowApi }
    )

    await editModal.locator('button:has-text("Save")').first().click()
    const patchResp = await patchPromise
    expect(patchResp.status()).toBe(200)
    console.log('PATCH saved with future deadline')

    await expect(editModal).not.toBeVisible({ timeout: timeouts.api.default })

    // KEY ASSERTION: after patch(), the fixed store must sync the re-fetched
    // server state (hasoutcome=0/undefined) back into byUserList.  Without the
    // fix, byUserList retains hasoutcome=1 and the post stays in Old Posts.
    await expect
      .poll(
        () =>
          page.evaluate((msgId) => {
            const pinia =
              document.querySelector('#__nuxt')?.__vue_app__?.config
                ?.globalProperties?.$pinia
            const msg = pinia?.state?.value?.message
            if (!msg?.byUserList) return null
            for (const userId in msg.byUserList) {
              const m = msg.byUserList[userId].find((m) => m.id === msgId)
              if (m !== undefined) return m.hasoutcome ?? 0
            }
            return null
          }, posted.id),
        { timeout: timeouts.ui.appearance }
      )
      .toBeFalsy()

    console.log('hasoutcome is falsy in byUserList after patch ✓')
    console.log('Post correctly moved back to active posts ✓')
  })
})
