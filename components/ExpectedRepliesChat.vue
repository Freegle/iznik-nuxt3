<template>
  <b-button variant="primary" size="lg" :to="'/chats/' + id">
    Reply to {{ chat?.name }} now
  </b-button>
</template>
<script setup>
import { computed } from 'vue'
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const chat = computed(() => chatStore.byChatId(props.id))

await chatStore.fetchChat(props.id)
</script>
