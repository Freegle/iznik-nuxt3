import api from '~/api'

console.log('API plugin')

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  return {
    provide: {
      api: api(nuxtApp),
      // TODO Split config into separate plugin?
      ourConfig: config,
    },
  }
})
