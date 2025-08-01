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

### WSL Testing Considerations
- When in WSL, and running lint, use run-lint-on-changed.sh
- Don't run npm run test - you can't in WSL
- When running Playwright tests in WSL, use --headed option and only run using the Chrome browser

### Playwright Setup Notes
- First time setup: `npm install @playwright/test`
- Install browsers: `npx playwright install`
- For WSL/Linux, may need system dependencies: `sudo npx playwright install-deps`
- Tests automatically start the dev server via webServer configuration in playwright.config.js
- Tests use environment variable `TEST_BASE_URL` to determine server URL
- IMPORTANT: Never mark tests with `.skip()` - all tests should be runnable

### Playwright Testing Best Practices
- In Playwright tests, never use `expect().toBeVisible()`. Use `locator.waitFor({ state: 'visible', timeout: ... })`
- Never use hard-coded timeouts in tests.  Reuse or add to the timeouts in config.js

### Playwright Test Development
- When adding Playwright tests, look for existing utility functions (e.g. for logging in/signing up) to use before writing the code.

## Debugging and Investigation
- No need to run lint before investigating problems