import lineClamp from 'vue-line-clamp'

export default defineNuxtPlugin((nuxtApp) => {
  // TODO Not working.
  nuxtApp.vueApp.directive('line-clamp', lineClamp)
})
