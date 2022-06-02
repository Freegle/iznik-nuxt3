// Register the me.js global mixin so that it is available to all components.
import me from '~/mixins/me'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin(me)
})
