<template>
  <b-modal
    id="blockmodal"
    v-model="showModal"
    scrollable
    title="Delete message"
    no-stacking
  >
    <template #default>
      <b-row>
        <b-col>
          <p>
            We will delete it from our systems, but it's possible that the other
            freegler may have received the message by email (which we can't
            delete).
          </p>
          <p>Are you sure you want to delete the message?</p>
        </b-col>
      </b-row>
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
