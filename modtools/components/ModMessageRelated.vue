<template>
  <div class="text-success small">
    Related to <v-icon icon="hashtag" class="text-muted" scale="0.5" />{{
      message.id
    }}
    <em>{{ message.subject }}</em>
    {{ timeago(message.arrival) }}
  </div>
</template>
<script setup>
defineProps({
  message: {
    type: Object,
    required: true,
  },
})
</script>
