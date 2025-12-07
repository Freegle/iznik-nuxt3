/**
 * Tests for MessageExpanded viewport layout variations.
 *
 * Tests the responsive layout behavior at different viewport sizes:
 * - 2-column layout triggers at xl width (1200+) AND short height (<=700px)
 * - 1-column layout everywhere else
 * - Poster overlay vs poster section visibility
 * - Fullscreen overlay mode vs modal mode
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')

// Viewport configurations to test
const viewports = {
  // xs breakpoint - mobile
  xsShort: { width: 375, height: 600, name: 'xs-short' },
  xsTall: { width: 375, height: 800, name: 'xs-tall' },

  // md breakpoint - tablet
  mdShort: { width: 768, height: 600, name: 'md-short' },
  mdTall: { width: 768, height: 800, name: 'md-tall' },

  // xl breakpoint - desktop
  xlShort: { width: 1200, height: 600, name: 'xl-short' },
  xlTall: { width: 1200, height: 800, name: 'xl-tall' },

  // Height boundary tests (at xl width)
  boundaryAt700: { width: 1200, height: 700, name: 'boundary-700' },
  boundaryAt701: { width: 1200, height: 701, name: 'boundary-701' },

  // Common laptop resolutions
  laptop1366: { width: 1366, height: 633, name: 'laptop-1366x633' },
}

// Helper to open a message expanded view
async function openMessageExpanded(page) {
  // Navigate to browse
  await page.gotoAndVerify('/browse', {
    timeout: timeouts.navigation.default,
  })

  // Wait for message cards to load
  await page
    .locator('.message-summary-mobile, .messagecard')
    .first()
    .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })

  // Click on the first message to open expanded view
  await page.locator('.message-summary-mobile, .messagecard').first().click()

  // Wait for the expanded view to appear (either modal or fullscreen overlay)
  await page
    .locator('.message-expanded-wrapper')
    .waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
}

test.describe('MessageExpanded viewport layout tests', () => {
  test.describe('2-column layout (xl-short)', () => {
    test.use({ viewport: viewports.xlShort })

    test('shows 2-column layout with poster section in right column', async ({
      page,
    }) => {
      await openMessageExpanded(page)

      // Check for 2-column wrapper with grid display
      const twoColumnWrapper = page.locator('.two-column-wrapper')
      await twoColumnWrapper.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Verify right column exists and contains info-section
      const rightColumn = page.locator('.right-column')
      await rightColumn.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Poster section should be visible in right column (not overlay)
      const posterSection = page.locator('.poster-section-wrapper')
      await posterSection.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Poster overlay should NOT be visible in 2-column mode
      const posterOverlay = page.locator('.poster-overlay')
      const overlayVisible = await posterOverlay.isVisible()
      expect(overlayVisible).toBe(false)

      // Modal close button should be visible (not back button)
      const closeButton = page.locator('.modal-close-btn, .close-button')
      await closeButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Inline reply section should be visible in 2-column layout
      const inlineReply = page.locator('.inline-reply-section')
      await inlineReply.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
    })
  })

  test.describe('1-column layout (xl-tall)', () => {
    test.use({ viewport: viewports.xlTall })

    test('shows 1-column layout with poster section', async ({ page }) => {
      await openMessageExpanded(page)

      // Info section should be visible
      const infoSection = page.locator('.info-section')
      await infoSection.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Poster overlay should NOT be visible (height > 700)
      const posterOverlay = page.locator('.poster-overlay')
      const overlayVisible = await posterOverlay.isVisible()
      expect(overlayVisible).toBe(false)

      // Poster section should exist in DOM (may require scroll)
      const posterSection = page.locator('.poster-section-wrapper')
      const posterExists = (await posterSection.count()) > 0
      expect(posterExists).toBe(true)

      // App footer should be visible (1-column mode uses fixed footer)
      const appFooter = page.locator('.app-footer')
      await appFooter.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
    })
  })

  test.describe('Mobile layout (xs-short)', () => {
    test.use({ viewport: viewports.xsShort })

    test('shows 1-column layout with poster overlay on photo', async ({
      page,
    }) => {
      await openMessageExpanded(page)

      // Should show fullscreen overlay mode (back button visible)
      const backButton = page.locator('.back-button')
      await backButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Poster overlay should be visible on photo (short screen)
      const posterOverlay = page.locator('.poster-overlay')
      await posterOverlay.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Poster section should NOT be visible (hidden on short screens)
      const posterSection = page.locator('.poster-section-wrapper')
      const sectionVisible = await posterSection.isVisible()
      expect(sectionVisible).toBe(false)
    })
  })

  test.describe('Mobile layout (xs-tall)', () => {
    test.use({ viewport: viewports.xsTall })

    test('shows 1-column layout with poster section visible', async ({
      page,
    }) => {
      await openMessageExpanded(page)

      // Should show fullscreen overlay mode (back button visible)
      const backButton = page.locator('.back-button')
      await backButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Poster overlay should NOT be visible (tall screen)
      const posterOverlay = page.locator('.poster-overlay')
      const overlayVisible = await posterOverlay.isVisible()
      expect(overlayVisible).toBe(false)

      // Poster section should be visible
      const posterSection = page.locator('.poster-section-wrapper')
      await posterSection.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
    })
  })

  test.describe('Tablet layout (md-short)', () => {
    test.use({ viewport: viewports.mdShort })

    test('shows 1-column layout with poster overlay on photo', async ({
      page,
    }) => {
      await openMessageExpanded(page)

      // Should show fullscreen overlay mode (back button visible)
      const backButton = page.locator('.back-button')
      await backButton.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })

      // Poster overlay should be visible on photo (short screen)
      const posterOverlay = page.locator('.poster-overlay')
      await posterOverlay.waitFor({
        state: 'visible',
        timeout: timeouts.ui.appearance,
      })
    })
  })

  test.describe('Height boundary tests', () => {
    test.describe('At boundary (1200x700)', () => {
      test.use({ viewport: viewports.boundaryAt700 })

      test('shows 2-column layout at exactly 700px height', async ({
        page,
      }) => {
        await openMessageExpanded(page)

        // Should be 2-column (700 <= 700 triggers short layout at xl width)
        const posterSection = page.locator('.poster-section-wrapper')
        await posterSection.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })

        // Poster overlay should NOT be visible
        const posterOverlay = page.locator('.poster-overlay')
        const overlayVisible = await posterOverlay.isVisible()
        expect(overlayVisible).toBe(false)

        // Inline reply section should be visible (2-column indicator)
        const inlineReply = page.locator('.inline-reply-section')
        await inlineReply.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })
      })
    })

    test.describe('Above boundary (1200x701)', () => {
      test.use({ viewport: viewports.boundaryAt701 })

      test('shows 1-column layout at 701px height', async ({ page }) => {
        await openMessageExpanded(page)

        // Should be 1-column (701 > 700 triggers tall layout)
        // App footer should be visible (1-column uses fixed footer)
        const appFooter = page.locator('.app-footer')
        await appFooter.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })

        // Inline reply section should NOT be visible (1-column doesn't use it)
        const inlineReply = page.locator('.inline-reply-section')
        const inlineVisible = await inlineReply.isVisible()
        expect(inlineVisible).toBe(false)
      })
    })
  })

  test.describe('Common laptop resolutions', () => {
    test.describe('Laptop 1366x633', () => {
      test.use({ viewport: viewports.laptop1366 })

      test('shows 2-column layout on common laptop resolution', async ({
        page,
      }) => {
        await openMessageExpanded(page)

        // 1366 > 1200 (xl) and 633 <= 700 (short) = 2-column layout
        const twoColumnWrapper = page.locator('.two-column-wrapper')
        await twoColumnWrapper.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })

        // Right column should be visible
        const rightColumn = page.locator('.right-column')
        await rightColumn.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })

        // Poster section should be visible in right column
        const posterSection = page.locator('.poster-section-wrapper')
        await posterSection.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })

        // Poster overlay should NOT be visible
        const posterOverlay = page.locator('.poster-overlay')
        const overlayVisible = await posterOverlay.isVisible()
        expect(overlayVisible).toBe(false)

        // Inline reply section should be visible (2-column indicator)
        const inlineReply = page.locator('.inline-reply-section')
        await inlineReply.waitFor({
          state: 'visible',
          timeout: timeouts.ui.appearance,
        })
      })
    })
  })
})
