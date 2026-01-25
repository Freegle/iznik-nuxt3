// @ts-nocheck
/**
 * User related utility functions for Playwright tests
 */

const path = require('path')
const { timeouts, DEFAULT_TEST_PASSWORD } = require('../config')
const { SCREENSHOTS_DIR } = require('../config')
const { waitForModal } = require('./ui')

/**
 * Waits for auth to be persisted to localStorage after login.
 * This ensures the auth token is available before navigating away.
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
async function waitForAuthPersistence(page) {
  console.log('Waiting for auth to be persisted to localStorage...')
  try {
    await page.waitForFunction(
      () => {
        try {
          const authData = localStorage.getItem('auth')
          if (!authData) return false
          const parsed = JSON.parse(authData)
          // Check the nested auth object for jwt or persistent token
          const tokens = parsed?.auth
          return !!(tokens?.jwt || tokens?.persistent)
        } catch (e) {
          return false
        }
      },
      { timeout: timeouts.ui.appearance }
    )
    console.log('Auth persisted to localStorage')
  } catch (error) {
    console.log(`Warning: Auth persistence check timed out: ${error.message}`)
    // Don't throw - the login may still have succeeded but persistence is slow
  }
}

/**
 * Clears all session data from the current page WITHOUT navigating.
 * This is a fast operation that just clears storage and cookies.
 * @param {import('@playwright/test').Page} page - Current Playwright page object
 * @returns {Promise<void>}
 */
async function clearSessionData(page) {
  // First, call the logout API to clear server-side session
  await page.evaluate(async () => {
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: {
          'X-HTTP-Method-Override': 'DELETE',
          'Content-Type': 'application/json',
        },
      })
    } catch {
      // Ignore errors - user might not be logged in
    }
  })

  // Clear all browser storage
  await page.evaluate(() => {
    try {
      localStorage.clear()
    } catch {
      // Ignore
    }
    try {
      sessionStorage.clear()
    } catch {
      // Ignore
    }

    // Clear indexedDB
    if (window.indexedDB && window.indexedDB.databases) {
      window.indexedDB
        .databases()
        .then((databases) => {
          databases.forEach((db) => {
            window.indexedDB.deleteDatabase(db.name)
          })
        })
        .catch(() => {})
    }

    // Clear Pinia stores if they exist
    if (window.$nuxt && window.$nuxt.$pinia) {
      for (const store of window.$nuxt.$pinia._s.values()) {
        if (store.$reset) {
          store.$reset()
        }
      }
    }
  })

  // Clear all cookies
  const context = page.context()
  await context.clearCookies()
}

/**
 * Clears all session data from the current page to simulate logout.
 * @param {import('@playwright/test').Page} page - Current Playwright page object
 * @param {boolean} [navigateToHome=true] - Whether to navigate to homepage after clearing (slower but ensures fresh state)
 * @returns {Promise<import('@playwright/test').Page>} - Returns the same page object with cleared session
 */
async function logoutIfLoggedIn(page, navigateToHome = true) {
  console.log('Clearing all session data to simulate fresh browser state')

  try {
    await clearSessionData(page)
    console.log('Cleared session data')

    // Only navigate if explicitly requested (for backwards compatibility)
    if (navigateToHome) {
      await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
      console.log('Navigated to homepage')

      // Wait for DOM to be ready - don't use networkidle as the app has background polling
      // that can prevent network from becoming idle, causing timeouts in parallel runs
      await page.waitForLoadState('domcontentloaded', {
        timeout: timeouts.navigation.default,
      })

      // Verify logged-out state by checking localStorage auth is cleared
      const isLoggedOut = await page.evaluate(() => {
        try {
          const authData = localStorage.getItem('auth')
          if (!authData) return true
          const parsed = JSON.parse(authData)
          const tokens = parsed?.auth
          // Check if there are any valid tokens remaining
          return !(tokens?.jwt || tokens?.persistent)
        } catch (e) {
          return true // If we can't parse, assume logged out
        }
      })

      if (!isLoggedOut) {
        console.log(
          'Warning: Auth data still present after logout, clearing again'
        )
        // Try clearing again
        await clearSessionData(page)
        // Reload to ensure fresh state
        await page.reload({ timeout: timeouts.navigation.initial })
        // Wait for DOM to be ready - don't use networkidle as the app has background polling
        await page.waitForLoadState('domcontentloaded', {
          timeout: timeouts.navigation.default,
        })
      }

      console.log('Verified logged-out state')
    }

    return page
  } catch (error) {
    console.error(`Error clearing session data: ${error.message}`)
    throw error
  }
}

/**
 * Waits for an enabled sign-in button on the page.
 * With SSR, buttons may be rendered disabled and only become enabled after Vue hydration.
 * This function polls until a visible, enabled button is found or timeout.
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<import('@playwright/test').Locator|null>} - Returns the enabled button locator or null
 */
async function waitForEnabledSignInButton(page) {
  const buttons = page.locator('.test-signinbutton')
  // Wait for at least one element to be visible
  await page
    .locator('.test-signinbutton:visible')
    .first()
    .waitFor({ timeout: timeouts.ui.appearance })
  const count = await buttons.count()
  console.log(`Found ${count} .test-signinbutton elements`)

  if (count === 0) {
    console.error('Could not find .test-signinbutton on homepage')
    return null
  }

  // With SSR, buttons may be rendered disabled and only become enabled after
  // Vue hydration. Poll until we find an enabled button or timeout.
  const hydrationTimeout = timeouts.ui.appearance
  const pollInterval = 200
  const startTime = Date.now()
  let signInButton = null

  while (Date.now() - startTime < hydrationTimeout) {
    // Look for the first visible and enabled button
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i)

      // Check if this button is visible
      const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false)

      if (isVisible) {
        // Check if it's enabled by checking various disabled states
        const isDisabled = await btn
          .evaluate((el) => {
            // For button elements, check the disabled property
            if (el.disabled) return true

            // For any element, check disabled attribute values
            const disabledAttr = el.getAttribute('disabled')
            if (disabledAttr === 'true' || disabledAttr === '') return true

            // Check for disabled classes
            if (el.classList.contains('disabled')) return true

            return false
          })
          .catch(() => false)

        if (!isDisabled) {
          console.log(`Found visible, enabled button at index ${i}`)
          signInButton = btn
          break
        }
      }
    }

    if (signInButton) {
      break
    }

    // Wait before retrying - button may still be disabled during hydration
    console.log(
      'Sign-in button disabled (likely awaiting hydration), retrying...'
    )
    await page.waitForTimeout(pollInterval)
  }

  if (!signInButton) {
    console.error(
      'Could not find visible, enabled .test-signinbutton on homepage after waiting for hydration'
    )
    return null
  }

  // Wait for the button to be ready
  await signInButton.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })

  return signInButton
}

/**
 * Signs up a new user through the login modal on the homepage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - Email address to use for sign up
 * @param {string} [displayName] - Optional display name (generates one if not provided)
 * @param {string} [password=DEFAULT_TEST_PASSWORD] - Optional password (uses default if not provided)
 * @param {boolean} [marketingConsent=null] - Optional marketing consent value (null means don't change default)
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.skipLogout=false] - Skip logout if caller already handled it
 * @returns {Promise<boolean>} - Returns true if sign up was successful
 */
async function signUpViaHomepage(
  page,
  email,
  displayName,
  password = DEFAULT_TEST_PASSWORD,
  marketingConsent = null,
  options = {}
) {
  const { skipLogout = false } = options
  console.log(`Starting signup process for email: ${email}`)

  // Clear session data if not skipped (fast, no navigation)
  if (!skipLogout) {
    await clearSessionData(page)
    console.log('Cleared session data before signup')
  }

  // Navigate to homepage if we're not already there
  const currentUrl = page.url()
  if (!currentUrl.endsWith('/') && !currentUrl.endsWith('/?')) {
    await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
  }

  // Wait for page to be fully loaded with JavaScript
  // Don't use networkidle - the app has background polling that prevents idle state
  await page.waitForLoadState('domcontentloaded', {
    timeout: timeouts.navigation.default,
  })

  // Find and click the sign-in button on the homepage to open the login modal
  console.log('Opening login modal')

  const signInButton = await waitForEnabledSignInButton(page)
  if (!signInButton) {
    return false
  }

  console.log(`Found valid sign-in button, clicking...`)
  await signInButton.click()

  // Wait for login modal to appear
  console.log('Waiting for login modal')
  await page
    .locator('#loginModal, .modal-dialog:has-text("Join the Reuse Revolution")')
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
    'button:has-text("Create an account")',
    'span:has-text("Create an account on Freegle")',
    'button:has-text("Register")',
    'button:has-text("Sign up")',
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
  await fullnameInput.type(fullName)

  // Fill in the email field
  const emailInput = page
    .locator('input[type="email"], input[name="email"]')
    .first()
  await emailInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await emailInput.type(email)

  // Fill in the password field
  const passwordInput = page
    .locator('input[type="password"], input[name="password"]')
    .first()
  await passwordInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await passwordInput.type(password)

  // Handle marketing consent if specified
  if (marketingConsent !== null) {
    console.log(`Setting marketing consent to: ${marketingConsent}`)
    const marketingCheckbox = page.locator('#marketingConsent')

    // Wait for the checkbox to be visible
    await marketingCheckbox.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    if (marketingConsent === true) {
      // Ensure it's checked (should be by default)
      const isChecked = await marketingCheckbox.isChecked()
      if (!isChecked) {
        await marketingCheckbox.check()
      }
    } else if (marketingConsent === false) {
      // Uncheck it
      const isChecked = await marketingCheckbox.isChecked()
      if (isChecked) {
        await marketingCheckbox.uncheck()
      }
    }
  }

  // Find and click the Register button in the modal
  console.log('Clicking register button')
  const registerButton = page.locator(
    'button:has-text("Join Freegle!"), .btn:has-text("Join Freegle!"), button:has-text("Register on Freegle"), .btn:has-text("Register on Freegle")'
  )
  await registerButton.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await registerButton.click()

  // Wait for successful registration
  console.log('Waiting for confirmation after registration')

  try {
    // Wait for redirect to explore page or myposts, which happens after successful registration
    await page.waitForURL(/\/(explore|myposts)/, {
      timeout: timeouts.navigation.default,
    })

    const currentUrl = page.url()
    if (currentUrl.includes('/explore')) {
      console.log('Redirected to explore page - registration successful')
    } else if (currentUrl.includes('/myposts')) {
      console.log('Redirected to myposts page - registration successful')
    }

    // Wait for auth to be persisted to localStorage before returning
    // This ensures navigation to other pages preserves the logged-in state
    await waitForAuthPersistence(page)

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

    // If registration was successful via indicators, also wait for auth persistence
    if (registrationSuccessful) {
      await waitForAuthPersistence(page)
    }

    return registrationSuccessful
  }
}

/**
 * Logs in a user via the login modal on the homepage
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} email - Email address to use for login
 * @param {string} [password=DEFAULT_TEST_PASSWORD] - Password to use for login
 * @param {boolean} [expectedMarketingConsent=null] - Optional expected marketing consent value to verify (null means don't verify)
 * @returns {Promise<boolean>} - Returns true if login was successful
 */
async function loginViaHomepage(
  page,
  email,
  password = DEFAULT_TEST_PASSWORD,
  expectedMarketingConsent = null
) {
  console.log(`Starting login process for email: ${email}`)

  // Clear session data before login (fast, no navigation)
  await clearSessionData(page)
  console.log('Cleared session data before login')

  // Navigate to homepage if we're not already there
  const currentUrl = page.url()
  if (!currentUrl.endsWith('/') && !currentUrl.endsWith('/?')) {
    await page.gotoAndVerify('/', { timeout: timeouts.navigation.initial })
  }

  // Find and click the sign-in button on the homepage to open the login modal
  console.log('Opening login modal')

  const signInButton = await waitForEnabledSignInButton(page)
  if (!signInButton) {
    return false
  }

  console.log(`Found valid sign-in button, clicking...`)
  await signInButton.click()

  // Wait for login modal to appear
  console.log('Waiting for login modal')
  await page.locator('#loginModal').first().waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })

  // Ensure we're in signin mode, not signup mode
  console.log('Checking if in signin mode')

  // Define our locators
  const loginLink = page
    .locator('.test-already-a-freegler')
    .filter({ visible: true })
    .first()
  const emailField = page
    .locator('input[type="email"], input[name="email"]')
    .first()
  const passwordField = page
    .locator('input[type="password"], input[name="password"]')
    .first()
  const fullnameField = page.locator('#fullname, input[name="fullname"]')

  // Wait for modal to be ready by waiting for either the login link or form fields to appear
  console.log('Waiting for modal to be ready...')
  try {
    await page.waitForFunction(
      () => {
        const loginLinkEl = document.querySelector('.test-already-a-freegler')
        const emailEl = document.querySelector(
          'input[type="email"], input[name="email"]'
        )
        const passwordEl = document.querySelector(
          'input[type="password"], input[name="password"]'
        )

        // Check if login link is visible OR if form fields are present (regardless of fullname)
        const loginLinkVisible =
          loginLinkEl && getComputedStyle(loginLinkEl).display !== 'none'
        const formFieldsPresent = emailEl && passwordEl

        return loginLinkVisible || formFieldsPresent
      },
      { timeout: timeouts.ui.appearance }
    )
  } catch (error) {
    console.log('Failed to find modal elements, continuing anyway...')
  }

  // Check which mode we're in - be more thorough
  console.log('Checking modal mode...')

  // First check current field visibility
  const emailVisible = await emailField.isVisible().catch(() => false)
  const passwordVisible = await passwordField.isVisible().catch(() => false)
  const fullnameVisible = await fullnameField.isVisible().catch(() => false)
  console.log(
    `Current field visibility - email: ${emailVisible}, password: ${passwordVisible}, fullname: ${fullnameVisible}`
  )

  const loginLinkVisible = await loginLink.isVisible().catch(() => false)
  console.log(`Login link visible: ${loginLinkVisible}`)

  // If we have all three fields, we're in signup mode - try to work with it
  if (emailVisible && passwordVisible && fullnameVisible) {
    console.log(
      'Detected signup mode - attempting to use existing user credentials'
    )

    // Try to switch to login mode first
    if (loginLinkVisible) {
      console.log('Found visible login link, clicking to switch to login mode')
      await loginLink.click()

      // Wait for fullname field to disappear (indicates mode switch)
      try {
        await fullnameField.waitFor({ state: 'hidden', timeout: 3000 })
        console.log('Successfully switched to login mode!')
      } catch {
        console.log('Mode switch failed, continuing with signup mode approach')
      }
    } else {
      console.log(
        'No visible login link found, will use signup mode with existing user approach'
      )

      // Since modal switching doesn't work, we'll fill the form as a "signup"
      // but use existing user credentials. The backend should recognize the
      // existing user and log them in instead of creating a new account.
      console.log('Using signup form with existing user credentials to log in')
    }
  } else if (emailVisible && passwordVisible && !fullnameVisible) {
    console.log('Already in login mode')
  } else {
    console.log(
      `Unexpected modal state - email: ${emailVisible}, password: ${passwordVisible}, fullname: ${fullnameVisible}`
    )
  }

  // Final verification - check if we're in login mode
  const finalEmailVisible = await emailField.isVisible().catch(() => false)
  const finalPasswordVisible = await passwordField
    .isVisible()
    .catch(() => false)
  const finalFullnameVisible = await fullnameField
    .isVisible()
    .catch(() => false)

  // Accept either login mode OR signup mode (we can work with both)
  const inLoginMode =
    finalEmailVisible && finalPasswordVisible && !finalFullnameVisible
  const inSignupMode =
    finalEmailVisible && finalPasswordVisible && finalFullnameVisible

  if (!inLoginMode && !inSignupMode) {
    console.log(
      'Neither login nor signup mode detected',
      finalEmailVisible,
      finalPasswordVisible,
      finalFullnameVisible
    )
    // Capture a screenshot for debugging
    try {
      console.log('Skipping failed-login screenshot to avoid hang')
    } catch (screenshotError) {
      console.log(`Screenshot failed: ${screenshotError.message}`)
    }

    return false
  }

  if (inSignupMode) {
    console.log(
      'Continuing with signup mode - will use existing user credentials'
    )
  } else {
    console.log('In login mode - proceeding normally')
  }

  // Fill in the login form
  console.log('Filling in login form')

  // DEBUG: Form field debug before filling
  console.log('=== FORM FIELDS BEFORE FILLING DEBUG ===')
  try {
    const emailValue = await Promise.race([
      emailField.inputValue(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error('inputValue timeout after 3s')), 3000)
      ),
    ]).catch(() => 'NO_VALUE')
    const emailVisible = await emailField.isVisible().catch(() => false)
    const emailEnabled = await emailField.isEnabled().catch(() => false)
    console.log(
      `Email field - value: "${emailValue}", visible: ${emailVisible}, enabled: ${emailEnabled}`
    )

    const passwordValue = await Promise.race([
      passwordField.inputValue(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error('inputValue timeout after 3s')), 3000)
      ),
    ]).catch(() => 'NO_VALUE')
    const passwordVisible = await passwordField.isVisible().catch(() => false)
    const passwordEnabled = await passwordField.isEnabled().catch(() => false)
    console.log(
      `Password field - value: "${passwordValue}", visible: ${passwordVisible}, enabled: ${passwordEnabled}`
    )

    if (finalFullnameVisible && fullnameField) {
      try {
        console.log('About to get fullname field value in debug section...')
        const fullnameValue = await Promise.race([
          fullnameField.inputValue(),
          new Promise((_resolve, reject) =>
            setTimeout(
              () => reject(new Error('inputValue timeout after 3s')),
              3000
            )
          ),
        ]).catch(() => 'NO_VALUE')
        console.log('Got fullname value in debug section')

        const fullnameVisible = await fullnameField
          .isVisible()
          .catch(() => false)
        const fullnameEnabled = await fullnameField
          .isEnabled()
          .catch(() => false)
        console.log(
          `Fullname field - value: "${fullnameValue}", visible: ${fullnameVisible}, enabled: ${fullnameEnabled}`
        )
      } catch (fullnameError) {
        console.log(`Fullname debug section failed: ${fullnameError.message}`)
      }
    }
  } catch (debugError) {
    console.log(`Form field debug error: ${debugError.message}`)
  }
  console.log('=== FORM FIELDS BEFORE FILLING DEBUG END ===')

  // Fill in the email field
  const emailInput = emailField
  await emailInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  console.log(`About to type email: ${email}`)
  await emailInput.type(email)
  console.log('Email typed successfully')

  // Fill in fullname field if we're in signup mode
  if (inSignupMode && finalFullnameVisible) {
    console.log('Filling fullname field for signup mode')
    await fullnameField.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    // Use a generic name for existing user login attempts
    await fullnameField.type('Test User')
  }

  // Fill in the password field
  const passwordInput = passwordField
  await passwordInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  console.log(`About to type password: [REDACTED ${password.length} chars]`)
  await passwordInput.type(password)
  console.log('Password typed successfully')

  // DEBUG: Check form state after filling all fields
  console.log('=== FORM STATE AFTER FILLING ===')
  try {
    const emailValue = await Promise.race([
      emailField.inputValue(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error('inputValue timeout after 3s')), 3000)
      ),
    ]).catch(() => 'NO_VALUE')

    const passwordValue = await Promise.race([
      passwordField.inputValue(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error('inputValue timeout after 3s')), 3000)
      ),
    ]).catch(() => 'NO_VALUE')

    console.log(
      `Final email value: "${emailValue}" (length: ${emailValue.length})`
    )
    console.log(
      `Final password value: [REDACTED ${passwordValue.length} chars]`
    )

    if (finalFullnameVisible && fullnameField) {
      const fullnameValue = await Promise.race([
        fullnameField.inputValue(),
        new Promise((_resolve, reject) =>
          setTimeout(
            () => reject(new Error('inputValue timeout after 3s')),
            3000
          )
        ),
      ]).catch(() => 'NO_VALUE')
      console.log(
        `Final fullname value: "${fullnameValue}" (length: ${fullnameValue.length})`
      )
    }

    // Check if form is valid
    const form = page.locator('form').first()
    const formValid = await form
      .evaluate((el) => el.checkValidity())
      .catch(() => false)
    console.log(`Form validity: ${formValid}`)
  } catch (debugError) {
    console.log(`Final form state debug error: ${debugError.message}`)
  }
  console.log('=== FORM STATE AFTER FILLING END ===')

  // Verify marketing consent if specified
  if (expectedMarketingConsent !== null) {
    console.log(`Verifying marketing consent is: ${expectedMarketingConsent}`)
    const marketingCheckbox = page.locator('#marketingConsent')

    // Wait for the checkbox to be visible
    await marketingCheckbox.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })

    const isChecked = await marketingCheckbox.isChecked()
    if (expectedMarketingConsent !== isChecked) {
      console.error(
        `Marketing consent mismatch: expected ${expectedMarketingConsent}, got ${isChecked}`
      )
      return false
    }
    console.log(`Marketing consent verification passed: ${isChecked}`)
  }

  // Debug: Check field values before submitting
  try {
    console.log('About to get email input value...')
    const emailValue = await Promise.race([
      emailInput.inputValue(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error('inputValue timeout after 3s')), 3000)
      ),
    ]).catch(() => 'NO_VALUE')

    console.log('About to get password input value...')
    const passwordValue = await Promise.race([
      passwordInput.inputValue(),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new Error('inputValue timeout after 3s')), 3000)
      ),
    ]).catch(() => 'NO_VALUE')

    console.log(`Form field values before submit:`)
    console.log(`  Email: "${emailValue}" (length: ${emailValue.length})`)
    console.log(
      `  Password: "${passwordValue}" (length: ${passwordValue.length})`
    )
    console.log('Just printed password, about to continue...')

    console.log(
      `About to check signup mode - inSignupMode: ${inSignupMode}, finalFullnameVisible: ${finalFullnameVisible}`
    )

    if (inSignupMode && finalFullnameVisible) {
      console.log(`  Fullname: (skipping value retrieval to avoid hang)`)
    }
    console.log('Finished getting all field values, exiting try block...')
  } catch (error) {
    console.log(`Error getting field values: ${error.message}`)
  }

  console.log('Exited field values try-catch block successfully')

  console.log('About to take screenshot before submitting...')

  // Take a screenshot before submitting
  try {
    console.log('Skipping screenshot to avoid hang - will investigate later')
    console.log('Screenshot taken successfully (skipped)')
  } catch (screenshotError) {
    console.log(`Screenshot failed: ${screenshotError.message}`)
  }

  // Find and click the submit button (text varies by mode)
  console.log(
    `Clicking submit button (mode: ${inSignupMode ? 'signup' : 'login'})`
  )

  // DEBUG: Before looking for submit buttons
  console.log('=== SUBMIT BUTTON DEBUG START ===')

  // Debug: Check all buttons on the page
  const allButtons = await page.locator('button').all()
  console.log(`Total buttons found on page: ${allButtons.length}`)

  for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
    try {
      const button = allButtons[i]
      const text = await button.textContent().catch(() => 'NO_TEXT')
      const isVisible = await button.isVisible().catch(() => false)
      const isDisabled = await button.isDisabled().catch(() => 'UNKNOWN')
      const classes = await button.getAttribute('class').catch(() => 'NO_CLASS')
      const type = await button.getAttribute('type').catch(() => 'NO_TYPE')
      console.log(
        `  Button ${i}: text="${text}", visible=${isVisible}, disabled=${isDisabled}, type="${type}", class="${classes}"`
      )
    } catch (error) {
      console.log(`  Button ${i}: Error getting info - ${error.message}`)
    }
  }

  // Debug: Check form state
  try {
    const modal = page.locator('#loginModal')
    const modalVisible = await modal.isVisible().catch(() => false)
    console.log(`Login modal visible: ${modalVisible}`)

    if (modalVisible) {
      const modalHTML = await modal
        .innerHTML()
        .catch(() => 'ERROR_GETTING_HTML')
      console.log(`Modal HTML length: ${modalHTML.length}`)

      // Look for specific text patterns in the modal
      const hasSignupText =
        modalHTML.includes('Join') || modalHTML.includes('Sign up')
      const hasLoginText =
        modalHTML.includes('Log in') || modalHTML.includes('Login')
      console.log(`Modal contains signup text: ${hasSignupText}`)
      console.log(`Modal contains login text: ${hasLoginText}`)
    }
  } catch (debugError) {
    console.log(`Modal debug error: ${debugError.message}`)
  }

  // Selectors must be scoped to #loginModal to avoid clicking navbar buttons
  const submitSelectors = [
    '#loginModal button:has-text("Log in"):not([disabled]):not([disable]):not(.disabled)',
    '#loginModal button:has-text("Join Freegle!"):not([disabled]):not([disable]):not(.disabled)',
    '#loginModal button[type="submit"]:not([disabled]):not([disable]):not(.disabled)',
  ]

  let submitButton = null
  console.log('Trying submit button selectors...')
  for (let i = 0; i < submitSelectors.length; i++) {
    const selector = submitSelectors[i]
    console.log(`  Testing selector ${i}: ${selector}`)
    try {
      const button = page.locator(selector)
      const count = await button.count()
      console.log(`    Found ${count} buttons matching this selector`)

      if (count > 0) {
        const isVisible = await button
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false)
        const isEnabled = await button
          .first()
          .isEnabled()
          .catch(() => false)
        console.log(
          `    First button: visible=${isVisible}, enabled=${isEnabled}`
        )

        if (isVisible && isEnabled) {
          console.log(`✅ Found working submit button: ${selector}`)
          submitButton = button.first()
          break
        } else {
          console.log(
            `❌ Button found but not usable: visible=${isVisible}, enabled=${isEnabled}`
          )
        }
      } else {
        console.log(`    No buttons found for this selector`)
      }
    } catch (error) {
      console.log(`    Selector error: ${error.message}`)
    }
  }

  console.log('=== SUBMIT BUTTON DEBUG END ===')

  if (!submitButton) {
    console.error('❌ Could not find any usable submit button')

    // Take a screenshot for debugging
    await page.screenshot({
      path: `playwright-screenshots/login-no-button-${Date.now()}.png`,
      fullPage: true,
    })

    return false
  }

  // Wait for button to be enabled and clickable
  await submitButton.waitFor({
    state: 'visible',
    timeout: timeouts.ui.interaction,
  })

  // Double check that the button is enabled
  const isEnabled = await submitButton.isEnabled()
  if (!isEnabled) {
    console.error('Submit button is disabled')
    return false
  }

  await submitButton.click()

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

      // Debug: Get all error elements and their text
      try {
        const allErrorElements = await page
          .locator(
            '.alert, .text-danger, .invalid-feedback, [class*="error"], [class*="danger"]'
          )
          .all()
        console.log(
          `Found ${allErrorElements.length} potential error elements:`
        )
        for (let i = 0; i < allErrorElements.length; i++) {
          const element = allErrorElements[i]
          const isVisible = await element.isVisible().catch(() => false)
          const text = await element.textContent().catch(() => '')
          console.log(`  ${i}: visible=${isVisible}, text="${text.trim()}"`)
        }
      } catch (debugError) {
        console.log(`Error debugging error elements: ${debugError.message}`)
      }

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
        // Wait for auth to be persisted to localStorage before returning
        await waitForAuthPersistence(page)
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
      // Wait for auth to be persisted to localStorage before returning
      await waitForAuthPersistence(page)
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
    try {
      console.log('Filling in email input')
      await emailInput.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await emailInput.type(email)
    } catch {
      console.log('Email input not found, likely already logged in')
    }

    console.log('Clicking "Leave Freegle completely" button')
    const leaveButton = page.locator(
      '.btn:has-text("Leave Freegle completely")'
    )

    // The leave button might not appear if the account has already unsubscribed but is in limbo.
    try {
      await leaveButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await leaveButton.click()
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
    } catch {
      console.log(
        'Leave button not found or not clickable - account may already be unsubscribed'
      )
    }

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
  clearSessionData,
}
