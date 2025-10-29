// Mixin that provides access to the me composable for components using Options API
import { useMe } from '~/composables/useMe'

export default {
  setup() {
    const meData = useMe()
    return {
      ...meData,
    }
  },
}
