<template>
  <div>
    <LayoutCommon v-if="ready">
      <slot />
    </LayoutCommon>
    <GoogleOneTap @complete="googleLoaded" />
    <LoginModal v-if="googleReady" />
  </div>
</template>
<script>
import { useAuthStore } from '../stores/auth'

export default {
  data() {
    return {
      ready: false,
      googleReady: false,
    }
  },
  watch: {
    me: {
      handler(newVal) {
        console.log('Login required watcher', newVal)
        if (newVal) {
          // We are logged in - we can continue.
          this.ready = true
        } else {
          // We're not logged in.  We need to force a login.
          this.ready = false
          const authStore = useAuthStore()
          authStore.forceLogin = true
        }
      },
      immediate: true,
    },
  },
  methods: {
    googleLoaded() {
      // For this layout we know that we need to be logged in.  Now that we know whether Google has logged us in,
      // we can render the login modal, which may or may not be needed.
      console.log('Login required google loaded')
      this.googleReady = true
    },
  },
}
</script>
