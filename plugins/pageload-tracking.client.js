/**
 * Page load tracking plugin.
 *
 * Hooks into Nuxt router events to track page load phases for API call grouping.
 * This enables the system logs viewer to distinguish page load API calls
 * from user-triggered API calls.
 *
 * Phases:
 * - 'loading': Navigation started, page is loading
 * - 'interactive': Page component rendered, may still be fetching data
 * - 'idle': No recent API activity, page is fully loaded
 * - 'user_action': User triggered an action (not page load)
 */

import {
  setPageLoadPhase,
  markPageInteractive,
} from '~/composables/useClientLog'

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  // Track navigation start - set phase to 'loading'
  router.beforeEach((to, from) => {
    // Only track actual page changes, not initial load or same-page navigation
    if (from.path !== to.path) {
      setPageLoadPhase('loading')
    }
  })

  // Track when page has finished rendering - set phase to 'interactive'
  nuxtApp.hook('page:finish', () => {
    markPageInteractive()
  })

  // Also listen for app:suspense:resolve which fires when async data is ready
  nuxtApp.hook('app:suspense:resolve', () => {
    // If we're still in loading phase, mark as interactive
    markPageInteractive()
  })

  // Initial page load - set loading phase
  if (import.meta.client) {
    setPageLoadPhase('loading')

    // Mark interactive once DOM is ready
    if (document.readyState === 'complete') {
      markPageInteractive()
    } else {
      window.addEventListener(
        'load',
        () => {
          markPageInteractive()
        },
        { once: true }
      )
    }
  }
})
