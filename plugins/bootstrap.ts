import BButton from 'bootstrap-vue-3'
import BNotice from 'bootstrap-vue-3'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BButton)
  nuxtApp.vueApp.use(BNotice)
})
