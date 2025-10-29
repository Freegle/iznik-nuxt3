# iznik-nuxt3

Iznik is a platform for online reuse of unwanted items.  This is the front-end client.  

The old version is [here](https://github.com/Freegle/iznik-nuxt).

There is a Docker Compose development environment which can be used to run a complete standalone system; see [FreegleDocker](https://github.com/Freegle/FreegleDocker).

The development has been funded by [Freegle](https://www.ilovefreegle.org) for use in the UK,
but it is an open source platform which can be used or adapted by others.  Other contributors very welcome,
especially those with design/UX expertise.

**It would be very lovely if you sponsored us.**

[:heart: Sponsor](https://github.com/sponsors/Freegle)

License
=======

This code is licensed under the GPL v2 (see LICENSE file).  If you intend to use it, Freegle would be interested to
hear about it; you can mail <geeks@ilovefreegle.org>.

# Development

Currently only tested on node v18 and npm v9.7.

Then install all the dependencies:
```
npm i
```

Set some environment variables:
```
IZNIK_API_V1=https://fdapidbg.ilovefreegle.org/api
IZNIK_API_V2=https://api.ilovefreegle.org/apiv2
```

(if running the Go Server locally then http://localhost:8192/api)

Then start the dev server:
```
npm run dev
```

This will serve up the site at [127.0.0.1:3002](http://127.0.0.1:3002).  **If you use localhost instead of 127.0.0.1 you may find page load extremely slow.**

It will watch for changes and do hot module reloading.  Occasionally you'll need to restart Vite when it doesn't 
pick up a change.

## Git Hooks

The project uses Git hooks to ensure code quality. These hooks are cross-platform and work on both Linux and Windows environments (including Git Bash, WSL, and MINGW).

The hooks are installed automatically when you run `npm install` through the `prepare` script.

Key features:
- Pre-commit hook that runs ESLint on staged files (excludes TypeScript .ts and .tsx files)
- Cross-platform compatibility with proper path handling
- Automatic OS detection and environment-specific behavior
- Proper handling of file paths with spaces
- Clear, colorful status messages

If you need to manually install or update the hooks:
```
./setup-hooks.sh
```

If you need to bypass the hooks for a specific commit:
```
git commit --no-verify
```

## Testing

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. The tests are deliberately configured to run in series with a single worker to ensure resource stability and prevent conflicts in the Docker environment.

### Key Testing Configuration:
- **Serial Execution**: Tests run one at a time (`fullyParallel: false`, `workers: 1`)
- **Single Worker**: Prevents resource contention and hanging tests
- **Breakpoint Tests**: Homepage tests run all viewport sizes in series within a single test function

### Running Tests:
```bash
# Run all Playwright tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Clean test artifacts
npm run test:clean
```

The serial configuration ensures reliable test execution in containerized environments while maintaining comprehensive test coverage across all responsive breakpoints.

# Technologies

Briefly:
* [Nuxt 3](https://v3.nuxtjs.org/), which is [Vue 3](https://vuejs.org/) (so we get all
  that nice reactive stuff), with a standard folder layout, SSR/static site generation and Pinia as a replacement 
  for Vuex.
* [Bootstrap Vue Next](https://github.com/bootstrap-vue/bootstrap-vue-next/), which is Bootstrap v5 for Vue 3 / Nuxt 3.
* Continuous Delivery via Netlify.
* Capacitor app.

<img src="http://www.browserstack.com/images/layout/browserstack-logo-600x315.png" width="280"/>

[BrowserStack](http://www.browserstack.com) is supporting Freegle, allowing us to use their service and infrastructure to test the code in this repository. Thank you for supporting the open source community!
 
