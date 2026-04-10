<template>
  <div>
    <p class="text-muted">
      These are tasks that have to be done regularly but can't easily be
      automated on the server. Most are automated by a
      <a
        href="https://github.com/nicholasgasior/freegle-housekeeper"
        target="_blank"
      >
        Chrome extension
      </a>
      running in the browser of a geek. Manual tasks need to be done by hand.
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
            <b-th class="status-col" />
            <b-th>Task</b-th>
            <b-th>Schedule</b-th>
            <b-th>Last Run</b-th>
            <b-th>Next Due</b-th>
            <b-th>Summary</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <template v-for="task in tasks" :key="task.task_key">
            <b-tr
              :class="rowClass(task)"
              class="task-row"
              @click="toggleLog(task.task_key)"
            >
              <b-td class="status-col text-center">
                <span
                  v-if="!task.enabled || task.placeholder"
                  class="text-muted fs-5"
                  >&#8211;</span
                >
                <span v-else-if="isOk(task)" class="text-success fs-5"
                  >&#10003;</span
                >
                <span v-else class="text-danger fs-5">&#10007;</span>
              </b-td>
              <b-td>
                <strong>{{ task.name }}</strong>
                <div v-if="task.description" class="text-muted small">
                  {{ task.description }}
                </div>
                <b-badge v-if="task.placeholder" variant="info" class="ms-1">
                  Manual
                </b-badge>
              </b-td>
              <b-td>
                {{ formatInterval(task.interval_hours) }}
              </b-td>
              <b-td>
                <span v-if="task.last_run_at">
                  {{ timeago(task.last_run_at, true) }}
                </span>
                <span v-else class="text-muted">Never</span>
              </b-td>
              <b-td>
                <span
                  v-if="
                    (task.last_run_at || task.start_date) && task.interval_hours
                  "
                  :class="{ 'text-danger fw-bold': task.overdue }"
                >
                  {{ nextDue(task) }}
                </span>
                <span v-else class="text-muted">-</span>
              </b-td>
              <b-td>
                <span v-if="task.last_summary">{{ task.last_summary }}</span>
                <span v-else class="text-muted">-</span>
                <b-button
                  v-if="task.placeholder"
                  size="sm"
                  variant="outline-success"
                  class="ms-2"
                  :disabled="completing === task.task_key"
                  @click.stop="markDone(task.task_key)"
                >
                  <span v-if="completing === task.task_key">...</span>
                  <span v-else>Mark Done</span>
                </b-button>
              </b-td>
            </b-tr>
            <b-tr
              v-if="expandedLog === task.task_key"
              :key="task.task_key + '-log'"
            >
              <b-td colspan="6">
                <div class="log-panel">
                  <h6>Task Log</h6>
                  <pre v-if="expandedLogContent" class="log-content">{{
                    expandedLogContent
                  }}</pre>
                  <span v-else class="text-muted">No log available</span>
                </div>
              </b-td>
            </b-tr>
          </template>
        </b-tbody>
      </b-table-simple>
    </div>
  </div>
</template>

<script setup>
import api from '~/api'
import { timeago } from '~/composables/useTimeFormat'

const runtimeConfig = useRuntimeConfig()
const apiInstance = api(runtimeConfig)

const loading = ref(true)
const error = ref(null)
const tasks = ref([])
const expandedLog = ref(null)
const expandedLogContent = ref(null)
const completing = ref(null)

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
  if (expandedLog.value === taskKey) {
    expandedLog.value = null
    expandedLogContent.value = null
  } else {
    const task = tasks.value.find((t) => t.task_key === taskKey)
    expandedLog.value = taskKey
    expandedLogContent.value = task?.last_log || null
  }
}

function isOk(task) {
  if (!task.enabled || task.placeholder) return true
  if (task.last_status === 'failure') return false
  if (task.overdue) return false
  return true
}

function rowClass(task) {
  if (!task.enabled || task.placeholder) return 'text-muted'
  if (task.last_status === 'failure') return 'table-danger'
  if (task.overdue) return 'table-warning'
  return ''
}

function nextDue(task) {
  if (!task.interval_hours) return '-'

  let deadline

  if (task.last_run_at) {
    const lastRun = new Date(task.last_run_at)
    deadline = new Date(lastRun.getTime() + task.interval_hours * 3600000)
  } else if (task.start_date) {
    deadline = new Date(task.start_date)
  } else {
    return '-'
  }

  const now = new Date()

  if (now > deadline) {
    return 'overdue'
  }

  return timeago(deadline)
}

async function markDone(taskKey) {
  completing.value = taskKey
  try {
    await apiInstance.housekeeper.completeTask(taskKey)
    await fetchTasks()
  } catch (e) {
    console.error('Failed to mark task done:', e)
  } finally {
    completing.value = null
  }
}

function formatInterval(hours) {
  if (!hours) return '-'
  if (hours < 24) return `Every ${hours}h`
  const days = Math.round(hours / 24)
  if (days === 7) return 'Weekly'
  if (days === 30) return 'Monthly'
  return `Every ${days}d`
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.status-col {
  width: 30px;
  padding-left: 4px;
  padding-right: 4px;
}
.task-row {
  cursor: pointer;
}
.task-row:hover {
  background-color: #e9ecef !important;
}
.task-row.table-danger:hover {
  background-color: #f1c0c0 !important;
}
.task-row.table-warning:hover {
  background-color: #f5e0a0 !important;
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
