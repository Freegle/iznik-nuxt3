const { timeouts } = require('./config')

/**
 * Checks if an element exists on the page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - CSS selector to check
 * @returns {Promise<boolean>} - Whether the element exists
 */
async function elementExists(page, selector) {
  return (await page.locator(selector).count()) > 0
}

/**
 * Waits for an element's animations to complete and ensures opacity is 1
 * @param {import('@playwright/test').Locator} locator - Playwright locator object
 * @returns {Promise<void>}
 */
async function waitForAnimationEnd(locator) {
  const handle = await locator.elementHandle()
  await handle?.waitForElementState('stable')
  handle?.dispose()
}

/**
 * Waits for a modal to appear and fully render (including animations)
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} textContent - Text content to identify the modal
 * @param {number} [timeout] - Optional timeout (defaults to ui.appearance from config)
 * @returns {Promise<import('@playwright/test').Locator>} - The modal locator
 */
async function waitForModal(
  page,
  textContent,
  timeout = timeouts.ui.appearance
) {
  // Find the modal dialog containing the text
  const modalLocator = page.locator(`.modal:has-text("${textContent}")`).first()

  // Remove fade class to ensure the modal is fully visible and clickable.
  await modalLocator.evaluate((modal) => {
    modal.classList.remove('fade')
  })

  // Wait for the modal to be visible
  await modalLocator.waitFor({
    state: 'visible',
    timeout,
  })

  // Wait for animations to complete
  await waitForAnimationEnd(modalLocator)

  return modalLocator
}

/**
 * Waits for an element with specific text to appear
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} selector - CSS selector to wait for
 * @param {string} text - Text content to look for
 * @param {number} [timeout] - Optional timeout (defaults to ui.appearance from config)
 */
async function waitForElementWithText(
  page,
  selector,
  text,
  timeout = timeouts.ui.appearance
) {
  await page.waitForSelector(`${selector}:has-text("${text}")`, { timeout })
}

/**
 * Signs up a new user through the login modal on the homepage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - Email address to use for sign up
 * @param {string} [displayName] - Optional display name (generates one if not provided)
 * @param {string} [password=TestPassword123!] - Optional password (uses default if not provided)
 * @returns {Promise<boolean>} - Returns true if sign up was successful
 */
async function signUpViaHomepage(
  page,
  email,
  displayName,
  password = 'TestPassword123!'
) {
  console.log(`Starting signup process for email: ${email}`)

  // Navigate to homepage if we're not already there
  const currentUrl = page.url()
  if (!currentUrl.endsWith('/') && !currentUrl.endsWith('/?')) {
    await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
  }

  // Find and click a sign-up/sign-in button on the homepage to open the login modal
  console.log('Opening login modal')
  const signInButtons = [
    '.btn:has-text("Sign up")',
    '.btn:has-text("Sign in")',
    'a:has-text("Sign up")',
    'a:has-text("Register")',
    'button:has-text("Sign up")',
  ]

  // Try each possible button until we find one
  let buttonFound = false
  for (const selector of signInButtons) {
    const button = page.locator(selector).first()
    if (
      (await button.count()) > 0 &&
      (await button.isVisible().catch(() => false))
    ) {
      await button.click()
      buttonFound = true
      break
    }
  }

  if (!buttonFound) {
    console.error('Could not find sign up/sign in button on homepage')
    return false
  }

  // Wait for login modal to appear
  console.log('Waiting for login modal')
  await page
    .locator('#loginModal, .modal-dialog:has-text("Let\'s get freegling")')
    .first()
    .waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

  // Ensure we're in signup mode, not signin mode
  console.log('Checking if in signup mode')
  const newFreeglerLink = page.locator('text=New freegler? Register')
  if (
    await newFreeglerLink
      .isVisible({ timeout: timeouts.ui.appearance })
      .catch(() => false)
  ) {
    // We're in login mode, click to switch to register mode
    console.log('Switching to register mode')
    await newFreeglerLink.click()

    // Wait for the fullname input to appear which indicates we're in register mode
    const fullnameInput = page.locator('#fullname, input[name="fullname"]')
    await fullnameInput.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
  }

  // Fill in the registration form
  console.log('Filling in registration form')

  // Generate display name if not provided
  const fullName = displayName || `Test User ${Date.now()}`

  // Fill in the name field
  const fullnameInput = page.locator('#fullname, input[name="fullname"]')
  await fullnameInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await fullnameInput.fill(fullName)

  // Fill in the email field
  const emailInput = page
    .locator('input[type="email"], input[name="email"]')
    .first()
  await emailInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await emailInput.fill(email)

  // Fill in the password field
  const passwordInput = page
    .locator('input[type="password"], input[name="password"]')
    .first()
  await passwordInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await passwordInput.fill(password)

  // Take a screenshot before submitting
  await page.screenshot({
    path: `playwright-screenshots/before-signup-${Date.now()}.png`,
    fullPage: true,
  })

  // Find and click the Register button in the modal
  console.log('Clicking register button')
  const registerButton = page.locator(
    'button:has-text("Register on Freegle"), .btn:has-text("Register on Freegle")'
  )
  await registerButton.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await registerButton.click()

  // Wait for successful registration
  console.log('Waiting for confirmation after registration')

  try {
    // Wait for redirect to explore page, which is what happens after successful registration
    await page.waitForURL(/\/explore/, {
      timeout: timeouts.navigation.default,
    })

    console.log('Redirected to explore page - registration successful')
    return true
  } catch (error) {
    // If we're not redirected to explore, look for other success indicators
    const successIndicators = [
      'text=thank you for registering',
      'text=registration successful',
      'text=verify your email',
      'text=confirmation email',
      'text=successfully registered',
      'text=welcome to freegle',
      'text=no community for your area',
    ]

    let registrationSuccessful = false

    for (const indicator of successIndicators) {
      try {
        await page
          .waitForSelector(indicator, {
            timeout: timeouts.ui.appearance,
            state: 'visible',
          })
          .then(() => {
            registrationSuccessful = true
            console.log(`Registration success detected with: "${indicator}"`)
          })
          .catch(() => {
            // This particular indicator wasn't found, continue to next
          })

        if (registrationSuccessful) break
      } catch (error) {
        // Continue to the next indicator
      }
    }

    return registrationSuccessful
  }
}

/**
 * Unsubscribes an email address manually by using the unsubscribe form
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - Email address to unsubscribe
 * @returns {Promise<boolean>} - Returns true if unsubscribe was successful
 */
async function unsubscribeManually(page, email) {
  console.log(`Starting unsubscribe process for: ${email}`)

  // Navigate to the unsubscribe page
  await page.gotoAndVerify('/unsubscribe', {
    timeout: timeouts.navigation.default,
  })

  try {
    // See if emailInput is present
    const emailInput = page
      .locator('input[type="email"], input[name="email"]')
      .first()

    // If so, fill it
    if ((await emailInput.count()) > 0) {
      console.log('Filling in email input')
      await emailInput.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await emailInput.fill(email)
    } else {
      console.log('Email input not found, logged in')
    }

    console.log('Clicking "Leave Freegle completely" button')
    await page.locator('.btn:has-text("Leave Freegle completely")').click()

    // Look for the confirmation modal
    console.log('Waiting for confirmation modal')

    // Wait for the confirmation modal to appear and animations to complete
    await waitForModal(page, 'Permanently delete your account?')

    console.log('Found confirmation modal, clicking Confirm button')
    // Click the Confirm button
    const confirmButton = page.locator(
      '.btn:has-text("Confirm"), button:has-text("Confirm")'
    )
    await confirmButton.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await confirmButton.click()

    console.log('Wait for confirmation')

    await page.locator('div:has-text("removed your account")')

    console.log('Successfully unsubscribed email')
    return true
  } catch (error) {
    console.error(`Failed to unsubscribe: ${error.message}`)
    return false
  }
}

module.exports = {
  elementExists,
  waitForElementWithText,
  waitForAnimationEnd,
  waitForModal,
  signUpViaHomepage,
  unsubscribeManually,
}
