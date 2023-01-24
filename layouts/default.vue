<template>
  <div>
    <LayoutCommon v-if="ready">
      <slot />
    </LayoutCommon>
    <GoogleOneTap @complete="googleLoaded" />
  </div>
</template>
<script>
export default {
  data() {
    return {
      ready: false,
    }
  },
  methods: {
    googleLoaded() {
      // For this layout we don't need to be logged in.  So can just continue.
      this.ready = true
    },
  },
}
</script>
