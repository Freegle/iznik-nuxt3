<template>
  <div v-if="message" class="small">
    <span class="text-danger">
      Crosspost
      <v-icon icon="hashtag" class="text-muted" scale="0.5" />
      {{ message.id }}
      <nuxt-link :to="'/message/' + message.id">
        <em>{{ message.subject }}</em>
        {{ timeago(message.arrival) }} on <em>{{ groupname }}</em>
      </nuxt-link>
    </span>
    <span v-if="message.collection != 'Approved'">
      <span class="text-muted">in</span>
      <span class="text-danger">
        {{ message.collection }}
      </span>
    </span>
    <span v-else-if="message.outcome">, now {{ message.outcome }}</span
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

watch(
  () => message.value?.groupid,
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
  return message.value ? groupStore.get(message.value.groupid) : null
})

const groupname = computed(() => {
  return group.value ? group.value.namedisplay : null
})

onMounted(() => {
  if (!message.value) {
    messageStore.fetch(props.messageid)
  }
})
</script>
