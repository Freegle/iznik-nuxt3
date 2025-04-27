/**
 * Centralized configuration file for Playwright tests
 * All timeout values and other configurable parameters should be defined here
 */

// Timeouts in milliseconds
const timeouts = {
  // Navigation timeouts
  navigation: {
    default: 60000, // Default navigation timeout (60 seconds)
    initial: 90000, // First page load timeout (90 seconds)
    slowPage: 120000, // Extra long timeout for known slow pages (120 seconds)
  },

  // UI interaction timeouts
  ui: {
    appearance: 10000, // Waiting for element to appear (10 seconds)
    interaction: 20000, // Interaction with elements like clicks (20 seconds)
    animation: 2000, // Waiting for animations to complete (2 seconds)
    autocomplete: 20000, // Waiting for autocomplete results (20 seconds)
  },

  // API and data loading timeouts
  api: {
    default: 30000, // Default API response timeout (30 seconds)
    slowApi: 60000, // Slower API endpoints timeout (60 seconds)
  },

  // Test teardown timeouts
  teardown: {
    networkIdle: 10000, // Network idle wait during teardown (10 seconds)
  },

  // Assertion timeouts
  assertion: {
    quick: 2000, // Quick assertions (2 seconds)
    normal: 10000, // Standard assertions (10 seconds)
    slow: 30000, // Slow assertions for complex operations (30 seconds)
  },
}

// Environment-specific settings
const environment = {
  isDev: !process.env.CI,
  isCI: !!process.env.CI,

  // These can be overridden with environment variables
  postcode: process.env.TEST_POSTCODE || 'EH3 6SS',
  place: process.env.TEST_PLACE || 'Edinburgh',
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

module.exports = {
  timeouts,
  environment,
  selectors,
  breakpoints,
}
