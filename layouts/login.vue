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
import { useMobileStore } from '~/stores/mobile'
import LayoutCommon from '../components/LayoutCommon'
import { ref } from '#imports'
const GoogleOneTap = () => import('~/components/GoogleOneTap')
const LoginModal = () => import('~/components/LoginModal')

export default {
  components: {
    GoogleOneTap,
    LoginModal,
    LayoutCommon,
  },
  async setup() {
    const mobileStore = useMobileStore()
    const ready = ref(mobileStore.isApp)
    const oneTap = ref(false)
    const googleReady = ref(false)
    const authStore = useAuthStore()
    const jwt = authStore.auth.jwt
    const persistent = authStore.auth.persistent

    if (jwt || persistent) {
      // We have some credentials, which may or may not be valid on the server.  If they are, then we can crack on and
      // start rendering the page.  This will be quicker than waiting for GoogleOneTap to load on the client and tell us
      // whether or not we can log in that way.
      let user = null
      console.log('Login layout, fetch user')

      try {
        user = await authStore.fetchUser()
        console.log('Fetched user')
      } catch (e) {
        console.log('Error fetching user', e)
      }

      if (user) {
        ready.value = true
      }
    }

    if (!ready.value && !mobileStore.isApp) {
      // We don't have a valid JWT.  See if OneTap can sign us in.
      oneTap.value = true
    }

    return {
      ready,
      oneTap,
      googleReady,
    }
  },
  watch: {
    me: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // We've logged in.
          this.ready = true
        }
      },
    },
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
