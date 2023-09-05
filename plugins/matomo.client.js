import VueMatomo from 'vue-matomo'
import { useRuntimeConfig, defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const host = config.public.MATOMO_HOST

  if (host) {
    try {
      nuxtApp.vueApp.use(VueMatomo, {
        router: nuxtApp.$router,
        host,
        siteId: 1,
      })
    } catch (e) {
      console.log('Matomo load failed', e)
    }
  }
})
