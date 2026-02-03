<template>
  <div>
    <b-button variant="white" class="mr-2 mb-1" @click="view">
      <v-icon icon="comments" /> View Chat
    </b-button>
    <NoticeMessage v-if="showModal && !id" variant="warning" class="mt-2">
      This chat is no longer available.
    </NoticeMessage>
    <ModChatModal
      v-if="showModal && id"
      :id="id"
      :pov="pov"
      @hidden="showModal = false"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'

defineProps({
  id: {
    type: Number,
    required: true,
  },
  pov: {
    type: Number,
    required: false,
    default: null,
  },
})

const showModal = ref(false)

function view() {
  showModal.value = true
}
</script>
