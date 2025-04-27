async function elementExists(page, selector) {
  return (await page.locator(selector).count()) > 0
}

async function waitForElementWithText(page, selector, text) {
  await page.waitForSelector(`${selector}:has-text("${text}")`)
}

module.exports = {
  elementExists,
  waitForElementWithText,
}
