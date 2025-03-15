import { defineNuxtPlugin } from '#app/nuxt'
import { reloadNuxtApp } from '#app/composables/chunk'
import { useMiscStore } from '~/stores/misc'

// On Netlify, we link to the permanently available version of the site, and so we shouldn't have issues with
// chunk files no longer existing.  So this plugin is for other environments.
//
// Nuxt reloads on route errors now.  But if you use async components, which we do, you could still have bad
// behaviour where you get stuck after a JS error.  So we reload on any chunk error.
//
// This is for the case where your old chunks have gone, e.g. you've deployed a new release.
export default defineNuxtPlugin({
  setup(nuxtApp) {
    nuxtApp.hook('app:chunkError', (error) => {
      if (!useMiscStore().unloading) {
        console.log(
          'Caught chunk error in ' +
            window?.location?.pathname +
            ', will reload: ' +
            JSON.stringify(error)
        )

        // Flag as reloading to suppress errors.
        useMiscStore().unloading = true

        // reloadNuxtApp({
        //   path: window?.location?.pathname ? window.location.pathname : '/',
        //   persistState: true,
        // })
        // TODO Problems with reloadNuxtApp?
      } else {
        console.log('Ignore chunk error during reload')
      }
    })
  },
})
