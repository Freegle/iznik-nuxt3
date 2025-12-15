// import * as Sentry from '@sentry/capacitor';
import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'
import {
  HttpClient as HttpClientIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
} from '@sentry/integrations'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRouter } from '#imports'
import { useMiscStore } from '~/stores/misc'
import { suppressException } from '~/composables/useSuppressException'
import { onTraceChange, getTraceId, getSessionId } from '~/composables/useTrace'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { vueApp } = nuxtApp
  const router = useRouter()

  /* window.onbeforeunload = function () { Remove for IS_APP as opening browser calls this
    console.log('Window unloading...')
    useMiscStore().unloading = true
  } */

  // If we initialise Sentry before CookieYes then it seems to attach a click handler which blocks clicking on the
  // CookieYes banner.
  function checkCMPComplete() {
    const runTimeConfig = useRuntimeConfig()

    // Skip Sentry initialization if DSN is empty (disabled)
    if (!config.public.SENTRY_DSN) {
      console.log('Sentry disabled - skipping initialization')
      return
    }

    if (runTimeConfig.public.COOKIEYES && !window.cookieYesComplete) {
      setTimeout(checkCMPComplete, 100)
    } else {
      console.log('Init Sentry')
      Sentry.init({
        app: [vueApp],
        dsn: config.public.SENTRY_DSN,
        // Some errors seem benign, and so we ignore them on the client side rather than clutter our sentry logs.
        ignoreErrors: [
          'ResizeObserver loop limit exceeded', // Benign - see https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
          'ResizeObserver loop completed with undelivered notifications.',
          'Navigation cancelled from ', // This can happen if someone clicks twice in quick succession

          // These are very commonly errors caused by fetch() being aborted during page navigation.  See for example
          // https://forum.sentry.io/t/typeerror-failed-to-fetch-reported-over-and-overe/8447
          'TypeError: Failed to fetch',
          'TypeError: NetworkError when attempting to fetch resource.',
          'TypeError: Unable to preload',
          'Window closed',
        ],
        integrations: [
          new Integrations.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracePropagationTargets: ['localhost', 'ilovefreegle.org', /^\//],
          }),
          new HttpClientIntegration(),
          new ExtraErrorDataIntegration(),
        ],
        logErrors: false, // Note that this doesn't seem to work with nuxt 3
        tracesSampleRate: config.public.SENTRY_TRACES_SAMPLE_RATE || 1.0, // Sentry recommends adjusting this value in production
        debug: config.public.SENTRY_ENABLE_DEBUG || false, // Enable debug mode
        environment: config.public.ENVIRONMENT || 'dev', // Set environment
        // The following enables exceptions to be logged to console despite logErrors being set to false (preventing them from being passed to the default Vue err handler)
        beforeSend(event, hint) {
          if (useMiscStore()?.unloading) {
            // All network requests are aborted during unload, and so we'll get spurious errors.  Ignore them.
            console.log('Ignore error in unload')
            return null
          }

          // Ignore crawlers, which seems to abort pre-fetching of some assets.
          const userAgent = window.navigator.userAgent?.toLowerCase()

          if (
            userAgent.includes('bingpreview') ||
            userAgent.includes('bingbot') ||
            userAgent.includes('linespider') ||
            userAgent.includes('yisou')
          ) {
            return null
          }

          // HeadlessChrome triggers an error in Google sign-in.  It's not a real user.
          if (userAgent.includes('headlesschrome')) {
            return null
          }

          // Suppress Nuxt/Vue internal DOM removal errors before logging to console.
          // These occur during navigation when components are unmounted.
          if (
            hint?.originalException?.stack?.includes('performRemove') &&
            hint?.originalException?.message?.includes("reading 'parentNode'")
          ) {
            return null
          }

          // Suppress Vue unmountComponent errors during navigation.
          if (
            hint?.originalException?.stack?.includes('unmountComponent') &&
            hint?.originalException?.message?.includes(
              "'bum' of 'instance' as it is null"
            )
          ) {
            return null
          }

          // Check if it is an exception, and if so, log it.
          if (event.exception) {
            console.error(
              `[Exeption for Sentry]: (${hint.originalException})`,
              {
                event,
                hint,
              }
            )
          }

          if (hint) {
            const originalException = hint?.originalException
            const originalExceptionString = originalException?.toString()
            const originalExceptionStack = originalException?.stack
            const originalExceptionMessage = originalException?.message
            const originalExceptionName = originalException?.name

            // Add some more detail if we can.
            if (originalException instanceof Event) {
              event.extra.isTrusted = originalException.isTrusted
              event.extra.detail = originalException.detail
              event.extra.type = originalException.type
            }

            console.log(
              'Original exception was',
              originalException,
              typeof originalException,
              originalExceptionString,
              originalExceptionStack,
              originalExceptionMessage
            )

            if (!originalException) {
              // There's basically no info to report, so there's nothing we can do.  Suppress it.
              console.log('No info - suppress exception')
              return null
            } else if (originalExceptionStack?.includes('frame_ant')) {
              // Chrome extension giving errors.
              return null
            } else if (originalExceptionStack?.includes('/gpt/')) {
              // Google ads are not our problem.
              console.log('Google ads - suppress exception')
              return null
            } else if (
              originalExceptionStack?.includes('Cannot unmountComponent') &&
              originalExceptionString?.includes('destructure')
            ) {
              console.log('Vue unmount error - suppress')
              return null
            } else if (
              originalExceptionStack?.includes('/pageFold/') ||
              originalExceptionStack?.includes('/strikeforce/') ||
              originalExceptionStack?.includes('/ads/js/')
            ) {
              // This is a flaky ad library
              console.log('Pagefold, ads - suppress exception')
              return null
            } else if (
              (originalExceptionStack?.includes('bootstrap-vue-next') &&
                originalExceptionString?.match('removeAttribute')) ||
              originalExceptionStack?.match('_isWithActiveTrigger ')
            ) {
              // This seems to be a bug in bootstrap, and doesn't affect the user.
              console.log('Suppress Bootstrap tooltip exception')
              return null
            } else if (originalExceptionString?.match(/Down for maintenance/)) {
              console.log('Maintenance - suppress exception', this)
              return null
            } else if (
              originalExceptionString?.match(/Piwik undefined after waiting/)
            ) {
              // Some privacy blockers can cause this.
              console.log('Suppress Piwik/Matomo exception')
              return null
            } else if (
              originalExceptionString?.match(/Google ad script blocked/)
            ) {
              console.log('AdBlocker - no need to log.', this)
              return null
            } else if (
              originalExceptionString?.match(
                /Attempt to use history.replaceState/
              )
            ) {
              console.log('History.replaceState too often')
              return null
            } else if (suppressException(originalException)) {
              console.log('Suppress exception')
              return null
            } else if (originalExceptionName === 'TypeError') {
              console.log('TypeError')
              if (
                originalExceptionMessage?.match(
                  /can't redefine non-configurable property "userAgent"/
                )
              ) {
                // This exception happens a lot, and the best guess I can find is that it is a bugged browser
                // extension.
                console.log('Suppress userAgent')
                return null
              } else if (originalExceptionMessage?.match(/cancelled/)) {
                // This probably happens due to the user changing their mind and navigating away immediately.
                console.log('Suppress cancelled')
                return null
              } else if (
                originalExceptionString?.match(/Object.checkLanguage/)
              ) {
                // Some auto translation thing.
                console.log('Translate exception cancelled')
                return null
              } else if (originalExceptionString?.match(/\/js\/gpt/)) {
                // Error inside Google Ads.
                console.log('Ad error ignored')
                return null
              } else if (
                originalExceptionString?.match(
                  /NetworkError when attempting to fetch resource./
                )
              ) {
                // Flaky network.
                console.log('Suppress flaky network')
                return null
              }
            } else if (originalExceptionName === 'ReferenceError') {
              console.log('ReferenceError')
              if (
                originalExceptionMessage?.match(/Can't find variable: fieldset/)
              ) {
                // This happens because of an old bug which is now fixed:
                // https://codereview.chromium.org/2343013005
                console.log('Old Chrome fieldset bug')
                return null
              }
            } else if (originalExceptionName === 'SecurityError') {
              if (
                (originalExceptionMessage?.match('Blocked a frame') &&
                  originalExceptionStack?.match('isRef')) ||
                originalExceptionStack?.match('popupInterval')
              ) {
                // See https://stackoverflow.com/questions/39081098/close-a-window-opened-with-window-open-after-clicking-a-button
                console.log(
                  'Suppress error caused by a bug in vue-social-sharing.'
                )
                return null
              }
            } else if (
              originalExceptionStack?.includes('_.ae') &&
              originalExceptionStack?.includes('/gsi/client')
            ) {
              // This is an error in Google One Tap sign-in, often preceded by a console log about malformed JSON
              // response.  It's possible that it relates to multiple account sign in.  I've failed to reproduce it, and
              // it's not really clear that it's our fault so there's no point beating ourselves up about it.
              console.log('Suppress odd Google One Tap error')
              return null
            } else if (
              originalExceptionMessage?.includes(
                'Looks like your website URL has changed'
              ) &&
              originalExceptionStack?.includes('cookieyes')
            ) {
              // This is a common error that is not our fault.
              console.log('CookieYes domain error - probably test deployment')
              if (window.postCookieYes) {
                window.postCookieYes()
              }

              return null
            } else if (
              originalExceptionMessage?.includes(
                'Attempted to load an infinite number of tiles'
              ) ||
              originalExceptionMessage?.includes(
                "Cannot read properties of null (reading 'latLngToLayerPoint')"
              ) ||
              originalExceptionMessage?.includes('latLngToLayerPoint')
            ) {
              // This is a leaflet error - don't understand it, but not our fault.
              return null
            } else if (
              originalExceptionMessage?.includes(
                "All 'ins' elements in the DOM with class=adsbygoogle already have ads"
              )
            ) {
              // This is a Google Ads error, and not our fault.
              return null
            } else if (
              originalExceptionMessage?.includes('@webkit-masked-url://hidden/')
            ) {
              // Webkit issue - see https://github.com/getsentry/sentry-javascript/discussions/5875
              return null
            }
          }

          // Continue sending to Sentry
          return event
        },
      })

      vueApp.mixin(
        Sentry.createTracingMixins({
          trackComponents: true,
          timeout: 2000,
          hooks: ['activate', 'mount', 'update'],
        })
      )
      Sentry.attachErrorHandler(vueApp, {
        logErrors: false,
        attachProps: true,
        trackComponents: true,
        timeout: 2000,
        hooks: ['activate', 'mount', 'update'],
      })

      // Set initial trace tags for correlation with Loki logs.
      Sentry.setTag('trace_id', getTraceId())
      Sentry.setTag('session_id', getSessionId())

      // Register callback to update trace tags when trace changes.
      onTraceChange((traceId, sessionId) => {
        Sentry.setTag('trace_id', traceId)
        Sentry.setTag('session_id', sessionId)
      })
    }
  }

  checkCMPComplete()

  return {
    provide: {
      sentrySetContext: (n, context) => Sentry.setContext(n, context),
      sentrySetUser: (user) => Sentry.setUser(user),
      sentrySetTag: (tagName, value) => Sentry.setTag(tagName, value),
      sentryAddBreadcrumb: (breadcrumb) => Sentry.addBreadcrumb(breadcrumb),
      sentryCaptureException: (e) => Sentry.captureException(e),
    },
  }
})
