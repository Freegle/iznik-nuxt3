// Custom methods added to the Playwright Page object
import { Page } from '@playwright/test'

declare module '@playwright/test' {
  interface Page {
    /**
     * Navigate to a URL and verify the page loaded correctly
     * Checks for error pages and waits for network idle
     */
    gotoAndVerify(path: string, options?: { timeout?: number }): Promise<Page>

    /**
     * Get all console errors that occurred during the test
     */
    consoleErrors(): { text: string; location?: { url: string; lineNumber: number } }[]

    /**
     * Get a summary of console errors grouped by allowed vs. not allowed
     */
    getErrorSummary(): {
      allowed: { text: string; location?: { url: string; lineNumber: number } }[]
      notAllowed: { text: string; location?: { url: string; lineNumber: number } }[]
      total: number
      allowedCount: number
      notAllowedCount: number
    }

    /**
     * Add a pattern to the list of allowed console errors
     */
    addAllowedErrorPattern(pattern: RegExp | string): void

    /**
     * Check if the test ran without console errors
     * Alias for checkTestRanOK
     */
    expectNoConsoleErrors(): Promise<void>

    /**
     * Check if the test ran without console errors
     */
    checkTestRanOK(): Promise<void>

    /**
     * Wait for network idle and other teardown operations
     */
    waitForTeardown(options?: { timeout?: number }): Promise<boolean>
  }
}