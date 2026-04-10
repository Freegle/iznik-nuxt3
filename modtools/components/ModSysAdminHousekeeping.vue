<template>
  <div>
    <h3>Housekeeping Tasks</h3>
    <p class="text-muted">
      Browser-automated tasks managed by the Freegle Housekeeper extension.
    </p>

    <div v-if="loading" class="text-center py-3">
      <b-spinner />
    </div>
    <div v-else-if="error" class="text-danger">Failed to load: {{ error }}</div>
    <div v-else-if="tasks.length === 0" class="text-muted">
      No housekeeping tasks registered yet. Install and run the Housekeeper
      extension.
    </div>
    <div v-else>
      <b-table-simple hover responsive>
        <b-thead>
          <b-tr>
            <b-th>Task</b-th>
            <b-th>Status</b-th>
            <b-th>Last Run</b-th>
            <b-th>Schedule</b-th>
            <b-th>Summary</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr
            v-for="task in tasks"
            :key="task.task_key"
            :class="rowClass(task)"
            class="clickable"
            @click="toggleLog(task.task_key)"
          >
            <b-td>
              <strong>{{ task.name }}</strong>
              <div v-if="task.description" class="text-muted small">
                {{ task.description }}
              </div>
              <b-badge v-if="task.placeholder" variant="secondary" class="ms-1">
                Placeholder
              </b-badge>
            </b-td>
            <b-td>
              <b-badge :variant="statusVariant(task)">
                {{ statusText(task) }}
              </b-badge>
            </b-td>
            <b-td>
              <span v-if="task.last_run_at">
                {{ formatDate(task.last_run_at) }}
              </span>
              <span v-else class="text-muted">Never</span>
            </b-td>
            <b-td>
              {{ formatInterval(task.interval_hours) }}
            </b-td>
            <b-td>
              <span v-if="task.last_summary">{{ task.last_summary }}</span>
              <span v-else class="text-muted">-</span>
            </b-td>
          </b-tr>
          <b-tr
            v-if="
              expandedLog ===
              tasks.find((t) => showingLog === t.task_key)?.task_key
            "
          >
            <b-td colspan="5">
              <div class="log-panel">
                <h6>Task Log</h6>
                <pre v-if="expandedLogContent" class="log-content">{{
                  expandedLogContent
                }}</pre>
                <span v-else class="text-muted">No log available</span>
              </div>
            </b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
    </div>
  </div>
</template>

<script setup>
import api from '~/api'

const runtimeConfig = useRuntimeConfig()
const apiInstance = api(runtimeConfig)

const loading = ref(true)
const error = ref(null)
const tasks = ref([])
const showingLog = ref(null)
const expandedLog = ref(null)
const expandedLogContent = ref(null)

async function fetchTasks() {
  loading.value = true
  error.value = null

  try {
    const result = await apiInstance.housekeeper.fetchTasks()
    tasks.value = result || []
  } catch (e) {
    error.value = e.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}

function toggleLog(taskKey) {
  if (showingLog.value === taskKey) {
    showingLog.value = null
    expandedLog.value = null
    expandedLogContent.value = null
  } else {
    const task = tasks.value.find((t) => t.task_key === taskKey)
    showingLog.value = taskKey
    expandedLog.value = taskKey
    expandedLogContent.value = task?.last_log || null
  }
}

function statusVariant(task) {
  if (!task.enabled) return 'secondary'
  if (task.placeholder) return 'secondary'
  if (task.last_status === 'failure') return 'danger'
  if (task.overdue) return 'warning'
  if (task.last_status === 'success') return 'success'
  return 'secondary'
}

function statusText(task) {
  if (!task.enabled) return 'Disabled'
  if (task.placeholder) return 'Placeholder'
  if (!task.last_status) return 'Not run yet'
  if (task.last_status === 'failure') return 'Failed'
  if (task.overdue) return 'Overdue'
  return 'OK'
}

function rowClass(task) {
  if (task.last_status === 'failure') return 'table-danger'
  if (task.overdue && task.enabled && !task.placeholder) return 'table-warning'
  return ''
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatInterval(hours) {
  if (!hours) return '-'
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days === 7) return 'Weekly'
  if (days === 30) return 'Monthly'
  return `${days}d`
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
.log-panel {
  padding: 8px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
.log-content {
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style>
