/**
 * Tests for additional public pages.
 * These pages display content and should load without authentication.
 */

const { test } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Giftaid Page Tests', () => {
  test('giftaid page should load and display gift aid information', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/giftaid')
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
