<template>
  <b-modal
    id="nudgetoosoonwarningmodal"
    v-model="showModal"
    scrollable
    title="Nudging"
    no-stacking
  >
    <template #default>
      <p>
        It's too soon to nudge - you need to wait 24 hours after the last
        message.
      </p>
      <p>
        Please remember that not everyone is online all the time. Some people
        are only able to check their messages every day or two.
      </p>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>
<script>
export default {
  data() {
    return {
      showModal: false,
    }
  },
  methods: {
    show(type) {
      this.showModal = true
    },

    hide() {
      this.showModal = false
    },
  },
}
</script>
