<template>
  <div v-if="show">
    <slot />
  </div>
</template>
<script>
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
