<template>
  <div>
    <ModSupportChat
      v-for="chat in chatsShown"
      :key="'chathistory-' + chat.id"
      :chat="chat"
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
import { ref, computed } from 'vue'

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

const showChats = ref(0)

const chatsShown = computed(() => {
  return props.chats ? props.chats.slice(0, showChats.value) : []
})

function loadMoreChats($state) {
  // We use an infinite load for the list because it's a lot of DOM to add at initial page load.
  if (showChats.value < props.chats.length) {
    showChats.value += 10
    $state.loaded()
  } else {
    $state.complete()
  }
}
</script>
