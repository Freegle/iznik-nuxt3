<template>
  <div class="chat-message-summary">
    <div v-if="!message" class="text-muted small">
      This chat message refers to a post (<v-icon
        icon="hashtag"
        class="text-muted fa-0-8x"
      />{{ id }}) that no longer exists.
    </div>
    <div v-else>
      <ChatMessageCard :id="id" />
      <notice-message
        v-if="message.outcomes?.length || message.deleted"
        class="mt-2"
      >
        <v-icon icon="info-circle" />
        <span v-if="message.type === 'Offer'">
          This is no longer available.
        </span>
        <span v-else> They are no longer looking for this. </span>
      </notice-message>
      <div v-else-if="message.promised">
        <div v-if="message.fromuser === myid">
          <notice-message class="mt-2">
            <div v-if="promisedToThem">
              You've promised it to this freegler.
            </div>
            <div v-else>You've promised it to someone else.</div>
          </notice-message>
        </div>
        <div v-else>
          <notice-message class="mt-2">
            <div v-if="message.promisedtoyou">This is promised to you.</div>
            <div v-else>This is promised to someone else at the moment.</div>
          </notice-message>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { useChatStore } from '~/stores/chat'
import { useAuthStore } from '~/stores/auth'
import ChatMessageCard from '~/components/ChatMessageCard'

const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  chatid: {
    type: Number,
    required: false,
    default: null,
  },
})

const messageStore = useMessageStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const myid = authStore.user?.id

// Fetch the message info.
try {
  await messageStore.fetch(props.id)

  const message = messageStore.byId(props.id)

  if (message) {
    message.groups.forEach(async (g) => {
      await groupStore.fetch(g.groupid)
    })
  }
} catch (e) {
  console.log('Message fetch failed', props.id, e)
}

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const chat = computed(() => {
  const chatStore = useChatStore()
  return props.chatid ? chatStore?.byChatId(props.chatid) : null
})

const promisedToThem = computed(() => {
  let ret = false

  if (message.value?.promises) {
    for (const p of message.value?.promises) {
      if (chat.value?.otheruid === p.userid) {
        ret = true
      }
    }
  }

  return ret
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.chat-message-summary {
  @include media-breakpoint-up(lg) {
    max-width: 400px;
  }
}
</style>
