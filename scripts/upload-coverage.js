const fs = require('fs')
const path = require('path')

// Check if running in CI environment
const isCI =
  process.env.CI || process.env.CIRCLECI || process.env.GITHUB_ACTIONS

// Path to LCOV file
const lcovPath = path.join(process.cwd(), 'coverage', 'lcov.info')

if (!fs.existsSync(lcovPath)) {
  console.error('No coverage/lcov.info file found')
  process.exit(1)
}

const lcovContent = fs.readFileSync(lcovPath, 'utf8')
console.log('LCOV file found with content length:', lcovContent.length)

if (!isCI) {
  console.log(
    'Not running in CI environment. Coverage would be uploaded in CI.'
  )
  console.log('LCOV content preview:')
  console.log(lcovContent.substring(0, 200) + '...')
  process.exit(0)
}

// Log CI environment information
if (process.env.CIRCLECI) {
  console.log('Running in CircleCI environment')
  console.log('Branch:', process.env.CIRCLE_BRANCH)
  console.log('Build number:', process.env.CIRCLE_BUILD_NUM)
} else if (process.env.GITHUB_ACTIONS) {
  console.log('Running in GitHub Actions environment')
  console.log('Branch:', process.env.GITHUB_REF)
}

// In CI environment, we'll use the coveralls package
const coveralls = require('coveralls')

coveralls.handleInput(lcovContent, (err) => {
  if (err) {
    console.error('Error uploading to Coveralls:', err)
    process.exit(1)
  }
  console.log('Coverage uploaded to Coveralls successfully!')
})
