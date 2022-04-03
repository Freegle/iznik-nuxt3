import BootstrapVue3 from "bootstrap-vue-3"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BootstrapVue3)
})