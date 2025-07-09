# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Safe Commands to Run
These commands can be run by Claude without asking for permission:
- `eslint --fix <file1> <file2>` - Fix code style issues in specific files
- `npm run test` - Run Playwright tests
- `git status` - Check repository status
- `git diff` - Show code changes
- `npm list <package>` - Check installed package versions
- `npx prettier --check <file>` - Check file formatting
- `npm run typecheck` - Verify TypeScript types (if available)
- `grep <pattern> <files>` - Search for patterns in files
- `find <path> <options>` - Find files matching criteria

IMPORTANT: After making code changes, always run `eslint --fix` on the specific files changed and remove any unused code detected by the linter.

## Build Commands
- `npm run dev` - Start development server on port 3002
- `npm run build` - Build for production
- `eslint --fix <file>` - Fix code style issues for specific files

## Testing
- `npm run test` - Run Playwright end-to-end tests (against dev server)
- `npm run test:ui` - Run Playwright tests with UI
- `npm run test:headed` - Run Playwright tests in headed mode
- `npm run test:debug` - Run Playwright tests in debug mode
- `npm run test:prod` - Run tests against production site
- `npm run test:clean` - Remove test artifacts and reports
- `npm run test:ci` - Clean and run tests (used in CI)
- To customize server: `TEST_BASE_URL=https://example.com npm run test`
- For single test: `npx playwright test tests/e2e/file.spec.js`
- For specific test: `npx playwright test -g "test name pattern"`

### Playwright Setup Notes
- First time setup: `npm install @playwright/test`
- Install browsers: `npx playwright install`
- For WSL/Linux, may need system dependencies: `sudo npx playwright install-deps`
- Tests automatically start the dev server via webServer configuration in playwright.config.js
- Tests use environment variable `TEST_BASE_URL` to determine server URL
- IMPORTANT: Never mark tests with `.skip()` - all tests should be runnable

### Nuxt Test Utils Integration
- `@nuxt/test-utils` is installed for enhanced e2e testing capabilities
- **IMPORTANT**: Tests must be run from Windows (not WSL) and require dev server to be running first
- **Local development**: 
  1. Start dev server first: `npm run dev` (runs on port 3002)
  2. Run tests from a separate terminal: `npm run test`
  3. Tests expect server at `http://127.0.0.1:3002`
- **CI environment**: CircleCI manually manages the production server on port 3000
- Custom fixtures in `tests/e2e/fixtures.js` provide enhanced testing capabilities while maintaining compatibility
- Tests handle slow loading gracefully and provide clear error messages when dev server is not running
- The NUXT_TEST_UTILS_AVAILABLE flag is exported from fixtures for conditional testing features
- Tests include improved timeout handling and storage cleanup error prevention

## Code Style Guidelines
- **Formatting**: Use Prettier with semicolons disabled and single quotes
- **Components**: Use Vue 3 Composition API with `<script setup>` syntax
- **Naming**: Use PascalCase for component names and camelCase for variables
- **Imports**: Use ES module imports and prefer destructured imports from #imports
- **Error Handling**: Use try/catch blocks for async operations
- **Props**: Define prop types and default values with defineProps()
- **Store Access**: Use Pinia stores with the useXStore pattern
- **Nuxt 3**: Follow Nuxt 3 conventions for pages, layouts, and components
- **TypeScript**: Use TypeScript type annotations where possible
- **Emits**: Define component emits with defineEmits()
- **Comments**: Do NOT add explanatory comments for obvious concepts or standard operations
- **Documentation**: Assume the reader understands Vue Single File Component structure and patterns
- **Async Functions**: NEVER use the `async` keyword unless the function contains at least one `await` statement. Regular functions that return a Promise don't need the `async` keyword.
  ```javascript
  // CORRECT - Using async with await
  const fetchData = async () => {
    const result = await api.getData()
    return result
  }
  
  // CORRECT - No async keyword when no await is used
  const handleClick = () => {
    fetchData().then(result => {
      // do something with result
    })
  }
  
  // WRONG - Using async without await
  const processItem = async (item) => {
    return item.id * 2 // No await, so async is unnecessary
  }
  
  // WRONG - Event handler with no await statements shouldn't be async
  const handleSubmit = async (event) => {
    event.preventDefault()
    submitForm().then(response => {
      showSuccess()
    })
  }
  
  // CORRECT - The same handler without async
  const handleSubmit = (event) => {
    event.preventDefault()
    submitForm().then(response => {
      showSuccess()
    })
  }
  
  // WRONG - Function that calls async functions but never awaits them
  const processList = async (items) => {
    items.forEach(item => {
      processItem(item) // This returns a Promise but we're not awaiting it
    })
  }
  
  // CORRECT - Same function without async since there's no await
  const processList = (items) => {
    items.forEach(item => {
      processItem(item)
    })
  }
  ```
  
  This rule applies to ALL function types:
  - Arrow functions
  - Function declarations
  - Method definitions
  - Event handlers
  - Callback functions
  - Computed property setters

### User Data Access
Always use the `useMe` composable to access the current user information:

```javascript
// Import the composable
import { useMe, fetchMe } from '~/composables/useMe'

// Extract what you need
const { me, myid, loggedIn, myGroups } = useMe()

// Access user data with .value since it's a computed ref
const username = me.value?.displayname

// Use fetchMe(true) to force a server refresh when needed
const updateUserData = async () => {
  await fetchMe(true)
}
```

Key benefits of using the useMe composable:
- Provides consistent access to user data across components
- Offers helper computed properties (myid, loggedIn, etc.)
- Handles loading states and data fetching
- Better performance than accessing the auth store directly

### Git Hooks Setup
- The project uses custom Git hooks for managing pre-commit hooks
- Pre-commit hook automatically runs ESLint on staged files (TypeScript .ts and .tsx files are excluded)
- Custom script `run-lint-on-changed.sh` handles the linting
- This script is cross-platform compatible (works on both Linux and Windows)
- Git hooks are installed using the `setup-hooks.sh` script (run via `npm run prepare`)
- The custom pre-commit hook template is in the project root (`pre-commit`)
- Key cross-platform features:
  - Detects operating system (Windows vs. Unix-like)
  - Sets up proper Node/npm paths for different environments
  - Handles NVM if available on Unix systems
  - Proper file path handling for Windows and Linux
  - Spaces in filenames are handled correctly
- All Git hooks scripts are tested on both Windows and Linux environments
- Hook scripts provide clear status messages and error handling

## E2E Testing Guidelines
- Place tests in `tests/e2e` directory
- Use page object pattern for complex UI interactions
- Default test URL is configured via `baseURL` in playwright.config.js
- Override with `TEST_BASE_URL` environment variable as needed

### Playwright Test Structure
- Use the custom fixtures from `fixtures.js` for consistent behavior
- IMPORTANT: Use the configuration from `config.js` for test parameters like timeouts, selectors, and breakpoints
- Never use hardcoded timeout values - always use the constants from the config file
- Timeouts are categorized (navigation, ui, api, teardown, assertion) in the config for clear intent
- Timeouts are automatically extended by 50% in CI environments
- Default timeouts are generous to accommodate slower CI environments and reduce flakiness
- Sentry is automatically disabled during tests via environment variables in playwright.config.js to prevent error reporting during tests
- Selectors should be defined in the config file and referenced in tests
- Use built-in test fixtures for globally unique test data:
  - `testEmail` - provides a random globally unique date-time stamped email for each test
  - `getTestEmail` - function to generate custom prefixed emails (e.g., `getTestEmail('furniture')`)
- Navigation and verification should use `page.gotoAndVerify(path, options)` 
- `gotoAndVerify` automatically checks for error pages, detecting both "Something went wrong" and 404 "page doesn't exist" errors
- Console errors are automatically checked at the end of each test
- For manual console error checking, use `page.checkTestRanOK()` (previously `expectNoConsoleErrors`)
- Whitelist expected/harmless console errors using regex patterns in `fixtures.js`
- Ad-related 403 errors (with URLs containing "pagead", "googleads", "doubleclick", or "ads") are automatically ignored
- Add test-specific allowed errors with `page.addAllowedErrorPattern(regex|string)`
- View error summaries with `page.getErrorSummary()` for debugging
- Use helper functions from `helpers.js` for common test operations
- Page fixture automatically tracks and reports console errors
- Automatic full-page screenshots are captured for any test failures
- All screenshots are stored in the `playwright-screenshots` directory
- Screenshots are automatically cleaned up after successful test runs
- Failed test screenshots are preserved for debugging
- Use `npm run test:clean` to remove all screenshots manually
- Automatic teardown waits for network idle after each test (timeout from config)
- Manual teardown available with `page.waitForTeardown(options)` when needed
- For testing multiple pages, use parameterized tests with arrays of page data
- Focus on testing public pages that don't require authentication
- Tests should only need to navigate to pages and make assertions
- No need for explicit console error checks, try-catch blocks, or screenshot capture
- Code should be self-documenting with clear method and variable names
- Test files should be concise and free of explanatory comments
- When adding new timeouts or selectors, add them to the appropriate section in `config.js`
- Use the test user utilities to create consistent test user data:
  - `testUsers.getRandomUser()` returns a random test user with email, password, etc.
  - `testUsers.getRegularUser()` returns a standard test user for login tests
  - `testUsers.getModeratorUser()` returns a moderator test user
  - Test email addresses use the domain from `environment.email.domain` (default ahoogroups.com)
  - Generate custom test emails with `environment.email.getRandomEmail()` and `environment.email.getEmailForUser()`
- IMPORTANT: Do NOT create separate example or demonstration spec.js files; implement tests in the appropriate existing test files
- Each test file should focus on a specific feature or workflow, not just demonstrate API usage
- When implementing new test fixtures or utilities:
  - Document them in CLAUDE.md
  - Add them to existing test files where they make sense
  - Do not create "example" tests just to show how to use them
  - Ensure all tests are fully functional, not partial demonstrations

#### Playwright Fixture Guidelines
- **Reuse before recreate**: Before adding non-trivial logic directly to a test, first check if similar functionality exists in existing fixtures
- **Create fixtures for complex flows**: When test logic becomes non-trivial (more than 10-15 lines of repeated code), extract it into a reusable fixture
- **Common fixture patterns to look for**:
  - User authentication flows (login, signup, logout)
  - Form submissions and validation
  - Navigation to specific pages with data setup
  - Multi-step user workflows (post message, reply to message, etc.)
  - Data cleanup and teardown operations
- **Fixture naming conventions**: Use descriptive names that clearly indicate the action and outcome (e.g., `postMessage`, `replyToMessageWithSignup`, `withdrawPost`)
- **Fixture parameters**: Design fixtures to accept configuration objects with required and optional parameters for flexibility
- **Documentation**: Include JSDoc comments for fixtures explaining parameters, return values, and behavior
- **Examples of good fixture extraction**:
  - Instead of manually filling login forms in each test, use `loginViaHomepage(page, email, password)`
  - Instead of repeating message posting logic, use `postMessage({ type, item, description, email })`
  - Instead of manual post withdrawal, use `withdrawPost({ item })`

### Playwright Best Practices
- WSL users: Run `sudo npx playwright install-deps` to install system dependencies
- Edit playwright.config.js to uncomment additional browsers when needed
- For debugging: Use `--headed` flag to see browsers or `--debug` for step-by-step execution
- **CRITICAL: NEVER use `.skip()` or `.only()` in committed tests** - all tests MUST be enabled at all times
  - DO NOT add tests that are meant to be skipped
  - DO NOT create placeholder or example tests
  - If a test needs work, either fix it completely or don't commit it at all
  - Never commit code with skipped, non-functional, or example-only tests
- If a test is temporarily problematic but should remain in the suite, rename it with a descriptive prefix like `test('FIXME: broken test - homepage should...', async...)`
- Make tests that work with both development and production environments
- Use try/catch blocks with screenshots for better error diagnosis
- Always retry tests once automatically to collect Playwright debug information and screenshots 
- **IMPORTANT**: For element selection, buttons are implemented as either `div` or `a` elements with the class `btn`, not as native `<button>` elements. Follow these guidelines:
  1. Use selectors that match both possibilities, like `.btn:has-text("Button Text")` instead of `button:has-text("Button Text")` or `text=Button Text`
  2. ALWAYS filter for visible elements and use `.first()` when clicking buttons:
     - Use `.filter({ visible: true }).first()` to ensure you're only clicking visible elements
     - This prevents tests from failing when there are hidden buttons with the same text
  
  ```javascript
  // CORRECT: Use these formats for button selectors
  page.locator('.btn:has-text("Save")').filter({ visible: true }).first().click();
  
  // WRONG: Do not use these formats
  page.locator('button:has-text("Save")').click(); // Wrong element type
  page.locator('text=Save').click(); // Too generic
  page.locator('div.btn:has-text("Save")').click(); // Too specific, might miss <a> buttons
  page.locator('.btn:has-text("Save")').click(); // Missing .first(), can be ambiguous
  page.locator('.btn:has-text("Save")').first().click(); // Not filtered for visibility
  ```

### Maintaining Page Tests
- When adding new public pages, add them to the `publicPages` array in `pages.spec.js`
- Ensure page titles in tests match the actual page titles (check the `buildHead` function in the page)

## Development Workflow
- After making code changes, always run `eslint --fix <changed-files>` to catch and fix style issues
- Be specific about which files to lint rather than running on the entire codebase
- Remove any unused variables, imports, or code identified by the linter rather than disabling warnings
- Git hooks automatically run ESLint on changed files before commit

### Cross-Platform Compatibility
- **IMPORTANT**: Any scripts or Git hooks added to the project MUST work on both Windows and Linux environments
- All shell scripts should use `#!/usr/bin/env bash` as the shebang line
- Scripts should detect the OS environment and handle path differences accordingly:
  ```bash
  # Detect operating system
  case "$(uname -s)" in
    CYGWIN*|MINGW*|MSYS*)
      IS_WINDOWS=1
      echo "🖥️ Windows environment detected"
      ;;
    *)
      IS_WINDOWS=0
      echo "🐧 Unix-like environment detected"
      ;;
  esac
  ```
- Test Windows compatibility using Git Bash, WSL, or MINGW environments
- Use Node.js scripts instead of shell scripts for complex operations
- For file operations, use cross-platform libraries like `path` and `fs` modules
- Always use relative paths from project root or environment variables
- Avoid platform-specific commands or syntax
- When running commands with file lists, handle spaces in filenames properly:
  ```bash
  # For Windows (create temp file with null separators)
  if [ "$IS_WINDOWS" -eq 1 ]; then
    # Create a temporary file with NUL-separated list for xargs
    temp_file=$(mktemp -t filelist.XXXXXX)
    printf "%s\0" "${files[@]}" > "$temp_file"
    xargs -0 -a "$temp_file" npx eslint --fix
    rm "$temp_file"
  else
    # For Unix systems, pass files directly
    npx eslint --fix "${files[@]}"
  fi
  ```
- For Windows/Node.js path handling, ensure paths work properly in Git hooks:
  ```bash
  # Find Node and npm binaries for both Windows and Unix
  setup_path() {
    # Add common paths where Node can be found
    if [ "$IS_WINDOWS" -eq 1 ]; then
      # Windows paths
      export PATH="$PATH:/c/Program Files/nodejs:/c/Program Files (x86)/nodejs"
      # Add npm global path
      if [ -d "$APPDATA/npm" ]; then
        export PATH="$PATH:$APPDATA/npm"
      fi
    else
      # Unix paths
      export PATH="$PATH:/usr/local/bin:/usr/local"
      # Load NVM if available (Unix only)
      if [ -f "$HOME/.nvm/nvm.sh" ]; then
        export NVM_DIR="$HOME/.nvm"
        # This loads nvm
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        # Use the project's Node version if .nvmrc exists
        [ -f ".nvmrc" ] && nvm use
      fi
    fi
  }
  ```
- Scripts should provide clear status output and error messages
- When creating/installing Git hooks, use setup scripts to ensure cross-platform compatibility
- All scripts should have proper error handling and exit codes

## CI Pipeline
- CircleCI is configured to run on master, develop, production, and feature branches
- Uses Node.js 18.20.8 with browser support
- The workflow includes build and test phases:
  1. Install dependencies and Playwright
  2. Run linting checks
  3. Build the application for production
  4. Serve the built application
  5. Run end-to-end tests against the built app
- Tests verify the actual production build, not the development server
- Build artifacts, test results, and screenshots are stored for debugging
- Tests should pass in CI before merging changes
- The configuration includes filters to only run on specific branch patterns

### CircleCI Environment Variables
- `API_V1_URL` - API V1 URL (defaults to https://fdapilive.ilovefreegle.org/api)
- `API_V2_URL` - API V2 URL (defaults to https://api.ilovefreegle.org/apiv2)
- `TEST_BASE_URL` - URL for testing (defaults to http://localhost:3002)
- `TEST_POSTCODE` - Postcode to use for location-based tests (defaults to EH3 6SS)
- `TEST_PLACE` - Place name to use for location-based tests (defaults to Edinburgh)
- `TEST_EMAIL_DOMAIN` - Domain to use for test email addresses (defaults to yahoogroups.com)
- `STRIPE_PUBLISHABLE_KEY` - Stripe test mode publishable key for payment testing
- `SERVER_TIMEOUT` - Timeout for server startup in seconds (defaults to 120)

## Commenting Guidelines
- Code should be self-documenting with clear naming
- Avoid adding comments for obvious Vue patterns or structures 
- Only add comments for complex logic, non-obvious business rules, or workarounds
- Never add section comments like "// Methods", "// Computed properties", etc.
- In test files, do not add comments explaining what each line does
- In fixtures and helpers, focus on clear naming rather than explanatory comments

## Automated Operations Guidelines
Claude can automatically perform these operations without prompting:
- Running `eslint --fix` on specific changed files
- Running tests
- Reading code files to understand project structure
- Installing development dependencies
- Creating and running tests
- Making formatting changes that follow project standards
- Analyzing code for bugs or performance issues
- Adding type annotations to existing code
- Creating small utility functions
- Refactoring code that maintains the same behavior
- Removing unused code identified by the linter
- Searching for code patterns using grep, find, or similar tools
- Exploring the codebase to locate files or identify patterns

Actions that require explicit user permission:
- Installing production dependencies
- Changing core business logic
- Modifying state management
- Making API changes
- Updating third-party integrations
- Installing new frameworks or major dependencies

## Automated Code Verification
After making code changes, Claude should ALWAYS run these commands automatically:
- `npm run lint` or `eslint --fix --ext .js,.jsx,.ts,.vue <specific-files>` - Fix code style issues
- Check for any unused code and remove it as identified by the linter

For specific files:
```bash
eslint --fix path/to/file1.vue path/to/file2.js
```

When modifying multiple files, use:
```bash
npm run lint
```

### Playwright Memory Notes
- Use event driven Playwright tests not timers.

### WSL Testing Considerations
- Don't run npm run test - you can't in WSL