# Reply Flow Test Suite

This document provides an overview of the reply flow tests, which cover the state
machine that handles user replies to messages.

## Test Files

The tests are split across multiple files to enable parallel execution across files:

| File | Description | Tests |
|------|-------------|-------|
| `test-reply-flow-logged-in.spec.js` | Logged in user tests | 1.1, 1.2, 1.3 |
| `test-reply-flow-new-user.spec.js` | New user registration tests | 2.1, 2.2, 2.3 |
| `test-reply-flow-existing-user.spec.js` | Existing user forced login tests | 3.1, 3.2, 3.3 |
| `test-reply-flow-social.spec.js` | Social login simulation | 4.1 |
| `test-reply-flow-edge-cases.spec.js` | Edge cases and race conditions | Various |
| `test-reply-flow-logging.spec.js` | State machine logging | 1 test |

## Test Matrix

```
┌──────────────────────────┬─────────────────┬─────────────────┬─────────────────┐
│      User State          │  Message Page   │   Browse Page   │  Explore Page   │
├──────────────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Logged In                │ Test 1.1        │ Test 1.2        │ Test 1.3        │
│ New User (Registration)  │ Test 2.1        │ Test 2.2        │ Test 2.3        │
│ Existing User (Login)    │ Test 3.1        │ Test 3.2        │ Test 3.3        │
│ Social Sign-In           │ Test 4.1*       │ (simulated)     │ (simulated)     │
└──────────────────────────┴─────────────────┴─────────────────┴─────────────────┘

* Test 4.1 simulates social login by testing the loginCount key bump mechanism
  that triggers after OAuth completes. This verifies the reply state survives
  the full app re-render. Actual OAuth cannot be automated as it requires
  interaction with external providers (Google, Facebook, Apple).
```

## Edge Cases

```
┌────────────────────────────────────┬─────────────────────────────────────────┐
│ Edge Case                          │ Expected Behavior                       │
├────────────────────────────────────┼─────────────────────────────────────────┤
│ Page refresh mid-reply             │ Reply section accessible after refresh  │
│ Browser back button                │ Reply section accessible on return      │
│ Navigate to different message      │ New message starts fresh                │
│ Double-click Send                  │ Second click ignored while processing   │
│ Login via navbar mid-compose       │ Can click Send after login              │
└────────────────────────────────────┴─────────────────────────────────────────┘
```

## Parallelization Strategy

- **Cross-file parallelization**: Tests run in parallel across different files
- **Within-file**: Tests run serially within each file to avoid state conflicts

Files that share pre-registered test users (1.x tests) MUST run serially.
Files that create unique users per test (2.x, 3.x, edge cases) could run in
parallel within the file, but cross-file parallelization is sufficient.

## Shared Helpers

Common helper functions are in `utils/reply-helpers.js`:

- `waitForAuthInLocalStorage(page)` - Wait for auth tokens in localStorage
- `waitForAuthHydration(page)` - Wait for page to stabilize after auth
- `dismissLoginModalIfPresent(page)` - Dismiss signup modal on browse/explore
- `navigateToMessageViaBrowse(page, messageId, groupName, itemText)` - Navigate via browse
- `navigateToMessageViaExplore(page, groupName)` - Navigate via explore
- `clickReplyButton(page)` - Click Reply and expand reply section
- `fillReplyForm(page, { email, replyText, collectText })` - Fill reply form
- `clickSendAndWait(page, { expectWelcomeModal })` - Send and wait for navigation
