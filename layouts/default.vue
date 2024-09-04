<template>
  <div>
    <LayoutCommon :key="'nuxt-' + bump">
      <slot />
    </LayoutCommon>
    <client-only> </client-only>
  </div>
</template>
<script>
import { useMiscStore } from '../stores/misc'
import LayoutCommon from '~/components/LayoutCommon'
import { ref } from '#imports'
import { useAuthStore } from '~/stores/auth'

export default {
  components: {
    LayoutCommon,
  },
  async setup() {
    let ready = false
    const oneTap = ref(false)
    const googleReady = ref(false)
    const authStore = useAuthStore()
    const jwt = authStore.auth.jwt
    const miscStore = useMiscStore()
    const persistent = authStore.auth.persistent

    if (process.client) {
      // Ensure we don't wrongly think we have some outstanding requests if the server happened to start some.  This
      // would break waitForRef.
      miscStore.apiCount = 0
    }

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
        ready = true
      }
    }

    if (!ready) {
      // We don't have a valid JWT.  See if OneTap can sign us in.
      oneTap.value = true
    }

    return {
      oneTap,
      googleReady,
    }
  },
  data() {
    return {
      bump: 0,
    }
  },
  watch: {
    loginStateKnown: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // We now know whether or not we have logged in.  Re-render the page to make it reflect that.
          this.bump++
        }
      },
    },
  },
  async mounted() {
    // For this layout we don't need to be logged in.  So can just continue.  But we want to know first whether or
    // not we are logged in.  We might already know that from the server via cookies, but if not, find out.
    if (!this.loginStateKnown) {
      const authStore = useAuthStore()
      await authStore.fetchUser()
    }
  },
  methods: {
    googleLoggedIn() {
      // OneTap has logged us in.  Re-render the page as logged in.
      this.bump++
    },
  },
}
</script>
