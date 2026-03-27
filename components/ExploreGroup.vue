<template>
  <div class="mb-2 mt-2">
    <GroupHeader
      v-if="group"
      :group="group"
      show-join
      :show-give-find="showGiveFind"
    />
    <OurMessage v-if="msgid" :id="msgid" record-view class="mt-3" />
    <MessageList
      :messages-for-list="messagesToShow"
      :selected-group="id"
      :bump="bump"
      :exclude="msgid"
      :show-give-find="showGiveFind"
      :show-group-header="false"
    />
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import MessageList from './MessageList'
import OurMessage from './OurMessage'
import GroupHeader from './GroupHeader'
import { useGroupStore } from '~/stores/group'

const props = defineProps({
  id: {
    validator: (prop) => typeof prop === 'number' || typeof prop === 'string',
    required: true,
  },
  msgid: {
    type: Number,
    required: false,
    default: null,
  },
  showGiveFind: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const groupStore = useGroupStore()

const group = computed(() => {
  return groupStore?.get(props.id)
})

const bump = ref(0)

await groupStore.fetchMessagesForGroup(props.id)

// Computed properties
const messages = computed(() => {
  return groupStore?.getMessages(props.id)
})

const messagesToShow = computed(() => {
  const ids = messages.value ? messages.value : []
  return ids.map((id) => {
    return { id, groupid: props.id }
  })
})

// Watch for changes
watch(messagesToShow, () => {
  bump.value++
})
</script>
