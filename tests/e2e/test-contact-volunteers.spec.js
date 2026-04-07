/**
 * Contact Volunteers Chat Test
 *
 * Reproduces: clicking "Contact Volunteers" on a group page navigates to a
 * new User2Mod chat, but the chat does NOT appear listed/selected in the
 * left-hand chat panel (Wendy_B, Discourse #9481).  Because the new chat has
 * no messages yet (lastmsg=0), the ChatListEntry component was gated behind
 * `v-if="c.lastmsg > 0"` and therefore never rendered.
 *
 * Fix: show ChatListEntry when `c.lastmsg > 0 || selectedChatId === c?.id`
 * so the currently-navigated-to chat always appears in the list.
 *
 * Expected: after clicking "Contact Volunteers" the left-hand chat list shows
 * a selected/highlighted entry for the new chat, making it clear who you are
 * talking to.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Contact Volunteers', () => {
  test('clicking Contact Volunteers shows the new chat selected in the left panel', async ({
    page,
    testEmail,
    testEnv,
    postMessage,
  }) => {
    // postMessage signs up the user and leaves them logged in on /myposts.
    // We don't need the posted message itself — just need an authenticated session.
    const posted = await postMessage({
      type: 'OFFER',
      item: `ContactVolunteersTest ${Date.now()}`,
      description: 'Setup post to create logged-in session',
      email: testEmail,
    })
    expect(posted.id).toBeTruthy()

    const groupName = testEnv?.group?.name || 'FreeglePlayground'

    // Navigate to the group's explore page which shows GroupHeader with the
    // "Contact Volunteers" button (only shown to logged-in members).
    await page.gotoAndVerify(`/explore/${groupName}`, {
      timeout: timeouts.navigation.default,
    })

    // Find and click the "Contact Volunteers" / "Contact Caretakers" button.
    const contactBtn = page
      .locator('button')
      .filter({ hasText: /contact\s+(volunteers|caretakers)/i })
      .first()
    await expect(contactBtn).toBeVisible({ timeout: timeouts.ui.appearance })

    console.log('Found Contact Volunteers button, clicking...')
    await contactBtn.click()

    // Should navigate to /chats/{id}
    await expect(page).toHaveURL(/\/chats\/\d+/, {
      timeout: timeouts.navigation.default,
    })
    const chatUrl = page.url()
    console.log(`Navigated to: ${chatUrl}`)

    // KEY ASSERTION: the new chat must appear as the selected/active entry in
    // the left-hand chat list.  Without the fix, a brand-new User2Mod chat has
    // lastmsg=0 and ChatListEntry is never rendered, leaving the panel empty.
    // The `.chat.active` div is the outer container; it must contain a
    // ChatListEntry (which renders an anchor tag with the chat name).
    const activeChatEntry = page.locator('.chat.active')
    await expect(activeChatEntry).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    console.log('Active chat entry visible in left panel ✓')

    // The chat entry should show the group name so the user knows who they're
    // talking to.
    await expect(activeChatEntry).toContainText(groupName, {
      timeout: timeouts.ui.appearance,
    })
    console.log('Chat entry shows group name — user can identify recipient ✓')

    // A message input (textarea) must also be visible so the user can type.
    const messageInput = page
      .locator(
        '.chat-footer textarea, textarea[placeholder], .chatHolder textarea'
      )
      .first()
    await expect(messageInput).toBeVisible({ timeout: timeouts.ui.appearance })
    console.log('Message input visible ✓')
  })
})
