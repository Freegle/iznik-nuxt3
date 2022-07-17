<template>
  <div class="d-flex mt-1 justify-content-between">
    <div class="flex-grow-1">
      <b-button
        v-if="message.groups && message.groups.length"
        variant="link"
        class="grey p-0 mr-4"
        size="sm"
        @click="report"
      >
        Report this post
      </b-button>
      <b-button
        variant="link"
        class="p-0 grey"
        title="Share"
        size="sm"
        @click="share"
      >
        Share
      </b-button>
    </div>
    <b-button
      variant="link"
      class="p-0 text-faded mr-2"
      size="sm"
      target="_blank"
      :to="'/message/' + message.id"
    >
      <v-icon icon="hashtag" class="fa-0-8x" />{{ message.id }}
    </b-button>
    <!--    TODO-->
    <!--    <ShareModal v-if="message.url" :id="message.id" ref="shareModal" />-->
    <!--    <MessageReportModal ref="reportModal" :message="message" />-->
  </div>
</template>
<script>
import { useMessageStore } from '~/stores/message'
export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const messageStore = useMessageStore()
    return { messageStore }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
  },
  methods: {
    share() {
      this.$refs.shareModal.show()
    },
    report() {
      this.$refs.reportModal.show()
    },
  },
}
</script>
<style scoped lang="scss">
.grey {
  color: $color-gray--base;
}
</style>
