<template>
  <div>
    <ModSupportChat
      v-for="chat in chatsShown"
      :key="'chathistory-' + chat.id"
      :chatid="chat.id"
      :pov="pov"
    />
    <infinite-loading :distance="10" @infinite="loadMoreChats">
      <template #complete>
        <notice-message v-if="!chatsShown?.length"> No chats. </notice-message>
      </template>
    </infinite-loading>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '~/stores/chat'

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

const showChats = ref(10)

const chatsShown = computed(() => {
  return props.chats ? props.chats.slice(0, showChats.value) : []
})

function loadMoreChats($state) {
  // We use an infinite load for the list because it's a lot of DOM to add at initial page load.
  if (props.chats && showChats.value < props.chats.length) {
    showChats.value += 10
    $state.loaded()
  } else {
    $state.complete()
  }
}
</script>
