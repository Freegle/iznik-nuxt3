// tests/e2e/status-reporter.js
//
// Custom Playwright reporter that writes real-time test status to a JSON file.
// The status container reads this file (via docker exec) instead of parsing stdout.
//
// Output path: test-results/test-status.json (inside the Playwright container)

const fs = require('fs')
const path = require('path')

const STATUS_FILE = path.join(__dirname, '../../test-results/test-status.json')

class StatusReporter {
  constructor() {
    this.status = {
      state: 'starting', // starting | running | finished
      startTime: Date.now(),
      endTime: null,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      running: [], // Array of currently-running test titles
      completed: 0, // passed + failed + skipped
      currentTest: '', // Most recently started test (for display)
      tests: {}, // testId -> { title, file, status, duration, error }
    }
    this._ensureDir()
    this._write()
  }

  _ensureDir() {
    const dir = path.dirname(STATUS_FILE)
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch {
      // ignore
    }
  }

  _write() {
    try {
      fs.writeFileSync(STATUS_FILE, JSON.stringify(this.status, null, 2))
    } catch {
      // Silently ignore write failures to avoid interfering with test execution
    }
  }

  _testId(test) {
    return (
      test.id ||
      `${test.location.file}:${test.location.line}:${test.location.column}`
    )
  }

  onBegin(config, suite) {
    const allTests = suite.allTests()
    this.status.state = 'running'
    this.status.total = allTests.length
    this.status.startTime = Date.now()

    for (const test of allTests) {
      const id = this._testId(test)
      this.status.tests[id] = {
        title: test.title,
        fullTitle: test.titlePath().join(' > '),
        file: path.basename(test.location.file),
        status: 'pending',
        duration: null,
        error: null,
      }
    }

    this._write()
  }

  onTestBegin(test) {
    const id = this._testId(test)
    const title = test.title

    if (this.status.tests[id]) {
      this.status.tests[id].status = 'running'
    }

    if (!this.status.running.includes(title)) {
      this.status.running.push(title)
    }
    this.status.currentTest = title

    this._write()
  }

  onTestEnd(test, result) {
    const id = this._testId(test)
    const title = test.title

    // Map Playwright result status to our status
    // Playwright statuses: 'passed', 'failed', 'timedOut', 'skipped', 'interrupted'
    let status
    switch (result.status) {
      case 'passed':
        status = 'passed'
        this.status.passed++
        break
      case 'failed':
      case 'timedOut':
      case 'interrupted':
        status = 'failed'
        this.status.failed++
        break
      case 'skipped':
        status = 'skipped'
        this.status.skipped++
        break
      default:
        status = 'failed'
        this.status.failed++
    }

    if (this.status.tests[id]) {
      this.status.tests[id].status = status
      this.status.tests[id].duration = result.duration
      if (result.error) {
        this.status.tests[id].error =
          result.error.message || String(result.error)
      }
    }

    this.status.running = this.status.running.filter((t) => t !== title)
    this.status.completed =
      this.status.passed + this.status.failed + this.status.skipped

    this._write()
  }

  onEnd() {
    this.status.state = 'finished'
    this.status.endTime = Date.now()
    this.status.running = []
    this.status.completed =
      this.status.passed + this.status.failed + this.status.skipped

    this._write()
  }
}

module.exports = StatusReporter
