// eslint-disable-next-line import/no-named-as-default
import { BootstrapVueNext, vBTooltip, vBToggle } from 'bootstrap-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BootstrapVueNext)

  /// The directives don't seem to get installed this way, so we need to do it manually.
  nuxtApp.vueApp.directive('b-tooltip', vBTooltip)
  nuxtApp.vueApp.directive('b-toggle', vBToggle)

  // b-modal is not exported - roll our own.
  nuxtApp.vueApp.directive('b-modal', {
    mounted(el, binding) {
      let target = binding.value

      if (Object.keys(binding.modifiers).length > 0) {
        ;[target] = Object.keys(binding.modifiers)
      }

      el.setAttribute('data-bs-toggle', 'modal')
      el.setAttribute('data-bs-target', `#${target}`)
    },
  })
})
