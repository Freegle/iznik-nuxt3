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
    <div
      v-tooltip="'Click to view this message in a single page'"
      @click.native.prevent="goto"
    >
      <b-button
        variant="link"
        class="p-0 text-faded mr-2"
        size="sm"
        :to="'/message/' + message.id"
      >
        <v-icon icon="hashtag" class="fa-0-8x" />{{ message.id }}
      </b-button>
    </div>
    <MessageShareModal
      v-if="showShareModal && message.url"
      :id="message.id"
      ref="shareModal"
    />
    <!--    TODO Report message-->
    <!--    <MessageReportModal ref="reportModal" :message="message" />-->
  </div>
</template>
<script>
import { useRouter } from '#imports'
import { useMessageStore } from '~/stores/message'
const MessageShareModal = () => import('./MessageShareModal')

export default {
  components: {
    MessageShareModal,
  },
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
  data() {
    return {
      showShareModal: false,
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
  },
  methods: {
    share() {
      this.showShareModal = true
      this.waitForRef('shareModal', () => {
        this.$refs.shareModal.show()
      })
    },
    report() {
      this.$refs.reportModal.show()
    },
    goto() {
      const router = useRouter()
      router.push('/message/' + this.id)
    },
  },
}
</script>
<style scoped lang="scss">
.grey {
  color: $color-gray--base;
}
</style>
