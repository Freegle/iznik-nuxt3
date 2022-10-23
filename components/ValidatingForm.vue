<template>
  <form v-bind="$attrs">
    <slot />
  </form>
</template>
<script>
import { useVuelidate } from '@vuelidate/core'

export default {
  setup() {
    return {
      v$: useVuelidate(),
    }
  },
}
</script>
