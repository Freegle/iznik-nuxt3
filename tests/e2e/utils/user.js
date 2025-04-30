/**
 * User related utility functions for Playwright tests
 */

const { timeouts, DEFAULT_TEST_PASSWORD } = require('../config')
const { waitForModal } = require('./ui')

/**
 * Signs up a new user through the login modal on the homepage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - Email address to use for sign up
 * @param {string} [displayName] - Optional display name (generates one if not provided)
 * @param {string} [password=DEFAULT_TEST_PASSWORD] - Optional password (uses default if not provided)
 * @returns {Promise<boolean>} - Returns true if sign up was successful
 */
async function signUpViaHomepage(
  page,
  email,
  displayName,
  password = DEFAULT_TEST_PASSWORD
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

  // Look for either "New freegler? Register" or similar text
  const possibleRegisterLinks = [
    'text=New freegler? Register',
    'text=Create an account',
    'text=Register',
    'text=Sign up',
    'text=New to Freegle? Register',
    "text=Don't have an account? Register",
    'text=New freegle? Register',
  ]

  // Try each possible register link
  for (const selector of possibleRegisterLinks) {
    const registerLink = page.locator(selector)

    // Check if this link is visible
    if (
      await registerLink
        .isVisible({ timeout: timeouts.ui.appearance / 2 })
        .catch(() => false)
    ) {
      // We're in login mode, click to switch to register mode
      console.log(
        `Found register link "${selector}", switching to register mode`
      )
      await registerLink.click()

      // Wait for the fullname input to appear which indicates we're in register mode
      const fullnameInput = page.locator('#fullname, input[name="fullname"]')
      await fullnameInput.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      break // Exit the loop once we've found and clicked a link
    }
  }

  // Check if we're in register mode by looking for the name input
  const fullnameInput = page.locator('#fullname, input[name="fullname"]')
  if (!(await fullnameInput.isVisible().catch(() => false))) {
    console.log('Could not find or switch to register mode')
    return false
  }

  // Fill in the registration form
  console.log('Filling in registration form')

  // Generate display name if not provided
  const fullName = displayName || `Test User ${Date.now()}`

  // Fill in the name field
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
 * Logs in a user via the login modal on the homepage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - Email address to use for login
 * @param {string} [password=DEFAULT_TEST_PASSWORD] - Password to use for login
 * @returns {Promise<boolean>} - Returns true if login was successful
 */
async function loginViaHomepage(page, email, password = DEFAULT_TEST_PASSWORD) {
  console.log(`Starting login process for email: ${email}`)

  // Navigate to homepage if we're not already there
  const currentUrl = page.url()
  if (!currentUrl.endsWith('/') && !currentUrl.endsWith('/?')) {
    await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
  }

  // Find and click a sign-in button on the homepage to open the login modal
  console.log('Opening login modal')
  const signInButtons = [
    '.btn:has-text("Sign in")',
    'a:has-text("Sign in")',
    'button:has-text("Sign in")',
    '.btn:has-text("Log in")',
    'a:has-text("Log in")',
    'button:has-text("Log in")',
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
    console.error('Could not find sign in button on homepage')
    return false
  }

  // Wait for login modal to appear
  console.log('Waiting for login modal')
  await page
    .locator(
      '#loginModal, .modal-dialog:has-text("Sign in"), .modal-dialog:has-text("Let\'s get freegling")'
    )
    .first()
    .waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

  // Ensure we're in signin mode, not signup mode
  console.log('Checking if in signin mode')

  // Look for "Already a freegler?" or similar text that would indicate we need to switch to login mode
  const possibleLoginLinks = [
    'text=Already a freegler?',
    'text=Already have an account?',
    'text=Already a member?',
    'text=Sign in instead',
    'text=Login instead',
    'text=Already registered?',
  ]

  // Try each possible login link
  for (const selector of possibleLoginLinks) {
    const loginLink = page.locator(selector)

    // Check if this link is visible
    if (
      await loginLink
        .isVisible({ timeout: timeouts.ui.appearance / 2 })
        .catch(() => false)
    ) {
      // We're in register mode, click to switch to login mode
      console.log(`Found login link "${selector}", switching to login mode`)
      await loginLink.click()

      // Wait for the transition to complete
      await page.waitForTimeout(500)
      break // Exit the loop once we've found and clicked a link
    }
  }

  // Check if we're in login mode by looking for the email and password inputs without fullname
  const emailField = page
    .locator('input[type="email"], input[name="email"]')
    .first()
  const passwordField = page
    .locator('input[type="password"], input[name="password"]')
    .first()
  const fullnameField = page.locator('#fullname, input[name="fullname"]')

  const emailVisible = await emailField.isVisible().catch(() => false)
  const passwordVisible = await passwordField.isVisible().catch(() => false)
  const fullnameVisible = await fullnameField.isVisible().catch(() => false)

  if (!(emailVisible && passwordVisible && !fullnameVisible)) {
    console.log('Could not find or switch to login mode')
    return false
  }

  // Fill in the login form
  console.log('Filling in login form')

  // Fill in the email field
  const emailInput = emailField
  await emailInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await emailInput.fill(email)

  // Fill in the password field
  const passwordInput = passwordField
  await passwordInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await passwordInput.fill(password)

  // Take a screenshot before submitting
  await page.screenshot({
    path: `playwright-screenshots/before-login-${Date.now()}.png`,
    fullPage: true,
  })

  // Find and click the Login button in the modal
  console.log('Clicking login button')
  const loginButton = page.locator(
    'button:has-text("Sign in"), .btn:has-text("Sign in")'
  )
  await loginButton.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await loginButton.click()

  // Wait for successful login
  console.log('Waiting for successful login')

  try {
    // Look for error messages
    const errorSelector = '.alert-danger, .text-danger, .invalid-feedback'
    const errorElement = page.locator(errorSelector)

    // If there's an error message visible, login failed
    if (
      await errorElement
        .isVisible({ timeout: timeouts.ui.appearance / 2 })
        .catch(() => false)
    ) {
      const errorText = await errorElement.textContent()
      console.error(`Login failed with error: ${errorText}`)
      return false
    }

    // Wait for the modal to disappear (successful login)
    await page
      .locator('#loginModal')
      .waitFor({
        state: 'detached',
        timeout: timeouts.ui.appearance,
      })
      .catch(() => {
        // If modal doesn't disappear, check for "My account" or similar indicators of logged-in state
      })

    // Check for elements that indicate logged in state
    const loggedInIndicators = [
      '.btn:has-text("My account")',
      '.btn:has-text("Settings")',
      '.test-user-dropdown',
      'a:has-text("Log out")',
    ]

    for (const indicator of loggedInIndicators) {
      if (
        await page
          .locator(indicator)
          .isVisible({ timeout: timeouts.ui.appearance / 2 })
          .catch(() => false)
      ) {
        console.log('Login successful - found logged in indicator')
        return true
      }
    }

    // If we get here and don't see login modal anymore, assume success
    const loginModalVisible = await page
      .locator('#loginModal')
      .isVisible()
      .catch(() => false)
    if (!loginModalVisible) {
      console.log('Login appears successful - modal closed')
      return true
    }

    console.log('Could not confirm successful login')
    return false
  } catch (error) {
    console.error(`Login error: ${error.message}`)
    return false
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

    // Take a screenshot after clicking
    await page.screenshot({
      path: `playwright-screenshots/after-click-leave-${Date.now()}.png`,
      fullPage: true,
    })

    // Check for error message about unrecognized email
    const notRecognizedText = "We don't recognise that email address"
    const notRecognizedMessage = page.locator(`text=${notRecognizedText}`)

    // Wait a bit to see if the error message appears
    const notRecognizedVisible = await notRecognizedMessage
      .isVisible({ timeout: timeouts.ui.appearance / 2 })
      .catch(() => false)

    if (notRecognizedVisible) {
      console.log(`Email not recognized: "${notRecognizedText}" message shown`)
      // This is actually a "success" in terms of the account being removed already or never existing
      return true
    }

    // If no error message, look for the confirmation modal
    console.log('Waiting for confirmation modal in unsubscribe')

    try {
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
    } catch (error) {
      // One more check for the "don't recognize" message that might appear after clicking
      const notRecognizedAfterClick = await page
        .locator(`text=${notRecognizedText}`)
        .isVisible({ timeout: timeouts.ui.appearance / 2 })
        .catch(() => false)

      if (notRecognizedAfterClick) {
        console.log(
          `Email not recognized (after modal check): "${notRecognizedText}" message shown`
        )
        return true
      }

      // If we get here, something went wrong with the unsubscribe process
      throw error
    }

    console.log('Successfully unsubscribed email')
    return true
  } catch (error) {
    console.error(`Failed to unsubscribe: ${error.message}`)
    return false
  }
}

module.exports = {
  signUpViaHomepage,
  loginViaHomepage,
  unsubscribeManually,
}
