/**
 * Client-side logging composable for sending logs to the backend.
 *
 * Uses fire-and-forget pattern - logging failures are silently ignored
 * to avoid showing errors to users.
 */

import { getTraceHeaders, getTraceId, getSessionId } from './useTrace'

// Runtime config reference - will be set when useClientLog is called.
let runtimeConfig = null

// Auth store reference - will be set when useClientLog is called.
let authStore = null

/**
 * Get the current user ID if logged in.
 * Returns null if not logged in or store not available.
 */
function getCurrentUserId() {
  try {
    if (authStore?.user?.id) {
      return authStore.user.id
    }
  } catch {
    // Store not available yet.
  }
  return null
}

/**
 * Check if auth store is ready (login state has been determined).
 * The store is considered ready once loginStateKnown is true,
 * which happens after fetchUser completes (whether logged in or not).
 */
function isAuthStoreReady() {
  try {
    return authStore?.loginStateKnown === true
  } catch {
    // Store not available.
  }
  return false
}

// Queue for batching logs.
const logQueue = []
let flushTimeout = null
const FLUSH_INTERVAL = 5000 // 5 seconds
const MAX_BATCH_SIZE = 10

/**
 * Log levels matching standard severity.
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
}

/**
 * Internal function to send logs to the backend.
 * Fire-and-forget - errors are silently caught.
 */
function sendLogs(logs) {
  if (!logs.length || !runtimeConfig?.public?.APIv2) {
    return
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getTraceHeaders(),
    }

    // Fire-and-forget - we don't await or check response.
    fetch(runtimeConfig.public.APIv2 + '/clientlog', {
      method: 'POST',
      headers,
      body: JSON.stringify({ logs }),
      // Use keepalive to ensure logs are sent even if page is unloading.
      keepalive: true,
    }).catch(() => {
      // Silently ignore all errors.
    })
  } catch {
    // Silently ignore all errors.
  }
}

// Max time to wait for auth store before sending logs anyway.
const MAX_AUTH_WAIT_MS = 10000
let authWaitStartTime = null

/**
 * Flush queued logs to the backend.
 * Waits for auth store to be ready (up to 10s) so user_id can be included.
 *
 * @param {boolean} force - If true, send immediately without waiting for auth store.
 */
function flushLogs(force = false) {
  if (flushTimeout) {
    clearTimeout(flushTimeout)
    flushTimeout = null
  }

  if (logQueue.length === 0) {
    return
  }

  // Wait for auth store to be ready, but not forever (unless force=true).
  if (!force && !isAuthStoreReady()) {
    if (!authWaitStartTime) {
      authWaitStartTime = Date.now()
    }
    const waitedMs = Date.now() - authWaitStartTime
    if (waitedMs < MAX_AUTH_WAIT_MS) {
      // Retry in 500ms.
      flushTimeout = setTimeout(flushLogs, 500)
      return
    }
    // Waited too long - send anyway without user_id.
  }

  authWaitStartTime = null

  // Take all logs from queue.
  const logsToSend = logQueue.splice(0, logQueue.length)

  // Add user_id to all logs now that auth store is ready.
  const currentUserId = getCurrentUserId()
  if (currentUserId) {
    for (const log of logsToSend) {
      if (!log.user_id) {
        log.user_id = currentUserId
      }
    }
  }

  sendLogs(logsToSend)
}

/**
 * Schedule a flush if not already scheduled.
 */
function scheduleFlush() {
  if (!flushTimeout && logQueue.length > 0) {
    flushTimeout = setTimeout(flushLogs, FLUSH_INTERVAL)
  }
}

/**
 * Add a log entry to the queue.
 */
function queueLog(level, message, context = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    trace_id: getTraceId(),
    session_id: getSessionId(),
    user_id: getCurrentUserId(),
    url: typeof window !== 'undefined' ? window.location.href : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    ...context,
  }

  logQueue.push(entry)

  // Flush immediately if batch is full.
  if (logQueue.length >= MAX_BATCH_SIZE) {
    flushLogs()
  } else {
    scheduleFlush()
  }
}

/**
 * Log a debug message.
 */
function debug(message, context = {}) {
  queueLog(LogLevel.DEBUG, message, context)
}

/**
 * Log an info message.
 */
function info(message, context = {}) {
  queueLog(LogLevel.INFO, message, context)
}

/**
 * Log a warning message.
 */
function warn(message, context = {}) {
  queueLog(LogLevel.WARN, message, context)
}

/**
 * Log an error message.
 */
function error(message, context = {}) {
  queueLog(LogLevel.ERROR, message, context)
}

// Debounce timer for viewport resize logging.
let resizeDebounceTimeout = null
const RESIZE_DEBOUNCE_MS = 1000

// Previous viewport dimensions to detect significant changes.
let lastViewportWidth = null
let lastViewportHeight = null

/**
 * Collect environment information from the browser.
 * Called once per session to capture device/browser details.
 *
 * We collect this information to help with support calls - it saves asking
 * people what device/browser/screen size they're using when debugging issues.
 */
function getEnvironmentInfo() {
  if (typeof window === 'undefined') {
    return {}
  }

  const nav = navigator || {}
  const screen = window.screen || {}
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {}

  return {
    // Viewport and screen
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    screen_width: screen.width,
    screen_height: screen.height,
    device_pixel_ratio: window.devicePixelRatio,
    orientation: screen.orientation?.type,

    // Browser/device
    user_agent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    languages: nav.languages?.join(','),
    cookie_enabled: nav.cookieEnabled,
    do_not_track: nav.doNotTrack,

    // Network (if available)
    connection_type: conn.effectiveType,
    connection_downlink: conn.downlink,
    connection_rtt: conn.rtt,
    connection_save_data: conn.saveData,

    // App detection
    is_standalone: window.matchMedia('(display-mode: standalone)').matches,
    is_touch: 'ontouchstart' in window || nav.maxTouchPoints > 0,

    // Referrer and timezone
    referrer: document.referrer || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset: new Date().getTimezoneOffset(),
  }
}

/**
 * Log session start with environment info.
 * Should be called once when the app initializes.
 *
 * The log is queued immediately but won't be sent until the auth store
 * is ready (loginStateKnown is true). This ensures user_id is included
 * if the user is logged in, even though we don't know that at queue time.
 *
 * @param {Object} context - Additional context to include
 * @param {Object} appDeviceInfo - Optional Capacitor device info from mobile store
 */
function sessionStart(context = {}, appDeviceInfo = null) {
  const envInfo = getEnvironmentInfo()

  // Add app-specific device info if provided (from Capacitor Device plugin).
  if (appDeviceInfo) {
    envInfo.app_manufacturer = appDeviceInfo.manufacturer
    envInfo.app_model = appDeviceInfo.model
    envInfo.app_platform = appDeviceInfo.platform
    envInfo.app_os_version = appDeviceInfo.osVersion
    envInfo.app_webview_version = appDeviceInfo.webViewVersion
    envInfo.app_is_virtual = appDeviceInfo.isVirtual
  }

  queueLog(LogLevel.INFO, 'Session started', {
    event_type: 'session_start',
    ...envInfo,
    ...context,
  })
}

/**
 * Log a Sentry error for correlation.
 * Called when Sentry captures an exception.
 * Includes viewport dimensions so we know the device at time of crash.
 */
function sentryError(errorMessage, sentryEventId, context = {}) {
  // Include basic environment info so crash logs show device details.
  const envInfo = getEnvironmentInfo()

  queueLog(LogLevel.ERROR, `Sentry: ${errorMessage}`, {
    event_type: 'sentry_error',
    sentry_event_id: sentryEventId,
    error_message: errorMessage,
    viewport_width: envInfo.viewport_width,
    viewport_height: envInfo.viewport_height,
    user_agent: envInfo.user_agent,
    ...context,
  })
}

/**
 * Log a page view event.
 */
function pageView(pageName, context = {}) {
  queueLog(LogLevel.INFO, `Page view: ${pageName}`, {
    event_type: 'page_view',
    page_name: pageName,
    ...context,
  })
}

/**
 * Log a user action event.
 */
function action(actionName, context = {}) {
  queueLog(LogLevel.INFO, `Action: ${actionName}`, {
    event_type: 'action',
    action_name: actionName,
    ...context,
  })
}

/**
 * Log an API request for timing/debugging.
 */
function apiRequest(method, path, durationMs, status, context = {}) {
  const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
  queueLog(level, `API ${method} ${path}`, {
    event_type: 'api_request',
    method,
    path,
    duration_ms: durationMs,
    status,
    ...context,
  })
}

/**
 * Log viewport resize event (debounced to avoid flooding).
 * Only logs if the viewport changed significantly (more than 50px).
 */
function logViewportResize() {
  if (typeof window === 'undefined') {
    return
  }

  const width = window.innerWidth
  const height = window.innerHeight

  // Skip if change is too small (less than 50px in either dimension).
  if (
    lastViewportWidth !== null &&
    Math.abs(width - lastViewportWidth) < 50 &&
    Math.abs(height - lastViewportHeight) < 50
  ) {
    return
  }

  const previousWidth = lastViewportWidth
  const previousHeight = lastViewportHeight
  lastViewportWidth = width
  lastViewportHeight = height

  queueLog(LogLevel.INFO, 'Viewport resized', {
    event_type: 'viewport_resize',
    viewport_width: width,
    viewport_height: height,
    previous_width: previousWidth,
    previous_height: previousHeight,
    orientation: window.screen?.orientation?.type,
  })
}

/**
 * Handle viewport resize with debouncing.
 */
function handleViewportResize() {
  if (resizeDebounceTimeout) {
    clearTimeout(resizeDebounceTimeout)
  }
  resizeDebounceTimeout = setTimeout(logViewportResize, RESIZE_DEBOUNCE_MS)
}

/**
 * Log device orientation change.
 */
function handleOrientationChange() {
  if (typeof window === 'undefined') {
    return
  }

  const orientation = window.screen?.orientation?.type || 'unknown'
  queueLog(LogLevel.INFO, 'Orientation changed', {
    event_type: 'orientation_change',
    orientation,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
  })
}

/**
 * Flush logs immediately (call before page unload).
 */
function flush() {
  flushLogs()
}

/**
 * Set the auth store reference for user_id tracking.
 * Call this once during app initialization.
 *
 * @param {Object} store - The auth store instance
 */
function setAuthStore(store) {
  authStore = store
}

/**
 * Client logging composable.
 *
 * Usage:
 *   const { log, info, error, pageView, action, setAuthStore } = useClientLog()
 *   setAuthStore(useAuthStore()) // Call once during init
 *   info('User clicked button', { button: 'submit' })
 */
export function useClientLog() {
  // Get runtime config if not already set.
  if (!runtimeConfig && typeof useRuntimeConfig !== 'undefined') {
    try {
      runtimeConfig = useRuntimeConfig()
    } catch {
      // Not in Nuxt context - will be set later.
    }
  }

  return {
    debug,
    info,
    warn,
    error,
    pageView,
    action,
    apiRequest,
    sessionStart,
    sentryError,
    flush,
    setAuthStore,
    LogLevel,
  }
}

// Set up page unload handler to flush remaining logs.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Force flush on unload - don't wait for auth store since page is closing.
    flushLogs(true)
  })

  // Also flush on visibility change (mobile tab switch).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Force flush when tab is hidden - user may close browser.
      flushLogs(true)
    }
  })

  // Track viewport resize (debounced).
  window.addEventListener('resize', handleViewportResize)

  // Track orientation changes.
  if (window.screen?.orientation) {
    window.screen.orientation.addEventListener(
      'change',
      handleOrientationChange
    )
  } else {
    // Fallback for older browsers.
    window.addEventListener('orientationchange', handleOrientationChange)
  }

  // Track Bootstrap modal open/close events globally.
  // Bootstrap 5 fires native DOM events that bubble up to document.
  function getModalIdentifier(modalElement) {
    // Try various sources for a meaningful identifier.
    if (modalElement?.id) {
      return modalElement.id
    }
    // Try aria-labelledby which points to the title element.
    const labelledBy = modalElement?.getAttribute('aria-labelledby')
    if (labelledBy) {
      const titleEl = document.getElementById(labelledBy)
      if (titleEl?.textContent) {
        return titleEl.textContent.trim().substring(0, 50)
      }
    }
    // Try to find a title in the modal header.
    const titleEl = modalElement?.querySelector('.modal-title')
    if (titleEl?.textContent) {
      return titleEl.textContent.trim().substring(0, 50)
    }
    return 'unknown'
  }

  document.addEventListener('show.bs.modal', (event) => {
    const modalId = getModalIdentifier(event.target)
    queueLog(LogLevel.INFO, `Modal opened: ${modalId}`, {
      event_type: 'modal_open',
      modal_id: modalId,
    })
  })

  document.addEventListener('hidden.bs.modal', (event) => {
    const modalId = getModalIdentifier(event.target)
    queueLog(LogLevel.INFO, `Modal closed: ${modalId}`, {
      event_type: 'modal_close',
      modal_id: modalId,
    })
  })
}

// Export individual functions for use outside composable context.
export {
  debug,
  info,
  warn,
  error,
  pageView,
  action,
  apiRequest,
  sessionStart,
  sentryError,
  flush,
  setAuthStore,
}
