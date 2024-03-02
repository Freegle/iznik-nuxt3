<template>
  <div>
    <div v-for="(message, ix) in visibleMessages" :key="'messagelist-' + message.id" class="p-0 mt-2">
      <div :ref="'top' + message.id" />
      <ModMessage :message="message" :next="ix < visibleMessages.length - 1 ? visibleMessages[ix + 1].id : null" :next-after-removed="nextAfterRemoved"
        @destroy="destroy" />
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
const authStore = useAuthStore()
const messageStore = useMessageStore()
const miscStore = useMiscStore()
const groupStore = useGroupStore()


const props = defineProps({
  collection: {
    type: String,
    required: true,
  }
})

const groupid = ref(0)

// mixin/modMessagesPage
const context = ref(null)
// We fetch less stuff at once for MT.  This is because for slow devices and networks the time to fetch and
// render is significant, and each of these consumes a lot of screen space.  So by fetching and rendering less,
// we increase how fast it feels.
const distance = ref(1000)
const limit = ref(2)
const workType = ref('pending')
const show = ref(0)
const busy = ref(false)
const messageTerm = ref(null)
const memberTerm = ref(null)
const modalOpen = ref(false)
const scrollHeight = ref(null)
const scrollTop = ref(null)
const nextAfterRemoved = ref(null)

// mixin/modMessagesPage
const visibleMessages = computed(() => {
  return messages.value.slice(0, show.value)
})

// mixin/modMessagesPage
const work = computed(() => {
  // Count for the type of work we're interested in.
  const work = authStore.work
  const count = workType.value ? work[workType.value] : 0
  return count
})

// mixin/modMessagesPage
watch(groupid, () => {
  context.value = null
  show.value = 0
  messageStore.clear()
})

// mixin/modMessagesPage
// TODO: where is group defined?
/*watch(group, async (newValue, oldValue) => {
  // We have this watch because we may need to fetch a group that we have remembered.  The mounted()
  // call may happen before we have restored the persisted state, so we can't initiate the fetch there.
  if (oldValue === null || oldValue.id !== groupid.value) {
    await groupStore.fetch(groupid.value)
  }
})*/

// mixin/modMessagesPage
watch(work, async (newVal, oldVal) => {
  console.log('Work changed', newVal, oldVal, modalOpen.value)
  let doFetch = false

  if (modalOpen.value && Date.now() - modalOpen.value > 10 * 60 * 1000) {
    // We don't always seem to get the modal hidden event, so assume any modals open for a long time have actually
    // closed.
    modalOpen.value = null
  }

  if (!modalOpen.value) {
    if (newVal > oldVal) {
      // There's new stuff to fetch.
      console.log('Fetch')
      await messageStore.clearContext()
      doFetch = true
    } else {
      const visible = miscStore.visible
      console.log('Visible', visible)

      if (!visible) {
        // If we're not visible, then clear what we have in the store.  We don't want to do that under our own
        // feet, but if we do this then we will pick up changes from other people and avoid confusion.
        await messageStore.clear()
        doFetch = true
      }
    }

    if (doFetch) {
      console.log('Fetch')
      await messageStore.clearContext()
      context.value = null

      await messageStore.fetchMessages({
        groupid: groupid.value,
        collection: props.collection,
        modtools: true,
        summary: false,
        limit: Math.max(limit.value, newVal)
      })

      // Force them to show.
      let messages

      if (groupid.value) {
        messages = messageStore.getByGroup(groupid.value)
      } else {
        messages = messageStore.all
      }

      show.value = messages.length
    }
  }
})

// mixin/modMessagesPage
const messages = computed(() => {
  let messages

  if (groupid.value) {
    messages = messageStore.getByGroup(groupid.value)
  } else {
    messages = messageStore.all
  }
  // We need to sort as otherwise new messages may appear at the end.
  messages.sort((a, b) => {
    if (a.groups && b.groups) {
      return (
        new Date(b.groups[0].arrival).getTime() -
        new Date(a.groups[0].arrival).getTime()
      )
    } else {
      return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
    }
  })

  return messages
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

  if (work.value > 0) {
    await messageStore.fetchMessages({
      groupid: groupid.value,
      collection: props.collection,
      modtools: true,
      summary: false,
      limit: Math.max(limit.value, work.value)
    })
    show.value = messages.value.length
  }

})

const destroy = (oldid, nextid) => {
  console.log('destroy', oldid, nextid)
  nextAfterRemoved.value = nextid
}

</script>
