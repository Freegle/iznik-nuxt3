import api from '~/api'

console.log('API plugin')

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  console.log('Config', config)
  console.log(config.API)
  return {
    provide: {
      api: api(nuxtApp),
      // TODO Split into separate plugin?
      ourConfig: config,
    },
  }
})
