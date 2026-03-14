# Playwright Testing Guidelines

This document outlines best practices for writing Playwright tests for our Nuxt 3 application.

## Directory Structure

```
tests/e2e/
├── config.js              # Test configuration (timeouts, selectors, etc.)
├── helpers.js             # Legacy helper functions (maintained for backward compatibility)
├── README.md              # This file
├── unsubscribe-test-emails.js # Script to clean up test accounts
└── utils/                 # Directory containing utility functions
    ├── index.js           # Main export file for all utilities
    ├── message.js         # Message-related utilities
    ├── navigation.js      # Navigation helpers and extensions
    ├── ui.js              # UI interaction utilities
    └── user.js            # User authentication and account utilities
```

## Utility Functions

The `utils` directory contains modular utility functions categorized by purpose:

### UI Utilities (`ui.js`)

Functions for interacting with UI elements:

- `elementExists` - Check if an element exists on a page
- `waitForAnimationEnd` - Wait for an element's animations to complete
- `waitForModal` - Wait for a modal to appear and be fully rendered
- `waitForElementWithText` - Wait for an element with specific text to appear

### User Utilities (`user.js`)

Functions for user account management:

- `signUpViaHomepage` - Register a new user account
- `loginViaHomepage` - Log in with existing credentials
- `unsubscribeManually` - Unsubscribe a user account

### Message Utilities (`message.js`)

Functions for creating and interacting with messages:

- `createMessage` - Create a new OFFER or WANTED message
- `searchMessages` - Search for messages with specific criteria

### Navigation Utilities (`navigation.js`)

Functions for page navigation and state:

- `setupNavigationHelpers` - Extends the Page object with custom navigation methods

### Importing Utilities

For new tests, import utilities directly from the utilities directory:

```javascript
// Import specific utilities
const { loginViaHomepage, signUpViaHomepage } = require('./utils/user')
const { waitForModal } = require('./utils/ui')

// Or import everything
const utils = require('./utils')
```

## Critical Guidelines

### ⚠️ NEVER Use Hardcoded Timeouts

**NEVER EVER** use hardcoded timeout values or `page.waitForTimeout()`. Always use the timeout constants from the config file with `waitFor` methods:

```javascript
// ❌ EXTREMELY BAD: Never do this
await page.waitForTimeout(500)

// ❌ VERY BAD: Never use hardcoded values
await element.waitFor({ state: 'visible', timeout: 5000 })

// ✅ GOOD: Always use the timeout constants
await element.waitFor({ state: 'visible', timeout: timeouts.ui.appearance })
```

Instead of arbitrary waits, always wait for specific elements or conditions:

```javascript
// ❌ BAD APPROACH: Waiting for arbitrary time
await page.waitForTimeout(1000) // Wait for modal to close

// ✅ GOOD APPROACH: Wait for a specific condition
await page.locator('.next-element').waitFor({ 
  state: 'visible', 
  timeout: timeouts.ui.appearance 
})
```

This rule is critical because:
1. Hardcoded timeouts make tests flaky and unpredictable
2. They cause tests to run slower than necessary
3. They often hide underlying issues with selectors or test logic
4. They don't work consistently across different environments (local vs CI)

## Test Email Management

The tests generate unique, timestamped test email addresses for each test run. These emails follow the format: `prefix-YYYYMMDDHHMMSS-randomhash@domain`.

### Email Generation

Tests can generate test emails using the `testEmail` fixture or `getTestEmail()` function:

```javascript
test('My test with auto email', async ({ page, testEmail, postMessage }) => {
  // Use the generated test email
  await postMessage({
    type: 'OFFER',
    item: 'test item',
    description: 'test description',
    email: testEmail,
  });
});

test('My test with custom prefix', async ({ page, getTestEmail, postMessage }) => {
  // Generate email with custom prefix
  const customEmail = getTestEmail('signup');
  
  await postMessage({
    type: 'WANTED',
    item: 'test item',
    email: customEmail,
  });
});
```

### Manual Cleanup

Test emails and user accounts should be cleaned up manually as needed. The `unsubscribe-test-emails.js` script is available for batch unsubscription operations.

## Available Fixtures

The test framework includes several custom fixtures to simplify tests:

- `testEmail`: Generates a unique test email for each test
- `getTestEmail(prefix)`: Function to generate custom test emails with specific prefixes
- `postMessage(options)`: Helper to post a message (OFFER or WANTED)
- `withdrawPost(options)`: Helper to withdraw a post from My Posts page
- `setNewUserPassword(password)`: Sets password for new user during registration
- `replyToMessageWithSignup(options)`: Reply to a message with signup as new user

## Command Logging

The test framework automatically logs all Playwright commands as they are executed, helping with debugging and understanding test flow.

### Command Logging Features

- Logs each Playwright command with timestamps and parameters
- Configurable verbosity levels: minimal, normal, verbose
- Smart parameter formatting to avoid cluttering the log
- Automatically enabled for all tests

### Example Log Output

```
[14:25:32.123] page.goto("http://localhost:3000/")
[14:25:33.456] page.waitForLoadState("networkidle")
[14:25:34.789] page.title()
[14:25:34.790] page.locator("a").all()
[14:25:34.910] locator.textContent()
[14:25:35.012] locator.isVisible()
[14:25:35.123] locator.click()
```

### Configuring Command Logging

You can configure logging behavior by importing the logger directly:

```javascript
const logger = require('./logger');

// Enable or disable logging
logger.configure({ enabled: true });

// Change timestamp format: 'none', 'simple', 'iso'
logger.configure({ timestampFormat: 'simple' });

// Change detail level: 'minimal', 'normal', 'verbose'
logger.configure({ level: 'normal' });
```

## Navigation Tracking

The test framework automatically tracks and logs navigation events, distinguishing between:

- **Hard Navigations**: Full page loads that create a new document
- **Soft Navigations**: Client-side route changes that don't reload the page (typical in SPA/Nuxt)

### Navigation Methods

These methods are available on the `page` object:

```javascript
// Get all navigation events
const events = page.navigationEvents();

// Get a formatted string of navigation history
const history = page.getNavigationHistory();

// Get statistics and details about navigations
const summary = page.getNavigationSummary();
console.log(`Had ${summary.hardCount} hard navigations and ${summary.softCount} soft navigations`);

// Reset the navigation inactivity timer for long operations without navigation
page.resetNavigationTimer();
```

### Navigation Logging

Navigation events are automatically logged to the console:

```
[2023-04-29T14:32:15.432Z] [NAVIGATION:HARD] https://example.com/
[2023-04-29T14:32:18.765Z] [NAVIGATION:SOFT] https://example.com/products
```

On test success, a navigation summary is printed:
```
Navigation summary: 5 total (1 hard, 4 soft)
```

On test failure, the complete navigation history is printed for debugging.

### Navigation Inactivity Timeout

The test framework includes an automatic timeout mechanism to detect when tests might be stuck or frozen. If no navigation events occur for **9 minutes**, the test will automatically fail with a detailed error message.

This helps identify tests that have become stuck in an infinite loop, hit an unexpected error, or are experiencing browser issues.

#### How It Works

1. A timer starts when the test begins
2. The timer resets automatically whenever a navigation event occurs
3. If 9 minutes pass without any navigation, the test fails with a clear error message
4. A screenshot is automatically captured to help diagnose the issue

#### For Long Operations

Some legitimate test scenarios may involve long operations without navigation (e.g., complex calculations, uploading large files). In these cases, you can manually reset the inactivity timer:

```javascript
// Reset the navigation timeout when performing a long operation without navigation
await page.resetNavigationTimer();
```

#### Example

```javascript
test('processing a large dataset', async ({ page }) => {
  await page.goto('/data-processor');
  
  // Start a long operation that doesn't involve navigation
  await page.click('.test-start-processing');
  
  // Wait for progress indicators
  for (let i = 1; i <= 10; i++) {
    // Check if progress indicator has updated
    await page.locator('.test-progress-value')
      .waitFor({ state: 'visible', timeout: timeouts.ui.slow });
      
    // Important: Reset the navigation timer during this long operation
    page.resetNavigationTimer();
    
    console.log(`Processing step ${i}/10 completed`);
  }
  
  // After processing completes, continue with the test
  await page.click('.test-view-results');
});
```

#### Common Causes of Navigation Inactivity

If a test fails with a navigation inactivity timeout, check for:

1. Infinite loops in test code
2. Modal dialogs or overlays blocking interaction
3. Network issues preventing page loading
4. Missing elements causing waitFor conditions to timeout
5. Browser crashes or freezes
6. Resource-intensive operations causing browser unresponsiveness

## Test-Friendly Selectors

### ⚠️ Avoid Using Bootstrap Classes as Selectors

Bootstrap utility classes (e.g., `d-flex`, `mt-2`, `justify-content-between`) should **not** be used as selectors in tests:

```js
// ❌ BAD: Using Bootstrap utility classes as selectors
await page.click('.mt-3.d-flex.justify-content-between');
```

These are problematic because:
1. They describe styling, not functionality
2. They often change during UI refinements
3. They may be used in multiple places
4. They're not semantically meaningful

### ✅ Use Test-Specific Classes Instead

Add dedicated test-specific classes to your Vue templates:

```vue
<!-- ✅ GOOD: Add a descriptive test class -->
<div 
  class="mt-3 d-flex justify-content-between test-donation-button"
  @click="donate"
>
  Donate Now
</div>
```

Then use these test classes in your tests:

```js
// ✅ GOOD: Using dedicated test classes
await page.click('.test-donation-button');
```

## Naming Conventions

### Test Class Prefix

All test-specific classes should use the `test-` prefix to clearly distinguish them from styling classes:

```vue
<button class="btn btn-primary test-submit-button">Submit</button>
```

### Naming Patterns

Follow these patterns for test class names:

1. **For actions**: `test-{action}-{element}`
   ```
   test-submit-button
   test-add-item
   test-delete-post
   ```

2. **For sections**: `test-{section}-{element}`
   ```
   test-header-logo
   test-sidebar-menu
   test-footer-links
   ```

3. **For specific components**: `test-{component}-{element}`
   ```
   test-message-title
   test-chat-input
   test-user-avatar
   ```

4. **For lists**: `test-{item}-list` and `test-{item}-item`
   ```
   test-message-list
   test-message-item
   ```

## Example Component with Test Classes

```vue
<template>
  <div class="message-container p-3 mb-2">
    <h2 class="message-title test-message-title">{{ message.title }}</h2>
    
    <div class="d-flex justify-content-between align-items-center">
      <span class="message-date test-message-date">{{ formatDate(message.date) }}</span>
      <div class="message-actions">
        <button class="btn btn-sm btn-outline-primary me-2 test-message-edit">
          Edit
        </button>
        <button class="btn btn-sm btn-outline-danger test-message-delete">
          Delete
        </button>
      </div>
    </div>
    
    <p class="message-body test-message-body">{{ message.body }}</p>
    
    <div class="message-footer mt-3 d-flex justify-content-between">
      <button class="btn btn-primary test-message-reply">
        Reply
      </button>
      
      <div class="message-stats test-message-stats">
        <span class="ms-2">
          <font-awesome-icon icon="heart" /> {{ message.likes }}
        </span>
        <span class="ms-2">
          <font-awesome-icon icon="comment" /> {{ message.comments }}
        </span>
      </div>
    </div>
  </div>
</template>
```

## Example Test with Test Classes

```js
test('message component displays correctly and allows interaction', async ({ page }) => {
  await page.goto('/messages/123');
  
  // Check message content using test-specific selectors
  await expect(page.locator('.test-message-title')).toContainText('Free Sofa');
  await expect(page.locator('.test-message-body')).toContainText('Brown leather sofa');
  
  // Interact with message
  await page.click('.test-message-reply');
  await expect(page.locator('.test-reply-form')).toBeVisible();
  
  // Check dynamic content rendering
  await expect(page.locator('.test-message-stats')).toContainText('5'); // Should show 5 likes
});
```

## Converting Existing Components

When working with existing components:

1. Keep the Bootstrap classes for styling
2. Add test-specific classes for elements used in tests
3. Update existing tests to use the new test classes

### Before:
```vue
<button class="btn btn-primary mt-2" @click="submit">Submit</button>
```

### After:
```vue
<button class="btn btn-primary mt-2 test-submit-button" @click="submit">Submit</button>
```

## Benefits

- **Resilience**: Tests won't break when styling changes
- **Clarity**: Test classes communicate purpose and intent
- **Maintainability**: Easy to find which elements are used in tests
- **Isolation**: Changes to styling don't affect test selectors