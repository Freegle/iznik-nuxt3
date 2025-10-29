<template>
  <div>
    <div
      v-for="(message, ix) in visibleMessages"
      :key="'messagelist-' + message.id"
      class="p-0 mt-2"
    >
      <div :ref="'top' + message.id" />
      <ModMessage
        :message="message"
        :next="
          ix < visibleMessages.length - 1 ? visibleMessages[ix + 1].id : null
        "
        :editreview="editreview"
        :next-after-removed="nextAfterRemoved"
        :summary="summary"
        :search="messageTerm"
        @destroy="destroy"
      />
      <div :ref="'bottom' + message.id" />
    </div>
  </div>
</template>

<script setup>
import { setupModMessages } from '~/composables/useModMessages'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'

const groupStore = useGroupStore()
const messageStore = useMessageStore()

// composables/modMessagesPage
const modMessages = setupModMessages()
const {
  context,
  groupid,
  messageTerm,
  nextAfterRemoved,
  summary,
  visibleMessages,
} = modMessages

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  editreview: { type: Boolean, required: false, default: false },
})

onMounted(async () => {
  // Ensure we have no cached messages for other searches/groups
  messageStore.clear()

  if (process.client && groupid.value) {
    groupStore.fetch(groupid.value)
  }

  await messageStore.clearContext()
  context.value = null
})

const destroy = (oldid, nextid) => {
  // console.log('destroy', oldid, nextid)
  nextAfterRemoved.value = nextid
}
</script>
