<template>
  <div>
    <p class="text-muted">
      These jobs run automatically on the server on a schedule.
    </p>

    <div v-if="loading" class="text-center py-3">
      <b-spinner />
    </div>
    <div v-else-if="error" class="text-danger">Failed to load: {{ error }}</div>
    <div v-else>
      <b-table-simple hover responsive small>
        <b-thead>
          <b-tr>
            <b-th class="status-col" />
            <b-th>Job</b-th>
            <b-th>Description</b-th>
            <b-th>Schedule</b-th>
            <b-th>Last Run</b-th>
            <b-th>Next Due</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <template v-for="(jobs, category) in groupedJobs" :key="category">
            <b-tr class="category-row">
              <b-td colspan="6">
                <strong class="category-label">{{ category }}</strong>
              </b-td>
            </b-tr>
            <template v-for="job in jobs" :key="job.command">
              <b-tr
                :class="rowClass(job)"
                class="job-row"
                @click="toggleLog(job.command)"
              >
                <b-td class="status-col text-center">
                  <span v-if="isOk(job)" class="text-success fs-5"
                    >&#10003;</span
                  >
                  <span v-else class="text-danger fs-5">&#10007;</span>
                </b-td>
                <b-td>
                  <code>{{ job.command }}</code>
                </b-td>
                <b-td>{{ job.description }}</b-td>
                <b-td>
                  <span class="text-nowrap">{{ job.schedule }}</span>
                </b-td>
                <b-td>
                  <span v-if="job.last_run_at" class="text-nowrap">
                    {{ timeago(job.last_run_at, true) }}
                  </span>
                  <span v-else class="text-muted">Never</span>
                </b-td>
                <b-td>
                  <span
                    v-if="job.last_run_at && job.interval_minutes"
                    class="text-nowrap"
                    :class="{ 'text-danger fw-bold': isOverdue(job) }"
                  >
                    {{ nextDue(job) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </b-td>
              </b-tr>
              <b-tr
                v-if="expandedCommand === job.command"
                :key="job.command + '-log'"
              >
                <b-td colspan="6">
                  <div class="log-panel">
                    <h6>Output Log</h6>
                    <pre v-if="expandedOutput" class="log-content">{{
                      expandedOutput
                    }}</pre>
                    <span v-else class="text-muted">
                      No output captured yet.
                    </span>
                  </div>
                </b-td>
              </b-tr>
            </template>
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
const cronJobs = ref([])
const expandedCommand = ref(null)
const expandedOutput = ref(null)

const groupedJobs = computed(() => {
  const groups = {}
  for (const job of cronJobs.value) {
    const cat = job.category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(job)
  }
  return groups
})

function toggleLog(command) {
  if (expandedCommand.value === command) {
    expandedCommand.value = null
    expandedOutput.value = null
  } else {
    const job = cronJobs.value.find((j) => j.command === command)
    expandedCommand.value = command
    expandedOutput.value = job?.last_output || null
  }
}

function isOk(job) {
  if (!job.active) return true
  if (job.last_exit_code !== null && job.last_exit_code !== 0) return false
  if (!job.last_run_at) return false
  if (isOverdue(job)) return false
  return true
}

function isOverdue(job) {
  if (!job.last_run_at || !job.interval_minutes) return false
  const lastRun = new Date(job.last_run_at)
  const deadline = new Date(lastRun.getTime() + job.interval_minutes * 60000)
  return new Date() > deadline
}

function rowClass(job) {
  if (job.last_exit_code !== null && job.last_exit_code !== 0)
    return 'table-danger'
  return ''
}

function nextDue(job) {
  if (!job.last_run_at || !job.interval_minutes) return '-'
  const lastRun = new Date(job.last_run_at)
  const deadline = new Date(lastRun.getTime() + job.interval_minutes * 60000)
  const now = new Date()

  if (now > deadline) {
    return 'overdue'
  }

  // For very short intervals, show minutes remaining instead of vague "a few seconds"
  const remainMs = deadline - now
  const remainMins = Math.ceil(remainMs / 60000)
  if (remainMins <= 5) {
    return remainMins <= 1 ? '~1m' : `~${remainMins}m`
  }

  return timeago(deadline)
}

async function fetchCronJobs() {
  loading.value = true
  error.value = null

  try {
    const result = await apiInstance.housekeeper.fetchCronJobs()
    cronJobs.value = result || []
  } catch (e) {
    error.value = e.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCronJobs()
})
</script>

<style scoped>
.category-row {
  background-color: #f8f9fa;
}
.category-label {
  color: #2e7d32;
}
.status-col {
  width: 30px;
  padding-left: 4px;
  padding-right: 4px;
}
.job-row {
  cursor: pointer;
}
.job-row:hover {
  background-color: #e9ecef !important;
}
.job-row.table-danger:hover {
  background-color: #f1c0c0 !important;
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
