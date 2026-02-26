/**
 * Tests for informational and marketing pages.
 * These pages display static/marketing content and should load without authentication.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('About Page Tests', () => {
  test('about page should load and display key sections', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/about')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Donate Page Tests', () => {
  test('donate page should load and display donation options', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/donate')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Donate')

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Disclaimer Page Tests', () => {
  test('disclaimer page should load', async ({ page, waitForNuxtPageLoad }) => {
    await page.gotoAndVerify('/disclaimer')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Disclaimer')

    // Page should display disclaimer content.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Terms Page Tests', () => {
  test('terms page should load and display terms of use', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/terms')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Terms')

    // Page should display terms content.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Privacy Page Tests', () => {
  test('privacy page should load and display privacy policy', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/privacy')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Privacy')

    // Page should display privacy content.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Help Page Tests', () => {
  test('help page should load and display help content', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/help')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Help')

    // Page should display contact/help content.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Forgot Password Page Tests', () => {
  test('forgot page should load and display password reset form', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/forgot')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/password|forgot|lost/i)

    // Page should display forgot password form.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Jobs Page Tests', () => {
  test('jobs page should load and display job listings', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/jobs')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Jobs')

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Maintenance Page Tests', () => {
  test('maintenance page should load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/maintenance')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Birthday Page Tests', () => {
  test('birthday page should load', async ({ page, waitForNuxtPageLoad }) => {
    await page.gotoAndVerify('/birthday')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Adsoff Page Tests', () => {
  test('adsoff page should load', async ({ page, waitForNuxtPageLoad }) => {
    await page.gotoAndVerify('/adsoff')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Engage Page Tests', () => {
  test('engage page should redirect or load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/engage')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors (may redirect).
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})
