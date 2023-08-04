import VueMatomo from 'vue-matomo'
import { useRuntimeConfig, defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const host = config.public.MATOMO_HOST

  if (host) {
    nuxtApp.vueApp.use(VueMatomo, {
      router: nuxtApp.$router,
      host,
      siteId: 1,
    })
  }
})
