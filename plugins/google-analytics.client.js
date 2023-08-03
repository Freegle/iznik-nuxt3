import VueGtag from 'vue-gtag'
import { defineNuxtPlugin, useRuntimeConfig, useRouter } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const { vueApp } = nuxtApp
  const router = useRouter()

  const gaid = config.public.GOOGLE_ANALYTICS_ID
  console.log('Load GA analytics?', gaid)

  if (!gaid) {
    return
  }

  // Initialize the data layer for Google Tag Manager.  We have to do this before loading the script to ensure
  // our consent defaults will be respected.
  window.dataLayer = window.dataLayer || []

  function gtag() {
    window.dataLayer.push(arguments)
  }

  // Deny everything by default.  This allows us to be cookie-free and hence not need a consent banner.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'denied',
  })

  // Now we can invoke vue-gtag.  This will pull in the gtag script, which will pick up our consent settings.
  console.log('Add vue-gtag')
  vueApp.use(
    VueGtag,
    {
      config: {
        id: gaid,
      },
    },
    router
  )

  console.log('Added GA')
})
