<template>
  <div>
    <LayoutCommon v-if="ready">
      <slot />
    </LayoutCommon>
    <client-only>
      <GoogleOneTap v-if="oneTap" @complete="googleLoaded" />
      <LoginModal ref="loginModal" />
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
      oneTap: false,
      googleReady: false,
    }
  },
  async mounted() {
    if (this.jwt) {
      // We have a JWT, which may or may not be valid on the server.  If it is, then we can crack on and
      // start rendering the page.  This will be quicker than waiting for GoogleOneTap to load and tell us
      // whether or not we can log in that way.
      const authStore = useAuthStore()
      const user = await authStore.fetchUser()

      if (user) {
        this.ready = true
      }
    }

    if (!this.ready) {
      // We don't have a valid JWT.  See if OneTap can sign us in.
      this.oneTap = true
    }
  },
  methods: {
    googleLoaded() {
      // For this layout we know that we need to be logged in.  Now that we know whether Google has logged us in,
      // we can render the login modal, which may or may not be needed.
      this.googleReady = true
      console.log('Google ready')

      if (!this.me) {
        console.log('Not logged in, force')
        this.waitForRef('loginModal', () => {
          console.log(this.$refs.loginModal)
          this.$refs.loginModal.show()
        })
      }
    },
  },
}
</script>
