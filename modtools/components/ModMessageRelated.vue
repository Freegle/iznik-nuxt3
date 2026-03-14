<template>
  <div v-if="message" class="text-success small">
    Related to <v-icon icon="hashtag" class="text-muted" scale="0.5" />{{
      message.id
    }}
    <em>{{ message.subject }}</em>
    {{ timeago(message.arrival) }}
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'
import { useMessageStore } from '~/stores/message'

const props = defineProps({
  messageid: {
    type: Number,
    required: true,
  },
})

const messageStore = useMessageStore()
const message = computed(() => messageStore.byId(props.messageid))

watch(
  () => props.messageid,
  (id) => {
    if (id && !messageStore.byId(id)) messageStore.fetch(id)
  },
  { immediate: true }
)
</script>
