// This is a workaround for a new version being deployed under our feet.  See
// https://github.com/nuxt/nuxt/issues/14594
export default defineNuxtPlugin((nuxtApp) => {
  const checkError = (error) => {
    const messages = [
      'Importing a module script failed', // safari
      'Failed to fetch dynamically imported module', // edge & chrome
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
    if (typeof errorHandler === 'function') {
      errorHandler.call(err, instance, info)
    }

    checkError(err)
  }

  nuxtApp.$router.onError((error) => {
    checkError(error)
  })
})
