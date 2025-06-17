// @ts-check
/**
 * Tests for the email registration system
 */
const { test, expect } = require('./fixtures')
const { environment } = require('./config')

test.describe('Email Registration Tests', () => {
  test('Manual email registration works correctly', ({
    registerTestEmail,
    getRegisteredEmails,
  }) => {
    // Create a random email to register
    const email1 = `manual-test-${Date.now()}@${environment.email.domain}`
    const email2 = `another-test-${Date.now()}@${environment.email.domain}`

    // Register the first email
    const result1 = registerTestEmail(email1)
    expect(result1).toBeTruthy()

    // Register the second email
    const result2 = registerTestEmail(email2)
    expect(result2).toBeTruthy()

    // Try registering an invalid email
    const invalidResult = registerTestEmail('not-an-email')
    expect(invalidResult).toBeFalsy()

    // Get all registered emails and check if our emails are included
    const allEmails = getRegisteredEmails()
    expect(allEmails).toContain(email1)
    expect(allEmails).toContain(email2)
    expect(allEmails).not.toContain('not-an-email')

    // Check the total count is at least 2 (there may be other emails from other tests)
    expect(allEmails.length).toBeGreaterThanOrEqual(2)

    console.log('All registered emails:', allEmails)
  })

  test('Email registration works alongside existing fixtures', ({
    page,
    testEmail,
    registerTestEmail,
    getRegisteredEmails,
  }) => {
    // The testEmail fixture automatically generates and registers an email
    expect(testEmail).toContain('@')

    // Register a manual email as well
    const manualEmail = `manual-${Date.now()}@${environment.email.domain}`
    registerTestEmail(manualEmail)

    // Get all registered emails and verify both are present
    const allEmails = getRegisteredEmails()
    expect(allEmails).toContain(testEmail)
    expect(allEmails).toContain(manualEmail)

    console.log(`Generated test email: ${testEmail}`)
    console.log(`Manually registered email: ${manualEmail}`)
    console.log('Total registered emails:', allEmails.length)
  })
})
