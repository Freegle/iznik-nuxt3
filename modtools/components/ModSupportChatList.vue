<template>
  <div>
    <ModSupportChat
      v-for="chat in chatsShown"
      :key="'chathistory-' + chat.id"
      :chatid="chat.id"
      :pov="pov"
    />
    <b-button
      v-if="!showAll && chatsUnshown"
      variant="white"
      class="mt-1"
      @click="showAll = true"
    >
      Show +{{ chatsUnshown }}
    </b-button>
    <notice-message v-if="!props.chats?.length"> No chats. </notice-message>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '~/stores/chat'

const SHOW = 3

const chatStore = useChatStore()

const props = defineProps({
  chats: {
    type: Array,
    required: true,
  },
  pov: {
    type: Number,
    required: false,
    default: null,
  },
})

// Populate the chat store with chat objects so ModSupportChat can look them up by id.
function populateStore(chats) {
  if (chats) {
    chats.forEach((c) => {
      chatStore.listByChatId[c.id] = c
    })
  }
}

populateStore(props.chats)
watch(() => props.chats, populateStore)

const showAll = ref(false)

const chatsShown = computed(() => {
  if (!props.chats) return []
  return showAll.value ? props.chats : props.chats.slice(0, SHOW)
})

const chatsUnshown = computed(() => {
  if (!props.chats || props.chats.length <= SHOW) return 0
  return props.chats.length - SHOW
})
</script>
