# Playwright Testing Guidelines

This document outlines best practices for writing Playwright tests for our Nuxt 3 application.

## Test Email Management

The tests generate and track temporary email addresses that are used during test runs. These email addresses are recorded for later cleanup to prevent test user accounts from accumulating in the system.

### Automatic Email Registration

Email addresses are automatically registered in two ways:

1. Using the `testEmail` fixture which generates a random email address
2. Using the `registerTestEmail` fixture which allows you to explicitly register any email address

### Using Email Registration

#### Standard Usage with Auto-Generated Email

```javascript
test('My test with auto email', async ({ page, testEmail, postMessage }) => {
  // testEmail is automatically registered for cleanup
  
  // Use the email in your test
  await postMessage({
    type: 'OFFER',
    item: 'test item',
    description: 'test description',
    email: testEmail,
  });
});
```

#### Custom Email Registration

```javascript
test('My test with custom email', async ({ page, registerTestEmail }) => {
  // Create a custom email and register it manually
  const customEmail = `custom-${Date.now()}@example.com`;
  registerTestEmail(customEmail);
  
  // Now use the custom email in your test
  // It will be tracked for later cleanup
});
```

#### Getting All Registered Emails

```javascript
test('Check registered emails', async ({ getRegisteredEmails }) => {
  // Get array of all registered emails
  const allEmails = getRegisteredEmails();
  console.log('Registered emails:', allEmails);
});
```

### Email Cleanup

All registered test emails are saved to `test-emails.json` in the project root after each test run.

To manage these test emails, use the cleanup utility:

```bash
# List all test emails
node tests/e2e/cleanup-test-emails.js list

# Delete all test users
node tests/e2e/cleanup-test-emails.js delete
```

For the delete operation, you need to set environment variables:
- `API_KEY`: Your API key for authorization
- `API_URL`: The base URL of your API

## Available Fixtures

The test framework includes several custom fixtures to simplify tests:

- `testEmail`: Generates a unique test email for each test
- `getTestEmail(prefix)`: Function to generate custom test emails with specific prefixes
- `registerTestEmail(email)`: Manually register an email for cleanup
- `getRegisteredEmails()`: Get array of all registered emails
- `postMessage(options)`: Helper to post a message (OFFER or WANTED)
- `verifyPost(options)`: Helper to verify a post on My Posts page

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