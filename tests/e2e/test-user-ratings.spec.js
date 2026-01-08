/**
 * Tests for user ratings functionality
 * - Give thumbs up to a user
 * - Remove a rating (click again to show remove modal)
 */

const { test, expect } = require('./fixtures')
const { environment, timeouts } = require('./config')
const { loginViaHomepage, logoutIfLoggedIn } = require('./utils/user')

test.describe('User ratings tests', () => {
  test('Rate and unrate a user via chat', async ({
    page,
    testEmail,
    getTestEmail,
    postMessage,
    withdrawPost,
    replyToMessageWithSignup,
  }) => {
    // User A posts a message
    const uniqueItem = `test-rating-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`

    const result = await postMessage({
      type: 'OFFER',
      item: uniqueItem,
      description: `Rating test post at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`Post created with ID: ${result.id}`)
    expect(result.id).toBeTruthy()

    // User B replies to the message (creates a new user)
    const replyEmail = getTestEmail('rater')
    await logoutIfLoggedIn(page)

    await replyToMessageWithSignup({
      messageId: result.id,
      itemName: result.item,
      email: replyEmail,
    })

    console.log('User B replied successfully')

    // Log back in as User A to see the chat with User B
    await logoutIfLoggedIn(page)
    const loginSuccess = await loginViaHomepage(page, testEmail)
    if (!loginSuccess) {
      throw new Error('Failed to login as User A')
    }
    console.log('Logged in as User A')

    // Set up network request interception to debug API calls
    const apiRequests = []
    const apiResponses = []
    const consoleLogs = []

    // Listen for browser console messages
    page.on('console', (msg) => {
      const text = msg.text()
      consoleLogs.push({ type: msg.type(), text })
      // Log errors and important messages
      if (
        msg.type() === 'error' ||
        text.includes('rate') ||
        text.includes('Rate') ||
        text.includes('user')
      ) {
        console.log(`[Browser ${msg.type()}]: ${text}`)
      }
    })

    // Listen for page errors
    page.on('pageerror', (error) => {
      console.log(`[Page Error]: ${error.message}`)
    })

    page.on('request', (request) => {
      const url = request.url()
      // Capture all API calls (v1 and v2)
      if (
        url.includes('apiv1') ||
        url.includes('apiv2') ||
        url.includes('/api/')
      ) {
        apiRequests.push({
          url,
          method: request.method(),
          postData: request.postData(),
        })
        console.log(`API Request: ${request.method()} ${url}`)
        if (request.postData()) {
          console.log(`  Post data: ${request.postData()}`)
        }
      }
    })

    page.on('response', async (response) => {
      const url = response.url()
      // Capture all API responses (v1 and v2)
      if (
        url.includes('apiv1') ||
        url.includes('apiv2') ||
        url.includes('/api/')
      ) {
        let body = ''
        try {
          body = await response.text()
        } catch (e) {
          body = '[could not get body]'
        }
        apiResponses.push({
          url,
          status: response.status(),
          body,
        })
        console.log(`API Response: ${response.status()} ${url}`)
        if (body && body.length < 500) {
          console.log(`  Body: ${body}`)
        }
      }
    })

    // Navigate to /chats
    await page.gotoAndVerify('/chats')

    // Wait for chat entry to appear
    await page.waitForSelector('.chat-entry', {
      timeout: timeouts.background,
    })

    // Click on the chat entry to open the conversation
    const chatEntry = page.locator('.chat-entry').first()
    await chatEntry.click()
    await page.waitForTimeout(timeouts.ui.transition)

    // Wait for the chat header to load with user info (desktop view)
    // The user-ratings container has two buttons: thumbs-up (first), thumbs-down (second)
    const userRatings = page.locator('.user-ratings')
    await userRatings.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Wait for network to be idle to ensure Vue has fully hydrated event handlers
    // This is critical because SSR renders the HTML but event handlers aren't attached until hydration
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    console.log('Network idle - Vue hydration should be complete')

    // Additional wait for async component to fully load and attach event handlers
    // The UserRatings component is loaded via defineAsyncComponent
    await page.waitForTimeout(timeouts.ui.transition)

    // First button is thumbs-up
    const thumbsUpButton = userRatings.locator('button').first()

    // Wait for the button to be enabled and stable before clicking
    await thumbsUpButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Debug: Check if button is disabled
    const isDisabled = await thumbsUpButton.isDisabled()
    console.log(`Thumbs up button disabled: ${isDisabled}`)

    // Get the initial thumbs up count
    const initialUpCount = await thumbsUpButton.textContent()
    const initialCount = parseInt(initialUpCount.replace(/\D/g, '')) || 0
    console.log(`Initial thumbs up count: ${initialCount}`)

    // Debug: Get button classes before click
    const classesBeforeClick = await thumbsUpButton.getAttribute('class')
    console.log(`Button classes before click: ${classesBeforeClick}`)

    // Debug: Get information about the button and Vue state before click
    const buttonInfo = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.user-ratings button')
      if (buttons.length >= 1) {
        const btn = buttons[0]
        // Check for Vue component instance
        let vueInfo = null
        try {
          // Try to get Vue component data
          const component = btn.closest('.user-ratings')?.__vueParentComponent
          if (component) {
            const props = component.props || {}
            vueInfo = { props: JSON.stringify(props) }
          }
        } catch (e) {
          vueInfo = { error: e.message }
        }
        return {
          disabled: btn.disabled,
          className: btn.className,
          textContent: btn.textContent.trim(),
          ariaDisabled: btn.getAttribute('aria-disabled'),
          vueInfo,
        }
      }
      return null
    })
    console.log('Button info before click:', JSON.stringify(buttonInfo))

    // Click thumbs up to rate the user
    // Use force:true to ensure click goes through even if tooltip is showing
    console.log('About to click thumbs up button...')

    // Set up promise to wait for the rating API call
    const ratingRequestPromise = page
      .waitForRequest(
        (req) =>
          req.url().includes('apiv1') &&
          req.method() === 'POST' &&
          req.postData()?.includes('Rate'),
        { timeout: 10000 }
      )
      .catch(() => null)

    await thumbsUpButton.click({ force: true })
    console.log('Clicked thumbs up button with force:true')

    // Check if the rating request was made
    const ratingRequest = await ratingRequestPromise
    if (ratingRequest) {
      console.log('Rating POST request was made:', ratingRequest.url())
      console.log('Post data:', ratingRequest.postData())
    } else {
      console.log('WARNING: No rating POST request detected within 10s')
    }

    // Wait a moment for the API response to be processed
    await page.waitForTimeout(3000)

    // Check if any errors occurred during the click
    const buttonInfoAfter = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.user-ratings button')
      if (buttons.length >= 1) {
        const btn = buttons[0]
        return {
          disabled: btn.disabled,
          className: btn.className,
          textContent: btn.textContent.trim(),
        }
      }
      return null
    })
    console.log('Button info after click:', JSON.stringify(buttonInfoAfter))

    // Log all captured API requests and responses
    console.log('\n=== API Requests after click ===')
    for (const req of apiRequests) {
      console.log(`  ${req.method} ${req.url}`)
      if (req.postData) console.log(`    Data: ${req.postData}`)
    }
    console.log('\n=== API Responses after click ===')
    for (const res of apiResponses) {
      console.log(`  ${res.status} ${res.url}`)
      if (res.body && res.body.length < 200)
        console.log(`    Body: ${res.body}`)
    }
    console.log('\n=== Browser Console Logs (errors only) ===')
    for (const log of consoleLogs.filter((l) => l.type === 'error')) {
      console.log(`  [${log.type}]: ${log.text}`)
    }

    // Debug: Check for any errors in console after click
    // Get button state after click
    const classesAfterClick = await thumbsUpButton.getAttribute('class')
    console.log(`Button classes after click: ${classesAfterClick}`)

    // Debug: Check if there were any POST requests to apiv1 (for rating)
    const postToV1 = apiRequests.filter(
      (r) => r.method === 'POST' && r.url.includes('apiv1')
    )
    console.log(`POST requests to apiv1: ${postToV1.length}`)
    for (const req of postToV1) {
      console.log(`  ${req.url}: ${req.postData}`)
    }

    const countAfterClick = await thumbsUpButton.textContent()
    console.log(`Button text after click: ${countAfterClick}`)

    // Wait for the count to update by polling the button text
    const expectedCount = initialCount + 1
    await page.waitForFunction(
      (expected) => {
        const buttons = document.querySelectorAll('.user-ratings button')
        if (buttons.length >= 1) {
          const text = buttons[0].textContent || ''
          const count = parseInt(text.replace(/\D/g, '')) || 0
          console.log(
            `Polling: current count = ${count}, expected = ${expected}`
          )
          return count === expected
        }
        return false
      },
      expectedCount,
      { timeout: timeouts.background }
    )

    // Verify the count increased
    const updatedUpCount = await thumbsUpButton.textContent()
    const updatedCount = parseInt(updatedUpCount.replace(/\D/g, '')) || 0
    console.log(`Updated thumbs up count: ${updatedCount}`)
    expect(updatedCount).toBe(initialCount + 1)

    // Now click again to show the remove modal
    await thumbsUpButton.click()
    console.log('Clicked thumbs up button again to show remove modal')

    // Wait for the remove rating modal to appear
    const removeModal = page.locator('.modal-dialog').filter({
      hasText: 'Removing a rating',
    })
    await removeModal.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('Remove rating modal appeared')

    // Click the "Remove rating" button in the modal
    const removeButton = removeModal.locator('button').filter({
      hasText: 'Remove rating',
    })
    await removeButton.click()
    console.log('Clicked Remove rating button')

    // Wait for the modal to close and rating to be removed
    await page.waitForTimeout(timeouts.ui.transition)

    // Wait for the count to go back to original
    await page.waitForFunction(
      (expected) => {
        const buttons = document.querySelectorAll('.user-ratings button')
        if (buttons.length >= 1) {
          const text = buttons[0].textContent || ''
          const count = parseInt(text.replace(/\D/g, '')) || 0
          return count === expected
        }
        return false
      },
      initialCount,
      { timeout: timeouts.background }
    )

    // Verify the count went back to original
    const finalUpCount = await thumbsUpButton.textContent()
    const finalCount = parseInt(finalUpCount.replace(/\D/g, '')) || 0
    console.log(`Final thumbs up count: ${finalCount}`)
    expect(finalCount).toBe(initialCount)

    console.log('Successfully rated and unrated user')

    // Clean up - withdraw the post
    await withdrawPost({ item: result.item })
    console.log('Test completed - post withdrawn')
  })
})
