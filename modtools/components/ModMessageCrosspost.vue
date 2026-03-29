<template>
  <div v-if="message" class="small">
    <span class="text-danger">
      Crosspost
      <v-icon icon="hashtag" class="text-muted" scale="0.5" />
      {{ message.id }}
      <nuxt-link :to="'/message/' + message.id">
        <em>{{ message.subject }}</em>
        {{ timeago(message.arrival) }} on <em>{{ groupname }}</em>
      </nuxt-link> </span
    ><span v-if="collection && collection != 'Approved'"
      ><span class="text-muted"> in</span>
      <span class="text-danger">{{ collection }}</span></span
    ><span v-else-if="latestOutcome">, now {{ latestOutcome }}</span
    ><span v-else class="text-normal">, still open</span>
  </div>
</template>
<script setup>
import { computed, onMounted, watch } from 'vue'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'

const props = defineProps({
  messageid: {
    type: Number,
    required: true,
  },
})

const messageStore = useMessageStore()
const groupStore = useGroupStore()

const message = computed(() => {
  return messageStore.byId(props.messageid)
})

const latestOutcome = computed(() => {
  if (!message.value) return null
  if (message.value.outcome) return message.value.outcome
  if (message.value.outcomes?.length) return message.value.outcomes[0].outcome
  return null
})

const messageGroupId = computed(() => {
  if (!message.value) return null
  // Individual message fetch returns groups array, not top-level groupid
  if (message.value.groups?.length) return message.value.groups[0].groupid
  return message.value.groupid || null
})

watch(
  () => messageGroupId.value,
  (groupid) => {
    if (groupid) {
      const g = groupStore.get(groupid)

      if (!g) {
        groupStore.fetch(groupid)
      }
    }
  },
  { immediate: true }
)

const group = computed(() => {
  return messageGroupId.value ? groupStore.get(messageGroupId.value) : null
})

const groupname = computed(() => {
  return group.value ? group.value.namedisplay : null
})

const collection = computed(() => {
  if (!message.value) return null
  if (message.value.groups?.length) return message.value.groups[0].collection
  return message.value.collection || null
})

onMounted(() => {
  if (!message.value) {
    messageStore.fetch(props.messageid)
  }
})
</script>
