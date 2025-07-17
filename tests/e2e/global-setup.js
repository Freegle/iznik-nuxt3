const fs = require('fs')
const path = require('path')

function globalSetup() {
  // Clean up any existing coverage data
  const coverageDir = path.join(process.cwd(), 'coverage')
  const tempDir = path.join(coverageDir, 'tmp')

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }

  // Create directories
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true })
  }
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  console.log('Coverage setup: Created coverage directories')
}

module.exports = globalSetup
