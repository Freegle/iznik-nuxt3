<template>
  <div>
    <LayoutCommon v-if="ready">
      <slot />
    </LayoutCommon>
    <client-only>
      <GoogleOneTap @complete="googleLoaded" />
    </client-only>
  </div>
</template>
<script>
import LayoutCommon from '../components/LayoutCommon'
import { useAuthStore } from '~/stores/auth'
const GoogleOneTap = () => import('~/components/GoogleOneTap')

export default {
  components: {
    LayoutCommon,
    GoogleOneTap,
  },
  data() {
    return {
      // On the server we want to render immediately, because we're not going to find out that we're logged in - that
      // checking only happens on the client.
      ready: !!process.server,
    }
  },
  watch: {
    loginStateKnown: {
      handler(newVal) {
        if (newVal) {
          // Whether or not we are logged in, at least we now know.  We need this so that we don't trigger
          // API calls without a JWT when we are in fact logged in.  Now we can continue.
          console.log('Login state now known', newVal)
          this.ready = true
        }
      },
      immediate: true,
    },
  },

  methods: {
    async googleLoaded() {
      // For this layout we don't need to be logged in.  So can just continue.  But we want to know first whether or
      // not we are logged in.
      const authStore = useAuthStore()
      console.log('Google loaded')
      await authStore.fetchUser()
      console.log('Fetched')
    },
  },
}
</script>
