// DONE
// Register the stdmsgs.js global mixin so that it is available to all components.
import stdmsgs from '../mixins/stdmsgs'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin(stdmsgs)
})
