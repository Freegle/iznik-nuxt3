// @ts-check
/**
 * Tests for the give flow - posting OFFER items to Freegle
 */

const { test } = require('./fixtures')
const { environment } = require('./config')

test.describe('Give flow tests', () => {
  test('Logged out, new user, basic OFFER post, no attachment', async ({
    page,
    testEmail,
    postMessage,
    registerTestEmail,
  }) => {
    // Register the automatically generated test email for cleanup
    registerTestEmail(testEmail)

    // Use the fixture to post a message
    const result = await postMessage({
      type: 'OFFER',
      item: 'test post - please delete',
      description: `Created by automated test at ${new Date().toISOString()}`,
      postcode: environment.postcode,
      email: testEmail,
    })

    console.log(`Post result: ${JSON.stringify(result)}`)
  })
})
