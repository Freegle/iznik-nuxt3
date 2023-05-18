import * as Sentry from '@sentry/browser'
import { useRoute } from 'vue-router'
import { defineNuxtPlugin } from '#app/nuxt'
import { reloadNuxtApp } from '#app/composables/chunk'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    nuxtApp.hook('app:chunkError', ({ error }) => {
      const route = useRoute()

      Sentry.captureMessage(
        'Caught chunk error in ' +
          route?.path +
          ', will reload: ' +
          JSON.stringify(error)
      )

      reloadNuxtApp({
        path: route?.path ? '/' : route.path,
        persistState: true,
      })
    })
  },
})
