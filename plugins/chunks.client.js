// import * as Sentry from '@sentry/browser'
import { defineNuxtPlugin } from '#app/nuxt'
import { reloadNuxtApp } from '#app/composables/chunk'

// Nuxt reloads on route errors now.  But if you use async components, which we do, you could still have bad
// behaviour where you get stuck after a JS error.  So we reload on any chunk error.
//
// This is for the case where your old chunks have gone, e.g. you've deployed a new release on Netlify.
export default defineNuxtPlugin({
  setup(nuxtApp) {
    nuxtApp.hook('app:chunkError', ({ error }) => {
      // Sentry.captureMessage(
      //   'Caught chunk error in ' +
      //     window?.location?.pathname +
      //     ', will reload: ' +
      //     JSON.stringify(error)
      // )

      reloadNuxtApp({
        path: window?.location?.pathname ? window.location.pathname : '/',
        persistState: true,
      })
    })
  },
})
