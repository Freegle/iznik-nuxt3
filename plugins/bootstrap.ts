// TODO PERF Switch to new modules format for tree shaking, once it's ready.  Waiting on https://github.com/cdmoro/bootstrap-vue-3/issues/364.
import BootstrapVue3 from 'bootstrap-vue-3'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BootstrapVue3)
})
