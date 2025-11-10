// Register the modme.js global mixin so that it is available to all components.
import modme from '~/mixins/modme'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin(modme)
})
