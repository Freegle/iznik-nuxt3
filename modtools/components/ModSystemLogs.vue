<template>
  <div class="system-logs">
    <!-- Search and Filters -->
    <ModSystemLogSearch
      :userid="localUserid"
      :groupid="localGroupid"
      :msgid="localMsgid"
      @search="fetchLogs"
      @refresh="fetchLogs"
      @clear-user="clearUserFilter"
      @clear-group="clearGroupFilter"
      @clear-msg="clearMsgFilter"
      @update:userid="updateUserid"
      @update:groupid="updateGroupid"
      @update:msgid="updateMsgid"
      @expand-all="expandAllNodes"
    />

    <!-- Error Message -->
    <b-alert
      v-if="error"
      variant="danger"
      show
      dismissible
      @dismissed="clearError"
    >
      {{ error }}
    </b-alert>

    <!-- Loading State -->
    <div v-if="loading && !hasLogs" class="text-center py-4">
      <b-spinner label="Loading logs..." />
      <p class="mt-2 text-muted">Loading logs...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && !hasLogs" class="empty-state text-center py-4">
      <v-icon icon="search" scale="2" class="text-muted mb-2" />
      <p class="text-muted mb-1">No logs found for the selected filters.</p>
      <p class="text-muted small mb-0">
        {{ emptyStateHint }}
      </p>
    </div>

    <!-- Log List -->
    <div v-else class="log-list">
      <!-- Header -->
      <div class="log-header">
        <div class="log-col log-col-toggle" />
        <div class="log-col log-col-time">Time</div>
        <div class="log-col log-col-source">Source</div>
        <div v-if="!isFilteringByUser" class="log-col log-col-user">User</div>
        <div class="log-col log-col-action">Action</div>
        <div class="log-col log-col-expand" />
      </div>

      <!-- Tree View -->
      <ModSystemLogTreeNode
        v-for="node in logsAsTree"
        :key="node.trace_id || node.log?.id"
        ref="treeNodes"
        :node="node"
        :hide-user-column="isFilteringByUser"
        @filter-trace="filterByTrace"
        @filter-session="filterBySession"
        @filter-ip="filterByIp"
      />

      <!-- Load More -->
      <infinite-loading :distance="distance" @infinite="loadMore">
        <template #complete>
          <div class="text-center text-muted small py-2">
            No more logs to load.
          </div>
        </template>
        <template #spinner>
          <div class="text-center py-2">
            <b-spinner small label="Loading more..." />
          </div>
        </template>
      </infinite-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useSystemLogsStore } from '../stores/systemlogs'
import { useGroupStore } from '~/stores/group'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  userid: {
    type: [Number, String],
    default: null,
  },
  groupid: {
    type: [Number, String],
    default: null,
  },
  msgid: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update:userid', 'update:groupid', 'update:msgid'])

const systemLogsStore = useSystemLogsStore()
const userStore = useUserStore()
const groupStore = useGroupStore()

const treeNodes = ref(null)
const distance = ref(1000)
const localUserid = ref(null)
const localGroupid = ref(null)
const localMsgid = ref(null)

const logsAsTree = computed(() => systemLogsStore.logsAsTree)
const loading = computed(() => systemLogsStore.loading)
const error = computed(() => systemLogsStore.error)
const hasMore = computed(() => systemLogsStore.hasMore)
const isFilteringByUser = computed(() => !!localUserid.value)
const hasLogs = computed(() => logsAsTree.value.length > 0)

const emptyStateHint = computed(() => {
  const filters = []
  if (localUserid.value) {
    filters.push(`user #${localUserid.value}`)
  }
  if (systemLogsStore.email) {
    filters.push(`email "${systemLogsStore.email}"`)
  }
  if (localGroupid.value) {
    filters.push(`group #${localGroupid.value}`)
  }
  if (localMsgid.value) {
    filters.push(`message #${localMsgid.value}`)
  }
  if (systemLogsStore.ipAddress) {
    filters.push(`IP ${systemLogsStore.ipAddress}`)
  }

  const timeRange = systemLogsStore.timeRange
  const timeLabels = {
    '1h': 'the last hour',
    '24h': 'the last 24 hours',
    '7d': 'the last 7 days',
    '30d': 'the last 30 days',
    '365d': 'the last year',
    ever: 'all time',
  }
  const timeLabel = timeLabels[timeRange] || timeRange

  if (filters.length > 0) {
    return `Searched for ${filters.join(', ')} in ${timeLabel}.`
  }
  return `No activity recorded in ${timeLabel}. Try expanding the time range.`
})

watch(
  () => props.userid,
  (val) => {
    localUserid.value = val
    systemLogsStore.setUserFilter(val)
  },
  { immediate: true }
)

watch(
  () => props.groupid,
  (val) => {
    localGroupid.value = val
    systemLogsStore.setGroupFilter(val)
  },
  { immediate: true }
)

watch(
  () => props.msgid,
  (val) => {
    localMsgid.value = val
    systemLogsStore.setMsgFilter(val)
  },
  { immediate: true }
)

onMounted(() => {
  const config = useRuntimeConfig()
  systemLogsStore.init(config)
  fetchLogs()
})

async function fetchLogs() {
  systemLogsStore.clear()
  await systemLogsStore.fetchSummaries()
  await batchFetchEntities()
}

async function batchFetchEntities() {
  const { userIds, groupIds } = systemLogsStore.entityIds

  // Batch fetch users that aren't already in the store
  const missingUserIds = userIds.filter((id) => !userStore.list[id])
  if (missingUserIds.length > 0) {
    // Fetch in batches of 20 to avoid overloading the API
    const BATCH_SIZE = 20
    for (let i = 0; i < missingUserIds.length; i += BATCH_SIZE) {
      const batch = missingUserIds.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map((id) => userStore.fetch(id).catch(() => null))
      )
    }
  }

  // Batch fetch groups that aren't already in the store
  const missingGroupIds = groupIds.filter((id) => !groupStore.get(id))
  if (missingGroupIds.length > 0) {
    const BATCH_SIZE = 20
    for (let i = 0; i < missingGroupIds.length; i += BATCH_SIZE) {
      const batch = missingGroupIds.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map((id) => groupStore.fetch(id).catch(() => null))
      )
    }
  }
}

async function loadMore($state) {
  if (!hasMore.value || loading.value) {
    $state.complete()
    return
  }

  const currentCount = systemLogsStore.summaries.length
  await systemLogsStore.fetchSummaries({
    append: true,
    end: systemLogsStore.lastTimestamp,
  })
  if (systemLogsStore.summaries.length === currentCount) {
    $state.complete()
  } else {
    await batchFetchEntities()
    $state.loaded()
  }
}

function expandAllNodes() {
  // Expand all tree nodes via refs.
  if (treeNodes.value) {
    const nodes = Array.isArray(treeNodes.value)
      ? treeNodes.value
      : [treeNodes.value]
    nodes.forEach((node) => {
      if (node.expand) {
        node.expand()
      }
    })
  }
}

function clearError() {
  systemLogsStore.error = null
}

function updateUserid(val) {
  localUserid.value = val
  systemLogsStore.setUserFilter(val)
  emit('update:userid', val)
}

function updateGroupid(val) {
  localGroupid.value = val
  systemLogsStore.setGroupFilter(val)
  emit('update:groupid', val)
}

function updateMsgid(val) {
  localMsgid.value = val
  systemLogsStore.setMsgFilter(val)
  emit('update:msgid', val)
}

function clearUserFilter() {
  localUserid.value = null
  systemLogsStore.setUserFilter(null)
  emit('update:userid', null)
  fetchLogs()
}

function clearGroupFilter() {
  localGroupid.value = null
  systemLogsStore.setGroupFilter(null)
  emit('update:groupid', null)
  fetchLogs()
}

function clearMsgFilter() {
  localMsgid.value = null
  systemLogsStore.setMsgFilter(null)
  emit('update:msgid', null)
  fetchLogs()
}

function filterByTrace(traceId) {
  systemLogsStore.setTraceFilter(traceId)
  fetchLogs()
}

function filterBySession(sessionId) {
  systemLogsStore.setSessionFilter(sessionId)
  fetchLogs()
}

function filterByIp(ip) {
  systemLogsStore.setIpFilter(ip)
  fetchLogs()
}
</script>

<style scoped>
.system-logs {
  font-size: 0.875rem;
}

.empty-state {
  background: #f8f9fa;
  padding: 40px 20px;
}

.log-list {
  border: 1px solid #e9ecef;
  background: #fff;
}

.log-header {
  display: flex;
  background: #f8f9fa;
  padding: 10px 12px;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  font-size: 0.75rem;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  position: sticky;
  top: 0;
  z-index: 10;
}

.log-col {
  padding: 0 4px;
}

.log-col-toggle {
  flex: 0 0 48px;
}

.log-col-time {
  flex: 0 0 200px;
}

.log-col-source {
  flex: 0 0 70px;
}

.log-col-user {
  flex: 0 0 180px;
}

.log-col-action {
  flex: 1;
  min-width: 0;
}

.log-col-expand {
  flex: 0 0 30px;
}

@media (max-width: 768px) {
  .log-header {
    display: none;
  }

  .log-col-time {
    flex: 0 0 140px;
  }

  .log-col-source {
    flex: 0 0 70px;
  }

  .log-col-user {
    flex: 0 0 80px;
  }
}
</style>
