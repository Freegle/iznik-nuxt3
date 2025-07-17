const fs = require('fs')
const path = require('path')
const { test: base } = require('@playwright/test')

// Extend the base test to include coverage collection
const test = base.extend({
  context: async ({ context }, use) => {
    await use(context)

    // After each test, collect coverage
    const coverageDir = path.join(process.cwd(), 'coverage')
    const tempDir = path.join(coverageDir, 'tmp')

    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true })
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Get coverage from all pages
    for (const page of context.pages()) {
      try {
        const coverage = await page.evaluate(() => window.__coverage__)
        if (coverage) {
          const timestamp = Date.now()
          const pid = process.pid
          const coverageFile = path.join(
            tempDir,
            `coverage-${timestamp}-${pid}.json`
          )
          fs.writeFileSync(coverageFile, JSON.stringify(coverage, null, 2))
        }
      } catch (error) {
        // Coverage data might not be available on all pages
        console.log('No coverage data available for page:', error.message)
      }
    }
  },
})

module.exports = { test }
