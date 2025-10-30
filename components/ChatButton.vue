<template>
  <div v-if="userid !== myid" class="d-inline clickme">
    <slot>
      <b-button
        :size="size"
        :variant="variant"
        :class="btnClass + ' d-none d-sm-inline'"
        @click="gotoChat(true)"
      >
        <v-icon v-if="showIcon" icon="comments" />
        <span v-if="title" :class="titleClass">
          {{ title }}
        </span>
      </b-button>
      <b-button
        :size="size"
        :variant="variant"
        :class="btnClass + ' d-inline-block d-sm-none'"
        @click="gotoChat(false)"
      >
        <v-icon v-if="showIcon" icon="comments" />
        <span v-if="title" :class="titleClass">
          {{ title }}
        </span>
      </b-button>
    </slot>
  </div>
</template>
<script setup>
import { useChatStore } from '~/stores/chat'
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc'
import { useRouter } from '#imports'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  size: {
    type: String,
    required: false,
    default: null,
  },
  title: {
    type: String,
    required: false,
    default: null,
  },
  variant: {
    type: String,
    required: false,
    default: 'primary',
  },
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  userid: {
    type: Number,
    required: false,
    default: null,
  },
  chattype: {
    type: String,
    required: false,
    default: null,
  },
  showIcon: {
    type: Boolean,
    required: false,
    default: true,
  },
  btnClass: {
    type: String,
    required: false,
    default: null,
  },
  titleClass: {
    type: String,
    required: false,
    default: 'ml-1',
  },
})

const emit = defineEmits(['click', 'sent'])
const chatStore = useChatStore()
const messageStore = useMessageStore()
const miscStore = useMiscStore()
const router = useRouter()

// Use me and myid computed properties from useMe composable for consistency
const { me, myid } = useMe()

const gotoChat = () => {
  openChat(null, null, null)
}

const openChat = async (event, firstmessage, firstmsgid) => {
  emit('click')
  console.log(
    'Open chat',
    firstmessage,
    firstmsgid,
    props.groupid,
    props.userid
  )

  if (props.groupid > 0) {
    // Open a chat to the mods. If we are in FD then we just pass the group id and the chat opens from us to the
    // mods; if we're in MT we pass the groupid and userid and it opens from us mods to the user.
    const chatuserid = miscStore.modtools ? props.userid : 0
    const chatid = await chatStore.openChatToMods(props.groupid, chatuserid)

    router.push('/chats/' + chatid)
  } else if (props.userid > 0) {
    const chatid = await chatStore.openChatToUser({
      userid: props.userid,
      chattype: props.chattype,
    })

    if (chatid) {
      if (firstmessage) {
        console.log('First message to send', firstmessage)
        await chatStore.send(chatid, firstmessage, null, null, firstmsgid)

        console.log('Sent')

        if (firstmsgid) {
          // Update the message so that the reply count is updated. No need to wait.
          messageStore.fetch(firstmsgid, true)
        }

        // Refresh the message so that our reply will show.
        await chatStore.fetchMessages(chatid, true)

        emit('sent')
      }

      // set the flag on the store to let the chat know that a modal asking for
      // contact details should be opened as soon as the chat's loaded
      chatStore.showContactDetailsAskModal =
        me.value && !me.value.settings.mylocation

      // We may be called from within a profile modal. We want to skip the navigation guard which would otherwise
      // close the modal.
      router.push({
        name: 'chats-id',
        query: {
          noguard: true,
        },
        params: {
          id: chatid,
        },
      })
    }
  }
}

// Expose the openChat method so it can be called from parent components
defineExpose({
  openChat,
})
</script>
