<template>
  <b-modal
    ref="modal"
    scrollable
    title="Debug Logs"
    size="xl"
    fullscreen="md-down"
    @hidden="emit('hidden')"
  >
    <template #default>
      <div class="d-flex justify-content-between mb-2">
        <span class="text-muted">{{ logCount }} log entries</span>
        <div>
          <b-button variant="primary" size="sm" class="mr-2" @click="copyLogs">
            <v-icon icon="copy" /> Copy
          </b-button>
          <b-button variant="danger" size="sm" @click="clearLogs">
            <v-icon icon="trash" /> Clear
          </b-button>
        </div>
      </div>
      <div class="log-container">
        <div v-if="logs.length === 0" class="text-muted text-center py-4">
          No logs yet
        </div>
        <div
          v-for="(log, index) in reversedLogs"
          :key="index"
          class="log-entry"
          :class="'log-' + log.level.toLowerCase()"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">[{{ log.level }}]</span>
          <pre class="log-message">{{ log.message }}</pre>
        </div>
      </div>
    </template>
    <template #footer>
      <b-button variant="primary" @click="hide">Close</b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useOurModal } from '~/composables/useOurModal'
import { useDebugStore } from '~/stores/debug'

const emit = defineEmits(['hidden'])

const debugStore = useDebugStore()

const { modal, show, hide } = useOurModal()

const logs = computed(() => debugStore.logs)
const logCount = computed(() => logs.value.length)
const reversedLogs = computed(() => [...logs.value].reverse())

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  })
}

function clearLogs() {
  debugStore.clear()
}

async function copyLogs() {
  const text = debugStore.getLogsAsText
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    console.error('Failed to copy logs:', e)
  }
}

onMounted(() => {
  show()
})
</script>

<style scoped lang="scss">
.log-container {
  max-height: 60vh;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 8px;
  border-radius: 4px;
}

.log-entry {
  padding: 2px 0;
  border-bottom: 1px solid #333;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.log-time {
  color: #888;
  flex-shrink: 0;
}

.log-level {
  font-weight: bold;
  flex-shrink: 0;
  min-width: 50px;
}

.log-message {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  flex: 1;
  min-width: 0;
}

.log-error .log-level {
  color: #f44336;
}

.log-warn .log-level {
  color: #ff9800;
}

.log-info .log-level {
  color: #2196f3;
}

.log-debug .log-level {
  color: #4caf50;
}
</style>
