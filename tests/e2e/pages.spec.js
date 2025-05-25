const { test, expect } = require('./fixtures')

// Enable Nuxt test utilities if available
if (typeof test.beforeAll === 'function') {
  test.beforeAll(() => {
    // Nuxt test utils setup can go here if needed
    console.log('Running with Nuxt test utilities enabled')
  })
}

const publicPages = [
  { path: '/', title: "Don't throw it away, give it away!" },
  { path: '/about', title: 'About Us' },
  { path: '/terms', title: 'Terms of Use' },
  { path: '/privacy', title: 'Privacy' },
  { path: '/help', title: 'Help' },
  { path: '/donate', title: 'Donate to Freegle' },
  { path: '/disclaimer', title: 'Disclaimer' },
  { path: '/forgot', title: 'Lost Password' },
  { path: '/jobs', title: 'Jobs' },
]

test.describe('Public pages tests', () => {
  for (const page of publicPages) {
    test(`${page.path} should load without console errors`, async ({
      page: pageObj,
    }) => {
      await pageObj.gotoAndVerify(page.path)

      // Wait for the page to load properly (not the "Starting Nuxt..." loading page)
      await pageObj.waitForFunction(
        () => {
          return (
            document.title !== 'Starting Nuxt... | Nuxt' &&
            document.title.length > 0
          )
        },
        { timeout: 30000 }
      )

      const title = await pageObj.title()
      expect(title).toContain(page.title)
    })
  }
})
