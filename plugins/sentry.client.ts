import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'
import {
  HttpClient as HttpClientIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
} from '@sentry/integrations'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useRouter } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { vueApp } = nuxtApp
  const router = useRouter()

  Sentry.init({
    app: [vueApp],
    dsn: config.public.SENTRY_DSN,
    // Some errors seem benign, and so we ignore them on the client side rather than clutter our sentry logs.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded', // Benign - see https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
      'ResizeObserver loop completed with undelivered notifications.',
      'Navigation cancelled from ', // This can happen if someone clicks twice in quick succession

      // Leaflet errors.
      'Map container not found',
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
      // Ignore Bing crawler, which seems to abort pre-fetching of some assets.
      if (window.navigator.userAgent.includes('BingPreview')) {
        return null
      }

      // HeadlessChrome triggers an error in Google sign-in.  It's not a real user.
      if (window.navigator.userAgent.includes('HeadlessChrome')) {
        return null
      }

      // YisouSpider doesn't support some JS features, so we ignore it.
      if (window.navigator.userAgent.includes('Yisou')) {
        return null
      }

      // Check if it is an exception, and if so, log it.
      if (event.exception) {
        console.error(
          `[Exeption handled by Sentry]: (${hint.originalException})`,
          { event, hint }
        )
      }

      if (hint) {
        console.log(
          'Original exception was',
          hint.originalException,
          typeof hint.originalException
        )

        if (!hint.originalException) {
          // There's basically no info to report, so there's nothing we can do.  Suppress it.
          console.log('No info - suppress exception')
          return null
        } else if (hint.originalException.stack) {
          // Leaflet produces all sorts of errors, which are not really our fault and don't affect the user.
          if (hint.originalException.stack.includes('leaflet')) {
            console.log('Leaflet in stack - suppress exception')
            return null
          }
        } else if (
          hint.originalException.toString().match(/Down for maintenance/)
        ) {
          console.log('Maintenance - suppress exception', this)
          return null
        } else if (
          hint.originalException.name &&
          hint.originalException.name === 'TypeError'
        ) {
          console.log('TypeError')
          if (hint.originalException.message) {
            console.log('Message', hint.originalException.message)

            if (
              hint.originalException.message.match(/leaflet/) ||
              hint.originalException.message.match(/getPosition/)
            ) {
              // Leaflet produces all sorts of errors, which are not really our fault and don't affect the user.
              console.log('Suppress leaflet exception')
              return null
            } else if (
              hint.originalException.message.match(
                /can't redefine non-configurable property "userAgent"/
              )
            ) {
              // This exception happens a lot, and the best guess I can find is that it is a bugged browser
              // extension.
              console.log('Suppress userAgent')
              return null
            } else if (hint.originalException.message.match(/cancelled/)) {
              // This probably happens due to the user changing their mind and navigating away immediately.
              console.log('Suppress cancelled')
              return null
            }
          }
        } else if (
          hint.originalException.name &&
          hint.originalException.name === 'ReferenceError'
        ) {
          console.log('ReferenceError')
          if (hint.originalException.message) {
            console.log('Message', hint.originalException.message)

            if (
              hint.originalException.message.match(
                /Can't find variable: fieldset/
              )
            ) {
              // This happens because of an old bug which is now fixed:
              // https://codereview.chromium.org/2343013005
              console.log('Old Chrome fieldset bug')
              return null
            }
          }
        }
      }

      // Add some more detail if we can.
      if (hint && hint.originalException instanceof Event) {
        event.extra.isTrusted = hint.originalException.isTrusted
        event.extra.detail = hint.originalException.detail
        event.extra.type = hint.originalException.type
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

  return {
    provide: {
      sentrySetContext: (n, context) => Sentry.setContext(n, context),
      sentrySetUser: (user) => Sentry.setUser(user),
      sentrySetTag: (tagName, value) => Sentry.setTag(tagName, value),
      sentryAddBreadcrumb: (breadcrumb) => Sentry.addBreadcrumb(breadcrumb),
    },
  }
})
