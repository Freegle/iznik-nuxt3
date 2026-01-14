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

IMPORTANT: When making visual/layout changes (CSS, templates, component structure), ALWAYS verify the changes using the Chrome DevTools MCP browser tools. Navigate to the affected page and take a screenshot to confirm the changes look correct before moving on. Do not make visual changes blindly without checking them in a real browser. See `../BROWSER-TESTING.md` for the full workflow guide.

## File Creation Guidelines

- When you create files, always add them to git
- Always add newly created files to git.

## Build Commands
- `npm run dev` - Start development server on port 3002 (HMR works for hot reloading)
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

- In Playwright tests, always use Playwright assertions instead of locator.waitFor() or page.waitForTimeout().
  - Allow assertions to handle waiting and timing as much as possible.
  - Only use timeouts using the timeout constants as a last resort. Always prefer assertions.
- Never use hard-coded timeouts in tests. Reuse or add to the timeouts in config.js
- Don't use a hardcoded timer value - use the constants.

### Playwright Test Development

- When adding Playwright tests, look for existing utility functions (e.g. for logging in/signing up) to use before writing the code.

## Branch Management

- **Freegle**: Built from `master` branch using `./iznik-nuxt3` directory
- **ModTools**: Built from `modtools` branch using `./iznik-nuxt3-modtools` directory
- Two separate checkouts are required because different services need different branches
- The `modtools` branch contains ModTools-specific configuration and components

## CSS/SCSS Guidelines
- **Never use `//` comments in SCSS** - they cause Vite compilation errors. Always use `/* */` style comments.
- Bootstrap is already configured for sharp corners - don't add `border-radius: 0` overrides.
- After editing Vue component styles, check the Docker logs for compilation errors: `docker logs freegle-dev-local --tail 20`

## Debugging and Investigation

- No need to run lint before investigating problems

## Test User Credentials
- Test user credentials are stored in the FreegleDocker `.env` file
- Variables: `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`
- Use these when logging in during browser testing or Playwright tests

## Browser Testing with Chrome DevTools MCP
When using browser testing tools to inspect CSS and layout:

### Site Selection
- **Always use `http://freegle-dev-live.localhost`** for browser testing - it connects to live production data
- `freegle-dev-local.localhost` uses local test database which may not have test users or sample data
- The test user credentials from `.env` will work on `freegle-dev-live`

### Login Flow
- Never close login modals - always complete the login using test credentials from `.env`
- Click "Log in" link to switch from signup to login form
- Fill email and password fields, then click Log in button

### Responsive Layout Testing
- Bootstrap breakpoints: xs (<576px), sm (576-768px), md (768-992px), lg (992-1200px), xl (1200px+)
- The VisibleWhen component uses BreakpointFettler to detect current breakpoint
- 2-column layouts typically show at xs, sm, md breakpoints (< 992px)
- Use `evaluate_script` to check current viewport: `window.innerWidth`
- Use `take_screenshot` with `fullPage: true` to see full page layout
- Use `resize_page` to dynamically change viewport size for different breakpoints

### Chrome DevTools MCP Setup (WSL)
The MCP launches Chrome in WSL and displays via X server (MobaXterm or WSLg).

**Prerequisites:**
1. Install Chrome in WSL: `sudo dpkg -i google-chrome-stable_current_amd64.deb`
2. Have X server running (MobaXterm built-in, or WSLg on Windows 11)
3. Set DISPLAY if needed: `export DISPLAY=:0`

**MCP Configuration** (in `~/.claude.json` under project mcpServers):
```json
"chrome-devtools": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "chrome-devtools-mcp@latest", "--viewport", "820x1180"]
}
```

**Viewport sizes for Bootstrap breakpoints:**
- xs: 375x667 (mobile)
- sm: 576x800 (large mobile)
- md: 768x1024 (tablet portrait)
- md-lg: 820x1180 (iPad Air - good for 2-column testing)
- lg: 992x768 (tablet landscape)
- xl: 1200x900 (desktop)

**Dynamic resizing:** Use `resize_page` MCP tool to change viewport without restarting.

**Note:** Connecting to Windows Chrome via `--browserUrl` doesn't work reliably due to WSL/Windows network issues. Use WSL Chrome instead.

### Lightweight Dev Setup
When using the lightweight dev setup (freegle-dev-live container):
- The site is accessible at `http://localhost:3004/` (not via `.localhost` domains - Traefik is not running)
- To launch Chrome for testing: `DISPLAY=:0 google-chrome --user-data-dir=/tmp/chrome-debug --remote-debugging-port=9222 "http://localhost:3004/chats/28" &`
- Copy changed files to container: `docker cp /home/edward/FreegleDocker/iznik-nuxt3/components/MyComponent.vue freegle-dev-live:/app/components/`
- The container uses live production APIs but runs the dev server locally with hot reloading