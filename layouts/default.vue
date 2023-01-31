<template>
  <div>
    <LayoutCommon v-if="ready">
      <slot />
    </LayoutCommon>
    <!--    <client-only>-->
    <!--      <GoogleOneTap @complete="googleLoaded" />-->
    <!--    </client-only>-->
  </div>
</template>
<script>
import LayoutCommon from '../components/LayoutCommon'
// const GoogleOneTap = () => import('~/components/GoogleOneTap')

export default {
  components: {
    LayoutCommon,
    // GoogleOneTap,
  },
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
