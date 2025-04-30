/**
 * Centralized configuration file for Playwright tests
 * All timeout values and other configurable parameters should be defined here
 */

// Timeouts in milliseconds
const timeouts = {
  // Navigation timeouts
  navigation: {
    default: 30000, // Default navigation timeout (30 seconds)
    initial: 45000, // First page load timeout (45 seconds)
    slowPage: 60000, // Extra long timeout for known slow pages (60 seconds)
  },

  // UI interaction timeouts
  ui: {
    appearance: 5000, // Waiting for element to appear (5 seconds)
    interaction: 10000, // Interaction with elements like clicks (10 seconds)
    animation: 1000, // Waiting for animations to complete (1 second)
    autocomplete: 10000, // Waiting for autocomplete results (10 seconds)
  },

  // API and data loading timeouts
  api: {
    default: 15000, // Default API response timeout (15 seconds)
    slowApi: 30000, // Slower API endpoints timeout (30 seconds)
  },

  // Test teardown timeouts
  teardown: {
    networkIdle: 5000, // Network idle wait during teardown (5 seconds)
  },

  // Assertion timeouts
  assertion: {
    quick: 1000, // Quick assertions (1 second)
    normal: 5000, // Standard assertions (5 seconds)
    slow: 15000, // Slow assertions for complex operations (15 seconds)
  },
}

// Environment-specific settings
const environment = {
  isDev: !process.env.CI,
  isCI: !!process.env.CI,

  // These can be overridden with environment variables
  postcode: process.env.TEST_POSTCODE || 'EH3 6SS',
  place: process.env.TEST_PLACE || 'Edinburgh',

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
