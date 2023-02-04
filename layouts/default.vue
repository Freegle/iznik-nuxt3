<template>
  <div>
    <LayoutCommon v-if="ready">
      <slot />
    </LayoutCommon>
    <client-only>
      <GoogleOneTap v-if="oneTap" @complete="googleLoaded" />
    </client-only>
  </div>
</template>
<script>
import LayoutCommon from '../components/LayoutCommon'
import { ref } from '#imports'
import { useAuthStore } from '~/stores/auth'
const GoogleOneTap = () => import('~/components/GoogleOneTap')

export default {
  components: {
    LayoutCommon,
    GoogleOneTap,
  },
  async setup() {
    const ready = ref(false)
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

      try {
        user = await authStore.fetchUser()
      } catch (e) {
        console.log('Error fetching user', e)
      }

      if (user) {
        ready.value = true
      }
    }

    if (!ready.value) {
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
    loginStateKnown: {
      immediate: true,
      handler(newVal) {
        console.log('Login watch', newVal)
        if (newVal) {
          // We now know whether or not we have logged in.
          this.ready = true
        }
      },
    },
  },
  methods: {
    async googleLoaded() {
      // For this layout we don't need to be logged in.  So can just continue.  But we want to know first whether or
      // not we are logged in.  We might already know that from the server via cookies, but if not, find out.
      console.log('Google loaded', this.loginStateKnown)
      if (!this.loginStateKnown) {
        const authStore = useAuthStore()
        await authStore.fetchUser()
      }
    },
  },
}
</script>
