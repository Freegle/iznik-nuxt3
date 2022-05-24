import { ObserveVisibility } from 'vue3-observe-visibility'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('observe-visibility', ObserveVisibility)
})
