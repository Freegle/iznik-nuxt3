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
  methods: {
    googleLoaded() {
      // For this layout we don't need to be logged in.  So can just continue.
      this.ready = true
    },
  },
}
</script>
