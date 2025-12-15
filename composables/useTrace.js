/**
 * Trace management composable for distributed tracing.
 *
 * Generates and manages trace IDs and session IDs for correlating
 * client-side actions with backend API calls and Sentry errors.
 */

// Session ID persists across page loads within the same browser session.
let sessionId = null

// Current trace ID changes with each user interaction boundary.
let currentTraceId = null

// Callback to notify when trace changes (for Sentry integration).
let onTraceChangeCallback = null

/**
 * Generate a UUID v4.
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Get or create the session ID.
 * Stored in sessionStorage to persist across page navigation but not browser close.
 */
function getSessionId() {
  if (sessionId) {
    return sessionId
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionId = sessionStorage.getItem('freegle_session_id')
    if (!sessionId) {
      sessionId = generateUUID()
      sessionStorage.setItem('freegle_session_id', sessionId)
    }
  } else {
    // SSR or no sessionStorage - generate ephemeral ID.
    sessionId = generateUUID()
  }

  return sessionId
}

/**
 * Generate a new trace ID.
 * Called on interaction boundaries (route change, modal open, etc.).
 */
function newTraceId() {
  currentTraceId = generateUUID()

  if (onTraceChangeCallback) {
    onTraceChangeCallback(currentTraceId, getSessionId())
  }

  return currentTraceId
}

/**
 * Get the current trace ID, generating one if none exists.
 */
function getTraceId() {
  if (!currentTraceId) {
    newTraceId()
  }
  return currentTraceId
}

/**
 * Register a callback for trace changes (used by Sentry integration).
 */
function onTraceChange(callback) {
  onTraceChangeCallback = callback
}

/**
 * Get all trace headers for API requests.
 */
function getTraceHeaders() {
  return {
    'X-Trace-ID': getTraceId(),
    'X-Session-ID': getSessionId(),
    'X-Client-Timestamp': new Date().toISOString(),
  }
}

export function useTrace() {
  return {
    getSessionId,
    getTraceId,
    newTraceId,
    getTraceHeaders,
    onTraceChange,
  }
}

// Also export individual functions for use outside composable context.
export { getSessionId, getTraceId, newTraceId, getTraceHeaders, onTraceChange }
