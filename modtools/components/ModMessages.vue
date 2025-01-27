<template>
  <div>
    <div v-for="(message, ix) in visibleMessages" :key="'messagelist-' + message.id" class="p-0 mt-2">
      <div :ref="'top' + message.id" />
      <ModMessage :message="message" :next="ix < visibleMessages.length - 1 ? visibleMessages[ix + 1].id : null" :editreview="editreview"
        :next-after-removed="nextAfterRemoved" :summary="summary" :search="messageTerm" @destroy="destroy" />
      <div :ref="'bottom' + message.id" />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group';
import { useMessageStore } from '~/stores/message'
import { useMiscStore } from '~/stores/misc';
import { setupModMessages } from '../composables/useModMessages'

const authStore = useAuthStore()
const groupStore = useGroupStore()
const messageStore = useMessageStore()
const miscStore = useMiscStore()

// composables/modMessagesPage
const {
  busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, nextAfterRemoved, distance, summary, messages, visibleMessages, work,
} = setupModMessages()


const props = defineProps({
  editreview: { type: Boolean, required: false, default: false },
})


onMounted(async () => {
  //console.log('###ModMessages onMounted', groupid.value)
  // Ensure we have no cached messages for other searches/groups
  messageStore.clear()

  if (process.client && groupid.value) {
    groupStore.fetch(groupid.value)
  }

  await messageStore.clearContext()
  context.value = null

  const count = work.value
  if (count > 0) {
    await messageStore.fetchMessagesMT({
      groupid: groupid.value,
      collection: collection.value,
      modtools: true,
      summary: false,
      limit: Math.max(limit.value, count)
    })
    show.value = messages.value.length
  }
})

const destroy = (oldid, nextid) => {
  console.log('destroy', oldid, nextid)
  nextAfterRemoved.value = nextid
}

</script>
