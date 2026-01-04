/**
 * API helper module for fast test setup
 *
 * This module bypasses the slow UI-based fixtures by creating users and messages
 * directly via the API. This enables parallel test execution by allowing each
 * test to quickly create its own isolated test data.
 */

const { environment, DEFAULT_TEST_PASSWORD } = require('../config')

const API_BASE =
  process.env.TEST_BASE_URL || 'http://freegle-prod-local.localhost'

/**
 * Make an API request with proper headers and error handling
 */
async function apiRequest(method, endpoint, data = null, cookies = null) {
  const url = `${API_BASE}/api${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (cookies) {
    headers.Cookie = cookies
  }

  const options = {
    method,
    headers,
  }

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data)
  }

  const response = await fetch(url, options)
  const responseData = await response.json()

  // Extract cookies from response for session management
  const setCookies = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : response.headers.get('set-cookie')

  return {
    data: responseData,
    cookies: setCookies,
    status: response.status,
  }
}

/**
 * Create a new user via the API
 * @param {string} email - Email address for the user
 * @param {string} password - Password for the user
 * @returns {Promise<{userId: number, email: string}>}
 */
async function createUser(email, password = DEFAULT_TEST_PASSWORD) {
  const result = await apiRequest('PUT', '/user', {
    email,
    password,
  })

  if (result.data.ret !== 0) {
    throw new Error(
      `Failed to create user ${email}: ${result.data.status || 'Unknown error'}`
    )
  }

  return {
    userId: result.data.id,
    email,
  }
}

/**
 * Login a user and get session cookies
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Promise<{userId: number, cookies: string, persistent: object}>}
 */
async function loginUser(email, password = DEFAULT_TEST_PASSWORD) {
  const result = await apiRequest('POST', '/session', {
    email,
    password,
  })

  if (result.data.ret !== 0) {
    throw new Error(
      `Failed to login user ${email}: ${result.data.status || 'Unknown error'}`
    )
  }

  // Parse cookies into a single string for subsequent requests
  let cookieString = ''
  if (result.cookies) {
    if (Array.isArray(result.cookies)) {
      cookieString = result.cookies
        .map((c) => c.split(';')[0])
        .filter(Boolean)
        .join('; ')
    } else if (typeof result.cookies === 'string') {
      cookieString = result.cookies.split(';')[0]
    }
  }

  return {
    userId: result.data.user?.id,
    cookies: cookieString,
    persistent: result.data.persistent,
    jwt: result.data.jwt,
  }
}

/**
 * Create a user and immediately log them in
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {Promise<{userId: number, cookies: string, email: string}>}
 */
async function createUserAndLogin(email, password = DEFAULT_TEST_PASSWORD) {
  // First create the user
  await createUser(email, password)

  // Then log them in
  const session = await loginUser(email, password)

  return {
    ...session,
    email,
  }
}

/**
 * Get a location ID from a postcode
 * @param {string} postcode - UK postcode
 * @param {string} cookies - Session cookies
 * @returns {Promise<number>} Location ID
 */
async function getLocationId(postcode, cookies = null) {
  const result = await apiRequest(
    'GET',
    `/locations?typeahead=${encodeURIComponent(postcode)}&limit=1`,
    null,
    cookies
  )

  if (result.data.ret !== 0 || !result.data.locations?.length) {
    throw new Error(
      `Failed to get location for ${postcode}: ${
        result.data.status || 'No locations found'
      }`
    )
  }

  return result.data.locations[0].id
}

/**
 * Create a message via the API (much faster than UI)
 * @param {object} options - Message options
 * @param {string} options.cookies - Session cookies from login
 * @param {string} options.email - User's email
 * @param {string} options.type - Message type: 'Offer' or 'Wanted'
 * @param {string} options.item - Item title
 * @param {string} options.description - Item description
 * @param {string} options.postcode - Postcode for the message
 * @returns {Promise<{messageId: number, item: string}>}
 */
async function createMessage(options) {
  const {
    cookies,
    email,
    type = 'Offer',
    item = 'Test Item - Please Delete',
    description = `Created by automated test at ${new Date().toISOString()}`,
    postcode = environment.postcode,
  } = options

  if (!cookies) {
    throw new Error('Cookies required - user must be logged in')
  }
  if (!email) {
    throw new Error('Email required')
  }

  // Step 1: Get location ID for the postcode
  const locationId = await getLocationId(postcode, cookies)

  // Step 2: Create draft message
  const draftResult = await apiRequest(
    'PUT',
    '/message',
    {
      collection: 'Draft',
      messagetype: type,
      item,
      textbody: description,
      locationid: locationId,
    },
    cookies
  )

  if (draftResult.data.ret !== 0) {
    throw new Error(
      `Failed to create draft message: ${
        draftResult.data.status || 'Unknown error'
      }`
    )
  }

  const messageId = draftResult.data.id

  // Step 3: Submit the message with JoinAndPost action
  const submitResult = await apiRequest(
    'POST',
    '/message',
    {
      id: messageId,
      email,
      action: 'JoinAndPost',
    },
    cookies
  )

  if (submitResult.data.ret !== 0) {
    throw new Error(
      `Failed to submit message: ${submitResult.data.status || 'Unknown error'}`
    )
  }

  return {
    messageId,
    item,
    description,
  }
}

/**
 * Withdraw a message via the API
 * @param {string} cookies - Session cookies
 * @param {number} messageId - Message ID to withdraw
 * @returns {Promise<boolean>}
 */
async function withdrawMessage(cookies, messageId) {
  const result = await apiRequest(
    'POST',
    '/message',
    {
      id: messageId,
      action: 'Withdraw',
      reason: 'Withdrawn by automated test',
    },
    cookies
  )

  if (result.data.ret !== 0) {
    console.warn(
      `Failed to withdraw message ${messageId}: ${result.data.status}`
    )
    return false
  }

  return true
}

/**
 * Create a complete test setup: poster user, replier user, and posted message
 * This is designed for parallel test execution where each test needs isolated data.
 *
 * @param {string} testId - Unique test identifier for email generation
 * @returns {Promise<{poster: object, replier: object, message: object}>}
 */
async function createTestSetup(testId) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)

  const posterEmail = `poster-${testId}-${timestamp}-${random}@${environment.email.domain}`
  const replierEmail = `replier-${testId}-${timestamp}-${random}@${environment.email.domain}`

  // Create and login poster
  const poster = await createUserAndLogin(posterEmail)

  // Create the message
  const message = await createMessage({
    cookies: poster.cookies,
    email: posterEmail,
    type: 'Offer',
    item: `Test Item ${testId}`,
    description: `Automated test item for ${testId}`,
    postcode: environment.postcode,
  })

  // Create replier user (but don't login - tests may want fresh browser context)
  await createUser(replierEmail)

  return {
    poster: {
      ...poster,
      email: posterEmail,
    },
    replier: {
      email: replierEmail,
      password: DEFAULT_TEST_PASSWORD,
    },
    message,
  }
}

/**
 * Clean up test data by withdrawing messages
 * @param {string} cookies - Session cookies
 * @param {number[]} messageIds - Array of message IDs to withdraw
 */
async function cleanupMessages(cookies, messageIds) {
  for (const messageId of messageIds) {
    try {
      await withdrawMessage(cookies, messageId)
    } catch (error) {
      console.warn(`Failed to cleanup message ${messageId}: ${error.message}`)
    }
  }
}

module.exports = {
  apiRequest,
  createUser,
  loginUser,
  createUserAndLogin,
  getLocationId,
  createMessage,
  withdrawMessage,
  createTestSetup,
  cleanupMessages,
}
