import * as Sentry from '@sentry/browser'
import { useRoute } from 'vue-router'
import { defineNuxtPlugin } from '#app/nuxt'
import { reloadNuxtApp } from '#app/composables/chunk'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    const route = useRoute()

    nuxtApp.hook('app:chunkError', ({ error }) => {
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
