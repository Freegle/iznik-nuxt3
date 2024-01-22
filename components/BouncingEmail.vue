<template>
  <b-row>
    <b-col cols="12" xl="6" offset-xl="3" class="bottom verytop">
      <NoticeMessage
        v-if="me && me.bouncing"
        variant="danger"
        class="mb-3 text-center"
      >
        <v-icon icon="exclamation-triangle" />
        We can't send to your email address. Please go to
        <nuxt-link no-prefetch to="/settings">Settings</nuxt-link>
        to fix or retry.
      </NoticeMessage>
    </b-col>
  </b-row>
</template>
<script>
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)

export default {
  components: {
    NoticeMessage,
  },
}
</script>
<style scoped>
.bottom {
  position: fixed;
  bottom: 0;
}
</style>
