/**
 * Tests for shortlinks and noticeboards pages.
 * These pages display content and should load without authentication.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Shortlinks Page Tests', () => {
  test('shortlinks page should load and display shortlink list', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/shortlinks')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/shortlink|freegle/i)

    // Check that the main heading is present.
    await page
      .locator('h1:has-text("Shortlinks")')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('shortlinks page should display community and shortlink columns', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/shortlinks')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check for column headers.
    await page
      .locator('text=Community')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
    await page
      .locator('text=Shortlink')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })
})

test.describe('Noticeboards Page Tests', () => {
  test('noticeboards page should load and display main content', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/noticeboards')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/noticeboard|freegle/i)

    // Check that the main heading is present.
    await page
      .locator('h1:has-text("Noticeboards")')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('noticeboards page should display poster download button', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/noticeboards')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check for the download poster button.
    await page
      .locator('button:has-text("Download poster")')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('noticeboards page should display I put up a poster button', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/noticeboards')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check for the 'I put up a poster' button.
    await page
      .locator('button:has-text("I put up a poster")')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })
})

test.describe('Unsubscribed Page Tests', () => {
  test('unsubscribed page should load and display confirmation message', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/unsubscribe/unsubscribed')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check for the confirmation message.
    await page
      .locator('h1:has-text("We\'ve removed your account")')
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('unsubscribed page should explain 14 day recovery period', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/unsubscribe/unsubscribed')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check for the 14 day recovery explanation.
    await page
      .locator('text=14 days')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })
})
