/**
 * Tests for additional public pages.
 * These pages display content and should load without authentication.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Giftaid Page Tests', () => {
  test('giftaid page should load and display gift aid information', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/giftaid')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/gift\s*aid|donate/i)

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Donated Page Tests', () => {
  test('donated page should load and display thank you message', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/donated')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Mobile Page Tests', () => {
  test('mobile page should load', async ({ page, waitForNuxtPageLoad }) => {
    await page.gotoAndVerify('/mobile')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Promote Page Tests', () => {
  test('promote page should load and display promotion content', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/promote')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Freegle')

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Stats Pages Tests', () => {
  test('stats heatmap page should load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stats/heatmap')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/heat\s*map|stats|freegle/i)

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })

  test('stats authorities page should load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stats/authorities')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Stories Pages Tests', () => {
  test('stories summary page should load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stories/summary')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/stories|freegle/i)

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('NationalReuseDay Page Tests', () => {
  test('national reuse day page should load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/NationalReuseDay')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('JustGivingThankYou Page Tests', () => {
  test('just giving thank you page should load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/JustGivingThankYou')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Essex Page Tests', () => {
  test('essex page should load', async ({ page, waitForNuxtPageLoad }) => {
    await page.gotoAndVerify('/essex')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})
