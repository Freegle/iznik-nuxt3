#!/usr/bin/env node
/**
 * Script to remove low-value tests from test files.
 *
 * Run with --dry-run first to see what would be removed:
 *   node scripts/remove-redundant-tests.js --dry-run
 *
 * Then run without flag to actually modify files:
 *   node scripts/remove-redundant-tests.js
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const TEST_DIR = 'tests/unit'
const DRY_RUN = process.argv.includes('--dry-run')

// Test patterns to remove (these test framework, not business logic)
const TESTS_TO_REMOVE = [
  // Tests that just verify component mounts (testing Vue, not business logic)
  /^\s*it\(['"]mounts successfully['"]/,
  /^\s*it\(['"]mounts without error['"]/,
  /^\s*it\(['"]renders the component['"]/,
  /^\s*it\(['"]renders the modal['"]/,

  // Tests that verify props exist (testing Vue prop system)
  /^\s*it\(['"]accepts \w+ prop['"]/,
  /^\s*it\(['"]\w+ is Number type['"]/,
  /^\s*it\(['"]\w+ is String type['"]/,
  /^\s*it\(['"]\w+ is Boolean type['"]/,
  /^\s*it\(['"]\w+ is Array type['"]/,
  /^\s*it\(['"]\w+ is Object type['"]/,
  /^\s*it\(['"]requires \w+ prop['"]/,
  /^\s*it\(['"]\w+ is optional['"]/,
  /^\s*it\(['"]\w+ is required['"]/,
  /^\s*it\(['"]\w+ defaults to/,

  // Help composable tests - duplicated 11x each across files (tests the composable, not the component)
  /^\s*it\(['"]renders help content when showHelp is true['"]/,
  /^\s*it\(['"]hides help content when showHelp is false['"]/,
  /^\s*it\(['"]shows Help button when showHelp is false['"]/,
  /^\s*it\(['"]hides Help button when showHelp is true['"]/,
  /^\s*it\(['"]shows Hide Help button when help is visible['"]/,
  /^\s*it\(['"]calls toggleHelp when Hide Help button is clicked['"]/,
  /^\s*it\(['"]calls toggleHelp when Help button is clicked['"]/,
  /^\s*it\(['"]component has initComponent method that calls hide['"]/,
  /^\s*it\(['"]initComponent calls hide to initially hide help['"]/,
  /^\s*it\(['"]exposes hide function from composable['"]/,
  /^\s*it\(['"]exposes show function from composable['"]/,
  /^\s*it\(['"]exposes toggleHelp function from composable['"]/,
  /^\s*it\(['"]showHelp reflects the composable value['"]/,
  /^\s*it\(['"]updates display when showHelp changes from true to false['"]/,
  /^\s*it\(['"]updates display when showHelp changes from false to true['"]/,
  /^\s*it\(['"]handles rapid showHelp toggling['"]/,
  /^\s*it\(['"]handles undefined showHelp gracefully['"]/,

  // Button exists tests (testing Vue rendering, not logic)
  /^\s*it\(['"]has Close button['"]/,

  // Redundant initialization tests
  /^\s*it\(['"]initializes with correct data values['"]/,

  // Date prop tests (duplicated 7x)
  /^\s*it\(['"]accepts start date prop['"]/,
  /^\s*it\(['"]accepts end date prop['"]/,

  // Default value tests (testing Vue defaults)
  /^\s*it\(['"]defaults groupid to null['"]/,
  /^\s*it\(['"]defaults \w+ to null['"]/,
  /^\s*it\(['"]defaults \w+ to false['"]/,
  /^\s*it\(['"]defaults \w+ to true['"]/,
  /^\s*it\(['"]defaults \w+ to 0['"]/,
  /^\s*it\(['"]defaults \w+ to empty['"]/,
  /^\s*it\(['"]accepts \w+ prop with default/,

  // Page render tests (testing Nuxt, not logic)
  /^\s*it\(['"]renders the page['"]/,
  /^\s*it\(['"]renders the page with required components['"]/,

  // Loading state tests (duplicated 5x)
  /^\s*it\(['"]shows pulsate class when loading['"]/,
  /^\s*it\(['"]shows text-faded class when loading['"]/,
  /^\s*it\(['"]hides loading state when not loading['"]/,
  /^\s*it\(['"]shows loading when loading with data['"]/,

  // Render tests that just check Vue rendering
  /^\s*it\(['"]renders ScrollToTop component['"]/,
  /^\s*it\(['"]renders user displayname['"]/,
]

let totalRemoved = 0
let filesModified = 0

function removeTestFromContent(content, pattern) {
  const lines = content.split('\n')
  const result = []
  let i = 0
  let removed = 0

  while (i < lines.length) {
    const line = lines[i]

    // Check if this line starts a test we want to remove
    if (pattern.test(line)) {
      // Find the end of this test (matching closing brace)
      let braceCount = 0
      let started = false
      let endIndex = i

      for (let j = i; j < lines.length; j++) {
        const currentLine = lines[j]
        for (const char of currentLine) {
          if (char === '{') {
            braceCount++
            started = true
          } else if (char === '}') {
            braceCount--
          }
        }

        if (started && braceCount === 0) {
          endIndex = j
          break
        }
      }

      // Skip these lines (remove the test)
      removed++
      i = endIndex + 1

      // Also remove empty line after if present
      if (i < lines.length && lines[i].trim() === '') {
        i++
      }
    } else {
      result.push(line)
      i++
    }
  }

  return { content: result.join('\n'), removed }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  const relativePath = path.relative(process.cwd(), filePath)
  let fileRemoved = 0

  for (const pattern of TESTS_TO_REMOVE) {
    const { content: newContent, removed } = removeTestFromContent(
      content,
      pattern
    )
    content = newContent
    fileRemoved += removed
  }

  if (fileRemoved > 0) {
    totalRemoved += fileRemoved
    filesModified++

    if (DRY_RUN) {
      console.log(`Would remove ${fileRemoved} test(s) from ${relativePath}`)
    } else {
      fs.writeFileSync(filePath, content)
      console.log(`Removed ${fileRemoved} test(s) from ${relativePath}`)
    }
  }
}

// Find all test files
const testFiles = glob.sync(`${TEST_DIR}/**/*.spec.js`)

console.log(
  `${DRY_RUN ? '[DRY RUN] ' : ''}Processing ${testFiles.length} test files...\n`
)

testFiles.forEach(processFile)

console.log(`\n=== SUMMARY ===`)
console.log(
  `Files ${DRY_RUN ? 'that would be' : ''} modified: ${filesModified}`
)
console.log(`Tests ${DRY_RUN ? 'that would be' : ''} removed: ${totalRemoved}`)

if (DRY_RUN) {
  console.log(`\nRun without --dry-run to actually remove tests.`)
}
