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
        trackerFileName: 'piwik',
        preInitActions: [
          ['setCustomVariable', 1, 'app', 'true'],
          ['setCustomVariable', 2, 'appversion', config.public.MOBILE_VERSION],
        ],
      })
    } catch (e) {
      console.log('Matomo load failed', e)
    }
  }
})
