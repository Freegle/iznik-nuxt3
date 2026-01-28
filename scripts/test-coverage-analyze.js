#!/usr/bin/env node
/**
 * Analyzes coverage data to find redundant tests by looking at:
 * 1. Lines hit many times (indicates multiple tests cover same code)
 * 2. Functions called many times (same pattern)
 *
 * High hit counts suggest tests are redundantly covering the same paths.
 */

const fs = require('fs')

const coverageFile = 'coverage/coverage-final.json'
const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'))

// Collect execution counts per line across all files
const lineHits = []
const fnHits = []

for (const [filePath, data] of Object.entries(coverage)) {
  // Skip non-component files
  if (!filePath.includes('/components/')) continue

  const relativePath = filePath.replace(/.*\/components\//, 'components/')

  // Analyze statement execution counts
  if (data.s) {
    for (const [stmtId, count] of Object.entries(data.s)) {
      if (count > 10) {
        // Threshold: hit more than 10 times
        const loc = data.statementMap[stmtId]
        if (loc) {
          lineHits.push({
            file: relativePath,
            line: loc.start.line,
            count,
            type: 'statement',
          })
        }
      }
    }
  }

  // Analyze function execution counts
  if (data.f) {
    for (const [fnId, count] of Object.entries(data.f)) {
      if (count > 10) {
        // Threshold: called more than 10 times
        const loc = data.fnMap[fnId]
        if (loc) {
          fnHits.push({
            file: relativePath,
            name: loc.name || 'anonymous',
            line: loc.loc.start.line,
            count,
            type: 'function',
          })
        }
      }
    }
  }
}

// Sort by count descending
lineHits.sort((a, b) => b.count - a.count)
fnHits.sort((a, b) => b.count - a.count)

console.log('=== MOST HIT LINES (potential redundancy) ===\n')
console.log('Lines hit >50 times suggest many tests cover the same code:\n')

// Group by file for better readability
const topLines = lineHits.filter((l) => l.count > 50).slice(0, 50)
const byFile = {}
topLines.forEach((l) => {
  if (!byFile[l.file]) byFile[l.file] = []
  byFile[l.file].push(l)
})

for (const [file, lines] of Object.entries(byFile)) {
  console.log(`\n${file}:`)
  lines.slice(0, 5).forEach((l) => {
    console.log(`  Line ${l.line}: hit ${l.count}x`)
  })
}

console.log('\n\n=== MOST CALLED FUNCTIONS ===\n')
console.log('Functions called >50 times:\n')

fnHits
  .filter((f) => f.count > 50)
  .slice(0, 30)
  .forEach((f) => {
    console.log(`${f.count}x: ${f.file}:${f.line} - ${f.name}()`)
  })

// Summary stats
const totalStatements = lineHits.length
const highHitStatements = lineHits.filter((l) => l.count > 20).length
const veryHighHitStatements = lineHits.filter((l) => l.count > 50).length

console.log('\n\n=== SUMMARY ===\n')
console.log(`Statements hit >10x: ${totalStatements}`)
console.log(`Statements hit >20x: ${highHitStatements}`)
console.log(`Statements hit >50x: ${veryHighHitStatements}`)
console.log('\nHigh hit counts indicate potential test redundancy.')
console.log('Consider consolidating tests that cover the same code paths.')
