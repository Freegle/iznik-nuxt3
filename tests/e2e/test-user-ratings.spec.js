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

    // Dismiss the "Contact details" modal if it appears.
    // This modal asks for postcode when the user doesn't have mylocation set.
    const contactDetailsModal = page.locator(
      '.modal-content:has-text("Contact details")'
    )
    try {
      await contactDetailsModal.waitFor({
        state: 'visible',
        timeout: 5000,
      })
      console.log('Contact details modal appeared - dismissing it')
      // Click Cancel to dismiss the modal
      const cancelButton = contactDetailsModal.locator(
        'button:has-text("Cancel")'
      )
      await cancelButton.click()
      // Wait for modal to close
      await contactDetailsModal.waitFor({ state: 'hidden', timeout: 5000 })
      console.log('Contact details modal dismissed')
    } catch (e) {
      // Modal didn't appear within 5 seconds - that's fine, continue
      console.log('Contact details modal did not appear - continuing')
    }

    // ========== EXTENSIVE DEBUG: Check DOM structure ==========
    console.log('\n========== DOM STRUCTURE DEBUG ==========')
    const domDebug = await page.evaluate(() => {
      // Count all .user-ratings elements
      const allUserRatings = document.querySelectorAll('.user-ratings')
      const userRatingsInfo = []

      allUserRatings.forEach((el, idx) => {
        const buttons = el.querySelectorAll('button')
        const parent = el.parentElement
        const grandparent = parent?.parentElement

        // Check visibility
        const rect = el.getBoundingClientRect()
        const style = window.getComputedStyle(el)
        const parentStyle = parent ? window.getComputedStyle(parent) : null

        userRatingsInfo.push({
          index: idx,
          buttonCount: buttons.length,
          firstButtonText: buttons[0]?.textContent?.trim(),
          firstButtonClasses: buttons[0]?.className,
          isVisible: rect.width > 0 && rect.height > 0,
          display: style.display,
          visibility: style.visibility,
          parentClass: parent?.className,
          parentDisplay: parentStyle?.display,
          parentVisibility: parentStyle?.visibility,
          grandparentClass: grandparent?.className,
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        })
      })

      // Check collapsed state - look for chatinfoheader in localStorage or Pinia store
      let collapsedState = 'unknown'
      try {
        // Try to find the collapsed state from Vue/Pinia
        const miscStore = window.__PINIA__?.state?.value?.misc
        if (miscStore) {
          collapsedState = miscStore.chatinfoheader ? 'collapsed' : 'expanded'
        }
      } catch (e) {
        collapsedState = 'error: ' + e.message
      }

      return {
        totalUserRatingsElements: allUserRatings.length,
        userRatingsInfo,
        collapsedState,
        pageUrl: window.location.href
      }
    })

    console.log('Total .user-ratings elements:', domDebug.totalUserRatingsElements)
    console.log('Collapsed state:', domDebug.collapsedState)
    console.log('Page URL:', domDebug.pageUrl)
    for (const info of domDebug.userRatingsInfo) {
      console.log(`  UserRatings[${info.index}]:`, JSON.stringify(info))
    }
    console.log('========================================\n')

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

    // ========== DEBUG: Check for multiple visible UserRatings after network idle ==========
    const postNetworkDebug = await page.evaluate(() => {
      const allUserRatings = document.querySelectorAll('.user-ratings')
      const visibleRatings = []

      allUserRatings.forEach((el, idx) => {
        const rect = el.getBoundingClientRect()
        const style = window.getComputedStyle(el)
        const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'

        if (isVisible) {
          const buttons = el.querySelectorAll('button')
          visibleRatings.push({
            index: idx,
            buttonCount: buttons.length,
            firstButtonText: buttons[0]?.textContent?.trim(),
            outerHTML: el.outerHTML.substring(0, 200)
          })
        }
      })

      return {
        totalElements: allUserRatings.length,
        visibleCount: visibleRatings.length,
        visibleRatings
      }
    })

    console.log('\n========== POST-NETWORK-IDLE DEBUG ==========')
    console.log('Total .user-ratings elements:', postNetworkDebug.totalElements)
    console.log('Visible .user-ratings elements:', postNetworkDebug.visibleCount)
    for (const info of postNetworkDebug.visibleRatings) {
      console.log(`  Visible[${info.index}]:`, JSON.stringify(info))
    }
    console.log('==============================================\n')

    // First button is thumbs-up
    const thumbsUpButton = userRatings.locator('button').first()

    // Wait for the button to be visible and have a Vue event handler attached.
    // The UserRatings component is loaded via defineAsyncComponent which means the button
    // may be visible before Vue has attached the click handler.
    // We wait for the button to have Vue's internal properties set, indicating hydration is complete.
    await thumbsUpButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    // Wait for Vue to fully hydrate the async component.
    // In slow CI environments, the async component load can take several seconds.
    // We poll until the button has content (indicating the user data has loaded).
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('.user-ratings button')
        if (!btn) return false
        // The button shows the rating count when user data is loaded.
        // Check that the button has content and is not disabled.
        const hasContent = btn.textContent && btn.textContent.trim().length > 0
        const notDisabled = !btn.disabled
        return hasContent && notDisabled
      },
      { timeout: timeouts.ui.appearance }
    )
    console.log('UserRatings component loaded with user data')

    // Additional wait for async component hydration to complete
    // The defineAsyncComponent in ChatHeader loads UserRatings lazily,
    // which means Vue event handlers may not be attached immediately
    console.log('Waiting additional 3s for async component hydration...')
    await page.waitForTimeout(3000)

    // Try hovering over the button first - this can help trigger any lazy initialization
    console.log('Hovering over thumbs up button to ensure it is interactive...')
    await thumbsUpButton.hover()
    await page.waitForTimeout(500)

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

    // ========== DEBUG: Comprehensive button and Vue state before click ==========
    const preClickDebug = await page.evaluate(() => {
      const allButtons = document.querySelectorAll('.user-ratings button')
      const buttonDetails = []

      allButtons.forEach((btn, idx) => {
        const rect = btn.getBoundingClientRect()
        const parent = btn.closest('.user-ratings')
        const parentRect = parent?.getBoundingClientRect()

        // Try to find Vue component instance
        let vueData = null
        try {
          // Walk up to find Vue component
          let el = btn
          while (el && !el.__vueParentComponent) {
            el = el.parentElement
          }
          if (el?.__vueParentComponent) {
            const component = el.__vueParentComponent
            const setupState = component.setupState || {}
            vueData = {
              componentName: component.type?.name || component.type?.__name || 'unknown',
              hasClickedRating: 'clickedRating' in setupState,
              clickedRatingValue: setupState.clickedRating?.value,
              displayMineValue: setupState.displayMine?.value,
              displayUpCountValue: setupState.displayUpCount?.value,
              userId: component.props?.id
            }
          }
        } catch (e) {
          vueData = { error: e.message }
        }

        // Check for event listeners
        const hasClickListener = btn.onclick !== null ||
          (typeof getEventListeners !== 'undefined' ? getEventListeners(btn).click?.length > 0 : 'unknown')

        buttonDetails.push({
          buttonIndex: idx,
          text: btn.textContent?.trim(),
          className: btn.className,
          disabled: btn.disabled,
          isThumbsUp: btn.querySelector('[class*="thumbs-up"]') !== null || btn.innerHTML.includes('thumbs-up'),
          rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          parentRect: parentRect ? { top: parentRect.top, left: parentRect.left, width: parentRect.width, height: parentRect.height } : null,
          vueData,
          hasClickListener
        })
      })

      return {
        totalButtons: allButtons.length,
        buttonDetails,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      }
    })

    console.log('\n========== PRE-CLICK DEBUG ==========')
    console.log('Total buttons:', preClickDebug.totalButtons)
    console.log('Viewport:', preClickDebug.viewportWidth, 'x', preClickDebug.viewportHeight)
    for (const btn of preClickDebug.buttonDetails) {
      console.log(`  Button[${btn.buttonIndex}]:`, JSON.stringify(btn))
    }
    console.log('======================================\n')

    // Click thumbs up to rate the user
    // Use a retry mechanism because Vue async component hydration timing can vary.
    // The click event handler may not be attached immediately even when the button is visible.
    console.log('About to click thumbs up button...')

    let ratingResponse = null
    const maxRetries = 5
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`\n========== CLICK ATTEMPT ${attempt} of ${maxRetries} ==========`)

      // Wait a bit before each attempt to allow Vue hydration to settle.
      // The delay increases with each attempt to handle slow environments.
      const preClickDelay = 1000 + attempt * 500
      console.log(`Waiting ${preClickDelay}ms before click...`)
      await page.waitForTimeout(preClickDelay)

      // Get button state before click for debugging
      const btnStateBeforeClick = await page.evaluate(() => {
        const allBtns = document.querySelectorAll('.user-ratings button')
        const firstBtn = allBtns[0]
        if (!firstBtn) return { error: 'No button found' }

        // Find Vue component
        let vueState = null
        try {
          let el = firstBtn
          while (el && !el.__vueParentComponent) {
            el = el.parentElement
          }
          if (el?.__vueParentComponent) {
            const ss = el.__vueParentComponent.setupState || {}
            vueState = {
              clickedRating: ss.clickedRating?.value,
              displayMine: ss.displayMine?.value,
              displayUpCount: ss.displayUpCount?.value
            }
          }
        } catch (e) {
          vueState = { error: e.message }
        }

        return {
          text: firstBtn.textContent?.trim(),
          className: firstBtn.className,
          disabled: firstBtn.disabled,
          hasMineClass: firstBtn.classList.contains('mine'),
          vueState,
          totalButtons: allBtns.length
        }
      })
      console.log('Button state BEFORE click:', JSON.stringify(btnStateBeforeClick))

      // Set up promise to wait for the rating API response (not just request).
      // This ensures the database write is complete before we check the UI.
      const ratingResponsePromise = page
        .waitForResponse(
          (res) =>
            res.url().includes('apiv1') &&
            res.request().method() === 'POST' &&
            res.request().postData()?.includes('Rate'),
          { timeout: 15000 } // 15 seconds per attempt for slow CI
        )
        .catch((e) => {
          console.log(`Rating response wait error: ${e.message}`)
          return null
        })

      // Try multiple click approaches since Vue async component hydration can be tricky
      console.log('Clicking button now...')

      // First, try dispatching a native click event via evaluate
      // This can bypass issues where Playwright's click doesn't trigger Vue handlers
      const clickResult = await page.evaluate(() => {
        const btn = document.querySelector('.user-ratings button')
        if (!btn) return { error: 'No button found' }

        // Create and dispatch a native click event
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
        btn.dispatchEvent(clickEvent)

        return { clicked: true, buttonText: btn.textContent?.trim() }
      })
      console.log('Native click dispatch result:', JSON.stringify(clickResult))

      // Also try Playwright's click as a backup
      await thumbsUpButton.click({ force: true })
      console.log('Playwright click completed')

      // Immediately check state after click (before waiting for API)
      const btnStateImmediatelyAfterClick = await page.evaluate(() => {
        const allBtns = document.querySelectorAll('.user-ratings button')
        const firstBtn = allBtns[0]
        if (!firstBtn) return { error: 'No button found' }

        // Find Vue component
        let vueState = null
        try {
          let el = firstBtn
          while (el && !el.__vueParentComponent) {
            el = el.parentElement
          }
          if (el?.__vueParentComponent) {
            const ss = el.__vueParentComponent.setupState || {}
            vueState = {
              clickedRating: ss.clickedRating?.value,
              displayMine: ss.displayMine?.value,
              displayUpCount: ss.displayUpCount?.value
            }
          }
        } catch (e) {
          vueState = { error: e.message }
        }

        return {
          text: firstBtn.textContent?.trim(),
          className: firstBtn.className,
          hasMineClass: firstBtn.classList.contains('mine'),
          vueState,
          totalButtons: allBtns.length
        }
      })
      console.log('Button state IMMEDIATELY after click:', JSON.stringify(btnStateImmediatelyAfterClick))

      // Wait for the rating API response
      ratingResponse = await ratingResponsePromise

      // Check state after API response
      const btnStateAfterApi = await page.evaluate(() => {
        const allBtns = document.querySelectorAll('.user-ratings button')
        const firstBtn = allBtns[0]
        if (!firstBtn) return { error: 'No button found' }

        // Find Vue component
        let vueState = null
        try {
          let el = firstBtn
          while (el && !el.__vueParentComponent) {
            el = el.parentElement
          }
          if (el?.__vueParentComponent) {
            const ss = el.__vueParentComponent.setupState || {}
            vueState = {
              clickedRating: ss.clickedRating?.value,
              displayMine: ss.displayMine?.value,
              displayUpCount: ss.displayUpCount?.value
            }
          }
        } catch (e) {
          vueState = { error: e.message }
        }

        return {
          text: firstBtn.textContent?.trim(),
          className: firstBtn.className,
          hasMineClass: firstBtn.classList.contains('mine'),
          vueState,
          totalButtons: allBtns.length
        }
      })
      console.log('Button state AFTER API wait:', JSON.stringify(btnStateAfterApi))

      if (ratingResponse) {
        console.log(`Rating POST response received: ${ratingResponse.status()} ${ratingResponse.url()}`)

        // Verify the click actually worked by checking for the 'mine' class.
        // The button should get 'mine' class immediately when setClickedState('Up') is called,
        // which happens synchronously BEFORE the API call. If we got an API response but
        // no 'mine' class, the response might be a false positive from another request.
        const hasMineClass = await page.evaluate(() => {
          const btn = document.querySelector('.user-ratings button')
          return btn && btn.classList.contains('mine')
        })

        if (hasMineClass) {
          console.log('SUCCESS: Button has mine class - click succeeded')
          break // Success, exit retry loop
        } else {
          console.log('PROBLEM: API response received but button doesn\'t have mine class')
          ratingResponse = null // Reset so we retry
        }
      } else {
        console.log('No rating API response received')
      }

      console.log(`========== END ATTEMPT ${attempt} ==========\n`)

      if (!ratingResponse && attempt < maxRetries) {
        // Wait for Vue hydration to potentially complete before retry
        // Increase wait time with each attempt
        const retryDelay = 2000 + attempt * 1000
        console.log(`Waiting ${retryDelay}ms before retry...`)
        await page.waitForTimeout(retryDelay)
      }
    }

    if (!ratingResponse) {
      console.log('\n========== FAILURE DEBUG ==========')
      console.log('WARNING: No rating POST response received after all retries')

      // Take a screenshot to help debug
      await page.screenshot({
        path: 'test-results/rating-failed-debug.png',
        fullPage: true,
      })

      // Capture final DOM state
      const finalDomState = await page.evaluate(() => {
        const allUserRatings = document.querySelectorAll('.user-ratings')
        const details = []

        allUserRatings.forEach((el, idx) => {
          const buttons = el.querySelectorAll('button')
          const rect = el.getBoundingClientRect()

          buttons.forEach((btn, btnIdx) => {
            let vueState = null
            try {
              let parent = btn
              while (parent && !parent.__vueParentComponent) {
                parent = parent.parentElement
              }
              if (parent?.__vueParentComponent) {
                const ss = parent.__vueParentComponent.setupState || {}
                vueState = {
                  clickedRating: ss.clickedRating?.value,
                  displayMine: ss.displayMine?.value,
                  displayUpCount: ss.displayUpCount?.value
                }
              }
            } catch (e) {
              vueState = { error: e.message }
            }

            details.push({
              userRatingsIdx: idx,
              buttonIdx: btnIdx,
              text: btn.textContent?.trim(),
              className: btn.className,
              hasMineClass: btn.classList.contains('mine'),
              vueState,
              isVisible: rect.width > 0 && rect.height > 0
            })
          })
        })

        return {
          totalUserRatings: allUserRatings.length,
          details
        }
      })

      console.log('Final DOM state:', JSON.stringify(finalDomState, null, 2))
      console.log('====================================\n')
    }

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
