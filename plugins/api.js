import api from '~/api'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  return {
    provide: {
      api: api(runtimeConfig),
    },
  }
})
