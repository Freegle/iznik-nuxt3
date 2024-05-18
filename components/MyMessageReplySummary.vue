<template>
  <div class="d-flex justify-content-between mt-2 mb-2 p-2">
    <div class="d-flex flex-wrap fs">
      <MyMessageReplyUser
        v-for="reply in message.replies"
        :id="reply.userid"
        :key="'reply-' + reply.userid"
        :profile-modal="false"
        class="mr-2"
        :unseen="unseen"
        @click="openChat(reply.userid)"
      />
    </div>
    <div>
      <b-button size="lg" variant="primary" @click="expand">
        <div class="d-flex align-items-center">
          <v-icon icon="user" class="fa-fw" />
          &nbsp;Show
          {{
            message.replycount === 1
              ? '1 reply'
              : message.replycount + ' replies'
          }}
        </div>
      </b-button>
    </div>
    <div v-if="unseen > 0" class="mr-2">
      <b-badge variant="danger">
        <v-icon icon="comments" class="fa-fw" /> {{ unseen }} unread
      </b-badge>
    </div>
  </div>
</template>
<script setup>
import { useMessageStore } from '~/stores/message'
import { useChatStore } from '~/stores/chat'
import { useRouter } from '#imports'

const props = defineProps({
  id: { type: Number, required: true },
})

const emit = defineEmits(['expand'])

const messageStore = useMessageStore()
const chatStore = useChatStore()

const message = computed(() => {
  return messageStore.byId(props.id)
})

const unseen = computed(() => {
  // We want all the chats from replies.  We fetch them in default.vue, here we only need to
  // get them from the store
  const chats = chatStore?.list ? chatStore.list : []

  let unseen = 0

  if (message.value?.replies) {
    for (const reply of message.value.replies) {
      for (const chat of chats) {
        if (chat.id === reply.chatid) {
          unseen += chat.unseen
        }
      }
    }
  }

  return unseen
})

async function openChat(userid) {
  const chatid = await chatStore.openChatToUser({
    userid,
    chattype: 'User2User',
  })

  const router = useRouter()
  router.push('/chats/' + chatid)
}

function expand() {
  emit('expand')
}
</script>
<style scoped lang="scss">
.fs {
  font-size: 150% !important;
}
</style>
