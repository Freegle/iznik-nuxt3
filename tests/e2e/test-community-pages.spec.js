/**
 * Tests for community pages - events, volunteering, stories, and stats.
 * These pages display public content and should load without authentication.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

test.describe('Community Events Page Tests', () => {
  test('communityevents page should load without errors', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/communityevents')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Community Events')

    // Page should show the description text.
    await page
      .locator('text=Local events posted by freeglers like you')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('communityevents page shows sign-in prompt for guests', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/communityevents')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Guest users should see the sign-in notice.
    await page
      .locator('text=Please sign in and join a community to add an event')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })
})

test.describe('Volunteering Page Tests', () => {
  test('volunteerings page should load without errors', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/volunteerings')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Volunteer')

    // Page should show the description text.
    await page
      .locator('text=Are you a charity or good cause')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('volunteerings page shows sign-in prompt for guests', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/volunteerings')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Guest users should see the sign-in notice.
    await page
      .locator('text=Please sign in and join a community to add an opportunity')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })
})

test.describe('Stories Page Tests', () => {
  test('stories page should load without errors', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stories')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Stories')

    // Page should show the description text.
    await page
      .locator('text=We love to hear why you freegle')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('stories page has add story button', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stories')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The "Tell us your story" button should be visible.
    await page
      .locator('button:has-text("Tell us your story")')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })
})

test.describe('Stats Page Tests', () => {
  test('stats page should load without errors', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stats')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Check that the page title contains expected text.
    const title = await page.title()
    expect(title).toContain('Statistics')

    // Page should show the Freegle logo and tagline.
    await page
      .locator('text=Give and get stuff for free')
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('stats page loads with loading indicator then content', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stats')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // Wait for either loading indicator or actual content.
    // The page shows a loading gif initially then displays charts.
    const loadingOrContent = page.locator(
      'img[alt="Loading..."], text=Weights, text=Members'
    )
    await loadingOrContent
      .first()
      .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
  })

  test('stats authorities page should load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stats/authorities')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })

    const title = await page.title()
    expect(title.toLowerCase()).toMatch(/stats|authorities/i)
  })
})

test.describe('Story Heatmap Page Tests', () => {
  test('stats heatmap page should load', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/stats/heatmap')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Promote Page Tests', () => {
  test('promote page should load without errors', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/promote')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})

test.describe('Mobile Page Tests', () => {
  test('mobile page should load without errors', async ({
    page,
    waitForNuxtPageLoad,
  }) => {
    await page.gotoAndVerify('/mobile')
    await waitForNuxtPageLoad({ timeout: timeouts.navigation.default })

    // The page should load without errors.
    await page.locator('body').waitFor({ state: 'visible', timeout: 5000 })
  })
})
