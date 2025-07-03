<template>
  <div>
    <b-button variant="white" class="mr-2 mb-1" @click="view">
      <v-icon icon="comments" /> View Chat
    </b-button>
    <NoticeMessage v-if="showModal && !id" variant="warning" class="mt-2">
      This chat is no longer available.
    </NoticeMessage>
    <ModChatModal
      v-if="showModal && id"
      :id="id"
      ref="modChatModal"
      :pov="pov"
      @hidden="showModal = false"
    />
  </div>
</template>
<script>
export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    pov: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data: function () {
    return {
      showModal: false,
    }
  },
  methods: {
    view() {
      this.showModal = true
      this.$refs.modChatModal?.show()
    },
  },
}
</script>
