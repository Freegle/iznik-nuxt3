<template>
  <div>
    <NoticeMessage v-if="!id" variant="warning">
      No chat id given
    </NoticeMessage>
    <div v-else-if="supportOrAdmin">
      <NoticeMessage v-if="notfound" variant="warning">
        Chat {{ id }} not found
      </NoticeMessage>
      <ModChatModal v-if="chat" :id="id" ref="modChatModal" :pov="pov" />
    </div>
    <NoticeMessage v-else variant="warning">
      You don't have access to Support Tools.
    </NoticeMessage>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '~/stores/chat'
import { useMessageStore } from '~/stores/message'
import { useMe } from '~/composables/useMe'

// Stores
const chatStore = useChatStore()
const messageStore = useMessageStore()

// Composables
const { supportOrAdmin } = useMe()

// Route
const route = useRoute()

// Template refs
const modChatModal = ref(null)

// Local state (formerly data())
const id = ref('id' in route.params ? parseInt(route.params.id) : 0)
const notfound = ref(false)
const chat = ref(null)
const pov = ref(null)

// Lifecycle
onMounted(async () => {
  await messageStore.clear()
  await chatStore.clear()

  if (!id.value) {
    return
  }

  await chatStore.fetchChat(id.value)

  chat.value = chatStore.byChatId(id.value)

  if (chat.value) {
    pov.value = chat.value.user1.id
  } else {
    notfound.value = true
  }
})
</script>
