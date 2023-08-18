<template>
  <b-modal
    id="blockmodal"
    v-model="showModal"
    scrollable
    title="Delete message"
    no-stacking
  >
    <template #default>
      <p>
        We will delete this from our system, so you will no longer see it here.
      </p>
      <p>
        The other freegler may have received the message by email - we can't
        delete that.
      </p>
      <p>Are you sure you want to delete the message?</p>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="primary" @click="confirm"> Confirm </b-button>
    </template>
  </b-modal>
</template>
<script>
import modal from '@/mixins/modal'

export default {
  mixins: [modal],
  props: {
    chatId: {
      type: Number,
      required: true,
    },
    messageId: {
      type: Number,
      required: true,
    },
  },
  methods: {
    confirm() {
      this.$emit('confirm')
      this.hide()
    },
  },
}
</script>
