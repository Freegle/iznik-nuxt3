<template>
  <div v-if="show">
    <slot />
  </div>
</template>
<script>
import { useMiscStore } from '../stores/misc'

export default {
  props: {
    at: {
      type: Array,
      required: false,
      default: null,
    },
    not: {
      type: Array,
      required: false,
      default: null,
    },
  },
  computed: {
    breakpoint() {
      const store = useMiscStore()
      return store.getBreakpoint
    },
    show() {
      if (process.server) {
        // Drop all optional components for SSR, otherwise we might start to render them on the client when we
        // don't need to.
        return false
      } else if (this.at) {
        return this.at.includes(this.breakpoint)
      } else {
        return !this.not.includes(this.breakpoint)
      }
    },
  },
}
</script>
