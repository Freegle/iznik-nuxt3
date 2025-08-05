// Custom methods added to the Playwright Page object and test fixtures
import { Page, PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions } from '@playwright/test'

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

  interface PlaywrightTestArgs {
    // Additional test fixtures
    testEmail: string
    getTestEmail: (prefix?: string) => string
    registerTestEmail: (email: string) => boolean
    getRegisteredEmails: () => string[]
    postMessage: (options: {
      type?: 'OFFER' | 'WANTED'
      item?: string
      description?: string
      postcode?: string
      email: string
    }) => Promise<{ id: string | null; item: string; description: string }>
    withdrawPost: (options: { item: string }) => Promise<boolean>
    setupTestPage: (options?: { path?: string; viewport?: { width: number; height: number }; timeout?: number; waitForLoad?: boolean }) => Promise<void>
    takeTimestampedScreenshot: (description: string, options?: any) => Promise<void>
    waitForNuxtPageLoad: (options?: { timeout?: number }) => Promise<void>
    findAndClickButton: (selectors: string[], options?: any) => Promise<boolean>
    setNewUserPassword: (password?: string) => Promise<boolean>
    replyToMessageWithSignup: (options: {
      messageId: string
      itemName: string
      email: string
      replyMessage?: string
      collectDetails?: string
    }) => Promise<boolean>
  }
}