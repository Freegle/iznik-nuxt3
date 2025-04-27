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
- For local tests, start dev server first: `npm run dev` (in separate terminal)
- Tests use environment variable `TEST_BASE_URL` to determine server URL
- IMPORTANT: Never mark tests with `.skip()` - all tests should be runnable

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

## E2E Testing Guidelines
- Place tests in `tests/e2e` directory
- Use page object pattern for complex UI interactions
- Default test URL is configured via `baseURL` in playwright.config.js
- Override with `TEST_BASE_URL` environment variable as needed

### Playwright Test Structure
- Use the custom fixtures from `fixtures.js` for consistent behavior
- Navigation and verification should use `page.gotoAndVerify(path, options)` 
- `gotoAndVerify` automatically checks for error pages, detecting both "Something went wrong" and 404 "page doesn't exist" errors
- Console errors are automatically checked at the end of each test
- For manual console error checking, use `page.checkTestRanOK()` (previously `expectNoConsoleErrors`)
- Whitelist expected/harmless console errors using regex patterns in `fixtures.js`
- Add test-specific allowed errors with `page.addAllowedErrorPattern(regex|string)`
- View error summaries with `page.getErrorSummary()` for debugging
- Use helper functions from `helpers.js` for common test operations
- Page fixture automatically tracks and reports console errors
- Automatic full-page screenshots are captured for any test failures
- All screenshots are stored in the `playwright-screenshots` directory
- Screenshots are automatically cleaned up after successful test runs
- Failed test screenshots are preserved for debugging
- Use `npm run test:clean` to remove all screenshots manually
- Automatic teardown waits for network idle after each test (5s timeout)
- Manual teardown available with `page.waitForTeardown(options)` when needed
- For testing multiple pages, use parameterized tests with arrays of page data
- Focus on testing public pages that don't require authentication
- Tests should only need to navigate to pages and make assertions
- No need for explicit console error checks, try-catch blocks, or screenshot capture
- Code should be self-documenting with clear method and variable names
- Test files should be concise and free of explanatory comments

### Playwright Best Practices
- WSL users: Run `sudo npx playwright install-deps` to install system dependencies
- Edit playwright.config.js to uncomment additional browsers when needed
- For debugging: Use `--headed` flag to see browsers or `--debug` for step-by-step execution
- NEVER use `.skip()` - all tests should be enabled at all times
- If a test is temporarily problematic, use descriptive test naming like `test('FIXME: broken test - homepage should...', async...)`
- Make tests that work with both development and production environments
- Use try/catch blocks with screenshots for better error diagnosis
- Set appropriate timeouts for heavy pages
- Always retry tests once automatically to handle collect Playwright debug information and screenshots 

### Maintaining Page Tests
- When adding new public pages, add them to the `publicPages` array in `pages.spec.js`
- Ensure page titles in tests match the actual page titles (check the `buildHead` function in the page)
- For pages with special requirements (auth, params), create specific test files
- Test only public pages that don't require login or special parameters

## Development Workflow
- After making code changes, always run `eslint --fix <changed-files>` to catch and fix style issues
- Be specific about which files to lint rather than running on the entire codebase
- Remove any unused variables, imports, or code identified by the linter rather than disabling warnings
- Make small, focused commits with clear messages
- Run tests after significant changes to verify functionality

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
- `TEST_URL` - URL for testing (defaults to http://localhost:3002)
- `SERVER_TIMEOUT` - Timeout for server startup in seconds (defaults to 60)

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

Actions that require explicit user permission:
- Installing production dependencies
- Changing core business logic
- Modifying state management
- Making API changes
- Updating third-party integrations
- Installing new frameworks or major dependencies