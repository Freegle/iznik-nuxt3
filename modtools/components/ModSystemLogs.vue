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

<script>
import { useSystemLogsStore } from '../stores/systemlogs'
import ModSystemLogSearch from './ModSystemLogSearch.vue'
import ModSystemLogTreeNode from './ModSystemLogTreeNode.vue'
import { useGroupStore } from '~/stores/group'
import { useUserStore } from '~/stores/user'

export default {
  components: {
    ModSystemLogSearch,
    ModSystemLogTreeNode,
  },
  props: {
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
  },
  emits: ['update:userid', 'update:groupid', 'update:msgid'],
  setup() {
    const systemLogsStore = useSystemLogsStore()
    const userStore = useUserStore()
    const groupStore = useGroupStore()
    return { systemLogsStore, userStore, groupStore }
  },
  data() {
    return {
      distance: 1000,
      localUserid: null,
      localGroupid: null,
      localMsgid: null,
    }
  },
  computed: {
    logsAsTree() {
      return this.systemLogsStore.logsAsTree
    },
    loading() {
      return this.systemLogsStore.loading
    },
    error() {
      return this.systemLogsStore.error
    },
    hasMore() {
      return this.systemLogsStore.hasMore
    },
    isFilteringByUser() {
      return !!this.localUserid
    },
    hasLogs() {
      return this.logsAsTree.length > 0
    },
    emptyStateHint() {
      const filters = []
      if (this.localUserid) {
        filters.push(`user #${this.localUserid}`)
      }
      if (this.systemLogsStore.email) {
        filters.push(`email "${this.systemLogsStore.email}"`)
      }
      if (this.localGroupid) {
        filters.push(`group #${this.localGroupid}`)
      }
      if (this.localMsgid) {
        filters.push(`message #${this.localMsgid}`)
      }
      if (this.systemLogsStore.ipAddress) {
        filters.push(`IP ${this.systemLogsStore.ipAddress}`)
      }

      const timeRange = this.systemLogsStore.timeRange
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
    },
  },
  watch: {
    userid: {
      immediate: true,
      handler(val) {
        this.localUserid = val
        this.systemLogsStore.setUserFilter(val)
      },
    },
    groupid: {
      immediate: true,
      handler(val) {
        this.localGroupid = val
        this.systemLogsStore.setGroupFilter(val)
      },
    },
    msgid: {
      immediate: true,
      handler(val) {
        this.localMsgid = val
        this.systemLogsStore.setMsgFilter(val)
      },
    },
  },
  mounted() {
    const config = useRuntimeConfig()
    this.systemLogsStore.init(config)
    this.fetchLogs()
  },
  methods: {
    async fetchLogs() {
      this.systemLogsStore.clear()
      await this.systemLogsStore.fetchSummaries()
      await this.batchFetchEntities()
    },
    async batchFetchEntities() {
      const { userIds, groupIds } = this.systemLogsStore.entityIds

      // Batch fetch users that aren't already in the store
      const missingUserIds = userIds.filter((id) => !this.userStore.list[id])
      if (missingUserIds.length > 0) {
        // Fetch in batches of 20 to avoid overloading the API
        const BATCH_SIZE = 20
        for (let i = 0; i < missingUserIds.length; i += BATCH_SIZE) {
          const batch = missingUserIds.slice(i, i + BATCH_SIZE)
          await Promise.all(
            batch.map((id) => this.userStore.fetch(id).catch(() => null))
          )
        }
      }

      // Batch fetch groups that aren't already in the store
      const missingGroupIds = groupIds.filter((id) => !this.groupStore.list[id])
      if (missingGroupIds.length > 0) {
        const BATCH_SIZE = 20
        for (let i = 0; i < missingGroupIds.length; i += BATCH_SIZE) {
          const batch = missingGroupIds.slice(i, i + BATCH_SIZE)
          await Promise.all(
            batch.map((id) => this.groupStore.fetch(id).catch(() => null))
          )
        }
      }
    },
    async loadMore($state) {
      if (!this.hasMore || this.loading) {
        $state.complete()
        return
      }

      const currentCount = this.systemLogsStore.summaries.length
      await this.systemLogsStore.fetchSummaries({
        append: true,
        end: this.systemLogsStore.lastTimestamp,
      })
      if (this.systemLogsStore.summaries.length === currentCount) {
        $state.complete()
      } else {
        await this.batchFetchEntities()
        $state.loaded()
      }
    },
    expandAllNodes() {
      // Expand all tree nodes via refs.
      if (this.$refs.treeNodes) {
        const nodes = Array.isArray(this.$refs.treeNodes)
          ? this.$refs.treeNodes
          : [this.$refs.treeNodes]
        nodes.forEach((node) => {
          if (node.expand) {
            node.expand()
          }
        })
      }
    },
    clearError() {
      this.systemLogsStore.error = null
    },
    updateUserid(val) {
      this.localUserid = val
      this.systemLogsStore.setUserFilter(val)
      this.$emit('update:userid', val)
    },
    updateGroupid(val) {
      this.localGroupid = val
      this.systemLogsStore.setGroupFilter(val)
      this.$emit('update:groupid', val)
    },
    updateMsgid(val) {
      this.localMsgid = val
      this.systemLogsStore.setMsgFilter(val)
      this.$emit('update:msgid', val)
    },
    clearUserFilter() {
      this.localUserid = null
      this.systemLogsStore.setUserFilter(null)
      this.$emit('update:userid', null)
      this.fetchLogs()
    },
    clearGroupFilter() {
      this.localGroupid = null
      this.systemLogsStore.setGroupFilter(null)
      this.$emit('update:groupid', null)
      this.fetchLogs()
    },
    clearMsgFilter() {
      this.localMsgid = null
      this.systemLogsStore.setMsgFilter(null)
      this.$emit('update:msgid', null)
      this.fetchLogs()
    },
    filterByTrace(traceId) {
      this.systemLogsStore.setTraceFilter(traceId)
      this.fetchLogs()
    },
    filterBySession(sessionId) {
      this.systemLogsStore.setSessionFilter(sessionId)
      this.fetchLogs()
    },
    filterByIp(ip) {
      this.systemLogsStore.setIpFilter(ip)
      this.fetchLogs()
    },
  },
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
