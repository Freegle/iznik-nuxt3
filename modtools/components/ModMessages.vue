<template>
  <div>
    <div v-for="(message, ix) in visibleMessages" :key="'messagelist-' + message.id" class="p-0 mt-2">
      <div :ref="'top' + message.id" />
      <ModMessage :message="message" :next="ix < visibleMessages.length - 1 ? visibleMessages[ix + 1].id : null" :next-after-removed="nextAfterRemoved"
        @destroy="destroy" />
      <div :ref="'bottom' + message.id" />
    </div>
  </div>
</template>
<script setup>
import { useMessageStore } from '../../stores/message'
const messageStore = useMessageStore()

const groupid = ref(0)

const context = ref(null)
// We fetch less stuff at once for MT.  This is because for slow devices and networks the time to fetch and
// render is significant, and each of these consumes a lot of screen space.  So by fetching and rendering less,
// we increase how fast it feels.
const distance = ref(1000)
const limit = ref(2)
const workType = ref(null)
const show = ref(0)
const busy = ref(false)
const messageTerm = ref(null)
const memberTerm = ref(null)
const modalOpen = ref(false)
const scrollHeight = ref(null)
const scrollTop = ref(null)
const nextAfterRemoved = ref(null)

const visibleMessages = computed(() => {
  console.log('visibleMessages')
  const ms = messages.value
  return []
  //return messages.slice(0, show.value)
})

/*getByGroup: state => groupid => {
    const ret = state.list.filter(message => {
      return (
        message.groups.length > 0 &&
        parseInt(message.groups[0].groupid) === parseInt(groupid)
      )
    })

    return ret
  },
*/

const messages = computed(() => {
  console.log('messages', messageStore.all)
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


</script>
