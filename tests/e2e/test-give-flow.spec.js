// @ts-check
/**
 * Tests for the give flow - posting OFFER items to Freegle
 */

const { test, expect } = require('./fixtures')
const { environment, timeouts } = require('./config')

test.describe('Give flow tests', () => {
  test('Logged out, new user, basic OFFER post, no attachment', async ({
    page,
    testEmail,
    postMessage,
    registerTestEmail,
  }) => {
    // Register the automatically generated test email for cleanup
    registerTestEmail(testEmail)

    // Use the fixture to post a message
    const result = await postMessage({
      type: 'OFFER',
      item: 'test post - please delete',
      description: `Created by automated test at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`Post result: ${JSON.stringify(result)}`)

    // Check that the result has an id
    expect(result.id).toBeTruthy()
    expect(result.id).not.toBe(null)
    console.log(`Post created with ID: ${result.id}`)

    // After posting, we should be automatically redirected to /myposts
    // Wait for the redirect to happen
    await page.waitForURL(/\/myposts/, { timeout: timeouts.navigation.default })

    // Check for "Is there a deadline?" modal and click "No deadline"
    try {
      const deadlineModal = page.locator(
        '.modal:has-text("Is there a deadline?")'
      )
      await deadlineModal.waitFor({ state: 'visible', timeout: 5000 })
      const noDeadlineButton = page.locator('.btn:has-text("No deadline")')
      await noDeadlineButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await noDeadlineButton.click()
      console.log('Clicked "No deadline" in deadline modal')
    } catch (error) {
      console.log('No deadline modal did not appear or was already handled')
    }

    // Check for "Could you deliver?" modal and click "Maybe"
    try {
      const deliveryModal = page.locator(
        '.modal:has-text("Could you deliver?")'
      )
      await deliveryModal.waitFor({ state: 'visible', timeout: 5000 })
      const maybeButton = page.locator('.btn:has-text("Maybe")')
      await maybeButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await maybeButton.click()
      console.log('Clicked "Maybe" in delivery modal')
    } catch (error) {
      console.log('No delivery modal did not appear or was already handled')
    }

    // Find the post we just created
    const postSelector = `.card-body:has-text("${result.item}")`
    const postCard = page.locator(postSelector)
    await postCard.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Look for the withdraw button within the post card
    const withdrawButton = postCard.locator('.btn:has-text("Withdraw")')
    await withdrawButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Click the withdraw button
    await withdrawButton.click()

    // Wait for confirmation modal to appear if needed
    const confirmButtons = ['.modal .btn:has-text("Withdraw")']

    // Try to find and click any confirmation button that appears
    for (const selector of confirmButtons) {
      try {
        const confirmButton = page.locator(selector).filter({ visible: true })
        await confirmButton.waitFor({
          state: 'visible',
          timeout: 2000,
        })
        await confirmButton.first().click()
        console.log(`Clicked confirmation button: ${selector}`)
        break
      } catch (error) {
        // This confirmation button doesn't exist, try the next one
        continue
      }
    }

    // The post should disappear entirely
    await postCard.waitFor({
      state: 'detached',
      timeout: timeouts.api.default,
    })
    console.log('Post successfully removed from page')
  })
})
