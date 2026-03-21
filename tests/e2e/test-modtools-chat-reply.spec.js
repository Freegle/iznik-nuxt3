/**
 * ModTools Chat Reply Test
 *
 * Tests that a moderator can reply to a User2Mod chat through the UI.
 * The mod is NOT user1/user2 on the chat — they reply as a group moderator.
 *
 * Uses the pre-created User2Mod chat from create-test-env.php.
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

test.describe('ModTools Chat Reply', () => {
  test('mod can reply to User2Mod chat', async ({ page, testEnv }) => {
    const modEmail = testEnv.mod.email
    const u2mChatId = testEnv.chats?.user2mod

    console.log('=== MOD CHAT REPLY TEST ===')
    console.log(`Mod: ${modEmail}`)
    console.log(`User2Mod chat ID: ${u2mChatId}`)

    expect(u2mChatId).toBeTruthy()

    // Step 1: Login as mod
    console.log('\n--- Step 1: Login as mod ---')
    await loginViaModTools(page, modEmail)

    // Step 2: Navigate to the specific User2Mod chat
    console.log('\n--- Step 2: Navigate to chat ---')
    await page.goto(`${MODTOOLS_URL}/chats/${u2mChatId}`, {
      timeout: timeouts.navigation.initial,
    })

    await dismissAllModals(page)

    // Wait for the chat pane to load — look for the message input
    // The ModChatFooter has a textarea for typing messages
    const chatInput = page.locator('textarea[placeholder="Type here..."]')

    await expect(chatInput).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })
    console.log('Chat pane loaded with message input')

    // Step 3: Type and send a reply
    console.log('\n--- Step 3: Send reply ---')
    const replyText = `Mod reply at ${new Date().toISOString()}`
    await chatInput.fill(replyText)

    // Track the POST response for the chat message creation
    const sendPromise = page.waitForResponse(
      (r) => r.url().includes('/message') && r.request().method() === 'POST',
      { timeout: timeouts.api.slowApi }
    )

    // The Send button is a SpinButton with label="Send"
    const sendButton = page.locator('button:has-text("Send")').first()
    await expect(sendButton).toBeVisible({ timeout: timeouts.ui.appearance })
    await sendButton.click()
    console.log('Clicked Send button')

    const sendResponse = await sendPromise
    const sendStatus = sendResponse.status()
    const sendBody = await sendResponse.text()
    console.log(`Send response: ${sendStatus} ${sendBody}`)
    expect(sendStatus).toBe(200)

    // Step 4: Verify the message appears in the chat
    console.log('\n--- Step 4: Verify reply appears ---')
    await expect(page.locator(`text=${replyText}`)).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    console.log('Reply visible in chat')

    // Take screenshot for evidence
    await page.screenshot({
      path: 'playwright-screenshots/mod-chat-reply.png',
      fullPage: true,
    })

    console.log('\n=== MOD CHAT REPLY TEST COMPLETE ===')
  })
})
