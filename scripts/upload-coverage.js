const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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

// Get git information from the submodule (iznik-nuxt3), not the parent repo
// This is important when running in CircleCI where we're in a submodule
let gitInfo = {}
try {
  const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
  const branch =
    process.env.CIRCLE_BRANCH ||
    execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
  const authorName = execSync('git log -1 --format=%an', {
    encoding: 'utf8',
  }).trim()
  const authorEmail = execSync('git log -1 --format=%ae', {
    encoding: 'utf8',
  }).trim()
  const message = execSync('git log -1 --format=%s', {
    encoding: 'utf8',
  }).trim()

  gitInfo = {
    head: {
      id: commitSha,
      author_name: authorName,
      author_email: authorEmail,
      committer_name: authorName,
      committer_email: authorEmail,
      message,
    },
    branch,
    service_name: 'circleci',
    service_job_id: process.env.CIRCLE_BUILD_NUM,
  }
  console.log('Using submodule git info:')
  console.log('  Commit:', commitSha.substring(0, 8))
  console.log('  Branch:', branch)
} catch (e) {
  console.warn('Could not get git info from submodule:', e.message)
}

// Log CI environment information
if (process.env.CIRCLECI) {
  console.log('Running in CircleCI environment')
  console.log('CircleCI Branch:', process.env.CIRCLE_BRANCH)
  console.log('Build number:', process.env.CIRCLE_BUILD_NUM)
} else if (process.env.GITHUB_ACTIONS) {
  console.log('Running in GitHub Actions environment')
  console.log('Branch:', process.env.GITHUB_REF)
}

// In CI environment, we'll use the coveralls package
const coveralls = require('coveralls')

// Use our submodule git info
const options = Object.keys(gitInfo).length > 0 ? { git: gitInfo } : undefined

coveralls.handleInput(
  lcovContent,
  (err) => {
    if (err) {
      console.error('Error uploading to Coveralls:', err)
      // Don't fail the build on coverage upload errors - tests passed which is what matters
      console.log('Warning: Coverage upload failed, but tests passed')
      process.exit(0)
    }
    console.log('Coverage uploaded to Coveralls successfully!')
  },
  options
)
