<template>
  <span v-if="log?.stdmsg">
    using <em>{{ log.stdmsg.title }} </em>
  </span>
</template>
<script setup>
import { computed } from 'vue'
import { useLogsStore } from '~/stores/logs'

const props = defineProps({
  logid: {
    type: Number,
    required: true,
  },
})

const logsStore = useLogsStore()

const log = computed(() => logsStore.byId(props.logid))
</script>
