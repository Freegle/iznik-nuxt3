/**
 * Centralized configuration file for Playwright tests
 * All timeout values and other configurable parameters should be defined here
 */

// Timeouts in milliseconds
const timeouts = {
  // Navigation timeouts
  navigation: {
    default: 60000, // Default navigation timeout (increased for slow loading)
    initial: 90000, // First page load timeout
    slowPage: 90000, // Extra long timeout for known slow pages
    inactivity: 9 * 60 * 1000, // Navigation inactivity timeout
  },

  // UI interaction timeouts
  ui: {
    appearance: 30000, // Waiting for element to appear (increased for Docker)
    interaction: 10000, // Interaction with elements like clicks
    animation: 1000, // Waiting for animations to complete
    autocomplete: 10000, // Waiting for autocomplete results
    settleTime: 1000, // Time to allow UI to settle
    transition: 500, // Time for UI transitions
  },

  // API and data loading timeouts
  api: {
    default: 15000, // Default API response timeout
    slowApi: 30000, // Slower API endpoints timeout
  },

  // Test teardown timeouts
  teardown: {
    networkIdle: 5000, // Network idle wait during teardown
  },

  // Assertion timeouts
  assertion: {
    quick: 1000, // Quick assertions
    normal: 5000, // Standard assertions
    slow: 15000, // Slow assertions for complex operations
  },

  background: 120000, // For background tasks like processing chat messages.
}

// Environment-specific settings
const environment = {
  isDev: !process.env.CI,
  isCI: !!process.env.CI,

  // These can be overridden with environment variables
  postcode: process.env.TEST_POSTCODE || 'EH3 6SS',
  place: process.env.TEST_PLACE || 'Edinburgh',
  testgroup: process.env.TEST_GROUP || 'FreeglePlayground',

  unmodded_email: process.env.TEST_EMAIL_UNMODDED || 'test@test.com',
  unmodded_password: process.env.TEST_EMAIL_UNMODDED_PASSWORD || 'freegle',

  // Test email configuration
  email: {
    // Default test domain for test email addresses
    domain: process.env.TEST_EMAIL_DOMAIN || 'yahoogroups.com',

    // Generate a random test email for this test run
    getRandomEmail: (prefix = 'test') => {
      const randomSuffix = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
      return `${prefix}${randomSuffix}@${environment.email.domain}`
    },

    // Generate a test email with a specific username
    getEmailForUser: (username) => {
      return `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@${
        environment.email.domain
      }`
    },
  },
}

// CI-specific timeouts (even longer for CI environments)
if (environment.isCI) {
  // Add 50% more time for CI environments
  Object.keys(timeouts).forEach((category) => {
    if (typeof timeouts[category] === 'object') {
      Object.keys(timeouts[category]).forEach((key) => {
        timeouts[category][key] = Math.round(timeouts[category][key] * 1.5)
      })
    }
  })

  console.log('CI environment detected - using extended timeouts')
}

// Selectors for commonly used elements (using data-testid attributes where possible)
const selectors = {
  placeAutocomplete: {
    input: '.test-place-input',
    suggestionItem: '.test-place-suggestion-item',
  },
  common: {
    mainFooter: '.test-main-footer',
    visualiseList: '.test-visualise-list',
    freeglerPhotos: '.test-freegler-photos',
    messageCard: '.messagecard',
  },
}

// Viewport sizes for responsive testing
const breakpoints = [
  { name: 'xs', width: 414, height: 896 }, // iPhone XR
  { name: 'sm', width: 640, height: 960 },
  { name: 'md', width: 820, height: 1180 }, // iPad Air
  { name: 'lg', width: 1024, height: 768 }, // iPad Pro
  { name: 'xl', width: 1280, height: 800 },
  { name: 'xxl', width: 1920, height: 1080 },
]

// Default test password (can be overridden by env variable)
const DEFAULT_TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!'

// Test user data for consistent user information in tests
const testUsers = {
  // Generate a test user with a random ID
  getRandomUser: () => {
    const id = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
    const firstName = `TestUser${id}`
    const email = environment.email.getRandomEmail(firstName.toLowerCase())

    return {
      id,
      firstName,
      lastName: 'Tester',
      fullName: `${firstName} Tester`,
      email,
      postcode: environment.postcode,
      password: DEFAULT_TEST_PASSWORD,
    }
  },

  // Predefined test users for specific test scenarios
  getModeratorUser: () => ({
    firstName: 'TestMod',
    lastName: 'Moderator',
    fullName: 'TestMod Moderator',
    email: environment.email.getEmailForUser('testmod'),
    postcode: environment.postcode,
    password: DEFAULT_TEST_PASSWORD,
    isModerator: true,
  }),

  getRegularUser: () => ({
    firstName: 'TestUser',
    lastName: 'Regular',
    fullName: 'TestUser Regular',
    email: environment.email.getEmailForUser('testuser'),
    postcode: environment.postcode,
    password: DEFAULT_TEST_PASSWORD,
  }),
}

// Define the screenshots directory
const path = require('path')
const SCREENSHOTS_DIR = path.join(process.cwd(), 'playwright-screenshots')

module.exports = {
  timeouts,
  environment,
  selectors,
  breakpoints,
  testUsers,
  DEFAULT_TEST_PASSWORD,
  SCREENSHOTS_DIR,
}
