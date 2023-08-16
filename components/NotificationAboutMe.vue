<template>
  <div class="clickme d-flex" @click="showModal">
    <div class="d-flex flex-column justify-content-around">
      <ProfileImage
        image="/icon.png"
        class="mr-1 mb-1 ml-1 inline"
        is-thumbnail
        size="lg"
      />
    </div>
    <div class="d-flex flex-column">
      <div>Tell us about yourself!</div>
      <div v-if="notification.text">
        Click to introduce yourself to other freeglers by telling us a bit about
        you. You'll get a better response and it makes freegling more fun.
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
    showModal() {
      this.$emit('showModal')
    },
  },
}
</script>
