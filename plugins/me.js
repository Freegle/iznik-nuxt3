// This plugin provides compatibility with components that expect the me mixin
// It injects the useMe composable's properties as global properties that can be accessed via this.$property
import { useMe } from '~/composables/useMe'

export default defineNuxtPlugin((nuxtApp) => {
  const meComposable = useMe()

  // Register all the properties from the composable as global properties
  // This maintains compatibility with components that use this.me, this.myGroups, etc.
  Object.keys(meComposable).forEach((key) => {
    // Skip functions (except those that should be exposed)
    if (
      typeof meComposable[key] === 'function' &&
      !['oneOfMyGroups', 'myGroup', 'fetchMe'].includes(key)
    ) {
      return
    }

    // Register the property
    nuxtApp.vueApp.config.globalProperties[key] = meComposable[key]
  })
})
