const { test, expect } = require('./fixtures')

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

      const title = await pageObj.title()
      expect(title).toContain(page.title)
    })
  }
})
