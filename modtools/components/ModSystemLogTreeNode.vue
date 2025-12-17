<template>
  <div class="tree-node" :class="{ 'has-children': hasChildren }">
    <!-- Parent row with expand/collapse toggle -->
    <div class="tree-row" :class="{ expanded: isExpanded }">
      <!-- Expand/collapse toggle area (only shown for nodes with children) -->
      <div v-if="hasChildren" class="tree-toggle-area">
        <button
          class="tree-toggle-btn"
          :class="{ 'btn-loading': isLoading }"
          :disabled="isLoading"
          :title="
            isLoading
              ? 'Loading...'
              : isExpanded
              ? 'Collapse'
              : 'Expand ' + childCount + ' related logs'
          "
          @click="toggleExpand"
        >
          <v-icon
            v-if="isLoading"
            icon="spinner"
            class="tree-expand-icon fa-spin"
          />
          <v-icon
            v-else
            :icon="isExpanded ? 'minus' : 'plus'"
            class="tree-expand-icon"
          />
        </button>
        <span class="child-count">{{ childCount }}</span>
      </div>

      <!-- Breadcrumb summary when collapsed - matches column layout -->
      <div v-if="showBreadcrumbSummary" class="breadcrumb-summary tree-entry">
        <!-- Time column -->
        <div class="breadcrumb-col breadcrumb-col-time">
          <span v-if="timestampRange" class="timestamp-range">
            {{ timestampRange }}
          </span>
        </div>
        <!-- Source column (empty for breadcrumb) -->
        <div class="breadcrumb-col breadcrumb-col-source" />
        <!-- Action column - breadcrumb routes -->
        <div class="breadcrumb-col breadcrumb-col-action">
          <span class="breadcrumb-routes">
            <template v-for="(segment, idx) in breadcrumbSegments" :key="idx">
              <span class="breadcrumb-route">{{ segment }}</span>
              <v-icon
                v-if="idx < breadcrumbSegments.length - 1"
                icon="angle-right"
                class="breadcrumb-separator"
              />
            </template>
            <template v-if="isTruncated">
              <v-icon icon="angle-right" class="breadcrumb-separator" />
              <span class="breadcrumb-ellipsis">...</span>
            </template>
          </span>
        </div>
      </div>

      <!-- The log entry (show when expanded or no breadcrumbs) -->
      <ModSystemLogEntry
        v-else
        :log="parentLog"
        :hide-user-column="hideUserColumn"
        class="tree-entry"
        @filter-trace="$emit('filter-trace', $event)"
        @filter-session="$emit('filter-session', $event)"
        @filter-ip="$emit('filter-ip', $event)"
      />
    </div>

    <!-- Children (when expanded) - hierarchical tree -->
    <div v-if="hasChildren && isExpanded" class="tree-children">
      <!-- Loading indicator -->
      <div v-if="isLoading" class="tree-loading">
        <span class="tree-connector" />
        <div class="loading-indicator">
          <v-icon icon="spinner" class="fa-spin me-2" />
          Loading logs...
        </div>
      </div>

      <!-- Route level -->
      <div
        v-for="(route, routeIdx) in visibleChildren"
        :key="'route-' + routeIdx"
        class="tree-route"
      >
        <div
          class="tree-child route-header"
          :class="{ 'route-expandable': hasRouteChildren(route) }"
          @click="hasRouteChildren(route) && toggleRoute(routeIdx)"
        >
          <span class="tree-connector" />
          <div v-if="hasRouteChildren(route)" class="route-toggle-btn">
            <v-icon
              :icon="isRouteVisible(routeIdx, route) ? 'minus' : 'plus'"
              class="route-expand-icon"
            />
          </div>
          <div v-else class="route-toggle-placeholder" />
          <div class="route-name">
            {{ route.pageName }}
            <span
              v-if="hasRouteChildren(route)"
              class="route-counts text-muted"
            >
              (<template v-if="route.otherLogs.length > 0"
                >{{ route.otherLogs.length }} user action{{
                  route.otherLogs.length !== 1 ? 's' : ''
                }}</template
              ><template
                v-if="route.otherLogs.length > 0 && route.apiCalls.length > 0"
                >, </template
              ><template v-if="route.apiCalls.length > 0"
                >{{ route.apiCalls.length }} API call{{
                  route.apiCalls.length !== 1 ? 's' : ''
                }}</template
              >)
            </span>
          </div>
        </div>

        <!-- Route children (when expanded or auto-expand if not explicitly toggled) -->
        <div
          v-if="
            isRouteExpanded(routeIdx) ||
            (!toggledRoutes[routeIdx] && shouldAutoExpand(route))
          "
          class="route-children"
        >
          <!-- Client events for this route -->
          <div
            v-for="clientLog in route.otherLogs"
            :key="clientLog.log.id"
            class="tree-child"
          >
            <span class="tree-connector" />
            <ModSystemLogEntry
              :log="clientLog.log"
              :hide-user-column="hideUserColumn"
              class="tree-entry child-entry"
              @filter-trace="$emit('filter-trace', $event)"
              @filter-session="$emit('filter-session', $event)"
              @filter-ip="$emit('filter-ip', $event)"
            />
          </div>

          <!-- API calls for this route -->
          <div
            v-for="(api, apiIdx) in route.apiCalls"
            :key="'api-' + routeIdx + '-' + apiIdx"
            class="tree-api"
          >
            <div
              class="tree-child api-header"
              @click="toggleApi(routeIdx, apiIdx)"
            >
              <span class="tree-connector" />
              <div v-if="api.serverLogs.length > 0" class="api-toggle">
                <v-icon
                  :icon="
                    isApiExpanded(routeIdx, apiIdx)
                      ? 'chevron-down'
                      : 'chevron-right'
                  "
                  class="api-chevron"
                />
              </div>
              <ModSystemLogEntry
                :log="api.log"
                :hide-user-column="hideUserColumn"
                class="tree-entry child-entry flex-grow-1"
                @filter-trace="$emit('filter-trace', $event)"
                @filter-session="$emit('filter-session', $event)"
                @filter-ip="$emit('filter-ip', $event)"
              />
            </div>

            <!-- Server logs for this API (when expanded or auto-expand if single) -->
            <div
              v-if="
                (isApiExpanded(routeIdx, apiIdx) ||
                  api.serverLogs.length === 1) &&
                api.serverLogs.length > 0
              "
              class="api-children"
            >
              <div
                v-for="serverLog in api.serverLogs"
                :key="serverLog.log.id"
                class="tree-child"
              >
                <span class="tree-connector" />
                <ModSystemLogEntry
                  :log="serverLog.log"
                  :hide-user-column="hideUserColumn"
                  class="tree-entry child-entry server-entry"
                  @filter-trace="$emit('filter-trace', $event)"
                  @filter-session="$emit('filter-session', $event)"
                  @filter-ip="$emit('filter-ip', $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load more sentinel -->
      <div
        v-if="hasMoreChildren"
        ref="loadMoreSentinel"
        class="load-more-sentinel"
      >
        <span class="tree-connector" />
        <div class="load-more-indicator" @click="loadMoreChildren">
          <v-icon icon="ellipsis-h" class="me-1" />
          Show {{ remainingChildCount }} more...
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSystemLogsStore } from '../stores/systemlogs'
import ModSystemLogEntry from './ModSystemLogEntry.vue'

const BATCH_SIZE = 50

export default {
  components: {
    ModSystemLogEntry,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    hideUserColumn: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['filter-trace', 'filter-session', 'filter-ip'],
  setup() {
    const systemLogsStore = useSystemLogsStore()
    return { systemLogsStore }
  },
  data() {
    return {
      visibleChildCount: BATCH_SIZE,
      observer: null,
      expandedRoutes: {},
      expandedApis: {},
      toggledRoutes: {}, // Track routes that have been explicitly toggled
    }
  },
  computed: {
    isTraceGroup() {
      return this.node.type === 'trace-group'
    },
    hasChildren() {
      // Has children if it's a trace group with more than 1 log.
      // Use childCount from summary if available.
      if (this.node.childCount !== undefined) {
        return this.isTraceGroup && this.node.childCount > 1
      }
      return this.isTraceGroup && this.totalLogCount > 1
    },
    childCount() {
      // Use childCount from summary if available.
      if (this.node.childCount !== undefined) {
        return this.node.childCount
      }
      return this.totalLogCount
    },
    parentLog() {
      // For trace-group, use parent; for standalone, use log.
      return this.isTraceGroup ? this.node.parent : this.node.log
    },
    isExpanded() {
      if (!this.isTraceGroup) return false
      return this.systemLogsStore.isGroupExpanded(this.node.trace_id)
    },
    isLoading() {
      // Check if children are being loaded.
      return this.node.loading || false
    },
    childrenLoaded() {
      // Check if children have been fetched.
      return this.node.children && this.node.children.length > 0
    },
    // Get all logs in chronological order.
    // Note: parent log is NOT included here - it's shown separately at the top level.
    allLogsChronological() {
      if (!this.isTraceGroup) return []

      const allLogs = []
      if (this.node.children) {
        for (const child of this.node.children) {
          allLogs.push(child)
        }
      }

      // Sort by timestamp (use getTime() for efficient numeric comparison)
      allLogs.sort((a, b) => {
        const timeA = new Date(a.log.timestamp).getTime()
        const timeB = new Date(b.log.timestamp).getTime()
        return timeA - timeB
      })

      return allLogs
    },
    // Build hierarchical tree: Route > API > Server logs
    hierarchicalTree() {
      if (!this.isTraceGroup) return []

      // Use allLogsChronological
      const allLogs = [...this.allLogsChronological]

      // Build hierarchy: routes > API calls > server logs
      const routes = []
      let currentRoute = null

      for (const item of allLogs) {
        const log = item.log
        const isPageView =
          log.source === 'client' && log.raw?.event_type === 'page_view'
        const isApiCall = log.source === 'api'
        const isServerLog = ['logs_table', 'batch', 'email'].includes(
          log.source
        )
        const isClientEvent = log.source === 'client' && !isPageView

        if (isPageView) {
          // Start a new route
          const rawName = log.raw?.page_name || log.raw?.url || 'Unknown'
          // Ensure leading slash for consistency
          const pageName = rawName.startsWith('/') ? rawName : `/${rawName}`
          currentRoute = {
            type: 'route',
            log,
            pageName,
            apiCalls: [],
            otherLogs: [],
          }
          routes.push(currentRoute)
        } else if (isApiCall) {
          // API call - add to current route or create orphan route
          if (!currentRoute) {
            currentRoute = {
              type: 'route',
              log: null,
              pageName: '(No route)',
              apiCalls: [],
              otherLogs: [],
            }
            routes.push(currentRoute)
          }
          currentRoute.apiCalls.push({
            type: 'api-call',
            log,
            serverLogs: [],
          })
        } else if (isServerLog) {
          // Server log - attach to most recent API call
          if (currentRoute && currentRoute.apiCalls.length > 0) {
            const lastApi =
              currentRoute.apiCalls[currentRoute.apiCalls.length - 1]
            lastApi.serverLogs.push(item)
          } else if (currentRoute) {
            currentRoute.otherLogs.push(item)
          } else {
            // Orphan server log
            currentRoute = {
              type: 'route',
              log: null,
              pageName: '(No route)',
              apiCalls: [],
              otherLogs: [item],
            }
            routes.push(currentRoute)
          }
        } else if (isClientEvent) {
          // Other client events - add to current route's other logs
          if (!currentRoute) {
            currentRoute = {
              type: 'route',
              log: null,
              pageName: '(No route)',
              apiCalls: [],
              otherLogs: [],
            }
            routes.push(currentRoute)
          }
          currentRoute.otherLogs.push(item)
        }
      }

      return routes
    },
    totalLogCount() {
      // Only count top-level items: routes + their direct otherLogs.
      // API calls are nested within routes and shown when route is expanded.
      let count = 0
      for (const route of this.hierarchicalTree) {
        count++ // Route itself
        count += route.otherLogs.length
      }
      return count
    },
    visibleChildren() {
      // Flatten for pagination (simplified)
      return this.hierarchicalTree.slice(0, this.visibleChildCount)
    },
    hasMoreChildren() {
      return this.totalLogCount > this.visibleChildCount
    },
    remainingChildCount() {
      return this.totalLogCount - this.visibleChildCount
    },
    // Extract routes from all client page_view logs for breadcrumb summary.
    // Uses routeSummary from node if available (lazy loading mode).
    routeBreadcrumbs() {
      if (!this.isTraceGroup) return null

      // Use routeSummary from summary data if available.
      if (this.node.routeSummary && this.node.routeSummary.length > 0) {
        return this.node.routeSummary
      }

      // Fallback: build from loaded children.
      const routes = []
      for (const item of this.allLogsChronological) {
        const log = item.log
        if (log.source === 'client') {
          const raw = log.raw || {}
          if (raw.event_type === 'page_view') {
            const pageName = raw.page_name || raw.url || ''
            if (pageName) {
              const route = pageName.startsWith('/') ? pageName : `/${pageName}`
              if (routes.length === 0 || routes[routes.length - 1] !== route) {
                routes.push(route)
              }
            }
          }
        }
      }

      return routes.length > 0 ? routes : null
    },
    // Get truncated routes array for breadcrumb display
    truncatedBreadcrumbs() {
      const routes = this.routeBreadcrumbs
      if (!routes || routes.length === 0) return []

      const MAX_LENGTH = 60
      let totalLength = routes[0].length
      const result = [routes[0]]

      for (let i = 1; i < routes.length; i++) {
        const nextLength = routes[i].length + 3 // +3 for chevron separator space
        if (totalLength + nextLength > MAX_LENGTH) {
          break
        }
        totalLength += nextLength
        result.push(routes[i])
      }

      return result
    },
    // Split routes into path segments for breadcrumb display.
    // E.g. ['/find/myposts', '/browse'] becomes ['/find', '/myposts', '/browse']
    breadcrumbSegments() {
      const routes = this.truncatedBreadcrumbs
      if (!routes || routes.length === 0) return []

      const segments = []
      for (const route of routes) {
        // Split by '/' and filter out empty strings, then add leading slash back
        const parts = route.split('/').filter((p) => p.length > 0)
        for (const part of parts) {
          segments.push(`/${part}`)
        }
      }

      return segments
    },
    // Check if breadcrumbs were truncated
    isTruncated() {
      const routes = this.routeBreadcrumbs
      if (!routes) return false
      return this.truncatedBreadcrumbs.length < routes.length
    },
    // Keep formattedBreadcrumbs for showBreadcrumbSummary check
    formattedBreadcrumbs() {
      return this.breadcrumbSegments.length > 0
    },
    // Show breadcrumb summary when we have routes (collapsed or expanded)
    showBreadcrumbSummary() {
      return this.hasChildren && this.formattedBreadcrumbs
    },
    // Get first timestamp for collapsed summary.
    // Uses node summary data if available.
    firstTimestamp() {
      if (this.node.firstTimestamp) {
        return this.node.firstTimestamp
      }
      const logs = this.allLogsChronological
      if (logs.length === 0) return null
      return logs[0].log.timestamp
    },
    // Get last timestamp for collapsed summary.
    // Uses node summary data if available.
    lastTimestamp() {
      if (this.node.lastTimestamp) {
        return this.node.lastTimestamp
      }
      const logs = this.allLogsChronological
      if (logs.length === 0) return null
      return logs[logs.length - 1].log.timestamp
    },
    // Format timestamp for display
    timestampRange() {
      if (!this.firstTimestamp) return null
      const formatTime = (ts) => {
        const d = new Date(ts)
        return d.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      }
      const first = formatTime(this.firstTimestamp)
      const last = formatTime(this.lastTimestamp)
      if (first === last) return first
      return `${first} - ${last}`
    },
  },
  watch: {
    isExpanded(newVal) {
      if (newVal) {
        // Reset visible count when expanding
        this.visibleChildCount = BATCH_SIZE
        // Set up observer after DOM updates
        this.$nextTick(() => {
          this.setupObserver()
        })
      } else {
        // Clean up observer when collapsing
        this.cleanupObserver()
      }
    },
  },
  mounted() {
    if (this.isExpanded) {
      this.setupObserver()
    }
  },
  beforeUnmount() {
    this.cleanupObserver()
  },
  methods: {
    async toggleExpand() {
      if (this.isTraceGroup) {
        const wasExpanded = this.isExpanded
        this.systemLogsStore.toggleGroupExpanded(this.node.trace_id)

        // If expanding and children not yet loaded, fetch them.
        if (!wasExpanded && !this.childrenLoaded && this.node.trace_id) {
          await this.systemLogsStore.fetchTraceChildren(this.node.trace_id)
        }
      }
    },
    loadMoreChildren() {
      this.visibleChildCount = Math.min(
        this.visibleChildCount + BATCH_SIZE,
        this.childCount
      )
      // Re-observe after loading more
      this.$nextTick(() => {
        this.setupObserver()
      })
    },
    setupObserver() {
      this.cleanupObserver()
      if (!this.hasMoreChildren) return

      const sentinel = this.$refs.loadMoreSentinel
      if (!sentinel) return

      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            this.loadMoreChildren()
          }
        },
        {
          rootMargin: '200px',
        }
      )
      this.observer.observe(sentinel)
    },
    cleanupObserver() {
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }
    },
    toggleRoute(routeIdx) {
      this.toggledRoutes[routeIdx] = true
      this.expandedRoutes[routeIdx] = !this.expandedRoutes[routeIdx]
    },
    toggleApi(routeIdx, apiIdx) {
      const key = `${routeIdx}-${apiIdx}`
      this.expandedApis[key] = !this.expandedApis[key]
    },
    isRouteExpanded(routeIdx) {
      return !!this.expandedRoutes[routeIdx]
    },
    isRouteVisible(routeIdx, route) {
      // Route is visible if explicitly expanded OR auto-expand applies (when not toggled)
      return (
        this.isRouteExpanded(routeIdx) ||
        (!this.toggledRoutes[routeIdx] && this.shouldAutoExpand(route))
      )
    },
    isApiExpanded(routeIdx, apiIdx) {
      const key = `${routeIdx}-${apiIdx}`
      return !!this.expandedApis[key]
    },
    shouldAutoExpand(route) {
      // Auto-expand if only 1 API call or no API calls (just other logs)
      return route.apiCalls.length <= 1
    },
    hasRouteChildren(route) {
      // Route has expandable children if it has API calls or other logs
      return route.apiCalls.length > 0 || route.otherLogs.length > 0
    },
  },
}
</script>

<style scoped>
.tree-node {
  position: relative;
}

.tree-row {
  display: flex;
  align-items: stretch;
}

/* Fixed width toggle area for consistent alignment */
.tree-toggle-area {
  flex: 0 0 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tree-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #1565c0;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 6px;
}

.tree-toggle-btn:hover:not(:disabled) {
  background: #1976d2;
}

.tree-toggle-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.tree-toggle-btn.btn-loading {
  background: #6c757d;
}

.tree-expand-icon {
  font-size: 12px;
}

.child-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 20px;
  padding: 0 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: #6c757d;
  border-radius: 10px;
}

.tree-entry {
  flex: 1;
  min-width: 0;
}

/* Breadcrumb summary when collapsed */
.breadcrumb-summary {
  display: flex;
  align-items: center;
  min-height: 36px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.breadcrumb-col {
  padding: 6px 4px;
}

.breadcrumb-col-time {
  flex: 0 0 160px;
}

.breadcrumb-col-source {
  flex: 0 0 70px;
}

.breadcrumb-col-action {
  flex: 1;
  min-width: 0;
}

.timestamp-range {
  font-size: 0.8rem;
  color: #6c757d;
  font-family: monospace;
}

.breadcrumb-routes {
  display: flex;
  align-items: center;
  font-family: monospace;
  font-size: 0.85rem;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
}

.breadcrumb-route {
  color: #0d6efd;
}

.breadcrumb-separator {
  margin: 0 6px;
  font-size: 0.65rem;
  color: #6c757d;
  vertical-align: middle;
}

.breadcrumb-ellipsis {
  color: #6c757d;
}

/* Children container */
.tree-children {
  margin-left: 24px;
  border-left: 2px solid #dee2e6;
  padding-left: 0;
}

.tree-child {
  display: flex;
  align-items: stretch;
  position: relative;
}

.tree-connector {
  flex: 0 0 12px;
  position: relative;
}

.tree-connector::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 12px;
  height: 0;
  border-top: 2px solid #dee2e6;
}

.tree-child:last-child .tree-connector::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -2px;
  bottom: 0;
  width: 2px;
  background: white;
}

.child-entry {
  background: #fafbfc;
}

.child-entry:hover {
  background: #f1f3f5;
}

/* Load more indicator */
.load-more-sentinel {
  display: flex;
  align-items: stretch;
  position: relative;
}

.load-more-indicator {
  flex: 1;
  padding: 8px 12px;
  background: #e3f2fd;
  color: #1565c0;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  transition: background 0.15s;
}

.load-more-indicator:hover {
  background: #bbdefb;
}

/* Hierarchical tree: Route and API levels */
.tree-route {
  margin-bottom: 2px;
}

.route-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  background: #e8f4fd;
  border-bottom: 1px solid #cce5ff;
  padding: 4px 0;
}

.route-header:hover {
  background: #d1e7fd;
}

.route-toggle-btn {
  flex: 0 0 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1565c0;
  color: white;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 8px;
}

.route-toggle-btn:hover {
  background: #1976d2;
}

.route-expand-icon {
  font-size: 12px;
}

.route-toggle-placeholder {
  flex: 0 0 22px;
  margin-right: 8px;
}

.route-expandable {
  cursor: pointer;
}

.route-name {
  flex: 1;
  font-family: monospace;
  font-size: 0.85rem;
  color: #0d6efd;
  padding: 4px 8px;
}

.route-count {
  font-size: 0.75rem;
}

.route-children {
  margin-left: 20px;
  border-left: 2px solid #90caf9;
}

.api-header {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.api-header:hover {
  background: #f5f5f5;
}

.api-toggle {
  flex: 0 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.api-chevron {
  font-size: 10px;
  color: #6c757d;
}

.api-children {
  margin-left: 18px;
  border-left: 2px solid #dee2e6;
}

.server-entry {
  background: #fefefe;
  font-size: 0.8rem;
}

/* Loading indicator */
.tree-loading {
  display: flex;
  align-items: stretch;
  position: relative;
}

.loading-indicator {
  flex: 1;
  padding: 12px 16px;
  background: #f8f9fa;
  color: #6c757d;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .tree-children {
    margin-left: 8px;
  }

  .tree-connector {
    flex: 0 0 8px;
  }

  .tree-connector::before {
    width: 8px;
  }
}
</style>
