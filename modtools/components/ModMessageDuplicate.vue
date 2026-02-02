<template>
  <div class="text-danger small">
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
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const groupid = computed(() => {
  let ret = 0

  if (props.message && props.message.groups && props.message.groups.length) {
    ret = props.message.groups[0].groupid
  }
  return ret
})

const isPending = computed(() => {
  return (
    props.message.collection === 'Pending' ||
    props.message.collection === 'PendingOther'
  )
})

const duplicateLink = computed(() => {
  if (isPending.value) {
    // Link to pending messages page with group and message to highlight.
    return (
      '/messages/pending?groupid=' +
      groupid.value +
      '&msgid=' +
      props.message.id
    )
  }
  // Link to approved messages with search term for approved duplicates.
  return '/messages/approved/' + groupid.value + '/' + props.message.id
})
</script>
