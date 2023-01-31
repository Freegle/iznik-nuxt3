<template>
  <div>
    <client-only>
      <LayoutCommon v-if="ready">
        <slot />
      </LayoutCommon>
    </client-only>
    <client-only>
      <GoogleOneTap @complete="googleLoaded" />
      <LoginModal v-if="googleReady" />
    </client-only>
  </div>
</template>
<script>
import { useAuthStore } from '../stores/auth'
const GoogleOneTap = () => import('~/components/GoogleOneTap')
const LoginModal = () => import('~/components/LoginModal')

export default {
  components: {
    GoogleOneTap,
    LoginModal,
  },
  data() {
    return {
      ready: false,
      googleReady: false,
    }
  },
  watch: {
    me: {
      handler(newVal) {
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
      this.googleReady = true
    },
  },
}
</script>
