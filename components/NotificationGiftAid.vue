<template>
  <div class="clickme d-flex">
    <div class="d-flex flex-column justify-content-around">
      <ProfileImage
        image="/icon.png"
        class="mr-1 mb-1 ml-1 inline"
        is-thumbnail
        size="lg"
      />
    </div>
    <div class="d-flex flex-column">
      <div>Thank you for donating to Freegle!</div>
      <div v-if="notification.text">
        Your kind donation can go even further if you complete a Gift Aid
        Declaration. Please click here.
      </div>
      <abbr class="small">{{ notificationago }}</abbr>
    </div>
  </div>
</template>
<script>
import { setupNotification } from '../composables/useNotification'

export default {
  components: {},
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    return await setupNotification(props.id)
  },
  methods: {
    goto() {
      if (!this.notification?.seen) {
        this.notificationStore.seen(this.id)
      }

      this.$router.push('/giftaid')
    },
  },
}
</script>
