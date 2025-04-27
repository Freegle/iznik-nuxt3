# Playwright Testing Guidelines

This document outlines best practices for writing Playwright tests for our Nuxt 3 application.

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