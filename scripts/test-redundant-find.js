#!/usr/bin/env node
/**
 * Script to identify redundant/low-value tests in the codebase.
 *
 * Run: node scripts/find-redundant-tests.js
 *
 * Identifies:
 * 1. "renders the component" style tests (testing framework, not business logic)
 * 2. "accepts X prop" tests (testing Vue prop system)
 * 3. Initial state tests (testing default ref values)
 * 4. Duplicate test names across files
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const TEST_DIR = 'tests/unit'

// Patterns that indicate low-value tests
const LOW_VALUE_PATTERNS = [
  // Testing that component mounts/renders (tests Vue, not business logic)
  /it\(['"](mounts|renders|displays).*successfully/i,
  /it\(['"]renders the (component|modal|card)/i,

  // Testing Vue's prop system
  /it\(['"]accepts \w+ prop/i,
  /it\(['"]\w+ is (Number|String|Boolean|Array|Object) type/i,
  /it\(['"]\w+ is (optional|required)/i,
  /it\(['"]\w+ defaults to/i,

  // Testing initial state of refs (testing JS variable assignment)
  /it\(['"]starts with \w+ as (null|false|true|0|'')/i,
  /it\(['"]has \w+ (false|true|null) by default/i,
  /it\(['"]initial \w+ is/i,

  // Testing that elements exist (testing Vue rendering, not logic)
  /it\(['"]renders \w+ (input|button|link|element)/i,
  /it\(['"]has \w+ (button|link|input)/i,
]

// Count occurrences of test names
const testNameCounts = new Map()
const lowValueTests = []
const fileStats = []

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const relativePath = path.relative(process.cwd(), filePath)

  let totalTests = 0
  let lowValueCount = 0

  lines.forEach((line, index) => {
    // Find test definitions
    const testMatch = line.match(/it\(['"](.+?)['"]/i)
    if (testMatch) {
      totalTests++
      const testName = testMatch[1]

      // Track test name frequency
      const count = testNameCounts.get(testName) || 0
      testNameCounts.set(testName, count + 1)

      // Check for low-value patterns
      for (const pattern of LOW_VALUE_PATTERNS) {
        if (pattern.test(line)) {
          lowValueCount++
          lowValueTests.push({
            file: relativePath,
            line: index + 1,
            test: testName,
            pattern: pattern.toString(),
          })
          break
        }
      }
    }
  })

  if (totalTests > 0) {
    fileStats.push({
      file: relativePath,
      total: totalTests,
      lowValue: lowValueCount,
      percentage: Math.round((lowValueCount / totalTests) * 100),
    })
  }
}

// Find all test files
const testFiles = glob.sync(`${TEST_DIR}/**/*.spec.js`)

console.log(`Analyzing ${testFiles.length} test files...\n`)

testFiles.forEach(analyzeFile)

// Sort by percentage of low-value tests
fileStats.sort((a, b) => b.percentage - a.percentage)

// Print files with highest percentage of low-value tests
console.log('=== FILES WITH HIGHEST % OF LOW-VALUE TESTS ===\n')
fileStats.slice(0, 30).forEach((stat) => {
  if (stat.lowValue > 0) {
    console.log(
      `${stat.percentage}% (${stat.lowValue}/${stat.total}) - ${stat.file}`
    )
  }
})

// Print most duplicated test names
console.log('\n=== MOST DUPLICATED TEST NAMES ===\n')
const sortedNames = [...testNameCounts.entries()]
  .filter(([name, count]) => count > 3)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)

sortedNames.forEach(([name, count]) => {
  console.log(`${count}x: "${name}"`)
})

// Summary
const totalLowValue = lowValueTests.length
const totalTests = fileStats.reduce((sum, f) => sum + f.total, 0)

console.log('\n=== SUMMARY ===\n')
console.log(`Total test files: ${testFiles.length}`)
console.log(`Total tests: ${totalTests}`)
console.log(
  `Low-value tests identified: ${totalLowValue} (${Math.round(
    (totalLowValue / totalTests) * 100
  )}%)`
)
console.log(
  `\nThese tests likely test the framework rather than business logic.`
)
console.log(`Consider consolidating or removing them.`)

// Write detailed report
const reportPath = 'tests/redundant-tests-report.json'
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      summary: {
        totalFiles: testFiles.length,
        totalTests,
        lowValueTests: totalLowValue,
        percentage: Math.round((totalLowValue / totalTests) * 100),
      },
      fileStats: fileStats.filter((f) => f.lowValue > 0),
      duplicatedNames: sortedNames,
      lowValueTests,
    },
    null,
    2
  )
)

console.log(`\nDetailed report written to: ${reportPath}`)
