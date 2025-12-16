import { defineStore } from 'pinia'
import { prefetchSwaggerDocs } from '../composables/useSystemLogFormatter'
import api from '~/api'

export const useSystemLogsStore = defineStore({
  id: 'systemlogs',
  state: () => ({
    list: [], // Used for flat view
    loading: false,
    error: null,

    // Lazy loading for tree view
    summaries: [], // TraceSummary objects from summary mode
    traceChildren: {}, // Map of trace_id → logs (loaded on demand)
    loadingTraces: {}, // Map of trace_id → boolean (loading state)

    // Filters
    sources: ['client', 'api', 'logs_table', 'email', 'batch'],
    types: [],
    subtypes: [],
    levels: [],
    search: '',
    timeRange: '24h',
    userid: null,
    groupid: null,
    msgid: null,
    traceId: null,
    sessionId: null,
    ipAddress: null,

    // Sorting
    sortDirection: 'backward', // backward (newest first) or forward (oldest first)

    // View mode and grouping
    viewMode: 'tree', // tree or flat
    groupBy: 'none', // none, session, trace, day
    collapseDuplicates: true,
    expandedGroups: {},
    expandedDetails: {},

    // Pagination
    hasMore: true,
    lastTimestamp: null,

    // Stats from last query
    stats: null,
  }),
  actions: {
    init(config) {
      this.config = config
      // Prefetch swagger docs for API descriptions (async, non-blocking).
      prefetchSwaggerDocs()
    },

    clear() {
      this.list = []
      this.summaries = []
      this.traceChildren = {}
      this.loadingTraces = {}
      this.hasMore = true
      this.lastTimestamp = null
      this.stats = null
      this.error = null
      this.expandedGroups = {}
    },

    // Fetch summaries for tree view (lazy loading - just trace headers).
    async fetchSummaries(params = {}) {
      this.loading = true
      this.error = null

      try {
        const queryParams = {
          sources: this.sources.join(','),
          start: this.timeRange,
          limit: 100, // Number of trace groups to show
          direction: this.sortDirection,
          summary: 'true', // Enable summary mode
          ...params,
        }

        // Add optional filters.
        this.addFiltersToParams(queryParams)

        const response = await api(this.config).systemlogs.fetch(queryParams)

        if (params.append && response.summaries) {
          this.summaries.push(...response.summaries)
        } else if (response.summaries) {
          this.summaries = response.summaries
        }

        this.stats = response.stats
        this.hasMore =
          response.summaries && response.summaries.length >= queryParams.limit

        if (response.summaries && response.summaries.length > 0) {
          this.lastTimestamp =
            response.summaries[response.summaries.length - 1].first_timestamp
        }
      } catch (e) {
        this.error = e.message || 'Failed to fetch logs'
        console.error('SystemLogs fetchSummaries error:', e)
      } finally {
        this.loading = false
      }
    },

    // Fetch children for a specific trace (on-demand when user expands).
    async fetchTraceChildren(traceId) {
      if (
        !traceId ||
        this.traceChildren[traceId] ||
        this.loadingTraces[traceId]
      )
        return

      this.loadingTraces[traceId] = true

      try {
        const queryParams = {
          sources: this.sources.join(','),
          start: this.timeRange,
          trace_id: traceId,
          limit: 500, // Get all logs for this trace
        }

        const response = await api(this.config).systemlogs.fetch(queryParams)
        this.traceChildren[traceId] = response.logs || []
      } catch (e) {
        console.error(`Failed to fetch trace ${traceId}:`, e)
        this.traceChildren[traceId] = [] // Mark as loaded but empty
      } finally {
        this.loadingTraces[traceId] = false
      }
    },

    // Helper to add filters to query params.
    addFiltersToParams(queryParams) {
      if (this.types.length > 0) {
        queryParams.types = this.types.join(',')
      }
      if (this.subtypes.length > 0) {
        queryParams.subtypes = this.subtypes.join(',')
      }
      if (this.levels.length > 0) {
        queryParams.levels = this.levels.join(',')
      }
      if (this.search) {
        queryParams.search = this.search
      }
      if (this.userid) {
        queryParams.userid = this.userid
      }
      if (this.groupid) {
        queryParams.groupid = this.groupid
      }
      if (this.msgid) {
        queryParams.msgid = this.msgid
      }
      if (this.traceId) {
        queryParams.trace_id = this.traceId
      }
      if (this.sessionId) {
        queryParams.session_id = this.sessionId
      }
      if (this.ipAddress) {
        queryParams.ip = this.ipAddress
      }
    },

    // Fetch logs for flat view (full data, not summary).
    async fetch(params = {}) {
      this.loading = true
      this.error = null

      try {
        const queryParams = {
          sources: this.sources.join(','),
          start: this.timeRange,
          limit: 500,
          direction: this.sortDirection,
          ...params,
        }

        // Add optional filters.
        this.addFiltersToParams(queryParams)

        const response = await api(this.config).systemlogs.fetch(queryParams)

        if (params.append) {
          this.list.push(...response.logs)
        } else {
          this.list = response.logs
        }

        this.stats = response.stats
        this.hasMore = response.logs && response.logs.length >= 500

        if (response.logs && response.logs.length > 0) {
          this.lastTimestamp = response.logs[response.logs.length - 1].timestamp
        }
      } catch (e) {
        this.error = e.message || 'Failed to fetch logs'
        console.error('SystemLogs fetch error:', e)
      } finally {
        this.loading = false
      }
    },

    async loadMore() {
      if (!this.hasMore || this.loading) return

      await this.fetch({
        append: true,
        end: this.lastTimestamp,
      })
    },

    setSources(sources) {
      this.sources = sources
      // Don't auto-clear - let the search button trigger refresh
    },

    setTypes(types) {
      this.types = types
      this.clear()
    },

    setSubtypes(subtypes) {
      this.subtypes = subtypes
      this.clear()
    },

    setLevels(levels) {
      this.levels = levels
      this.clear()
    },

    setSearch(search) {
      this.search = search
      this.clear()
    },

    setTimeRange(range) {
      this.timeRange = range
      this.clear()
    },

    setUserFilter(userid) {
      this.userid = userid
      this.clear()
    },

    setGroupFilter(groupid) {
      this.groupid = groupid
      this.clear()
    },

    setMsgFilter(msgid) {
      this.msgid = msgid
      this.clear()
    },

    setSortDirection(direction) {
      this.sortDirection = direction
      this.clear()
    },

    setTraceFilter(traceId) {
      this.traceId = traceId
      this.clear()
    },

    setSessionFilter(sessionId) {
      this.sessionId = sessionId
      this.clear()
    },

    setIpFilter(ip) {
      this.ipAddress = ip
      this.clear()
    },

    setViewMode(mode) {
      this.viewMode = mode
    },

    toggleGroupExpanded(groupKey) {
      this.expandedGroups[groupKey] = !this.expandedGroups[groupKey]
    },

    toggleDetails(logId) {
      this.expandedDetails[logId] = !this.expandedDetails[logId]
    },

    isGroupExpanded(groupKey) {
      return !!this.expandedGroups[groupKey]
    },

    isDetailsExpanded(logId) {
      return !!this.expandedDetails[logId]
    },
  },
  getters: {
    // Collect all entity IDs in a single pass for efficient batch fetching
    // This avoids multiple iterations over the log list
    entityIds: (state) => {
      const userIds = new Set()
      const groupIds = new Set()
      const messageIds = new Set()

      // Collect from flat list.
      for (const log of state.list) {
        if (log.user_id) userIds.add(log.user_id)
        if (log.byuser_id) userIds.add(log.byuser_id)
        if (log.group_id) groupIds.add(log.group_id)
        if (log.message_id) messageIds.add(log.message_id)
      }

      // Also collect from summaries (tree view mode).
      for (const summary of state.summaries) {
        const log = summary.first_log
        if (log) {
          if (log.user_id) userIds.add(log.user_id)
          if (log.byuser_id) userIds.add(log.byuser_id)
          if (log.group_id) groupIds.add(log.group_id)
          if (log.message_id) messageIds.add(log.message_id)
        }
      }

      // Also collect from loaded trace children.
      for (const logs of Object.values(state.traceChildren)) {
        for (const log of logs) {
          if (log.user_id) userIds.add(log.user_id)
          if (log.byuser_id) userIds.add(log.byuser_id)
          if (log.group_id) groupIds.add(log.group_id)
          if (log.message_id) messageIds.add(log.message_id)
        }
      }

      return {
        userIds: Array.from(userIds),
        groupIds: Array.from(groupIds),
        messageIds: Array.from(messageIds),
      }
    },

    // Legacy getters that use the combined entityIds for backwards compatibility
    userIds: (state) => {
      const ids = new Set()
      for (const log of state.list) {
        if (log.user_id) ids.add(log.user_id)
        if (log.byuser_id) ids.add(log.byuser_id)
      }
      return Array.from(ids)
    },

    groupIds: (state) => {
      const ids = new Set()
      for (const log of state.list) {
        if (log.group_id) ids.add(log.group_id)
      }
      return Array.from(ids)
    },

    messageIds: (state) => {
      const ids = new Set()
      for (const log of state.list) {
        if (log.message_id) ids.add(log.message_id)
      }
      return Array.from(ids)
    },

    // Group logs by session ID
    logsBySession: (state) => {
      const groups = {}
      for (const log of state.list) {
        const key = log.session_id || 'no-session'
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(log)
      }
      return groups
    },

    // Group logs by trace ID (simple grouping)
    logsByTrace: (state) => {
      const groups = {}
      for (const log of state.list) {
        const key = log.trace_id || 'no-trace'
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(log)
      }
      return groups
    },

    // Tree structure from summaries (lazy loading mode).
    // Uses summaries for collapsed view, traceChildren for expanded view.
    logsAsTree: (state) => {
      const result = []

      // If we have summaries, use lazy loading mode.
      if (state.summaries.length > 0) {
        for (const summary of state.summaries) {
          if (!summary.trace_id) {
            // Standalone entry (no trace_id).
            result.push({
              type: 'standalone',
              log: summary.first_log,
            })
          } else {
            // Trace group - use loaded children if available.
            const children = state.traceChildren[summary.trace_id]
            const isExpanded = !!state.expandedGroups[summary.trace_id]
            const isLoading = !!state.loadingTraces[summary.trace_id]

            const treeNode = {
              type: 'trace-group',
              trace_id: summary.trace_id,
              parent: summary.first_log,
              // Summary metadata for collapsed view.
              childCount: summary.child_count,
              sources: summary.sources,
              routeSummary: summary.route_summary,
              firstTimestamp: summary.first_timestamp,
              lastTimestamp: summary.last_timestamp,
              expanded: isExpanded,
              loading: isLoading,
              children: [],
            }

            // If expanded and children loaded, add them.
            if (isExpanded && children && children.length > 0) {
              // Filter out the parent log and add rest as children.
              for (const childLog of children) {
                if (childLog.id !== summary.first_log.id) {
                  treeNode.children.push({
                    type: childLog.source + '-node',
                    log: childLog,
                  })
                }
              }
            }

            result.push(treeNode)
          }
        }
        return result
      }

      // Fallback: build from list (flat view or legacy mode).
      const traceGroups = {}

      const getSourcePriority = (source) => {
        if (source === 'client') return 0
        if (source === 'api') return 1
        return 2
      }

      for (const log of state.list) {
        if (log.trace_id) {
          if (!traceGroups[log.trace_id]) {
            traceGroups[log.trace_id] = []
          }
          traceGroups[log.trace_id].push(log)
        } else {
          result.push({
            type: 'standalone',
            log,
          })
        }
      }

      for (const [traceId, logs] of Object.entries(traceGroups)) {
        logs.sort((a, b) => {
          const priorityDiff =
            getSourcePriority(a.source) - getSourcePriority(b.source)
          if (priorityDiff !== 0) return priorityDiff
          return new Date(a.timestamp) - new Date(b.timestamp)
        })

        const clientLog = logs.find((l) => l.source === 'client')
        const parentLog = clientLog || logs[0]
        const childLogs = logs.filter((l) => l !== parentLog)

        const treeNode = {
          type: 'trace-group',
          trace_id: traceId,
          parent: parentLog,
          childCount: logs.length,
          children: [],
          expanded: !!state.expandedGroups[traceId],
        }

        for (const childLog of childLogs) {
          treeNode.children.push({
            type: childLog.source + '-node',
            log: childLog,
          })
        }

        if (parentLog) {
          result.push(treeNode)
        }
      }

      return result
    },

    // Collapse consecutive duplicate logs
    collapsedLogs: (state) => {
      if (!state.collapseDuplicates) {
        return state.list.map((log) => ({ log, count: 1, entries: [log] }))
      }

      const result = []
      let currentGroup = null

      for (const log of state.list) {
        const key = getDuplicateKey(log)

        if (currentGroup && currentGroup.key === key) {
          currentGroup.count++
          currentGroup.lastTimestamp = log.timestamp
          currentGroup.entries.push(log)
        } else {
          if (currentGroup) {
            result.push(currentGroup)
          }
          currentGroup = {
            key,
            log,
            count: 1,
            firstTimestamp: log.timestamp,
            lastTimestamp: log.timestamp,
            entries: [log],
          }
        }
      }

      if (currentGroup) {
        result.push(currentGroup)
      }

      return result
    },
  },
})

// Helper to generate a key for duplicate detection (includes user_id to only collapse same user)
function getDuplicateKey(log) {
  const userId = log.user_id || 'anon'
  if (log.source === 'api') {
    const raw = log.raw || {}
    return `api:${userId}:${raw.method || 'GET'}:${raw.endpoint || ''}`
  }
  if (log.source === 'logs_table') {
    return `log:${userId}:${log.type}:${log.subtype}`
  }
  return `${log.source}:${userId}:${log.level || 'info'}:${(
    log.text || ''
  ).slice(0, 50)}`
}
