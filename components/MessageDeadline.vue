<template>
  <div v-if="message?.deadline">
    <b-badge v-b-tooltip="deadlineText" variant="info"
      ><v-icon icon="info-circle" /> Deadline
      <DateFormatted :value="message.deadline" format="dateonlyNoYear"
    /></b-badge>
  </div>
</template>
<script setup>
import { useMessageStore } from '~/stores/message'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const messageStore = useMessageStore()
const message = computed(() => messageStore.byId(props.id))

const deadlineText = computed(() => {
  return message.value?.type === 'Offer'
    ? 'Only available until this date.'
    : 'Only needed before this date'
})
</script>
