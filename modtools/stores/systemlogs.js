import { defineStore } from 'pinia'
import { prefetchSwaggerDocs } from '../composables/useSystemLogFormatter'
import api from '~/api'

export const useSystemLogsStore = defineStore({
  id: 'systemlogs',
  state: () => ({
    loading: false,
    error: null,

    // Tree view data
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
    email: null,

    // Sorting
    sortDirection: 'backward', // backward (newest first) or forward (oldest first)

    // Polling filter - hide noisy polling endpoints by default
    showPolling: false,

    // App source filter - fd (Freegle), mt (ModTools), or both
    appSource: 'fd',

    // Grouping
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
    // timeBounds: { start, end } - ISO timestamps to constrain the query.
    async fetchTraceChildren(traceId, timeBounds = null) {
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
          trace_id: traceId,
          limit: 500, // Get all logs for this trace
        }

        // Use precise time bounds if available, otherwise fall back to general timeRange.
        if (timeBounds && timeBounds.start && timeBounds.end) {
          queryParams.start = timeBounds.start
          queryParams.end = timeBounds.end
        } else {
          queryParams.start = this.timeRange
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
      if (this.email) {
        queryParams.email = this.email
      }
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

    setEmailFilter(email) {
      this.email = email
      this.clear()
    },

    setShowPolling(show) {
      this.showPolling = show
      // Don't clear - just re-render with filter applied
    },

    setAppSource(source) {
      this.appSource = source
      // Don't clear - just re-render with filter applied
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
    // Collect all entity IDs in a single pass for efficient batch fetching.
    entityIds: (state) => {
      const userIds = new Set()
      const groupIds = new Set()
      const messageIds = new Set()

      // Collect from summaries.
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

    // Tree structure from summaries (lazy loading mode).
    // Uses summaries for collapsed view, traceChildren for expanded view.
    logsAsTree: (state) => {
      // Helper to check if a log should be shown based on filters
      const shouldShowLog = (log) => {
        // Check polling filter
        if (!state.showPolling && isPollingLog(log)) {
          return false
        }

        // Check app source filter
        if (state.appSource !== 'both') {
          const isMT = isModToolsLog(log)
          if (state.appSource === 'fd' && isMT) {
            return false
          }
          if (state.appSource === 'mt' && !isMT) {
            return false
          }
        }

        return true
      }

      // Helper to check if a log is a page load API call
      const isPageLoadLog = (log) => {
        if (!log) return false
        const raw = log.raw || {}
        const phase = raw.page_load_phase
        // Consider 'loading' and 'interactive' as page load phases
        // Also check ms_since_page_load - if within 5 seconds, it's page load
        if (phase === 'loading' || phase === 'interactive') {
          return true
        }
        const msSincePageLoad = raw.ms_since_page_load
        if (
          msSincePageLoad !== null &&
          msSincePageLoad !== undefined &&
          msSincePageLoad < 5000
        ) {
          return true
        }
        return false
      }

      // If we have summaries, use lazy loading mode.
      if (state.summaries.length > 0) {
        // First pass: collect nodes and identify page load groups
        const nodes = []
        let currentPageLoadGroup = null

        for (const summary of state.summaries) {
          // Skip polling logs if filter is active
          if (!shouldShowLog(summary.first_log)) {
            continue
          }

          const isPageLoad = isPageLoadLog(summary.first_log)

          // Build the node
          let node
          if (!summary.trace_id) {
            // Standalone entry (no trace_id).
            node = {
              type: 'standalone',
              log: summary.first_log,
            }
          } else {
            // Trace group - use loaded children if available.
            const children = state.traceChildren[summary.trace_id]
            const isExpanded = !!state.expandedGroups[summary.trace_id]
            const isLoading = !!state.loadingTraces[summary.trace_id]

            node = {
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

            // If expanded and children loaded, add them with duplicate collapsing.
            if (isExpanded && children && children.length > 0) {
              // Filter out the parent log.
              const filteredChildren = children.filter(
                (childLog) => childLog.id !== summary.first_log.id
              )

              // Collapse consecutive duplicates.
              if (state.collapseDuplicates && filteredChildren.length > 0) {
                let currentGroup = null
                for (const childLog of filteredChildren) {
                  const key = getDuplicateKey(childLog)
                  if (currentGroup && currentGroup.key === key) {
                    currentGroup.count++
                    currentGroup.entries.push(childLog)
                  } else {
                    if (currentGroup) {
                      node.children.push(currentGroup)
                    }
                    currentGroup = {
                      type: childLog.source + '-node',
                      log: childLog,
                      key,
                      count: 1,
                      entries: [childLog],
                    }
                  }
                }
                if (currentGroup) {
                  node.children.push(currentGroup)
                }
              } else {
                // No collapsing - add children directly.
                for (const childLog of filteredChildren) {
                  node.children.push({
                    type: childLog.source + '-node',
                    log: childLog,
                  })
                }
              }
            }
          }

          // Group page load logs together
          if (isPageLoad && summary.first_log.source === 'client') {
            // Start or continue a page load group
            if (!currentPageLoadGroup) {
              const groupKey =
                'pageload-' +
                (summary.first_log.session_id ||
                  summary.first_timestamp ||
                  Date.now())
              currentPageLoadGroup = {
                type: 'page-load-group',
                groupKey,
                firstTimestamp: summary.first_timestamp,
                lastTimestamp: summary.last_timestamp,
                childCount: 1,
                expanded: !!state.expandedGroups[groupKey],
                children: [node],
              }
            } else {
              // Add to existing group
              currentPageLoadGroup.children.push(node)
              currentPageLoadGroup.childCount++
              currentPageLoadGroup.lastTimestamp = summary.last_timestamp
            }
          } else {
            // Not a page load log - flush any pending group and add this node
            if (currentPageLoadGroup) {
              // Only create group if there are multiple entries
              if (currentPageLoadGroup.children.length > 1) {
                nodes.push(currentPageLoadGroup)
              } else {
                // Single entry, just add it directly
                nodes.push(currentPageLoadGroup.children[0])
              }
              currentPageLoadGroup = null
            }
            nodes.push(node)
          }
        }

        // Flush any remaining page load group
        if (currentPageLoadGroup) {
          if (currentPageLoadGroup.children.length > 1) {
            nodes.push(currentPageLoadGroup)
          } else {
            nodes.push(currentPageLoadGroup.children[0])
          }
        }

        return nodes
      }

      // No summaries loaded yet.
      return []
    },
  },
})

// Action types/subtypes that are inherently ModTools-only actions.
// These actions can only be performed by moderators via ModTools.
const MODTOOLS_ONLY_ACTIONS = {
  Chat: ['Approved'],
  Message: ['Approved', 'Rejected', 'Hold', 'Release', 'Edit', 'Replied'],
  User: [
    'Approved',
    'Rejected',
    'Hold',
    'Release',
    'Mailed',
    'Suspect',
    'OurPostingStatus',
    'OurEmailFrequency',
  ],
  Group: ['Edit'],
  Config: ['Created', 'Deleted', 'Edit'],
  StdMsg: ['Created', 'Deleted', 'Edit'],
}

// Check if a log entry is from ModTools
function isModToolsLog(log) {
  const raw = log.raw || {}

  // For client logs, check the URL
  if (log.source === 'client') {
    const url = raw.url || ''
    return url.includes('modtools')
  }

  // For API logs, check the modtools parameter in query params or body
  if (log.source === 'api') {
    const queryParams = raw.query_params || {}
    const requestBody = raw.request_body || {}

    // Check if modtools param is truthy (could be 'true', true, '1', 1)
    const mtParam = queryParams.modtools || requestBody.modtools
    if (
      mtParam === true ||
      mtParam === 'true' ||
      mtParam === '1' ||
      mtParam === 1
    ) {
      return true
    }

    // If modtools param is explicitly false, it's from Freegle
    if (
      mtParam === false ||
      mtParam === 'false' ||
      mtParam === '0' ||
      mtParam === 0
    ) {
      return false
    }

    // No modtools param - could be either, default to Freegle
    return false
  }

  // For logs_table (database logs), identify ModTools actions by type/subtype
  if (log.source === 'logs_table') {
    const type = log.type || ''
    const subtype = log.subtype || ''

    // Check if this is an inherently ModTools-only action
    const modOnlySubtypes = MODTOOLS_ONLY_ACTIONS[type]
    if (modOnlySubtypes && modOnlySubtypes.includes(subtype)) {
      return true
    }

    // If byuser_id differs from user_id, it's a mod acting on someone else
    if (log.byuser_id && log.user_id && log.byuser_id !== log.user_id) {
      return true
    }

    // Default: treat as Freegle user action
    return false
  }

  // For other log sources (email, batch), we can't determine the source
  // Default to showing them (treat as neither specifically FD nor MT)
  return false
}

// Polling endpoint patterns that are noisy and can be filtered out.
// These are the suffixes after /api or /apiv2.
const POLLING_ENDPOINT_SUFFIXES = [
  '/newsfeedcount',
  '/message/count',
  '/notification/count',
  '/online',
  '/status',
  '/chat',
  '/chatrooms',
]

// Check if a log entry is a polling request
function isPollingLog(log) {
  if (log.source !== 'api') return false
  const raw = log.raw || {}
  const endpoint = raw.endpoint || ''

  // Strip the /api or /apiv2 prefix to get the route suffix
  let routeSuffix = endpoint
  if (endpoint.startsWith('/apiv2')) {
    routeSuffix = endpoint.slice(6) // Remove '/apiv2'
  } else if (endpoint.startsWith('/api')) {
    routeSuffix = endpoint.slice(4) // Remove '/api'
  }

  // Check for matches against polling suffixes
  for (const pollingSuffix of POLLING_ENDPOINT_SUFFIXES) {
    if (
      routeSuffix === pollingSuffix ||
      routeSuffix.startsWith(pollingSuffix + '?') ||
      routeSuffix.startsWith(pollingSuffix + '/')
    ) {
      return true
    }
  }

  return false
}

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
  if (log.source === 'client') {
    const raw = log.raw || {}
    // Use event_type for client logs (e.g., 'Ad impression', 'Interaction')
    const eventType = raw.event_type || 'unknown'

    // For noisy events like Ad impressions, group just by event type (not URL).
    // This collapses all ad impressions on a page into one group.
    if (eventType === 'Ad impression' || eventType === 'Interaction') {
      return `client:${userId}:${eventType}`
    }

    // For other client events, include URL to group similar events on the same page.
    const url = raw.url || ''
    return `client:${userId}:${eventType}:${url}`
  }
  return `${log.source}:${userId}:${log.level || 'info'}:${(
    log.text || ''
  ).slice(0, 50)}`
}
