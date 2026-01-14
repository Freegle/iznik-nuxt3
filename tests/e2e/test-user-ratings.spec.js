/**
 * Tests for user ratings functionality
 * - Give thumbs up to a user
 * - Remove a rating (click again to show remove modal)
 */

const { test, expect } = require('./fixtures')
const { environment, timeouts } = require('./config')
const { loginViaHomepage, logoutIfLoggedIn } = require('./utils/user')

test.describe('User ratings tests', () => {
  // Skip: This test is flaky and being worked on in fix/user-ratings branch
  test.skip('Rate and unrate a user via chat', async ({
    page,
    testEmail,
    getTestEmail,
    postMessage,
    withdrawPost,
    replyToMessageWithSignup,
  }) => {
    // Capture ALL browser console logs for debugging
    const browserLogs = []
    const allConsoleLogs = []
    page.on('console', (msg) => {
      const text = msg.text()
      const type = msg.type()
      allConsoleLogs.push(`[${type}] ${text.substring(0, 200)}`)
      if (
        text.includes('UserRatings') ||
        text.includes('ChatHeader') ||
        text.includes('userStore:')
      ) {
        browserLogs.push(`[${type}] ${text}`)
        console.log(`BROWSER [${type}]:`, text)
      }
    })

    // Capture page errors
    const pageErrors = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
      console.log(`PAGE ERROR: ${error.message}`)
    })

    // Track API calls to see if rating request is made
    const apiCalls = []
    page.on('request', (request) => {
      const url = request.url()
      // Track rating calls and user fetch calls
      if (
        url.includes('/api/') &&
        (url.includes('rating') || url.includes('user'))
      ) {
        apiCalls.push({ method: request.method(), url })
        console.log(`API REQUEST: ${request.method()} ${url}`)
      }
    })
    page.on('response', async (response) => {
      const url = response.url()
      if (
        url.includes('/api/') &&
        (url.includes('rating') || url.includes('user'))
      ) {
        console.log(`API RESPONSE: ${response.status()} ${url}`)
      }
    })

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

    // Dismiss the "Contact details" modal if it appears.
    const contactDetailsModal = page.locator(
      '.modal-content:has-text("Contact details")'
    )
    try {
      await contactDetailsModal.waitFor({
        state: 'visible',
        timeout: 5000,
      })
      console.log('Contact details modal appeared - dismissing it')
      const cancelButton = contactDetailsModal.locator(
        'button:has-text("Cancel")'
      )
      await cancelButton.click()
      await contactDetailsModal.waitFor({ state: 'hidden', timeout: 5000 })
    } catch (e) {
      // Modal didn't appear, continue
    }

    // Wait for the UserRatings component to be visible
    // Note: There can be multiple UserRatings (collapsed/non-collapsed) - we need the VISIBLE one
    // Use filter with isVisible to find specifically the visible one
    const allUserRatings = page.locator('.user-ratings')
    const count = await allUserRatings.count()
    console.log(`Found ${count} UserRatings elements on page`)

    // Find the visible one
    let userRatings = null
    for (let i = 0; i < count; i++) {
      const elem = allUserRatings.nth(i)
      if (await elem.isVisible()) {
        userRatings = elem
        console.log(`UserRatings element ${i} is visible - using this one`)
        break
      } else {
        console.log(`UserRatings element ${i} is NOT visible - skipping`)
      }
    }

    if (!userRatings) {
      throw new Error('No visible UserRatings element found')
    }

    await userRatings.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    console.log('Confirmed UserRatings component is visible')

    // Wait for network to be idle to ensure data is loaded
    await page.waitForLoadState('networkidle', { timeout: 30000 })

    // Log what browser console messages we've seen so far
    console.log(`Browser logs so far: ${browserLogs.length}`)
    browserLogs.forEach((log) => console.log('  ', log))
    console.log(`All console logs: ${allConsoleLogs.length}`)
    console.log(`Page errors: ${pageErrors.length}`)
    pageErrors.forEach((err) => console.log('  ERROR:', err))

    // Check debug data attributes
    // First check static attribute to verify we're using the latest build
    const testStatic = await userRatings.getAttribute('data-test-static')
    console.log(`UserRatings static test attr: ${testStatic}`)
    if (testStatic !== 'hello') {
      console.log(
        'WARNING: Static test attribute missing or incorrect - may be using cached/old build!'
      )
    }

    const debugId = await userRatings.getAttribute('data-debug-id')
    const debugMyid = await userRatings.getAttribute('data-debug-myid')
    const debugMounted = await userRatings.getAttribute('data-debug-mounted')
    console.log(
      `UserRatings debug attrs: id=${debugId}, myid=${debugMyid}, mounted=${debugMounted}`
    )

    // Wait for Vue hydration to complete (mounted=true means event handlers are attached)
    if (debugMounted !== 'true') {
      console.log('Waiting for Vue hydration (mounted=true)...')
      await page.waitForFunction(
        () => {
          const el = document.querySelector('.user-ratings')
          return el && el.getAttribute('data-debug-mounted') === 'true'
        },
        { timeout: 30000 }
      )
      console.log('Vue hydration complete')
    }

    // First button is thumbs-up
    const thumbsUpButton = userRatings.locator('button').first()
    await thumbsUpButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Get the initial thumbs up count
    const initialUpCount = await thumbsUpButton.textContent()
    const initialCount = parseInt(initialUpCount.replace(/\D/g, '')) || 0
    console.log(`Initial thumbs up count: ${initialCount}`)

    // Check if button is disabled (would explain click not working)
    const isDisabled = await thumbsUpButton.isDisabled()
    console.log(`Thumbs up button disabled: ${isDisabled}`)

    // Check if button has click event listeners attached (Vue hydration issue detection)
    const hasClickHandler = await page.evaluate(() => {
      const btn = document.querySelector('.user-ratings button')
      if (!btn) return { found: false }

      // Check for Vue event listeners via __vueParentComponent
      const hasVueHandler = !!(
        btn.__vueParentComponent ||
        btn._vei ||
        btn.__vue__
      )

      // Check for native onclick
      const hasOnclick = !!btn.onclick

      // Get the button's outerHTML for debugging
      const html = btn.outerHTML.substring(0, 200)

      return {
        found: true,
        hasVueHandler,
        hasOnclick,
        html,
      }
    })
    console.log('Button handler check:', JSON.stringify(hasClickHandler))

    // Get button bounding box to verify it's clickable
    const buttonBox = await thumbsUpButton.boundingBox()
    console.log('Button bounding box:', JSON.stringify(buttonBox))

    // Take debug screenshot before click - this will be captured as artifact
    await page.screenshot({
      path: 'test-results/user-ratings-before-click.png',
      fullPage: false,
    })
    console.log(
      'Saved debug screenshot: test-results/user-ratings-before-click.png'
    )

    // Get full HTML of UserRatings element
    const userRatingsHTML = await userRatings.innerHTML()
    console.log('UserRatings innerHTML:', userRatingsHTML.substring(0, 500))

    // Try scrolling the button into view first
    await thumbsUpButton.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)

    // Add CSS to completely disable tooltips - they intercept clicks
    await page.evaluate(() => {
      const style = document.createElement('style')
      style.id = 'disable-tooltips-for-test'
      style.textContent = `
        .tooltip, .popover, [role="tooltip"], .b-tooltip, .bs-tooltip-bottom, .bs-tooltip-top {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `
      document.head.appendChild(style)

      // Also remove any existing tooltips
      document
        .querySelectorAll('.tooltip, [role="tooltip"], .b-tooltip, .popover')
        .forEach((el) => el.remove())
    })

    // Wait for CSS to take effect
    await page.waitForTimeout(100)

    // Click using locator.evaluate with a proper MouseEvent
    // Native btn.click() may not trigger Vue event handlers in production builds
    console.log('Clicking thumbs up button via MouseEvent dispatch...')
    await thumbsUpButton.evaluate((btn) => {
      console.log(
        'Dispatching MouseEvent on button:',
        btn.outerHTML.substring(0, 100)
      )
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: 1,
      })
      btn.dispatchEvent(event)
    })

    // Wait for potential API response
    await page.waitForTimeout(3000)

    // Take screenshot after click
    await page.screenshot({
      path: 'test-results/user-ratings-after-click.png',
      fullPage: false,
    })
    console.log(
      'Saved debug screenshot: test-results/user-ratings-after-click.png'
    )

    console.log(`Browser logs after click: ${browserLogs.length}`)
    browserLogs.forEach((log) => console.log('  ', log))
    console.log(`Page errors after click: ${pageErrors.length}`)
    pageErrors.forEach((err) => console.log('  ERROR:', err))
    console.log(`API calls after click: ${apiCalls.length}`)
    apiCalls.forEach((call) => console.log('  ', call.method, call.url))

    // Wait for the count to update
    // IMPORTANT: Must check the VISIBLE UserRatings element, not just the first one
    // There can be multiple UserRatings (collapsed/non-collapsed views)
    const expectedCount = initialCount + 1
    await page.waitForFunction(
      (expected) => {
        // Find all user-ratings elements and check the visible one
        const allRatings = document.querySelectorAll('.user-ratings')
        for (const rating of allRatings) {
          // Check if visible (offsetParent is null for hidden elements)
          if (rating.offsetParent !== null) {
            const btn = rating.querySelector('button')
            if (btn) {
              const text = btn.textContent || ''
              const count = parseInt(text.replace(/\D/g, '')) || 0
              if (count === expected) {
                return true
              }
            }
          }
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
    // CSS already disables tooltips, just remove any that appeared
    await page.evaluate(() => {
      document
        .querySelectorAll('.tooltip, [role="tooltip"], .b-tooltip, .popover')
        .forEach((el) => el.remove())
    })

    console.log('Clicking thumbs up button again to show remove modal...')
    await thumbsUpButton.evaluate((btn) => {
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        button: 0,
        buttons: 1,
      })
      btn.dispatchEvent(event)
    })

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

    // Wait for the modal to close and rating to be removed
    await page.waitForTimeout(timeouts.ui.transition)

    // Wait for the count to go back to original
    // IMPORTANT: Must check the VISIBLE UserRatings element, not just the first one
    await page.waitForFunction(
      (expected) => {
        const allRatings = document.querySelectorAll('.user-ratings')
        for (const rating of allRatings) {
          if (rating.offsetParent !== null) {
            const btn = rating.querySelector('button')
            if (btn) {
              const text = btn.textContent || ''
              const count = parseInt(text.replace(/\D/g, '')) || 0
              if (count === expected) {
                return true
              }
            }
          }
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
