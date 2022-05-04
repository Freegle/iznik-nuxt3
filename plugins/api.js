import api from '~/api'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  return {
    provide: {
      api: api(nuxtApp, config),
    },
  }
})
