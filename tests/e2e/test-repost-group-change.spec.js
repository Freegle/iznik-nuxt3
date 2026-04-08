/**
 * Repost Group Change Test
 *
 * Tests that when a rejected post is edited and resent, the user can
 * change the group via the dropdown and the selection persists through
 * the posting flow.
 *
 * Bug: Previously, selecting a different group during repost kept
 * reverting to the original group.
 */

const { test, expect } = require('./fixtures')
const { timeouts } = require('./config')
const { loginViaHomepage } = require('./utils/user')

test.describe('Repost Group Change', () => {
  test('changing group dropdown during repost of rejected message should persist', async ({
    page,
    testEnv,
  }) => {
    console.log('=== REPOST GROUP CHANGE TEST ===')
    console.log(`User: ${testEnv.user.email}`)
    console.log(
      `Group1: ${testEnv.group.name} (${testEnv.group.id}), Group2: ${testEnv.group2.name} (${testEnv.group2.id})`
    )
    console.log(`Rejected message ID: ${testEnv.rejected?.offer}`)

    // Step 1: Log in as the test user who owns the rejected message.
    await loginViaHomepage(page, testEnv.user.email, 'freegle')

    // Step 2: Navigate to My Posts.
    await page.gotoAndVerify('/myposts', {
      timeout: timeouts.navigation.default,
    })

    // Wait for my posts to load.
    await expect(page.locator('.message-card, :text("no posts")')).toBeVisible({
      timeout: timeouts.ui.appearance,
    })

    // Step 3: Find the rejected message (has a warning notice banner).
    const rejectedCard = page
      .locator('.message-card:has(.notice--warning)')
      .first()
    await expect(rejectedCard).toBeVisible({ timeout: timeouts.ui.appearance })
    console.log('Found rejected message card')

    // Click "Edit & Resend".
    const editResendBtn = rejectedCard
      .locator('button:has-text("Edit & Resend")')
      .first()
    await expect(editResendBtn).toBeVisible({ timeout: timeouts.ui.appearance })
    await editResendBtn.click()
    console.log('Clicked Edit & Resend')

    // Step 4: Should navigate to /give with pre-filled data.
    await expect(page).toHaveURL(/\/give/, {
      timeout: timeouts.navigation.default,
    })

    // Click Next to go to whereami page.
    const nextToWhereami = page.locator('.next-btn:has-text("Next")').first()
    await expect(nextToWhereami).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    await nextToWhereami.click()

    // Step 5: On whereami page — verify group dropdown.
    await expect(page).toHaveURL(/whereami/, {
      timeout: timeouts.navigation.default,
    })
    console.log('On whereami page')

    // Wait for the group dropdown to appear.
    const groupDropdown = page.locator('select').first()
    await expect(groupDropdown).toBeVisible({ timeout: timeouts.ui.appearance })

    // Get the initial selected value and all options.
    const initialGroupId = await groupDropdown.inputValue()
    const optionElements = groupDropdown.locator('option')
    const optionCount = await optionElements.count()
    console.log(
      `Group dropdown: ${optionCount} options, initial selection: ${initialGroupId}`
    )

    // The repost should pre-select the message's original group.
    expect(initialGroupId).toBe(String(testEnv.group.id))
    console.log('Correct initial group pre-selected from rejected message')

    // We need at least 2 groups to test changing.
    expect(optionCount).toBeGreaterThanOrEqual(2)

    // Get all option values.
    const allValues = await optionElements.evaluateAll((opts) =>
      opts.map((o) => ({ value: o.value, text: o.textContent }))
    )
    console.log('Available groups:', JSON.stringify(allValues))

    // Step 6: Select a different group.
    const targetGroup = allValues.find((v) => v.value !== initialGroupId)
    expect(targetGroup).toBeTruthy()
    console.log(
      `Changing from ${initialGroupId} to ${targetGroup.value} (${targetGroup.text})`
    )

    await groupDropdown.selectOption(targetGroup.value)

    // Verify the change took effect immediately.
    await expect(groupDropdown).toHaveValue(targetGroup.value)
    console.log('Group changed successfully')

    // Step 7: Wait for any async operations (ComposeGroup.onMounted refetches
    // postcode and user, PostCode.onMounted re-resolves the postcode) that
    // could reset the group. Poll the dropdown value to catch any revert.
    await expect
      .poll(
        async () => {
          return await groupDropdown.inputValue()
        },
        {
          message:
            'Group dropdown reverted to original — the bug is reproduced',
          intervals: [200, 200, 200, 200, 200, 500, 500, 500],
          timeout: 3000,
        }
      )
      .toBe(targetGroup.value)

    console.log('Group selection persisted after async operations')

    // Step 8: Navigate forward to options page and back to verify persistence.
    const nextToOptions = page.locator('.next-btn:has-text("Next")').first()
    await expect(nextToOptions).toBeVisible({ timeout: timeouts.ui.appearance })
    await nextToOptions.click()

    await expect(page).toHaveURL(/\/give\/options/, {
      timeout: timeouts.navigation.default,
    })
    console.log('On options page')

    // Navigate back to whereami.
    await page.goBack()
    await expect(page).toHaveURL(/whereami/, {
      timeout: timeouts.navigation.default,
    })

    // Verify the group is still the one we selected.
    const groupAfterNav = page.locator('select').first()
    await expect(groupAfterNav).toBeVisible({
      timeout: timeouts.ui.appearance,
    })
    await expect(groupAfterNav).toHaveValue(targetGroup.value)
    console.log('Group selection persisted after navigation')
  })
})
