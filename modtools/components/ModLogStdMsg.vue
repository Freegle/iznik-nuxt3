<template>
  <span v-if="log?.stdmsg">
    using <em>{{ log.stdmsg.title }} </em>
  </span>
</template>
<script setup>
defineProps({
  log: {
    type: Object,
    required: false,
    default: null,
  },
})
</script>
