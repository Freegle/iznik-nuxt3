const fs = require('fs')
const path = require('path')

function globalTeardown() {
  // Merge all coverage files
  const coverageDir = path.join(process.cwd(), 'coverage')
  const tempDir = path.join(coverageDir, 'tmp')

  if (!fs.existsSync(tempDir)) {
    console.log('No coverage temp directory found')
    return
  }

  const files = fs.readdirSync(tempDir).filter((file) => file.endsWith('.json'))

  if (files.length === 0) {
    console.log('No coverage files found to merge')
    return
  }

  const mergedCoverage = {}

  for (const file of files) {
    const filePath = path.join(tempDir, file)
    try {
      const coverage = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      // Merge coverage data
      for (const [filename, fileCoverage] of Object.entries(coverage)) {
        if (!mergedCoverage[filename]) {
          mergedCoverage[filename] = fileCoverage
        } else {
          // Merge statement, function, and branch coverage
          const existing = mergedCoverage[filename]
          for (const key in fileCoverage.s) {
            existing.s[key] = Math.max(
              existing.s[key] || 0,
              fileCoverage.s[key] || 0
            )
          }
          for (const key in fileCoverage.f) {
            existing.f[key] = Math.max(
              existing.f[key] || 0,
              fileCoverage.f[key] || 0
            )
          }
          for (const key in fileCoverage.b) {
            if (existing.b[key] && fileCoverage.b[key]) {
              for (let i = 0; i < fileCoverage.b[key].length; i++) {
                existing.b[key][i] = Math.max(
                  existing.b[key][i] || 0,
                  fileCoverage.b[key][i] || 0
                )
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error reading coverage file ${file}:`, error.message)
    }
  }

  // Write merged coverage
  const finalCoverageFile = path.join(coverageDir, 'coverage-final.json')
  fs.writeFileSync(finalCoverageFile, JSON.stringify(mergedCoverage, null, 2))

  console.log(
    `Merged coverage from ${files.length} files into ${finalCoverageFile}`
  )
  console.log(`Coverage includes ${Object.keys(mergedCoverage).length} files`)
}

module.exports = globalTeardown
