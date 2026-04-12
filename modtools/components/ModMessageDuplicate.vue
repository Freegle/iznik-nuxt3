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
    {{ timeago(message.arrival)
    }}<span v-if="latestOutcome">, now {{ latestOutcome }}</span
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

const latestOutcome = computed(() => {
  if (!message.value) return null
  // Check singular outcome (from messagehistory) or outcomes array (from message store).
  if (message.value.outcome) return message.value.outcome
  if (message.value.outcomes?.length) return message.value.outcomes[0].outcome
  return null
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
  const page = isPending.value ? 'pending' : 'approved'
  return '/messages/' + page + '/' + groupid.value + '/' + message.value.id
})
</script>
