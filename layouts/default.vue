<template>
  <div>
    <LayoutCommon v-if="ready">
      <slot />
    </LayoutCommon>
  </div>
</template>
<script>
import LayoutCommon from '../components/LayoutCommon'
import { useAuthStore } from '~/stores/auth'
// CC const GoogleOneTap = () => import('~/components/GoogleOneTap')

export default {
  components: {
    LayoutCommon,
    // CC GoogleOneTap,
  },
  data() {
    return {
      // On the server we want to render immediately, because we're not going to find out that we're logged in - that
      // checking only happens on the client.
      ready: true, // CC
      oneTap: false,
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
      console.log('Try for onetap')
      this.oneTap = true
    }
  },
  methods: {
    async googleLoaded() {
      // For this layout we don't need to be logged in.  So can just continue.  But we want to know first whether or
      // not we are logged in.
      const authStore = useAuthStore()
      await authStore.fetchUser()

      this.ready = true
    },
  },
}
</script>
