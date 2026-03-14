import { computed } from 'vue'
import { useReplyStore } from '~/stores/reply'
import { useMessageStore } from '~/stores/message'
import { useMe } from '~/composables/useMe'
import { action } from '~/composables/useClientLog'

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

      action('reply_to_post_success', {
        message_id: replySent,
      })

      return replySent
    }

    // Log why replyToSend is null - helps diagnose "can't reply" issues.
    const replyAge = replyStore.replyingAt
      ? Date.now() - replyStore.replyingAt
      : null
    action('reply_to_post_null', {
      is_logged_in: !!me.value,
      has_reply_msg_id: !!replyStore.replyMsgId,
      has_reply_message: !!replyStore.replyMessage,
      has_replying_at: !!replyStore.replyingAt,
      reply_age_ms: replyAge,
      reply_stale: replyAge ? replyAge >= 24 * 60 * 60 * 1000 : null,
    })

    return null
  }

  return {
    replyToSend,
    replyToUser,
    replyToPost,
  }
}
