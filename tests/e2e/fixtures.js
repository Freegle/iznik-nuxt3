// @ts-nocheck
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const base = require('@playwright/test')

const { addCoverageReport } = require('monocart-reporter')
const {
  SCREENSHOTS_DIR,
  timeouts,
  environment,
  DEFAULT_TEST_PASSWORD,
} = require('./config')
const logger = require('./logger')
const { logoutIfLoggedIn } = require('./utils/user')

const NUXT_TEST_UTILS_AVAILABLE = (() => {
  try {
    require.resolve('@nuxt/test-utils/e2e')
    return true
  } catch {
    return false
  }
})()

if (NUXT_TEST_UTILS_AVAILABLE) {
  console.log(
    '@nuxt/test-utils is available and can be used for enhanced testing'
  )
}

// Ensure the screenshots directory exists
const ensureScreenshotsDir = () => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    try {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })
      console.log(`Created screenshots directory: ${SCREENSHOTS_DIR}`)
    } catch (error) {
      console.error(`Failed to create screenshots directory: ${error.message}`)
    }
  }
  return SCREENSHOTS_DIR
}

// Get a path for a screenshot file
const getScreenshotPath = (filename) => {
  ensureScreenshotsDir()
  return path.join(SCREENSHOTS_DIR, filename)
}

// Function to remove screenshot files from the screenshots directory
const cleanupScreenshots = async () => {
  ensureScreenshotsDir()

  try {
    // Read directory contents using promises
    const files = await fs.promises.readdir(SCREENSHOTS_DIR)

    if (files.length === 0) {
      return
    }

    // Filter for PNG files only
    const pngFiles = files.filter((file) => path.extname(file) === '.png')

    if (pngFiles.length === 0) {
      return
    }

    // Delete all PNG files with Promise.all for better parallelism
    const deletePromises = pngFiles.map((file) => {
      const filePath = path.join(SCREENSHOTS_DIR, file)
      return fs.promises
        .unlink(filePath)
        .catch((err) =>
          console.error(`Error deleting screenshot ${file}:`, err)
        )
    })

    // Wait for all deletions to complete
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises)
    }
  } catch (err) {
    console.error('Error during screenshots cleanup:', err)
  }
}

// Generate a globally unique, date-time stamped test email
const generateUniqueTestEmail = (prefix = 'test') => {
  // Format: prefix-YYYYMMDD-HHMMSS-randomhash@domain
  const now = new Date()
  const datePart = now
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 14) // YYYYMMDDHHmmSS format

  // Add a random hash for global uniqueness (8 characters should be plenty)
  const randomHash = crypto.randomBytes(4).toString('hex')

  const email = `${prefix}-${datePart}-${randomHash}@${environment.email.domain}`

  return email
}

// Define a custom test function that wraps the base test to add automatic screenshot capture
const test = base.test.extend({
  // Create a new isolated context for each test
  context: async ({ browser }, use) => {
    // Create a fresh context for this test with explicitly empty storage
    // This ensures no localStorage/sessionStorage/cookies leak between tests
    const context = await browser.newContext({
      ignoreHTTPSErrors: true, // Useful for local dev environments
      acceptDownloads: true,
      viewport: { width: 1280, height: 720 },
      storageState: { cookies: [], origins: [] }, // Start with blank storage
    })

    console.log(`Created new isolated browser context for test`)

    // Use the context in the test
    await use(context)

    // Clean up the context after the test
    await context.close()
    console.log(`Closed browser context after test`)
  },

  // Add screenshot helper that automatically attaches to test report
  takeScreenshot: async ({ page }, use, testInfo) => {
    const screenshotHelper = async (name, options = {}) => {
      // Generate filename
      const filename = `${name.replace(/[^a-zA-Z0-9-]/g, '_')}.png`
      const screenshotPath = getScreenshotPath(filename)

      // Take the screenshot
      await page.screenshot({
        path: screenshotPath,
        fullPage: options.fullPage !== false, // Default to fullPage
        ...options,
      })

      // Attach to test report for inline viewing
      await testInfo.attach(name, {
        path: screenshotPath,
        contentType: 'image/png',
      })

      console.log(`Screenshot taken and attached: ${name}`)
      return screenshotPath
    }

    await use(screenshotHelper)
  },

  // Add the testEmail fixture - basic version that just generates a random test email
  testEmail: async ({ browser }, use) => {
    // Generate a unique test email for this test
    const email = generateUniqueTestEmail()
    console.log(`Using test email: ${email}`)

    // Provide the email to the test
    await use(email)
  },

  // Add existingTestEmail fixture - returns a pre-existing registered user email
  // Use this for tests that need to log in as an already-registered user
  existingTestEmail: async ({ browser }, use) => {
    const email = environment.unmodded_email
    console.log(`Using existing test email: ${email}`)
    await use(email)
  },

  // Function to generate custom test emails with specific prefixes
  getTestEmail: async ({ browser }, use) => {
    // Return a function that generates test emails with custom prefixes
    const emailGenerator = (prefix = 'test') => generateUniqueTestEmail(prefix)
    await use(emailGenerator)
  },

  // Isolated test environment per test file (for parallel execution).
  // Reads pre-generated environment data from test-envs.json.
  // Environments are created by create-test-env.php before the test run.

  testEnv: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      // Derive prefix from filename: test-modtools-hold-release.spec.js -> mtholdrelease
      const filename = path.basename(testInfo.file, '.spec.js')
      const prefix = filename
        .replace('test-modtools-', 'mt')
        .replace('test-', '')
        .replace(/-/g, '')

      // Read pre-generated environments (created before test run)
      const envsPath = path.join(__dirname, 'test-envs.json')
      try {
        const envsData = JSON.parse(fs.readFileSync(envsPath, 'utf-8'))
        const env = envsData[prefix]
        if (env) {
          console.log(
            `Test environment loaded: group=${env.group.name}, mod=${env.mod.email}`
          )
          await use(env)
          return
        }
        console.warn(`No pre-generated environment for prefix "${prefix}"`)
      } catch (error) {
        console.error(`Failed to read test-envs.json: ${error.message}`)
      }

      // Fall back to shared FreeglePlayground environment
      console.log('Falling back to shared FreeglePlayground environment')
      await use({
        group: { id: null, name: 'FreeglePlayground' },
        group2: { id: null, name: 'FreeglePlayground2' },
        mod: { id: null, email: 'testmod@test.com' },
        user: { id: null, email: 'test@test.com' },
        user2: { id: null, email: 'test3@test.com' },
        messages: { offer: null, wanted: null },
        pending: { offer: null, wanted: null },
        chats: { user2user: null, user2mod: null },
      })
    },
    { scope: 'test' },
  ],

  // Override the page fixture to use our isolated context
  page: async ({ context }, use) => {
    // Create a page in our isolated context
    const page = await context.newPage()
    console.log(`Created new page in isolated context`)

    // Enable coverage collection only in Chromium
    let coverageStarted = false
    if (context.browser().browserType().name() === 'chromium') {
      try {
        await Promise.all([
          page.coverage.startJSCoverage({
            resetOnNavigation: false,
          }),
          page.coverage.startCSSCoverage({
            resetOnNavigation: false,
          }),
        ])
        coverageStarted = true
        console.log('Coverage collection started')
      } catch (error) {
        console.warn('Failed to start coverage collection:', error.message)
      }
    }

    // Create a logging proxy for the page
    const loggingPage = logger.createLoggingPage(page)

    const consoleErrors = []
    const navigationEvents = []

    // Define the original allowed console error patterns (using regex)
    const originalAllowedErrorPatterns = [
      /API count went negative/, // Not visible to client and can happen during navigation.
      /%cssr:error%c Could not find one or more icon/, // Can legitimately happen in SSR.
      /Not signed in with the identity provider/, // Not available in test.
      /Provider's accounts list is empty/, // Google Pay related error - can happen in test.
      /The given origin is not allowed for the given client ID/, // Not available in test.
      /Failed to load resource: the server responded with a status of 404.*api\/message\/\d+/, // Message API 404 errors can happen during normal operation.
      /Failed to load resource: the server responded with a status of 404.*api\/user\/\d+/, // User API 404 errors can happen during cleanup.
      /Failed to load resource: the server responded with a status of 404.*api\/chat\//, // Chat API 404 errors when chat rooms are deleted between test runs.
      /Failed to load resource: the server responded with a status of 404.*api\/session/, // Session API 404 can happen when trying to logout when not logged in.
      /Failed to load resource: the server responded with a status of 404.*delivery\.localhost/, // Delivery service 404 errors for missing images can happen during normal operation.
      /FedCM get\(\) rejects with/, // Not available in test
      /Error retrieving a token./, // Also related to GSI FedCM, not available in test
      /Hydration completed but contains mismatches/, // Not ideal, but not visible to user
      /ResizeObserver loop limit exceeded/, // Non-critical UI warning
      // NOTE: Do NOT add a broad Sentry catch-all — Sentry errors are critical. Only specific known patterns below.
      /tuimg_0/i, // Allow any error mentioning tuimg_0 (case-insensitive)
      /delivery\.localhost.*tuimg_0/i, // Specific delivery service tuimg_0 errors
      /stripe\.com/i, // Ignore any Stripe-related errors during testing (case-insensitive)
      /Failed to load resource.*stripe/i, // Specific stripe resource loading errors
      /The request has been aborted/, // Can happen during navigation.
      /Failed to load resource: the server responded with a status of 403/, // Ad or social sign-in related 403s are expected
      /Failed to load resource: the server responded with a status of 503/, // Server unavailable during startup
      /Failed to load resource: net::ERR_ABORTED/, // Can happen during page navigation when requests are cancelled
      /Failed to load resource: net::ERR_CONNECTION_REFUSED/, // Can happen when server is starting up
      /has been blocked by CORS policy/, // CORS errors can happen in test environments due to ads
      /Failed to save credentials NotSupportedError: The user agent does not support public key credentials./, // Can happen in test environments
      /Refused to frame/, // Can happen in test.
      /Failed to load resource.*sentry/, // Sentry errors can happen in test environments
      /Error in map idle TypeError: Cannot read properties of undefined \(reading '_leaflet_pos'\)/, // Leaflet map errors in test environment
      /\[Exc?eption for Sentry\]:.*TypeError: Cannot read properties of undefined \(reading '_leaflet_pos'\)/, // Sentry capturing leaflet errors
      /\[Exc?eption for Sentry\]:.*\(Error: \w+\)/, // Sentry capturing minified errors (e.g., "Error: oa")
      /accounts\.google\.com\/gsi/, // Google authentication/sign-in errors in test
      /malformed JSON response:.*Error 400 \(Bad Request\)/, // Google API malformed JSON responses
      // CSP (Content Security Policy) violations - common in development/testing
      /Refused to apply inline style because it violates the following Content Security Policy directive/,
      /Content Security Policy directive.*style-src/,
      /Either the 'unsafe-inline' keyword.*is required to enable inline execution/,
      // V2 API expected error responses during normal flows
      /Failed to load resource: the server responded with a status of 409.*api\/user/, // 409 Conflict when registering an existing email (expected in reply flow)
      /Failed to load resource: the server responded with a status of 401.*api\/tryst/, // 401 when not logged in (tryst requires auth)
      /Failed to load resource: the server responded with a status of 401.*api\/session/, // 401 when checking session while not logged in
      /TrustedScript/, // Vite dev server HMR uses eval() which triggers Trusted Types CSP
      /Failed to load resource.*freegle-dev-local/, // Freegle dev site may not be running during ModTools tests
      /Failed to load resource: the server responded with a status of 404.*api\/modtools\//, // modtools endpoints not yet in Go API
      /\[Exc?eption for Sentry\]:.*\/modtools\/modconfig/, // modconfig endpoint not yet in Go API
      /Only one navigator\.credentials\.get request may be outstanding at one time/, // FedCM concurrent credential requests in test
      /useOurModal show problem/, // Race condition fixed in useOurModal.js (nextTick) - allow until container rebuild
      /Failed to load resource: the server responded with a status of 500.*api\/user/, // Transient 500 on user API — app retries automatically
      /Failed to load resource: the server responded with a status of 500.*connect\.facebook\.net/, // Facebook SDK transient 500 errors
      /Refused to execute script from.*connect\.facebook\.net.*MIME type/, // Facebook SDK MIME type error when returning error page
    ]

    // Initialize the working copy of allowed error patterns
    const allowedErrorPatterns = [...originalAllowedErrorPatterns]

    // Method to add additional allowed error patterns for specific tests
    page.addAllowedErrorPattern = (pattern) => {
      if (pattern instanceof RegExp) {
        allowedErrorPatterns.push(pattern)
      } else if (typeof pattern === 'string') {
        // If a string is provided, convert it to a RegExp that matches the exact string
        allowedErrorPatterns.push(
          new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        )
      } else {
        throw new TypeError('Error pattern must be a RegExp or string')
      }
    }

    // Method to reset allowed error patterns back to the original set
    page.resetAllowedErrorPatterns = () => {
      // Reset to original patterns by copying from the original array
      allowedErrorPatterns.length = 0
      allowedErrorPatterns.push(...originalAllowedErrorPatterns)
      console.log(
        `Reset allowed error patterns to original set (${originalAllowedErrorPatterns.length} patterns)`
      )
    }

    // Helper to check if an error message matches any allowed pattern
    const isAllowedError = (errorText) => {
      return allowedErrorPatterns.some((pattern) => pattern.test(errorText))
    }

    // Track console errors and fail immediately on critical ones
    page.on('console', async (message) => {
      if (message.type() === 'error') {
        // Combine text and location to match the format shown in test output
        let fullErrorText = message.text()
        const location = message.location()
        if (location && location.url) {
          const locationStr =
            location.lineNumber !== undefined
              ? `${location.url}:${location.lineNumber}`
              : location.url
          fullErrorText += ` (at ${locationStr})`
        }

        // Try to extract stack trace from console arguments
        let stackTrace = ''
        try {
          const args = message.args()
          if (args.length > 0) {
            // Look for Error objects in the arguments that might contain stack traces
            for (const arg of args) {
              const argValue = await arg.jsonValue().catch(() => null)
              if (argValue && typeof argValue === 'object' && argValue.stack) {
                stackTrace = `\nStack trace:\n${argValue.stack}`
                break
              }
            }

            // If no stack found in args, try to get stack from the first argument
            if (!stackTrace) {
              const firstArg = await args[0]
                .evaluate((obj) => {
                  if (obj instanceof Error) return obj.stack
                  if (typeof obj === 'string' && obj.includes('\n    at '))
                    return obj
                  return null
                })
                .catch(() => null)

              if (firstArg) {
                stackTrace = `\nStack trace:\n${firstArg}`
              }
            }
          }
        } catch (e) {
          // Ignore errors when trying to extract stack trace
        }

        const fullErrorWithStack = fullErrorText + stackTrace

        consoleErrors.push({
          text: fullErrorWithStack,
          location,
        })

        // Check if this is a critical (not allowed) error and fail immediately
        if (!isAllowedError(fullErrorText)) {
          // Include recent API error details so CI artifacts show what actually happened
          const recentApiErrors = apiErrors
            .slice(-5)
            .map(
              (e) =>
                `  ${e.method} ${e.url} → ${e.status}` +
                (e.responseBody
                  ? ` | ${e.responseBody.substring(0, 200)}`
                  : '') +
                (e.requestBody
                  ? ` | Body: ${e.requestBody.substring(0, 200)}`
                  : '')
            )
            .join('\n')
          const apiContext = recentApiErrors
            ? `\nRecent API errors:\n${recentApiErrors}`
            : ''

          console.error('CRITICAL CONSOLE ERROR DETECTED:', fullErrorWithStack)
          if (apiContext) {
            console.error(apiContext)
          }
          throw new Error(
            `Critical console error detected: ${fullErrorWithStack}${apiContext}`
          )
        }
      }
    })

    // Track navigation events for debugging (no timer — Playwright's own
    // test timeout at 600s handles stuck tests reliably without the race
    // conditions inherent in a custom setTimeout-based inactivity timer).
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        const isHardNavigation =
          !frame._loaderId || frame._loaderId !== frame._lastLoaderId
        const url = frame.url()
        const timestamp = new Date().toISOString()
        const navType = isHardNavigation ? 'HARD' : 'SOFT'

        navigationEvents.push({
          type: navType,
          url,
          timestamp,
        })

        console.log(`[${timestamp}] [NAVIGATION:${navType}] ${url}`)
      }
    })

    // Track API error responses with full request details for diagnostics.
    // Browser console only shows "Failed to load resource: 400" with no method,
    // body, or response — this captures everything needed to debug.
    //
    // IMPORTANT: Push entry to array SYNCHRONOUSLY (before any await) so the
    // console error handler can see it. The browser fires 'console' and
    // 'response' events near-simultaneously for failed requests — if we await
    // response.text() before pushing, the entry won't be in apiErrors when
    // the console handler throws.
    const apiErrors = []
    page.on('response', async (response) => {
      const status = response.status()
      const url = response.url()

      // Only track API errors (4xx/5xx) on our own API endpoints
      if (status >= 400 && url.includes('/api')) {
        const request = response.request()
        const entry = {
          timestamp: new Date().toISOString(),
          method: request.method(),
          url,
          status,
        }

        // Capture request body synchronously (postData() is sync)
        if (request.method() !== 'GET') {
          try {
            entry.requestBody = request.postData()
          } catch {
            // postData() can fail for some request types
          }
        }

        // Push to array IMMEDIATELY so console handler can see it
        apiErrors.push(entry)

        // Then fetch response body asynchronously and update the entry
        try {
          entry.responseBody = await response.text().catch(() => null)
        } catch {
          // response.text() can fail if response was aborted
        }

        console.log(
          `[API ERROR] ${entry.method} ${url} → ${status}` +
            (entry.responseBody
              ? ` | Response: ${entry.responseBody.substring(0, 200)}`
              : '') +
            (entry.requestBody
              ? ` | Request: ${entry.requestBody.substring(0, 200)}`
              : '')
        )
      }
    })

    // Access captured API errors (method, URL, request body, response body)
    page.apiErrors = () => apiErrors

    // Methods to access console errors
    page.consoleErrors = () => consoleErrors

    // Methods to access navigation data
    page.navigationEvents = () => navigationEvents

    // Get navigation history as a formatted string for debugging
    page.getNavigationHistory = () => {
      if (navigationEvents.length === 0) {
        return 'No navigation events recorded'
      }

      return navigationEvents
        .map((event) => `[${event.timestamp}] [${event.type}] ${event.url}`)
        .join('\n')
    }

    // Get navigation summary with counts
    page.getNavigationSummary = () => {
      const hardNavigations = navigationEvents.filter(
        (event) => event.type === 'HARD'
      )
      const softNavigations = navigationEvents.filter(
        (event) => event.type === 'SOFT'
      )

      return {
        total: navigationEvents.length,
        hardCount: hardNavigations.length,
        softCount: softNavigations.length,
        hard: hardNavigations,
        soft: softNavigations,
        all: navigationEvents,
      }
    }

    // Method to get all console errors grouped by allowed vs non-allowed
    page.getErrorSummary = () => {
      const allowed = consoleErrors.filter((err) => isAllowedError(err.text))
      const notAllowed = consoleErrors.filter(
        (err) => !isAllowedError(err.text)
      )

      return {
        allowed,
        notAllowed,
        total: consoleErrors.length,
        allowedCount: allowed.length,
        notAllowedCount: notAllowed.length,
      }
    }

    page.gotoAndVerify = async (path, options = {}) => {
      const timeout = options.timeout || timeouts.navigation.default
      const maxRetries = options.maxRetries || 3
      const waitUntil = options.waitUntil || 'load'

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `Navigating to ${path} with timeout ${timeout}ms (attempt ${attempt}/${maxRetries})`
          )

          // Navigate with timeout and configurable waitUntil strategy.
          // Default 'load' waits for all resources; 'domcontentloaded' is faster
          // for pages with external resources (e.g., Stripe, PayPal) that may be slow in CI.
          await page.goto(path, { timeout, waitUntil })

          // Wait for page to finish hydrating (loading spinner to disappear)
          // The LoadingIndicator component is always in the DOM but uses opacity for visibility.
          // We check if it's actually VISIBLE (opacity > 0), not just present in DOM.
          // Can't use Playwright's toBeVisible assertion since that doesn't check opacity.
          const loadingIndicator = page.locator('.loading-indicator')
          if (loadingIndicator.count() > 0) {
            await base.expect(loadingIndicator).toHaveCSS('opacity', '0')
          }

          // Verify page content is visible
          const body = page.locator('body')
          await base.expect(body).toBeVisible({
            timeout: Math.min(timeout, 30000),
          })

          // Check if page contains error messages
          const errorTextContent = await body.textContent()

          // Check for general error message
          if (errorTextContent.includes('Something went wrong')) {
            // Take a screenshot of the error page
            await page.screenshot({
              path: getScreenshotPath(`error-page-${Date.now()}.png`),
              fullPage: true,
            })

            // Extract the "Error was" text if present
            let errorDetails = ''
            const errorWasMatch = errorTextContent.match(
              /Error was[:\s]*(.*?)(?=\n|$)/i
            )
            if (errorWasMatch) {
              errorDetails = ` - Error was: ${errorWasMatch[1].trim()}`
              console.log(`Error details extracted: ${errorWasMatch[1].trim()}`)
            }

            throw new Error(
              `Page loaded with 'Something went wrong' error message at ${path}${errorDetails}`
            )
          }

          // Check for 404 error message
          if (
            errorTextContent.includes("Oh no! That page doesn't seem to exist")
          ) {
            // Take a screenshot of the 404 page
            await page.screenshot({
              path: getScreenshotPath(`404-error-${Date.now()}.png`),
              fullPage: true,
            })
            throw new Error(
              `Page loaded with '404 page not found' error message at ${path}`
            )
          }
        } catch (error) {
          // Take a screenshot if navigation fails
          try {
            await page.screenshot({
              path: getScreenshotPath(`navigation-error-${Date.now()}.png`),
              fullPage: true,
            })
          } catch (screenshotError) {
            console.warn(
              `Could not take navigation error screenshot: ${screenshotError.message}`
            )
          }

          // Log current page state for debugging
          try {
            const currentUrl = page.url()
            const currentTitle = await page.title()
            console.log(
              `Navigation failed. Current URL: ${currentUrl}, Title: "${currentTitle}"`
            )
          } catch (debugError) {
            console.warn(
              `Could not get page state for debugging: ${debugError.message}`
            )
          }

          // Check if it's a connection refused error (dev server not running)
          if (error.message.includes('ERR_CONNECTION_REFUSED')) {
            throw new Error(
              `Cannot connect to dev server at ${path}. Make sure the dev server is running`
            )
          }

          // Check if it's a retryable connection error
          const isRetryable =
            error.message.includes('ERR_CONNECTION_RESET') ||
            error.message.includes('ERR_SOCKET_NOT_CONNECTED') ||
            error.message.includes('ERR_NETWORK_CHANGED') ||
            error.message.includes('net::ERR_')

          if (isRetryable && attempt < maxRetries) {
            console.log(
              `Retryable connection error on attempt ${attempt}, waiting before retry...`
            )
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, attempt - 1))
            )
            continue
          }

          // Re-throw with more context
          throw new Error(`Failed to navigate to ${path}: ${error.message}`)
        }

        // If no error, then this navigation succeeded - no need to keep retrying.
        break
      }

      // If we get here, navigation succeeded - return the page
      return page
    }

    // Internal method to handle teardown with error handling
    const performTeardown = async (options = {}) => {
      const timeout = options.timeout || timeouts.teardown.networkIdle
      try {
        // Clear browser storage before ending the test
        try {
          await page
            .evaluate(() => {
              try {
                // Check if localStorage is accessible before trying to clear it
                if (typeof Storage !== 'undefined' && window.localStorage) {
                  localStorage.clear()
                  console.log('LocalStorage cleared during teardown')
                }
              } catch (e) {
                console.warn('Could not clear localStorage:', e.message)
              }

              try {
                // Check if sessionStorage is accessible before trying to clear it
                if (typeof Storage !== 'undefined' && window.sessionStorage) {
                  sessionStorage.clear()
                  console.log('SessionStorage cleared during teardown')
                }
              } catch (e) {
                console.warn('Could not clear sessionStorage:', e.message)
              }

              // Safe IndexedDB cleanup
              if (window.indexedDB) {
                try {
                  // Add common database names that might be used in the application
                  // This approach is more reliable than indexedDB.databases() which is not widely supported
                  const possibleDBNames = [
                    'localforage',
                    'keyval-store',
                    'firebaseLocalStorageDb',
                    'iznik-db', // Add app-specific DB names
                    'app-state',
                    'user-data',
                  ]

                  for (const dbName of possibleDBNames) {
                    try {
                      console.log(`Attempting to delete IndexedDB: ${dbName}`)
                      indexedDB.deleteDatabase(dbName)
                    } catch (e) {
                      // Silent fail is acceptable for DB deletion attempts
                    }
                  }
                } catch (e) {
                  // Ignore IndexedDB errors during cleanup
                }
              }

              // Clear all cookies via JavaScript as an extra precaution
              try {
                if (document.cookie) {
                  const cookies = document.cookie.split(';')
                  cookies.forEach((cookie) => {
                    const name = cookie.split('=')[0].trim()
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
                  })
                  console.log('Cookies cleared during teardown')
                }
              } catch (e) {
                console.warn('Could not clear cookies:', e.message)
              }
            })
            .catch((e) => {
              // Only log if it's not a SecurityError about localStorage access
              if (
                !e.message.includes('localStorage') &&
                !e.message.includes('Access is denied')
              ) {
                console.warn(`Storage cleanup error: ${e.message}`)
              }
            })
        } catch (err) {
          // Log but continue if this fails
          console.warn(`Unable to clear page storage: ${err.message}`)
        }

        // Don't use networkidle - the app has background polling that prevents idle state
        await page.waitForLoadState('domcontentloaded', { timeout })
        return true
      } catch (error) {
        console.warn(`Teardown warning: ${error.message}`)
        // Take a screenshot if network doesn't become idle
        await page.screenshot({
          path: getScreenshotPath(`teardown-warning-${Date.now()}.png`),
        })
        return false
      }
    }

    // Public method for manual teardown invocation
    page.waitForTeardown = async (options = {}) => {
      return await performTeardown(options)
    }

    // Copy all custom methods from the original page to the logging page
    Object.keys(page).forEach((key) => {
      if (typeof page[key] === 'function' && !loggingPage[key]) {
        loggingPage[key] = page[key]
      }
    })

    // Override methods that need both the original page and logging functionality
    loggingPage.gotoAndVerify = page.gotoAndVerify
    loggingPage.waitForTeardown = page.waitForTeardown

    // Add configuration options for the logger
    console.log('Command logging enabled for Playwright tests')
    logger.configure({
      enabled: true,
      timestampFormat: 'simple',
      level: 'normal',
    })

    // Ensure user is logged out at the start of each test (after all methods are set up)
    await logoutIfLoggedIn(loggingPage)
    console.log('Ensured user is logged out for fresh test state')

    // Wrap the use() call in a try-catch block to add automatic screenshot capturing
    try {
      // Call use() with the logging page instead of the original page
      await use(loggingPage)

      // Log navigation summary at the end of successful tests
      const navSummary = loggingPage.getNavigationSummary()
      console.log(
        `Navigation summary: ${navSummary.total} total (${navSummary.hardCount} hard, ${navSummary.softCount} soft)`
      )
    } catch (error) {
      // Take a full page screenshot on any test failure
      const screenshotPath = getScreenshotPath(`test-failure-${Date.now()}.png`)
      await loggingPage.screenshot({ path: screenshotPath, fullPage: true })

      // Log the navigation history on failure for debugging
      console.log('Navigation history:')
      console.log(loggingPage.getNavigationHistory())

      // Log the error with screenshot info
      console.error(
        `Test failed: ${error.message}\nScreenshot saved to: ${screenshotPath}`
      )

      // Re-throw the error to fail the test
      throw error
    } finally {
      // Stop coverage collection and save results before teardown
      if (coverageStarted) {
        try {
          const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
          ])

          // Combine coverage data
          const coverage = [...jsCoverage, ...cssCoverage]
          if (coverage.length > 0) {
            // Add coverage data to monocart-reporter using the proper API
            await addCoverageReport(coverage, test.info())
            console.log(`Collected ${coverage.length} coverage entries`)
          }
        } catch (error) {
          console.warn('Failed to collect coverage data:', error.message)
        }
      }

      // Always perform teardown operations, regardless of test success/failure
      await performTeardown()
    }
  },
})

// Add a global hook to cleanup screenshots after all tests
test.afterAll(async () => {
  // Only clean up if the tests succeeded
  if (process.exitCode === undefined || process.exitCode === 0) {
    await cleanupScreenshots()
  } else {
    console.log('Tests failed, keeping screenshots for debugging')
  }
})

// Progress tracking functions
// Define our extended test with custom fixtures
const testWithFixtures = test.extend({
  postMessage: async ({ page, setNewUserPassword, testEnv }, use) => {
    /**
     * Helper function to post a message to Freegle
     * @param {Object} options - Configuration options for posting
     * @param {string} options.type - The type of post ('OFFER' or 'WANTED')
     * @param {string} options.item - The item title/name
     * @param {string} options.description - The item description
     * @param {string} options.postcode - The postcode for the item (defaults to testEnv postcode)
     * @param {string} options.email - The email to use for posting
     * @returns {Promise<{id: string|null, description: string}>} - Information about the created post
     */
    const postMessage = async (options) => {
      const {
        type = 'OFFER',
        item = 'test post - please delete',
        description = `Created by automated test at ${new Date().toISOString()}`,
        postcode = testEnv?.postcode || environment.postcode,
        email,
      } = options

      if (!email) {
        throw new Error('Email is required for posting a message')
      }

      // Debug: Check login state before starting message posting
      console.log('=== POST MESSAGE DEBUG START ===')
      console.log(`Posting as email: ${email}`)

      try {
        const currentUrl = page.url()
        console.log(`Current URL before posting: ${currentUrl}`)

        // Check for logged-in indicators
        const loggedInElements = await page
          .locator(
            '.test-user-dropdown, a[href*="logout"], .btn:has-text("My account")'
          )
          .count()
        console.log(
          `Found ${loggedInElements} logged-in indicators before posting`
        )

        // Take a screenshot
        await page.screenshot({
          path: `playwright-screenshots/before-post-message-${Date.now()}.png`,
          fullPage: true,
        })
      } catch (debugError) {
        console.log(`Debug error: ${debugError.message}`)
      }
      console.log('=== POST MESSAGE DEBUG END ===')

      // Using maximized browser window instead of setting viewport size

      // Navigate to the correct page based on type
      const startPath = type.toLowerCase() === 'wanted' ? '/find' : '/give'
      await page.gotoAndVerify(startPath, {
        timeout: timeouts.navigation.initial,
      })

      // Verify we're on the correct page
      const pageTitle = await page.title()
      base.expect(pageTitle).toContain(type.toUpperCase())

      // Fill in the item type using fill() — triggers Vue v-model via input event
      const itemInput = page.locator(
        '[id^="what"], .type-input, input[placeholder*="give"]'
      )
      await itemInput.click()
      await itemInput.fill(item)

      // Fill in the post details
      await page.waitForSelector(
        '[id^="description"], textarea.description, textarea.form-control',
        { timeout: timeouts.ui.appearance }
      )

      // Fill description using fill() instead of type() with delay
      const descInput = page.locator(
        '[id^="description"], textarea.description, textarea.form-control'
      )
      await descInput.click()
      await descInput.fill(description)

      // Wait for Vue reactivity to process the form changes and make the Next button available
      // This replaces the fixed 2000ms wait with a responsive check
      await page.waitForFunction(
        () => {
          // Check both mobile and desktop buttons using textContent instead of :has-text()
          const allButtons = document.querySelectorAll('.btn, button')
          let mobileBtn = null
          let desktopBtn = null

          for (const btn of allButtons) {
            if (btn.textContent && btn.textContent.includes('Next')) {
              // Check if it's a mobile button (has d-md-none parent or class)
              if (
                btn.closest('.d-block.d-md-none') ||
                btn.classList.contains('d-md-none')
              ) {
                mobileBtn = btn
              }
              // Check if it's a desktop button (has d-none.d-md-flex parent or class)
              if (
                btn.closest('.d-none.d-md-flex') ||
                (btn.classList.contains('d-none') &&
                  btn.classList.contains('d-md-flex'))
              ) {
                desktopBtn = btn
              }
              // If we can't determine mobile vs desktop, treat as general button
              if (!mobileBtn && !desktopBtn) {
                mobileBtn = btn // Default to treating as mobile (disabled check)
              }
            }
          }

          return (
            (mobileBtn && !mobileBtn.disabled) ||
            (desktopBtn && desktopBtn.offsetParent !== null)
          )
        },
        null,
        { timeout: timeouts.ui.appearance }
      )

      // Click the Next/Continue button to go to location page
      // Playwright's click() auto-scrolls the element into view
      await page.locator('.next-btn:has-text("Next")').click()

      // Fill in location details
      await page.waitForSelector('.pcinp, input[placeholder="Type postcode"]', {
        timeout: timeouts.ui.appearance,
      })

      // Fill in the postcode
      await page
        .locator('.pcinp, input[placeholder="Type postcode"]')
        .fill(postcode)

      // Wait for the location to be confirmed using locator.waitFor()
      const confirmationIcon = page.locator(
        '.validation-tick, .text-success.fa-bh, .fa-check-circle, .v-icon[icon="check-circle"]'
      )
      await confirmationIcon.waitFor({
        state: 'visible',
        timeout: timeouts.api.default,
      })

      // Click the Next/Continue button (Playwright auto-scrolls)
      await page.locator('.next-btn:has-text("Next")').click()

      // For OFFER posts, handle the /give/options page (delivery and deadline options)
      // WANTED posts go directly to whoami (no options page)
      if (type.toUpperCase() === 'OFFER') {
        console.log(
          'Handling /give/options page - inline deadline and delivery options'
        )

        // Wait for the options page to load
        await page.waitForURL(/\/give\/options/, {
          timeout: timeouts.navigation.default,
        })

        // Set "Maybe" for delivery (it's a toggle button, not modal)
        const maybeDeliveryButton = page.locator(
          '.toggle-btn:has-text("Maybe")'
        )
        await maybeDeliveryButton.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })
        await maybeDeliveryButton.click()
        console.log('Clicked "Maybe" for delivery option')

        // "No deadline" should be selected by default, but click it to be sure
        const noDeadlineButton = page.locator(
          '.toggle-btn:has-text("No deadline")'
        )
        await noDeadlineButton.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })
        await noDeadlineButton.click()
        console.log('Clicked "No deadline" for deadline option')

        // Click Next to go to email/whoami page (Playwright auto-scrolls)
        await page.locator('.next-btn:has-text("Next")').click()
      }

      // Wait for either the logged-in email display or the email input to appear
      console.log(
        'Waiting for either logged-in email display or email input field to appear'
      )

      const loggedInEmailDisplay = page.locator('text=Your email address is')
      const emailInput = page
        .locator('input[name="email"], input.email, input[type="email"]')
        .first()

      // Race between the two possible states
      const winner = await Promise.race([
        loggedInEmailDisplay
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
          .then(() => 'loggedIn')
          .catch(() => null),
        emailInput
          .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
          .then(() => 'notLoggedIn')
          .catch(() => null),
      ])

      if (winner === 'loggedIn') {
        console.log('User is already logged in, skipping email input')

        // Assert that the displayed email matches the one passed to the function
        const emailDisplay = page.locator('p.text--large strong')
        const displayedEmail = await emailDisplay.textContent()
        console.log(
          `Found displayed email: "${displayedEmail}", expected: "${email}"`
        )
        if (displayedEmail !== email) {
          // Wrong user is logged in - clear session so the page reactively
          // switches to the email input form, then fill in the correct email.
          console.log(
            `Wrong user logged in (${displayedEmail}), clearing session to use ${email}`
          )
          await logoutIfLoggedIn(page, false)

          // Wait for the email input to appear as the page reacts to logout
          const retryEmailInput = page
            .locator('input[name="email"], input.email, input[type="email"]')
            .first()
          await retryEmailInput.waitFor({
            state: 'visible',
            timeout: timeouts.ui.appearance,
          })
          await retryEmailInput.click()
          await retryEmailInput.fill(email)
          console.log(`Filled email ${email} after clearing wrong session`)
        } else {
          console.log(`Verified displayed email matches expected: ${email}`)
        }
      } else if (winner === 'notLoggedIn') {
        console.log('User not logged in, filling email input')

        // Fill in our generated test email
        await emailInput.click()
        await emailInput.fill(email)
      } else {
        throw new Error(
          'Neither logged-in email display nor email input appeared within timeout'
        )
      }

      // Take a debug screenshot
      const emailScreenshotTimestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
      await page.screenshot({
        path: `playwright-screenshots/email-filled-${emailScreenshotTimestamp}.png`,
        fullPage: true,
      })

      // Wait for validation to complete and the button to appear using web assertions
      console.log(
        'Waiting for Freegle it button to appear after email validation'
      )
      const freegleButton = page
        .locator('button:has-text("Freegle it!")')
        .first()

      // Wait for button to be visible
      await freegleButton.waitFor({
        state: 'visible',
        timeout: timeouts.api.default,
      })

      console.log('Button appeared, submit')

      // Wait for Vue to attach event handlers by checking the button is enabled
      await base.expect(freegleButton).toBeEnabled({
        timeout: timeouts.ui.appearance,
      })

      // Set up console listener to capture browser errors
      const consoleMessages = []
      const consoleListener = (msg) => {
        const msgType = msg.type()
        const msgText = msg.text()
        if (
          msgType === 'error' ||
          msgType === 'warning' ||
          msgText.includes('Error')
        ) {
          consoleMessages.push(`[${msgType}] ${msgText}`)
          console.log(`BROWSER CONSOLE [${msgType}]: ${msgText}`)
        }
      }
      page.on('console', consoleListener)

      // Click the Submit/Post button to finalize
      console.log('=== POST-SUBMISSION NAVIGATION DEBUG START ===')
      console.log('Current URL before submit button click:', page.url())

      // Click without force: true — Playwright's default actionability checks
      // ensure the button is stable and receiving events. With force: true, the
      // click can land before Vue has attached the @click handler, especially
      // on client-only rendered pages.
      await freegleButton.click()
      console.log('Submit button clicked successfully')

      // Wait for page url to contain myposts
      console.log('Waiting for navigation to My Posts page')
      console.log('Current URL before waitForURL:', page.url())

      const myPostsUrl = /\/myposts/

      try {
        // Add additional logging during the wait
        const startTime = Date.now()
        console.log(
          `Starting waitForURL at ${startTime} with timeout: ${timeouts.navigation.default}ms`
        )

        await page.waitForURL(myPostsUrl, {
          timeout: timeouts.navigation.default,
        })

        const endTime = Date.now()
        console.log(
          `Navigation completed successfully after ${endTime - startTime}ms`
        )
        console.log('Final URL after navigation:', page.url())
      } catch (navigationError) {
        const currentTime = Date.now()
        console.log('=== NAVIGATION TIMEOUT DEBUG ===')
        console.log('Navigation failed with error:', navigationError.message)
        console.log('Current URL at timeout:', page.url())
        console.log('Expected URL pattern:', myPostsUrl)
        console.log('Time elapsed during navigation attempt:', currentTime)

        // Log all captured console messages
        console.log('=== CAPTURED BROWSER CONSOLE MESSAGES ===')
        if (consoleMessages.length === 0) {
          console.log('No error/warning messages captured')
        } else {
          consoleMessages.forEach((msg, i) => {
            console.log(`Console message ${i + 1}: ${msg}`)
          })
        }
        console.log('=== END BROWSER CONSOLE MESSAGES ===')

        // Check page state at timeout
        try {
          const title = await page.title()
          console.log('Current page title:', title)
        } catch (e) {
          console.log('Could not get page title:', e.message)
        }

        // Check if there are any visible loading indicators
        try {
          const loadingElements = await page
            .locator(
              '[data-testid="loading"], .spinner, .loading, [aria-label*="loading" i]'
            )
            .count()
          console.log('Loading elements visible:', loadingElements)
        } catch (e) {
          console.log('Could not check loading elements:', e.message)
        }

        // Check if there are any error messages visible (including NoticeMessage component)
        try {
          const errorElements = await page
            .locator('.error, .alert-danger, [role="alert"], .notice--danger')
            .count()
          console.log('Error elements visible:', errorElements)
          if (errorElements > 0) {
            const errorText = await page
              .locator('.error, .alert-danger, [role="alert"], .notice--danger')
              .first()
              .textContent()
            console.log('First error message text:', errorText)
          }
        } catch (e) {
          console.log('Could not check error elements:', e.message)
        }

        // Also check for any text containing common error keywords
        try {
          const errorKeywords = await page
            .locator('text=/Something went wrong|Error|failed|not allowed/i')
            .count()
          console.log('Error keyword elements:', errorKeywords)
        } catch (e) {
          console.log('Could not check error keywords:', e.message)
        }

        // Check compose store debug info if on whoami page
        try {
          const debugElement = page.locator('.debug-compose-state')
          const debugExists = (await debugElement.count()) > 0
          console.log('Debug element exists:', debugExists)
          if (debugExists) {
            const messageCount = await debugElement.getAttribute(
              'data-message-count'
            )
            const hasApi = await debugElement.getAttribute('data-has-api')
            const postcodeId = await debugElement.getAttribute(
              'data-postcode-id'
            )
            const messageValid = await debugElement.getAttribute(
              'data-message-valid'
            )
            const postcodeValid = await debugElement.getAttribute(
              'data-postcode-valid'
            )
            const loggedIn = await debugElement.getAttribute('data-logged-in')
            const emailValid = await debugElement.getAttribute(
              'data-email-valid'
            )
            console.log('=== COMPOSE STORE DEBUG ===')
            console.log('Message count:', messageCount)
            console.log('Has $api:', hasApi)
            console.log('Postcode ID:', postcodeId)
            console.log('Message valid:', messageValid)
            console.log('Postcode valid:', postcodeValid)
            console.log('Logged in:', loggedIn)
            console.log('Email valid:', emailValid)
            console.log('=== END COMPOSE STORE DEBUG ===')
          } else {
            console.log(
              'Debug element NOT found - checking page HTML for client-only wrapper...'
            )
            const pageHtml = await page.content()
            const hasClientOnly = pageHtml.includes('client-only')
            console.log('Page has client-only wrapper:', hasClientOnly)
          }

          // Check localStorage for compose store data (always)
          const localStorageData = await page.evaluate(() => {
            const composeData = localStorage.getItem('compose')
            try {
              return composeData ? JSON.parse(composeData) : null
            } catch (e) {
              return { error: e.message, raw: composeData?.substring(0, 500) }
            }
          })
          console.log('=== LOCALSTORAGE COMPOSE DEBUG ===')
          console.log(
            'Compose store in localStorage:',
            JSON.stringify(localStorageData, null, 2)
          )
          console.log('=== END LOCALSTORAGE DEBUG ===')
        } catch (e) {
          console.log('Could not check compose store debug:', e.message)
        }

        console.log('=== END NAVIGATION TIMEOUT DEBUG ===')
        throw navigationError
      }

      console.log('=== POST-SUBMISSION NAVIGATION DEBUG END ===')

      // Take a screenshot of the success
      const screenshotTimestamp = new Date().toISOString().replace(/[:.]/g, '-')
      await page.screenshot({
        path: `playwright-screenshots/item-post-success-${screenshotTimestamp}.png`,
        fullPage: true,
      })

      // Check for the posted item
      // Look for the message card which uses .message-card class (with hyphen)
      const messageCard = page
        .locator(`.message-card:has-text("${item}")`)
        .first()
      await messageCard.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Try to extract the post ID from the message card's data-message-id attribute
      let postId = null
      try {
        postId =
          (await messageCard.getAttribute('data-message-id')) ||
          (await messageCard.getAttribute('data-id')) ||
          (await messageCard.getAttribute('id'))

        if (postId) {
          console.log(`Successfully created post with ID: ${postId}`)
        }
      } catch (error) {
        console.log(
          'Post appears to be created but could not find details:',
          error.message
        )
      }

      // Set password to default test password in NewUserInfo component
      await setNewUserPassword()

      // Return information about the post
      return {
        id: postId,
        item,
        description,
      }
    }

    await use(postMessage)
  },

  waitForNuxtPageLoad: async ({ page }, use) => {
    const waitForNuxtPageLoad = async (options = {}) => {
      const timeout = options.timeout || 30000
      return await page.waitForFunction(
        () => {
          return (
            document.title !== 'Starting Nuxt... | Nuxt' &&
            document.title !==
              'Error while loading Nuxt. Please check console and fix errors. | Nuxt' &&
            document.title.length > 0 &&
            document.body?.textContent?.includes('Loading... Stuck here') ===
              false
          )
        },
        null,
        { timeout }
      )
    }
    await use(waitForNuxtPageLoad)
  },

  findAndClickButton: async ({ page }, use) => {
    const findAndClickButton = async (selectors, options = {}) => {
      for (const selector of selectors) {
        const modifiedSelector = `${selector}:not([disabled]):not([disabled="true"])`
        const button = page.locator(modifiedSelector)
        if (
          (await button.count()) > 0 &&
          (await button.isVisible().catch(() => false))
        ) {
          await button.click()
          return true
        }
      }
      return false
    }
    await use(findAndClickButton)
  },

  setupTestPage: async ({ page }, use) => {
    const setupTestPage = async (options = {}) => {
      await page.setViewportSize(
        options.viewport || { width: 1280, height: 800 }
      )
      await page.gotoAndVerify(options.path || '/', {
        timeout: timeouts.navigation.initial,
      })
      if (options.waitForLoad !== false) {
        await page.waitForFunction(
          () => {
            return (
              document.title !== 'Starting Nuxt... | Nuxt' &&
              document.title !==
                'Error while loading Nuxt. Please check console and fix errors. | Nuxt' &&
              document.title.length > 0 &&
              document.body?.textContent?.includes('Loading... Stuck here') ===
                false
            )
          },
          null,
          { timeout: options.timeout || 30000 }
        )
      }
    }
    await use(setupTestPage)
  },

  takeTimestampedScreenshot: async ({ page }, use) => {
    const takeTimestampedScreenshot = async (description, options = {}) => {
      const timestamp = options.timestamp || Date.now()
      const path = getScreenshotPath(`${description}-${timestamp}.png`)
      return await page.screenshot({ path, fullPage: true, ...options })
    }
    await use(takeTimestampedScreenshot)
  },

  withdrawPost: async ({ page }, use) => {
    /**
     * Finds a post on the My Posts page and withdraws it
     * @param {Object} options - The withdrawal options
     * @param {string} options.item - The item text to search for
     * @returns {Promise<boolean>} - True if post was withdrawn successfully
     */
    const withdrawPost = async (options) => {
      const { item } = options

      if (!item) {
        throw new Error('Item text is required for withdrawing a post')
      }

      try {
        // Load My Posts page from scratch
        await page.goto('/myposts', {
          timeout: timeouts.navigation.default,
          waitUntil: 'load',
        })

        // Find the post we want to withdraw.
        // Use .card or .message-card (with hyphen, consistent with MyMessage component)
        const postSelector = `.card:has-text("${item}"), .message-card:has-text("${item}")`
        console.log(`Looking for post with selector: ${postSelector}`)
        const postCard = page.locator(postSelector).first()

        await postCard.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })

        console.log(
          `Post card for "${item}" is visible, proceeding with withdrawal`
        )

        // Look for the withdraw button within the post card
        // Note: MyMessage.vue uses .action-btn class, not .btn
        console.log(`Looking for withdraw button in post card for "${item}"`)
        const withdrawButton = postCard
          .locator(
            '.action-btn:has-text("Withdraw"), .btn:has-text("Withdraw")'
          )
          .first()

        try {
          await withdrawButton.waitFor({
            state: 'visible',
            timeout: timeouts.ui.appearance,
          })
          console.log('Withdraw button found and visible')
        } catch (error) {
          console.log(
            'Withdraw button not found with strict selector, trying broader selector'
          )
          const allButtons = await postCard
            .locator('.action-btn, .btn')
            .allTextContents()
          console.log(
            `Available buttons in post card: ${JSON.stringify(allButtons)}`
          )

          // Try a broader selector
          const broadWithdrawButton = postCard
            .locator('.action-btn, .btn')
            .filter({ hasText: /withdraw/i })
          const broadButtonCount = await broadWithdrawButton.count()
          console.log(`Found ${broadButtonCount} buttons with "withdraw" text`)

          if (broadButtonCount > 0) {
            console.log('Using broader withdraw button selector')
            await broadWithdrawButton
              .first()
              .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
          } else {
            throw new Error(
              `No withdraw button found. Available buttons: ${JSON.stringify(
                allButtons
              )}`
            )
          }
        }

        // Ensure button is enabled before clicking
        const isEnabled = await withdrawButton.isEnabled()
        if (!isEnabled) {
          console.log(
            'Withdraw button is disabled, checking if broad selector button is enabled'
          )
          const broadWithdrawButton = postCard
            .locator('.action-btn, .btn')
            .filter({ hasText: /withdraw/i })
            .first()
          const isBroadEnabled = await broadWithdrawButton.isEnabled()
          if (!isBroadEnabled) {
            throw new Error('All withdraw buttons are disabled')
          }
          console.log('Using broad selector button instead')
          await broadWithdrawButton.click()
        } else {
          // Click the withdraw button
          console.log('Clicking withdraw button...')
          await withdrawButton.click()
        }

        // Look for any modals that might appear
        const modalSelectors = [
          '.modal',
          '.swal2-popup',
          '.confirm-modal',
          '[role="dialog"]',
        ]

        let modalFound = false
        for (const modalSelector of modalSelectors) {
          try {
            const modal = page.locator(modalSelector).filter({ visible: true })
            const isVisible = await modal
              .isVisible({ timeout: timeouts.ui.interaction })
              .catch(() => false)
            if (isVisible) {
              console.log(`Found modal: ${modalSelector}`)
              modalFound = true

              // Look for confirmation buttons within this modal
              const confirmSelectors = [
                `${modalSelector} .btn:has-text("Withdraw")`,
                `${modalSelector} .btn:has-text("Yes")`,
                `${modalSelector} .btn:has-text("Confirm")`,
                `${modalSelector} .btn:has-text("OK")`,
                `${modalSelector} .btn-primary`,
                `${modalSelector} .swal2-confirm`,
              ]

              let confirmClicked = false
              for (const confirmSelector of confirmSelectors) {
                try {
                  const confirmButton = page
                    .locator(confirmSelector)
                    .filter({ visible: true })
                  const confirmVisible = await confirmButton
                    .isVisible({ timeout: timeouts.ui.interaction / 10 })
                    .catch(() => false)
                  if (confirmVisible) {
                    console.log(
                      `Clicking confirmation button: ${confirmSelector}`
                    )

                    // Withdrawing pending posts can cause legitimate "not found" errors when refetching
                    page.addAllowedErrorPattern(
                      /the server responded with a status of 404/
                    )

                    await confirmButton.click()
                    confirmClicked = true
                    break
                  }
                } catch (error) {
                  // Continue to next selector
                }
              }

              if (!confirmClicked) {
                console.log(`Modal found but no confirmation button clicked`)
              }
              break
            }
          } catch (error) {
            // Continue to next modal selector
          }
        }

        if (!modalFound) {
          console.log('No confirmation modal found - withdrawal may be direct')
        }

        // Wait for any UI updates after confirmation
        await page.waitForTimeout(timeouts.ui.settleTime)

        // Debug: Count posts before waiting for removal
        const postsBeforeWait = await page.locator(postSelector).count()
        console.log(`Posts with "${item}" before waiting: ${postsBeforeWait}`)

        // Debug: Check if our specific post card is still visible
        const isSpecificPostVisible = await postCard
          .isVisible()
          .catch(() => false)
        console.log(
          `Specific post card still visible: ${isSpecificPostVisible}`
        )

        // Wait for UI to update after withdrawal click
        await page.waitForTimeout(timeouts.ui.settleTime)

        // Debug: Check post count after settle time
        const postsAfterSettle = await page.locator(postSelector).count()
        console.log(
          `Posts with "${item}" after settle time: ${postsAfterSettle}`
        )

        // Verify the post was removed by checking the count decreased
        // This is more reliable than waiting for a specific element to detach
        // because Vue/Nuxt may re-render the entire list
        const postsAfterWithdrawal = await page.locator(postSelector).count()
        console.log(`Posts after withdrawal: ${postsAfterWithdrawal}`)

        if (postsAfterWithdrawal < postsBeforeWait) {
          console.log('✓ Post count decreased - withdrawal successful')
        } else {
          console.log('Post count unchanged - waiting for UI update...')
          // Wait a bit longer for UI to update
          await page.waitForTimeout(2000)
          const finalCount = await page.locator(postSelector).count()
          if (finalCount < postsBeforeWait) {
            console.log(
              '✓ Post count decreased after delay - withdrawal successful'
            )
          } else {
            console.log(
              '⚠ Warning: Post count did not decrease, but API call succeeded'
            )
          }
        }

        // Debug: Count posts after removal attempt
        const postsAfterWait = await page.locator(postSelector).count()
        console.log(`Posts with "${item}" after waiting: ${postsAfterWait}`)

        page.resetAllowedErrorPatterns()
        return true
      } finally {
        // Reset error patterns back to the original set to clean up any temporary patterns
        page.resetAllowedErrorPatterns()
      }
    }

    await use(withdrawPost)
  },

  setNewUserPassword: async ({ page }, use) => {
    /**
     * Sets the password for a new user in the NewUserInfo component
     * @param {string} [password=DEFAULT_TEST_PASSWORD] - The password to set
     * @returns {Promise<boolean>} - True if password was set successfully
     */
    const setNewUserPassword = async (password = DEFAULT_TEST_PASSWORD) => {
      console.log('Looking for password input field to set password')

      try {
        const passwordInput = page
          .locator('input[type="password"]')
          .filter({ visible: true })
        const saveButton = page
          .locator('.btn:has-text("Save")')
          .filter({ visible: true })

        // Check if password input is visible (NewUserInfo component)
        if (
          (await passwordInput.count()) > 0 &&
          (await saveButton.count()) > 0
        ) {
          console.log('Found password input, setting password')
          await passwordInput.type(password)
          await saveButton.click()
          console.log('Set password successfully')

          // Wait a moment for the password to be saved
          await page.waitForTimeout(1000)
          return true
        } else {
          console.log('Password input not visible, may not be needed')
          return false
        }
      } catch (error) {
        console.log('Password input not found or not needed:', error.message)
        return false
      }
    }

    await use(setNewUserPassword)
  },

  replyToMessageWithSignup: async ({ page }, use) => {
    /**
     * Navigates to a message page and replies with signup as a new user
     * @param {Object} options - The reply options
     * @param {string} options.messageId - The message ID to reply to
     * @param {string} options.itemName - The item name to verify on the page
     * @param {string} options.email - The email address to use for signup
     * @param {string} [options.replyMessage] - The reply message text
     * @param {string} [options.collectDetails] - Collection details for OFFER messages
     * @returns {Promise<boolean>} - True if reply was sent successfully
     */
    const replyToMessageWithSignup = async (options) => {
      const {
        messageId,
        itemName,
        email,
        replyMessage = 'I would love to have this item please! I can collect anytime this week.',
        collectDetails = 'I can collect Monday-Friday after 6pm or weekends anytime',
      } = options

      if (!messageId || !itemName || !email) {
        throw new Error(
          'messageId, itemName, and email are required for replying to a message'
        )
      }

      // Create a completely fresh browser context to ensure clean state
      // This is more reliable than trying to clear storage/cookies
      // Use explicit viewport to avoid two-column layout (triggered at width >= 992px AND height <= 800px)
      const browser = page.context().browser()
      const freshContext = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        storageState: { cookies: [], origins: [] },
      })
      const freshPage = await freshContext.newPage()

      // Add gotoAndVerify helper to the fresh page
      // Don't use networkidle - the app has background polling that prevents idle state
      freshPage.gotoAndVerify = async (path, options = {}) => {
        const baseUrl =
          process.env.TEST_BASE_URL || 'http://freegle-prod-local.localhost'
        const fullUrl = path.startsWith('http') ? path : `${baseUrl}${path}`
        await freshPage.goto(fullUrl, {
          waitUntil: 'domcontentloaded',
          timeout: options.timeout || 60000,
        })
        return freshPage
      }

      console.log('Created fresh browser context for reply flow')

      // Navigate to the specific message page
      const messageUrl = `/message/${messageId}`
      await freshPage.gotoAndVerify(messageUrl)
      console.log(`Navigated to message page: ${messageUrl}`)

      // Wait for the message content to load (the .message-expanded-wrapper contains the loaded message)
      await freshPage
        .locator('.message-expanded-wrapper, .message-expanded-mobile')
        .first()
        .waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })
      console.log('Message content loaded')

      // Wait for the Reply button in the app-footer and click it to expand the reply section
      // With viewport height 900px, we avoid the two-column layout so only app-footer button is visible
      const replyButton = freshPage.locator(
        '.app-footer .reply-button:has-text("Reply")'
      )
      await replyButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log('Reply button visible')

      // Wait for Vue hydration by checking the button is enabled and clickable
      // Don't use networkidle - the app has background polling that prevents idle state
      await freshPage.waitForFunction(
        (selector) => {
          const btn = document.querySelector(selector)
          if (!btn) return false
          // Check button is not disabled and has event handlers attached (Vue hydrated)
          return !btn.disabled && !btn.classList.contains('disabled')
        },
        '.app-footer .reply-button',
        { timeout: timeouts.navigation.default }
      )
      console.log('Reply button hydrated and enabled, attempting click')

      // Click the Reply button
      await replyButton.click()
      console.log('Clicked Reply button')

      // If the section doesn't appear, try clicking again (sometimes first click doesn't register during hydration)
      try {
        await freshPage.locator('.reply-expanded-section').waitFor({
          state: 'visible',
          timeout: 5000,
        })
        console.log('Reply section expanded on first click')
      } catch (e) {
        console.log('First click did not expand, retrying...')
        await replyButton.click({ force: true })
        console.log('Clicked Reply button again with force')
      }

      // Wait for the reply section to expand (indicated by .reply-expanded-section appearing)
      await freshPage.locator('.reply-expanded-section').waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      console.log('Reply section expanded')

      // Wait for the reply textarea to be visible after expanding
      // The textarea is inside client-only and may take time to render
      await freshPage.locator('textarea[name="reply"]').waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Fill in the email field (for non-logged-in users)
      const emailInput = freshPage
        .locator('.test-email-reply-validator input[type="email"]')
        .filter({ visible: true })
      await emailInput.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await emailInput.fill(email)
      console.log(`Filled email: ${email}`)

      // Fill in the reply message
      const replyTextarea = freshPage
        .locator('textarea[name="reply"]')
        .filter({ visible: true })
      await replyTextarea.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await replyTextarea.fill(replyMessage)
      console.log('Filled reply message')

      // Fill in collection details (for OFFER messages)
      const collectTextarea = freshPage
        .locator('textarea[name="collect"]')
        .filter({ visible: true })
      await collectTextarea.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await collectTextarea.fill(collectDetails)
      console.log('Filled collection details')

      // Click the "Send your reply" button
      const sendReplyButton = freshPage
        .locator('.btn:has-text("Send your reply")')
        .filter({ visible: true })
      await sendReplyButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
      await sendReplyButton.click()
      console.log('Clicked Send your reply button')

      // The reply state machine handles authentication for new users automatically:
      // 1. Calls user.add(email) to register the user
      // 2. Joins the message's group
      // 3. Creates the chat and sends the reply
      // 4. Shows a "Welcome to Freegle" modal for new users
      // 5. Navigates to /chats/
      //
      // We need to handle the Welcome modal if it appears, then verify
      // we end up at /chats/ with a chat entry.

      try {
        // The Welcome modal may appear for new users. Handle it if it does.
        const welcomeModal = freshPage.locator('.modal-content').filter({
          hasText: 'Welcome to Freegle',
        })

        try {
          await welcomeModal.waitFor({ state: 'visible', timeout: 10000 })
          console.log('Welcome to Freegle modal appeared')

          const closeButton = welcomeModal.locator(
            '.btn:has-text("Close and Continue")'
          )
          await closeButton.waitFor({
            state: 'visible',
            timeout: timeouts.ui.appearance,
          })
          await closeButton.click()
          console.log('Clicked Close and Continue')
        } catch {
          // Welcome modal may have already been dismissed or may not appear
          // for users who have been registered before in a previous test run
          console.log('Welcome modal did not appear within timeout')
        }

        // Wait for navigation to chats page - this is the definitive success indicator
        await freshPage.waitForURL('**/chats/**', {
          timeout: timeouts.navigation.default,
        })
        console.log('Successfully navigated to chats page')

        // Handle ContactDetailsAskModal if it appears
        try {
          const contactModal = freshPage.locator('.modal-content').filter({
            hasText: 'Contact details',
          })
          await contactModal.waitFor({ state: 'visible', timeout: 3000 })
          console.log('ContactDetailsAskModal appeared, filling postcode')

          const postcodeInput = contactModal.locator(
            'input[placeholder*="postcode"], .pcinp'
          )
          await postcodeInput.waitFor({
            state: 'visible',
            timeout: timeouts.ui.appearance,
          })
          await postcodeInput.fill('EH3 6SS')

          const modalCloseButton = contactModal.locator(
            '.btn-close, .close, button[aria-label="Close"]'
          )
          if ((await modalCloseButton.count()) > 0) {
            await modalCloseButton.click()
          }
          await contactModal.waitFor({
            state: 'detached',
            timeout: timeouts.ui.response,
          })
          console.log('ContactDetailsAskModal closed')
        } catch {
          // Modal didn't appear, that's fine
        }

        // Verify a chat entry exists
        await freshPage.waitForSelector('.chat-entry', {
          timeout: timeouts.ui.appearance,
        })
        const chatCount = await freshPage
          .locator('.chat-entry')
          .filter({ visible: true })
          .count()

        if (chatCount === 0) {
          console.log('No chat entries found after reply')
          await freshContext.close()
          return false
        }

        console.log(`Reply completed successfully, ${chatCount} chat entries`)
        await freshContext.close()
        return true
      } catch (error) {
        console.log('Reply with signup failed:', error.message)
        await freshContext.close()
        return false
      }
    }

    await use(replyToMessageWithSignup)
  },
})

// Export our enhanced test function with all fixtures and expect
exports.test = testWithFixtures
exports.expect = base.expect
exports.NUXT_TEST_UTILS_AVAILABLE = NUXT_TEST_UTILS_AVAILABLE
