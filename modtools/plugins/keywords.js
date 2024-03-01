// DONE
// Register the keywords.js global mixin so that it is available to all components.
import keywords from '../mixins/keywords'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin(keywords)
})
