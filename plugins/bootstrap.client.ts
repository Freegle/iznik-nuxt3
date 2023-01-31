// eslint-disable-next-line import/no-named-as-default
import BootstrapVueNext from 'bootstrap-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BootstrapVueNext)
})
