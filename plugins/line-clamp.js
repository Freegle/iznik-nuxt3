import lineClamp from 'vue-line-clamp'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('line-clamp', lineClamp)
})
