// This is a workaround for a new version being deployed under our feet.  See
// https://github.com/nuxt/nuxt/issues/14594
export default defineNuxtPlugin((nuxtApp) => {
  const checkError = (error) => {
    const messages = [
      'Importing a module script failed',
      'Failed to fetch dynamically imported module',
      'Unable to preload CSS',
    ]
    if (messages.some((message) => error?.message.includes(message))) {
      ;(() => {
        console.error('Missing script, reload site')
        nuxtApp.$router.go(0)
      })()
    }
  }

  const errorHandler = nuxtApp.vueApp.config.errorHandler

  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    console.log('Deployment workaround, error', err)
    if (typeof errorHandler === 'function') {
      errorHandler.call(err, instance, info)
    }

    checkError(err)
  }

  nuxtApp.$router.onError((error) => {
    console.log('Deployment workaround, router error', error)
    checkError(error)
  })
})
