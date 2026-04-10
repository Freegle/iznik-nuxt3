<template>
  <div>
    <h3>Scheduled Jobs</h3>
    <p class="text-muted">Laravel batch jobs that run on a schedule.</p>

    <div v-if="loading" class="text-center py-3">
      <b-spinner />
    </div>
    <div v-else-if="error" class="text-danger">Failed to load: {{ error }}</div>
    <div v-else>
      <b-table-simple hover responsive small>
        <b-thead>
          <b-tr>
            <b-th>Job</b-th>
            <b-th>Description</b-th>
            <b-th>Schedule</b-th>
            <b-th>Last Run</b-th>
            <b-th>Status</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <template v-for="(jobs, category) in groupedJobs" :key="category">
            <b-tr class="category-row">
              <b-td colspan="5">
                <strong class="category-label">{{ category }}</strong>
              </b-td>
            </b-tr>
            <b-tr
              v-for="job in jobs"
              :key="job.command"
              :class="rowClass(job)"
              class="clickable"
              @click="toggleLog(job.command)"
            >
              <b-td>
                <code>{{ job.command }}</code>
              </b-td>
              <b-td>{{ job.description }}</b-td>
              <b-td>
                <span class="text-nowrap">{{ job.schedule }}</span>
              </b-td>
              <b-td>
                <span v-if="job.last_run_at" class="text-nowrap">
                  {{ formatDate(job.last_run_at) }}
                </span>
                <span v-else class="text-muted">Never</span>
              </b-td>
              <b-td>
                <b-badge :variant="statusVariant(job)">
                  {{ statusText(job) }}
                </b-badge>
              </b-td>
            </b-tr>
            <b-tr
              v-if="
                expandedCommand &&
                jobs.some((j) => j.command === expandedCommand)
              "
              :key="category + '-log'"
            >
              <b-td colspan="5">
                <div class="log-panel">
                  <h6>Output Log</h6>
                  <pre v-if="expandedOutput" class="log-content">{{
                    expandedOutput
                  }}</pre>
                  <span v-else class="text-muted">
                    No output captured. Background commands write to /dev/null
                    by default.
                  </span>
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

function statusVariant(job) {
  if (!job.active) return 'secondary'
  if (job.last_exit_code !== null && job.last_exit_code !== 0) return 'danger'
  if (job.last_run_at) return 'success'
  return 'secondary'
}

function statusText(job) {
  if (!job.active) return 'Disabled'
  if (job.last_exit_code !== null && job.last_exit_code !== 0) return 'Failed'
  if (job.last_run_at) return 'Active'
  return 'Not run yet'
}

function rowClass(job) {
  if (job.last_exit_code !== null && job.last_exit_code !== 0)
    return 'table-danger'
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
