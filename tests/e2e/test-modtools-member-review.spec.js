// @ts-check
/**
 * Tests for the ModTools Member Review page (/members/review).
 *
 * Verifies:
 * - Page loads without errors
 * - Action buttons (Hold, Release, Ignore, Remove) are visible when members exist
 * - Group names are displayed (not "Undefined" or blank)
 *
 * Uses testEnv fixture for isolated test data.
 */

const { test, expect } = require('./fixtures')
const { timeouts, environment } = require('./config')
const { loginViaModTools } = require('./utils/user')

const MODTOOLS_URL = environment.modtoolsBaseUrl

// Helper: dismiss any overlay modals (cake modal, etc.) that block interaction.
async function dismissAllModals(page) {
  await page.evaluate(() => {
    document
      .querySelectorAll('.modal.show, .modal[style*="display: block"]')
      .forEach((el) => {
        el.classList.remove('show')
        el.style.display = 'none'
      })
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove())
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('overflow')
    document.body.style.removeProperty('padding-right')
  })
}

// Helper: check page for common error indicators.
async function assertNoErrors(page) {
  const body = await page.textContent('body')
  expect(body).not.toContain('something went wrong')
  expect(body).not.toContain('Oh dear')
  expect(body).not.toContain('undefined is not an object')
  expect(body).not.toContain('Cannot read properties of undefined')
}

test.describe('ModTools Member Review', () => {
  test('Member Review page loads and allows interaction with review members', async ({
    page,
    testEnv,
  }) => {
    // Collect page errors
    const errors = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Step 1: Login as moderator
    await loginViaModTools(page, testEnv.mod.email)

    // Step 2: Navigate to member review page
    await page.goto(`${MODTOOLS_URL}/members/review`, {
      timeout: timeouts.navigation.initial,
      waitUntil: 'domcontentloaded',
    })

    await dismissAllModals(page)

    // Step 3: Verify no error indicators on the page
    await assertNoErrors(page)

    // Step 4: Wait for the group select dropdown to appear (indicates page loaded and authenticated)
    const groupSelect = page.locator('#communitieslist')
    await expect(groupSelect).toBeVisible({
      timeout: timeouts.navigation.slowPage,
    })

    // Step 5: Check whether members are present or "no members" message is shown.
    // The page uses infinite-loading which shows either member cards or a "no members" notice.
    // Wait for either a member card or the "no members to review" message.
    // Use a specific locator that only matches actual member review cards
    // (which contain action buttons like Ignore/Remove), not layout cards.
    const memberCard = page
      .locator('.card:has(button:has-text("Ignore"))')
      .first()
    const noMembersNotice = page.getByText(
      'There are no members to review at the moment.'
    )

    // Wait for the page content to settle -- either members load or the empty notice appears.
    const hasMembersOrEmpty = await Promise.race([
      memberCard
        .waitFor({ state: 'visible', timeout: timeouts.navigation.slowPage })
        .then(() => 'members')
        .catch(() => null),
      noMembersNotice
        .waitFor({ state: 'visible', timeout: timeouts.navigation.slowPage })
        .then(() => 'empty')
        .catch(() => null),
    ])

    if (hasMembersOrEmpty === 'members') {
      // Members are present -- verify the action buttons and group names.

      // Dismiss modals again in case any appeared during data loading
      await dismissAllModals(page)

      // Verify at least one member review card is visible
      await expect(memberCard).toBeVisible({
        timeout: timeouts.ui.appearance,
      })

      // Verify that action buttons are present within member review cards.
      // The actions section contains SpinButton/ModMemberButton components
      // rendered as <button> elements with text: Ignore, Remove, Hold/Release.
      const actionButtons = page.locator(
        'button:has-text("Ignore"), button:has-text("Remove"), button:has-text("Hold"), button:has-text("Release")'
      )

      await expect(actionButtons.first()).toBeVisible({
        timeout: timeouts.ui.appearance,
      })

      // Verify group names are displayed and not "Undefined".
      // ModMemberReviewActions renders the group name inside a <strong> tag.
      // It falls back to "#<groupid>" if the group name can't be resolved, but never "Undefined".
      const strongTags = page.locator(
        '.card .card-body .card .card-body strong'
      )
      const strongCount = await strongTags.count()

      if (strongCount > 0) {
        for (let i = 0; i < Math.min(strongCount, 5); i++) {
          const text = await strongTags.nth(i).textContent()
          expect(text).not.toBe('Undefined')
          expect(text).not.toBe('undefined')
          expect(text.trim().length).toBeGreaterThan(0)
        }
      }

      // Verify the "Go to membership" link is present
      const goToMembership = page.locator(
        'a:has-text("Go to membership"), button:has-text("Go to membership")'
      )

      if ((await goToMembership.count()) > 0) {
        await expect(goToMembership.first()).toBeVisible({
          timeout: timeouts.ui.appearance,
        })
      }
    } else {
      // No members to review -- the notice message should be visible.
      await expect(noMembersNotice).toBeVisible({
        timeout: timeouts.ui.appearance,
      })
    }

    // Step 6: Verify no page errors occurred throughout the test
    expect(errors).toHaveLength(0)
  })
})
