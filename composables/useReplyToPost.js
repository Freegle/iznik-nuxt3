import { computed } from 'vue'
import { useReplyStore } from '~/stores/reply'
import { useMessageStore } from '~/stores/message'
import { useMe } from '~/composables/useMe'

export function useReplyToPost() {
  const replyStore = useReplyStore()
  const messageStore = useMessageStore()
  const { me } = useMe()

  const replyToSend = computed(() => {
    // This is here because we can arrive back at the site after a login which was triggered because we were
    // trying to reply.
    if (me.value) {
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
        // We have a fairly recent reply to send. Don't want to send old replies which somehow get stuck in
        // local storage.
        return ret
      }
    }

    return null
  })

  const replyToUser = computed(() => {
    if (replyToSend.value?.replyMsgId) {
      const msg = messageStore.byId(replyToSend.value.replyMsgId)

      if (msg && msg.fromuser) {
        return msg.fromuser
      }
    }

    return null
  })

  async function replyToPost(chatButtonRef) {
    // We have different buttons which display at different screen sizes. Which of those is visible and hence
    // clicked tells us whether we want to open this chat in a popup or not.
    console.log('Execute reply to post', JSON.stringify(replyToSend.value))

    if (replyToSend.value) {
      // Double-click can result in coming through here after the reply has been sent and cleared.

      // Create the chat and send the first message.
      const replySent = replyToSend.value.replyMsgId

      console.log(
        'Now open chat',
        replyToSend.value.replyMessage,
        replyToSend.value.replyMsgId,
        replyToUser.value
      )

      // Open the chat, which will send the message and go to the chat. The chat will clear the store.
      await chatButtonRef.openChat(
        null,
        replyToSend.value.replyMessage,
        replyToSend.value.replyMsgId
      )

      // Clear the store of any message to avoid repeatedly sending it.
      replyStore.replyMsgId = null
      replyStore.replyMessage = null
      replyStore.replyingAt = Date.now()

      return replySent
    }

    return null
  }

  return {
    replyToSend,
    replyToUser,
    replyToPost,
  }
}
