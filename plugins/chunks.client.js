import * as Sentry from '@sentry/browser'
import { defineNuxtPlugin } from '#app/nuxt'
import { reloadNuxtApp } from '#app/composables/chunk'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    nuxtApp.hook('app:chunkError', ({ error }) => {
      Sentry.captureMessage(
        'Caught chunk error in ' +
          window?.location?.pathname +
          ', will reload: ' +
          JSON.stringify(error)
      )

      reloadNuxtApp({
        path: window?.location?.pathname ? window.location.pathname : '/',
        persistState: true,
      })
    })
  },
})
