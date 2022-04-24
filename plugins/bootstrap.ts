import BButton from 'bootstrap-vue-3'
import BNotice from 'bootstrap-vue-3'
import BNav from 'bootstrap-vue-3'
import BNavBar from 'bootstrap-vue-3'
import BNavItem from 'bootstrap-vue-3'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BButton)
  nuxtApp.vueApp.use(BNotice)
  nuxtApp.vueApp.use(BNav)
  nuxtApp.vueApp.use(BNavBar)
  nuxtApp.vueApp.use(BNavItem)
})
