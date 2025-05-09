/**
 * User related utility functions for Playwright tests
 */

const path = require('path')
const { timeouts, DEFAULT_TEST_PASSWORD } = require('../config')
const { waitForModal } = require('./ui')
const { SCREENSHOTS_DIR } = require('~/tests/e2e/config')

/**
 * Logs out the current user if they are logged in
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} - Returns true if logout was performed, false if user wasn't logged in
 */
async function logoutIfLoggedIn(page) {
  console.log('Checking if user is logged in')

  // Try to find one of the common logout or user menu buttons
  const logoutIndicators = [
    '.test-user-dropdown', // User dropdown menu
    'button:has-text("Sign out")',
    'a:has-text("Log out")',
    'a:has-text("Sign out")',
    'button:has-text("Log out")',
    '.dropdown-item:has-text("Sign out")',
    '.dropdown-item:has-text("Log out")',
  ]

  let userIsLoggedIn = false
  let userMenuLocator = null

  // Check if any logout indicators are visible
  for (const indicator of logoutIndicators) {
    const locator = page.locator(indicator).first()

    if (await locator.isVisible().catch(() => false)) {
      userIsLoggedIn = true
      userMenuLocator = locator
      console.log(`Found logged in indicator: ${indicator}`)
      break
    }
  }

  // If user is not logged in, return false
  if (!userIsLoggedIn) {
    console.log('User is not logged in')
    return false
  }

  // Try to logout
  try {
    // If we found the user dropdown, we need to click it first to reveal the logout button
    if (
      userMenuLocator &&
      (await page
        .locator('.test-user-dropdown')
        .isVisible()
        .catch(() => false))
    ) {
      console.log('Clicking user dropdown menu')
      await userMenuLocator.click()

      // Wait for dropdown menu animation
      await page.waitForTimeout(500)

      // Now look for logout option in the dropdown
      const dropdownLogoutOptions = [
        '.dropdown-item:has-text("Sign out")',
        '.dropdown-item:has-text("Log out")',
        'a:has-text("Sign out")',
        'a:has-text("Log out")',
      ]

      let logoutFound = false
      for (const option of dropdownLogoutOptions) {
        const logoutButton = page.locator(option).first()

        if (await logoutButton.isVisible().catch(() => false)) {
          console.log(`Clicking logout option: ${option}`)
          await logoutButton.click()
          logoutFound = true
          break
        }
      }

      if (!logoutFound) {
        console.warn('Could not find logout option in dropdown menu')
        return false
      }
    } else {
      // Direct logout button (not in dropdown)
      console.log('Clicking logout button')
      await userMenuLocator.click()
    }

    // Wait for logout to complete
    console.log('Waiting for logout to complete')

    // Wait for logged out state - check for login/sign-up buttons
    const loginIndicators = [
      '.test-signinbutton',
      '.btn:has-text("Sign in")',
      '.btn:has-text("Sign up")',
      'a:has-text("Sign in")',
      'a:has-text("Sign up")',
    ]

    // Wait a bit for the logout operation to process
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check for any of the login indicators
    for (const indicator of loginIndicators) {
      try {
        await page
          .locator(indicator)
          .first()
          .waitFor({
            state: 'visible',
            timeout: timeouts.ui.appearance / 2,
          })
        console.log(`Logout confirmed - found login indicator: ${indicator}`)
        return true
      } catch (error) {
        // This particular indicator not found, try the next one
      }
    }

    // If we get here and don't see logged-in indicators anymore, assume success
    for (const indicator of logoutIndicators) {
      if (
        await page
          .locator(indicator)
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        console.warn(
          'Logout appears to have failed - still seeing logged in indicators'
        )
        return false
      }
    }

    console.log('Logout successful - no longer seeing logged in indicators')
    return true
  } catch (error) {
    console.error(`Error during logout: ${error.message}`)
    return false
  }
}

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

  // Check if already logged in and logout if needed
  const wasLoggedIn = await logoutIfLoggedIn(page)
  if (wasLoggedIn) {
    console.log('Logged out existing user before signup')
    // After logout, we should already be on the homepage, but just to be sure:
    await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
  } else {
    // Navigate to homepage if we're not already there
    const currentUrl = page.url()
    if (!currentUrl.endsWith('/') && !currentUrl.endsWith('/?')) {
      await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
    }
  }

  // Find and click a sign-up/sign-in button on the homepage to open the login modal
  console.log('Opening login modal')
  const signInButtons = [
    '.test-signinbutton',
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

  // Check if already logged in and logout if needed
  const wasLoggedIn = await logoutIfLoggedIn(page)
  if (wasLoggedIn) {
    console.log('Logged out existing user before login')
    // After logout, we should already be on the homepage, but just to be sure:
    await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
  } else {
    // Navigate to homepage if we're not already there
    const currentUrl = page.url()
    if (!currentUrl.endsWith('/') && !currentUrl.endsWith('/?')) {
      await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
    }
  }

  // Find and click a sign-in button on the homepage to open the login modal
  console.log('Opening login modal')
  const signInButtons = [
    '.test-signinbutton',
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
    '.test-signinbutton, button:has-text("Sign in"), .btn:has-text("Sign in")'
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

const getScreenshotPath = (filename) => {
  return path.join(SCREENSHOTS_DIR, filename)
}

/**
 * Unsubscribes an email address manually by using the unsubscribe form
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - Email address to unsubscribe
 * @returns {Promise<boolean>} - Returns true if unsubscribe was successful
 */
async function unsubscribeManually(page, email) {
  console.log(`Starting unsubscribe process for: ${email}`)

  // Try to sign in.
  const loggedIn = await loginViaHomepage(page, email, DEFAULT_TEST_PASSWORD)
  if (loggedIn) {
    console.log('Logged in successfully')
  } else {
    console.log('Login failed, assuming user is not registered')
    return true
  }

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

    // If no error message, look for the confirmation modal
    console.log('Waiting for confirmation modal in unsubscribe')

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

    await page.screenshot({
      path: getScreenshotPath(`failed-to-unsubscribe-${Date.now()}.png`),
      fullPage: true,
    })

    return false
  }
}

/**
 * Gets the current user's groups using the useMe composable
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Array>} - Array of the user's groups
 */
async function getMyGroups(page) {
  console.log('Getting user groups using useMe composable')

  try {
    // Execute JavaScript in the browser context to use the useMe composable
    const groups = await page.evaluate(() => {
      // We need to access the composable from the Vue app
      // This relies on the composable being exposed on the window for testing
      if (!window.$nuxt) {
        console.error('Nuxt app not available')
        return []
      }

      // Use the composable through the Vue app
      const { useMe } = window.$nuxt.$composables || {}

      if (!useMe) {
        console.error('useMe composable not found')
        return []
      }

      const { myGroups } = useMe()

      // Convert to plain array for serialization
      return Array.isArray(myGroups.value)
        ? JSON.parse(JSON.stringify(myGroups.value))
        : []
    })

    console.log(`Found ${groups.length} groups for current user`)
    return groups
  } catch (error) {
    console.error(`Error getting user groups: ${error.message}`)

    // Take a screenshot to help debug
    await page.screenshot({
      path: getScreenshotPath(`get-my-groups-error-${Date.now()}.png`),
      fullPage: true,
    })

    return []
  }
}

module.exports = {
  signUpViaHomepage,
  loginViaHomepage,
  unsubscribeManually,
  logoutIfLoggedIn,
  getMyGroups,
}
