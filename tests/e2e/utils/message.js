/**
 * Message related utility functions for Playwright tests
 */

const { timeouts } = require('../config')

/**
 * Creates a new OFFER or WANTED message
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} messageDetails - Details for the message
 * @param {string} messageDetails.type - Type of message (OFFER or WANTED)
 * @param {string} messageDetails.title - Title of the message
 * @param {string} messageDetails.description - Description of the message
 * @param {string} [messageDetails.location='My home'] - Location of the item
 * @param {Array<string>} [messageDetails.photos=[]] - Array of photo paths to upload
 * @param {string} [messageDetails.group] - Optional specific group to post to
 * @returns {Promise<string>} - ID of the created message
 */
async function createMessage(
  page,
  { type, title, description, location = 'My home', photos = [], group }
) {
  console.log(`Creating new ${type} message: "${title}"`)

  // Navigate to compose page
  await page.gotoAndVerify('/post', { timeout: timeouts.navigation.default })

  // Select message type (OFFER/WANTED)
  if (type === 'OFFER') {
    await page.locator('text=I have something to give').click()
  } else if (type === 'WANTED') {
    await page.locator('text=I want something').click()
  }

  // Fill item details
  const titleInput = page.locator(
    'input[placeholder="What item do you have?"], input[placeholder="What item do you want?"]'
  )
  await titleInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await titleInput.fill(title)

  // Fill description
  const descriptionInput = page.locator(
    'textarea[placeholder="Please describe it"]'
  )
  await descriptionInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await descriptionInput.fill(description)

  // Specify location if different from default
  if (location !== 'My home') {
    await page.locator('select#location').selectOption({ label: location })
  }

  // Upload photos if any
  if (photos.length > 0) {
    for (const photoPath of photos) {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(photoPath)

      // Wait for upload to complete
      await page.locator('.progress-bar[style*="width: 100%"]').waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance * 2, // Longer timeout for uploads
      })
    }
  }

  // Select specific group if specified
  if (group) {
    const groupSelect = page.locator('select#group')
    await groupSelect.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await groupSelect.selectOption({ label: group })
  }

  // Submit the form
  await page.locator('button:has-text("Submit")').click()

  // Wait for success page or modal
  try {
    // Extract message ID from URL after successful post
    await page.waitForURL(/.*\/message\/([0-9]+)/, {
      timeout: timeouts.navigation.default,
    })
    const url = page.url()
    const messageId = url.match(/\/message\/([0-9]+)/)[1]

    console.log(`Successfully created message with ID: ${messageId}`)
    return messageId
  } catch (error) {
    console.error(`Failed to create message: ${error.message}`)
    throw new Error('Message creation failed')
  }
}

/**
 * Searches for messages with specific criteria
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.query - Search query string
 * @param {string} [searchParams.type] - Optional message type filter (OFFER/WANTED)
 * @param {string} [searchParams.location] - Optional location filter
 * @returns {Promise<Array<Object>>} - Array of search results
 */
async function searchMessages(page, { query, type, location }) {
  console.log(`Searching for messages with query: "${query}"`)

  // Navigate to search page
  if (type === 'OFFER') {
    await page.gotoAndVerify('/give', { timeout: timeouts.navigation.default })
  } else if (type === 'WANTED') {
    await page.gotoAndVerify('/find', { timeout: timeouts.navigation.default })
  } else {
    // General search page
    await page.gotoAndVerify('/search', {
      timeout: timeouts.navigation.default,
    })
  }

  // Fill search query
  const searchInput = page.locator(
    'input[placeholder*="search"], input[placeholder*="Search"]'
  )
  await searchInput.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })
  await searchInput.fill(query)

  // Set location if provided
  if (location) {
    const locationInput = page.locator(
      'input.place-input, input[placeholder*="location"]'
    )
    await locationInput.waitFor({
      state: 'visible',
      timeout: timeouts.ui.appearance,
    })
    await locationInput.fill(location)

    // Wait for and select first autocomplete result
    await page.locator('.place-suggestion').first().click()
  }

  // Submit search
  await page.locator('button:has-text("Search")').click()

  // Wait for search results
  await page.waitForSelector('.message-list, .messagecard', {
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })

  // Extract search results
  const searchResults = await page.locator('.messagecard').all()

  // Build results array
  const results = []
  for (const result of searchResults) {
    const title = await result.locator('.messagesubject').textContent()
    const description = await result
      .locator('.messagedescription')
      .textContent()
    const isWanted = (await result.locator('.badge-warning').count()) > 0

    results.push({
      title: title.trim(),
      description: description.trim(),
      type: isWanted ? 'WANTED' : 'OFFER',
    })
  }

  console.log(`Found ${results.length} search results`)
  return results
}

module.exports = {
  createMessage,
  searchMessages,
}
