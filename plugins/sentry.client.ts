import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { vueApp } = nuxtApp
  Sentry.init({
    app: [vueApp],
    dsn: config.SENTRY_DSN,
    // Some errors seem benign, and so we ignore them on the client side rather than clutter our sentry logs.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded', // Benign - see https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
      'Navigation cancelled from ', // This can happen if someone clicks twice in quick succession
    ],
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(
          nuxtApp.$router
        ),
        tracingOrigins: ['localhost', 'ilovefreegle.org', /^\//],
      }),
    ],
    logErrors: false, // Note that this doesn't seem to work with nuxt 3
    tracesSampleRate: config.SENTRY_TRACES_SAMPLE_RATE || 1.0, // Sentry recommends adjusting this value in production
    debug: config.SENTRY_ENABLE_DEBUG || false, // Enable debug mode
    environment: config.ENVIRONMENT || 'dev', // Set environment
    // The following enables exeptions to be logged to console despite logErrors being set to false (preventing them from being passed to the default Vue err handler)
    beforeSend(event, hint) {
      // Check if it is an exception, and if so, log it.
      if (event.exception) {
        console.error(
          `[Exeption handled by Sentry]: (${hint.originalException})`,
          { event, hint }
        )
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
