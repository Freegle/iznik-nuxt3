import { useReplyStore } from '~/stores/reply'
import { useMessageStore } from '~/stores/message'

export default {
  computed: {
    replyToSend() {
      // This is here because we can arrive back at the site after a login which was triggered because we were
      // trying to reply.
      if (this.me) {
        const replyStore = useReplyStore()
        const ret = {
          replyMsgId: replyStore.replyMsgId,
          replyMessage: replyStore.replyMessage,
          replyingAt: replyStore.replyingAt,
        }

        if (
          ret &&
          ret.replyingAt &&
          Date.now() - ret.replyingAt < 24 * 60 * 60 * 1000 &&
          ret.replyMessage &&
          ret.replyMsgId
        ) {
          // We have a fairly recent reply to send.  Don't want to send old replies which somehow get stuck in
          // local storage.
          return ret
        }
      }

      return null
    },
    replyToUser() {
      if (this.replyToSend) {
        const messageStore = useMessageStore()
        const msg = messageStore.byId(this.replyToSend.replyMsgId)

        if (msg && msg.fromuser) {
          return msg.fromuser
        }
      }

      return null
    },
  },
  methods: {
    replyToPost() {
      // We have different buttons which display at different screen sizes.  Which of those is visible and hence
      // clicked tells us whether we want to open this chat in a popup or not.
      console.log('Execute reply to post', JSON.stringify(this.replyToSend))

      if (this.replyToSend) {
        this.$nextTick(async () => {
          // Double-click can result in coming through here after the reply has been sent and cleared.

          // Create the chat and send the first message.
          console.log(
            'Now open chat',
            this.replyToSend.replyMessage,
            this.replyToSend.replyMsgId,
            this.replyToUser
          )

          // Open the chat, which will send the message and go to the chat.  The chat will clear the store.
          await this.$refs.replyToPostChatButton.openChat(
            null,
            this.replyToSend.replyMessage,
            this.replyToSend.replyMsgId
          )

          // Clear the store of any message to avoid repeatedly sending it.
          const replyStore = useReplyStore()
          replyStore.replyMsgId = null
          replyStore.replyMessage = null
          replyStore.replyingAt = Date.now()

          this.replying = false

          this.$emit('sent')
        })
      }
    },
  },
}
