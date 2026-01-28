#!/usr/bin/env node
/**
 * Analyzes coverage data to find test files with excessive code path duplication.
 * Groups by source file and shows which ones are hit disproportionately often.
 */

const fs = require('fs')

const coverageFile = 'coverage/coverage-final.json'
const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'))

// Calculate total hits per source file
const fileStats = []

for (const [filePath, data] of Object.entries(coverage)) {
  if (!filePath.includes('/components/')) continue

  const relativePath = filePath.replace(/.*\/(components\/)/, '$1')

  let totalStatementHits = 0
  let statementCount = 0
  let maxHit = 0

  if (data.s) {
    for (const count of Object.values(data.s)) {
      totalStatementHits += count
      statementCount++
      if (count > maxHit) maxHit = count
    }
  }

  const avgHit =
    statementCount > 0 ? Math.round(totalStatementHits / statementCount) : 0

  fileStats.push({
    file: relativePath,
    totalHits: totalStatementHits,
    statements: statementCount,
    avgHit,
    maxHit,
  })
}

// Sort by total hits (descending)
fileStats.sort((a, b) => b.totalHits - a.totalHits)

console.log('=== SOURCE FILES BY TOTAL EXECUTION HITS ===\n')
console.log(
  'Files with highest total hits likely have excessive test coverage:\n'
)
console.log('Total Hits | Avg/Line | Max Hit | File')
console.log('-'.repeat(80))

fileStats.slice(0, 40).forEach((f) => {
  console.log(
    `${f.totalHits.toString().padStart(10)} | ${f.avgHit
      .toString()
      .padStart(8)} | ${f.maxHit.toString().padStart(7)} | ${f.file}`
  )
})

// Distribution analysis
console.log('\n\n=== DISTRIBUTION ANALYSIS ===\n')

const totalHitsArr = fileStats.map((f) => f.totalHits)
const sorted = [...totalHitsArr].sort((a, b) => a - b)

const median = sorted[Math.floor(sorted.length / 2)]
const p75 = sorted[Math.floor(sorted.length * 0.75)]
const p90 = sorted[Math.floor(sorted.length * 0.9)]
const p95 = sorted[Math.floor(sorted.length * 0.95)]
const p99 = sorted[Math.floor(sorted.length * 0.99)]
const max = sorted[sorted.length - 1]

console.log(`Median total hits: ${median}`)
console.log(`75th percentile:   ${p75}`)
console.log(`90th percentile:   ${p90}`)
console.log(`95th percentile:   ${p95}`)
console.log(`99th percentile:   ${p99}`)
console.log(`Maximum:           ${max}`)

// Find outliers (>3 standard deviations above mean)
const mean = totalHitsArr.reduce((a, b) => a + b, 0) / totalHitsArr.length
const variance =
  totalHitsArr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
  totalHitsArr.length
const stdDev = Math.sqrt(variance)

console.log(`\nMean: ${Math.round(mean)}, StdDev: ${Math.round(stdDev)}`)
console.log(
  `Outlier threshold (mean + 2*stdDev): ${Math.round(mean + 2 * stdDev)}`
)

const outliers = fileStats.filter((f) => f.totalHits > mean + 2 * stdDev)

if (outliers.length > 0) {
  console.log(
    `\n=== OUTLIERS (${outliers.length} files with excessive hits) ===\n`
  )
  outliers.forEach((f) => {
    console.log(`${f.totalHits} hits: ${f.file}`)
  })
} else {
  console.log('\nNo statistical outliers found.')
}

// Histogram
console.log('\n=== HISTOGRAM OF TOTAL HITS ===\n')
const buckets = [100, 500, 1000, 5000, 10000, 50000, 100000, Infinity]
const histogram = buckets.map(() => 0)

totalHitsArr.forEach((hits) => {
  for (let i = 0; i < buckets.length; i++) {
    if (hits <= buckets[i]) {
      histogram[i]++
      break
    }
  }
})

const labels = [
  '≤100',
  '101-500',
  '501-1k',
  '1k-5k',
  '5k-10k',
  '10k-50k',
  '50k-100k',
  '>100k',
]
labels.forEach((label, i) => {
  const bar = '█'.repeat(Math.min(histogram[i], 50))
  console.log(`${label.padStart(10)}: ${bar} (${histogram[i]})`)
})
