/**
 * UI utility functions for Playwright tests
 */

const path = require('path')
const { SCREENSHOTS_DIR, timeouts } = require('../config')

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

const getScreenshotPath = (filename) => {
  return path.join(SCREENSHOTS_DIR, filename)
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
  await page.screenshot({
    path: getScreenshotPath(`before-wait-modal-${Date.now()}.png`),
    fullPage: true,
  })

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

  await page.screenshot({
    path: getScreenshotPath(`after-wait-modal-${Date.now()}.png`),
    fullPage: true,
  })

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
 * Clicks an OurToggle component correctly by targeting the toggle container
 * The actual checkbox in OurToggle is hidden, so we need to click the visible toggle container
 * @param {import('@playwright/test').Locator} toggleLocator - Locator for the toggle component
 * @returns {Promise<void>}
 */
async function clickToggle(toggleLocator) {
  // Find the toggle container within the OurToggle component
  const toggleContainer = toggleLocator.locator('.toggle-container')

  // Scroll the toggle into view if needed
  await toggleContainer.scrollIntoViewIfNeeded()

  // Wait for the toggle to be visible and ready for interaction
  await toggleContainer.waitFor({
    state: 'visible',
    timeout: timeouts.ui.appearance,
  })

  // Click the toggle container to trigger the toggle
  await toggleContainer.click()

  // Wait for the toggle animation to complete
  await waitForAnimationEnd(toggleContainer)
}

module.exports = {
  elementExists,
  waitForAnimationEnd,
  waitForModal,
  waitForElementWithText,
  clickToggle,
}
