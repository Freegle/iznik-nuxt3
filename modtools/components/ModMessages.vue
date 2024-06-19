<template>
  <div>
    <div v-for="(message, ix) in visibleMessages" :key="'messagelist-' + message.id" class="p-0 mt-2">
      <div :ref="'top' + message.id" />
      <ModMessage :message="message" :next="ix < visibleMessages.length - 1 ? visibleMessages[ix + 1].id : null"
        :next-after-removed="nextAfterRemoved" :summary="summary" :search="messageTerm" @destroy="destroy" />
      <div :ref="'bottom' + message.id" />
    </div>

    <NoticeMessage v-if="!messages.length && !busy" class="mt-2">
      There are no messages at the moment. This will refresh automatically.
    </NoticeMessage>
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

// mixin/modMessagesPage
const {
  busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, messages, visibleMessages, work,
} = setupModMessages()


const props = defineProps({
})


// mixin/modMessagesPage
onMounted(async () => {
  // Ensure we have no cached messages for other searches/groups
  messageStore.clear()

  if (process.client && groupid.value) {
    groupStore.fetch(groupid.value)
  }

  /*// Keep track of whether we have a modal open, so that we don't clear messages under its feet.
  //
  // We don't always seem to get the hidden event, so we store the timestamp so that we can time out our belief
  // that the modal is open.
  this.$root.$on('bv::modal::show', (bvEvent, modalId) => {
    modalOpen.value = Date.now()
    console.log('Modal open')
  })

  this.$root.$on('bv::modal::hidden', (bvEvent, modalId) => {
    modalOpen.value = null
    console.log('Modal closed')
  })*/

  await messageStore.clearContext()
  context.value = null

  const authStore = useAuthStore()
  const work = authStore.work // NOT PRESENT YET
  console.log('###ModMessages work', work)
  if (work) {
    const count = workType.value ? work[workType.value] : 0

    console.log('###ModMessages onMounted', count)
    if (count > 0) {
      await messageStore.fetchMessages({
        groupid: groupid.value,
        collection: collection.value,
        modtools: true,
        summary: false,
        limit: Math.max(limit.value, count)
      })
      show.value = messages.value.length
    }
  }
})

const destroy = (oldid, nextid) => {
  console.log('destroy', oldid, nextid)
  nextAfterRemoved.value = nextid
}

</script>
