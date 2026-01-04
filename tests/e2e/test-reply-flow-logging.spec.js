/**
 * Reply Flow Tests - State Machine Logging
 *
 * This test verifies that the reply state machine logs its state transitions.
 *
 * See test-reply-flow-index.md for the complete test matrix.
 */

const { test, expect } = require('./fixtures')
const { environment } = require('./config')
const {
  loginViaHomepage,
  logoutIfLoggedIn,
  signUpViaHomepage,
} = require('./utils/user')
const {
  clickReplyButton,
  fillReplyForm,
  clickSendAndWait,
} = require('./utils/reply-helpers')

test.describe('Reply Flow - State Machine Logging', () => {
  test('logs state transitions during successful reply', async ({
    page,
    postMessage,
    testEmail,
    getTestEmail,
    withdrawPost,
  }) => {
    // Collect console messages
    const consoleMessages = []
    page.on('console', (msg) => {
      if (msg.text().includes('[ReplyStateMachine]')) {
        consoleMessages.push(msg.text())
      }
    })

    // Post a message
    const posterEmail = getTestEmail('logging-test')
    const uniqueItem = `test-logging-${Date.now()}`
    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: 'Test item for logging verification',
      postcode: environment.postcode,
      email: posterEmail,
    })
    expect(result.id).toBeTruthy()

    // Sign up (creates user and logs in), then reply
    await logoutIfLoggedIn(page)
    await signUpViaHomepage(page, testEmail)
    await page.gotoAndVerify(`/message/${result.id}`)
    await clickReplyButton(page)

    await fillReplyForm(page, {
      replyText: 'Testing state machine logging',
      collectText: 'Anytime',
    })
    await clickSendAndWait(page)

    // Verify we got state machine logs
    console.log('[Test] Captured console messages:')
    consoleMessages.forEach((msg) => console.log('  ' + msg))

    // Check for key state transitions
    const hasInitLog = consoleMessages.some(
      (m) => m.includes('Initializing') || m.includes('IDLE')
    )
    const hasTransitionLog = consoleMessages.some(
      (m) => m.includes('→') || m.includes('COMPOSING')
    )

    expect(hasInitLog || hasTransitionLog).toBe(true)
    console.log('[Test] State machine logging verified')

    // Cleanup
    await logoutIfLoggedIn(page)
    await loginViaHomepage(page, posterEmail)
    await withdrawPost({ item: result.item })
  })
})
