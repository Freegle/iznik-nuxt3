<template>
  <div v-if="message" class="text-danger small">
    Duplicate of
    <v-icon icon="hashtag" class="text-muted" scale="0.5" /><nuxt-link
      :to="duplicateLink"
    >
      {{ message.id }}
    </nuxt-link>
    -
    <em>{{ message.subject }}</em>
    {{ timeago(message.arrival) }}
    <span v-if="message.outcome">, now {{ message.outcome }}</span
    ><span v-else>, still open</span>
    <span v-if="isPending" class="text-muted"> (pending)</span>
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'
import { useMessageStore } from '~/stores/message'

const messageStore = useMessageStore()

const props = defineProps({
  messageid: {
    type: Number,
    required: true,
  },
})

const message = computed(() => {
  if (props.messageid) {
    return messageStore.byId(props.messageid) || null
  }
  return null
})

watch(
  () => props.messageid,
  async (newVal) => {
    if (newVal) {
      await messageStore.fetch(newVal)
    }
  },
  { immediate: true }
)

const groupid = computed(() => {
  let ret = 0

  if (message.value && message.value.groups && message.value.groups.length) {
    ret = message.value.groups[0].groupid
  }
  return ret
})

const isPending = computed(() => {
  return (
    message.value?.collection === 'Pending' ||
    message.value?.collection === 'PendingOther'
  )
})

const duplicateLink = computed(() => {
  if (isPending.value) {
    // Link to pending messages page with group and message to highlight.
    return (
      '/messages/pending?groupid=' +
      groupid.value +
      '&msgid=' +
      message.value.id
    )
  }
  // Link to approved messages with search term for approved duplicates.
  return '/messages/approved/' + groupid.value + '/' + message.value.id
})
</script>
