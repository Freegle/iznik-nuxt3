<template>
  <div>
    <b-modal
      :id="'messageReportModal-' + message.id"
      v-model="showModal"
      :title="'Report ' + message.subject"
      size="lg"
    >
      <template #default>
        <p>
          Thanks for reporting an inappropriate post. We'll send your comments
          to your local volunteers who will have a look and take suitable
          action.
        </p>
        <b-form-textarea
          v-model="reason"
          rows="2"
          placeholder="Please explain what's wrong with this post."
        />
      </template>
      <template #footer>
        <b-button variant="secondary" @click="hide">Close</b-button>
        <b-button variant="primary" @click="report">Submit Report</b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import modal from '@/mixins/modal'
import { useMessageStore } from '~/stores/message'
import { useChatStore } from '~/stores/chat'
export default {
  mixins: [modal],
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const messageStore = useMessageStore()
    const chatStore = useChatStore()

    return {
      messageStore,
      chatStore,
    }
  },
  data() {
    return {
      reason: null,
    }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
  },
  methods: {
    async report() {
      console.log('Report', this.reason)
      if (this.reason) {
        console.log('Open chat')
        const chatid = await this.chatStore.openChatToMods(
          this.message.groups[0].groupid
        )

        console.log('Send report', chatid)

        const runtimeConfig = useRuntimeConfig()

        await this.chatStore.send(
          chatid,
          "I'm reporting " +
            runtimeConfig.public.USER_SITE +
            '/message/' +
            this.message.id +
            ' to you as inappropriate.\r\n\r\n"' +
            this.reason +
            '"',
          null,
          null,
          this.id
        )

        this.hide()
      }
    },
  },
}
</script>
