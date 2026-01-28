<template>
  <div class="tree-node" :class="{ 'has-children': hasChildren }">
    <!-- Page Load Group (special grouping node) -->
    <template v-if="isPageLoadGroup">
      <div class="page-load-group">
        <div class="page-load-header" @click="togglePageLoadExpand">
          <div class="tree-toggle-area">
            <button
              class="tree-toggle-btn page-load-toggle"
              :title="
                isPageLoadExpanded ? 'Collapse' : 'Expand page load group'
              "
            >
              <v-icon
                :icon="isPageLoadExpanded ? 'minus' : 'plus'"
                class="tree-expand-icon"
              />
            </button>
            <span class="child-count">{{ pageLoadChildCount }}</span>
          </div>
          <div class="page-load-summary tree-entry">
            <div class="breadcrumb-col breadcrumb-col-time">
              <span class="timestamp-range">{{ pageLoadTimestampRange }}</span>
            </div>
            <div class="breadcrumb-col breadcrumb-col-source">
              <b-badge variant="info" class="page-load-badge"
                >Page Load</b-badge
              >
            </div>
            <div class="breadcrumb-col breadcrumb-col-action">
              <span class="page-load-info">
                {{ pageLoadChildCount }} API call{{
                  pageLoadChildCount !== 1 ? 's' : ''
                }}
                during page load
              </span>
            </div>
          </div>
        </div>
        <!-- Page load children (when expanded) -->
        <div v-if="isPageLoadExpanded" class="page-load-children">
          <ModSystemLogTreeNode
            v-for="(childNode, idx) in node.children"
            :key="childNode.trace_id || childNode.log?.id || idx"
            :node="childNode"
            :hide-user-column="hideUserColumn"
            @filter-trace="$emit('filter-trace', $event)"
            @filter-session="$emit('filter-session', $event)"
            @filter-ip="$emit('filter-ip', $event)"
          />
        </div>
      </div>
    </template>

    <!-- Normal tree node (trace-group or standalone) -->
    <template v-else>
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

        <!-- Summary row for groups with children -->
        <div v-if="hasChildren" class="breadcrumb-summary tree-entry">
          <!-- Time column -->
          <div class="breadcrumb-col breadcrumb-col-time">
            <span v-if="timestampRange" class="timestamp-range">
              {{ timestampRange }}
            </span>
          </div>
          <!-- Source column (empty for breadcrumb) -->
          <div class="breadcrumb-col breadcrumb-col-source" />
          <!-- Action column - breadcrumb routes or fallback summary -->
          <div class="breadcrumb-col breadcrumb-col-action">
            <span v-if="formattedBreadcrumbs" class="breadcrumb-routes">
              <v-icon
                v-if="isMobileApp"
                icon="mobile-alt"
                class="mobile-indicator me-1"
                title="Mobile app"
              />
              <template v-for="(segment, idx) in breadcrumbSegments" :key="idx">
                <span class="breadcrumb-route">{{
                  formatBreadcrumbSegment(segment)
                }}</span>
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
            <span v-else class="summary-fallback">
              {{ summaryDescription }}
            </span>
          </div>
        </div>

        <!-- The log entry (show for standalone nodes without children) -->
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
              <v-icon
                v-if="isRouteFromMobile(route)"
                icon="mobile-alt"
                class="mobile-indicator me-1"
                title="Mobile app"
              />{{ formatBreadcrumbSegment(route.pageName) }}
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
                ><template
                  v-if="
                    route.emailLogs?.length > 0 &&
                    (route.otherLogs.length > 0 || route.apiCalls.length > 0)
                  "
                  >, </template
                ><template v-if="route.emailLogs?.length > 0"
                  >{{ route.emailLogs.length }} email{{
                    route.emailLogs.length !== 1 ? 's' : ''
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
              <span
                v-if="clientLog.count > 1"
                class="duplicate-count"
                :title="clientLog.count + ' identical events'"
              >
                {{ clientLog.count }}×
              </span>
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

            <!-- Email logs for this route -->
            <div
              v-for="emailLog in route.emailLogs"
              :key="'email-' + emailLog.log.id"
              class="tree-child"
            >
              <span class="tree-connector" />
              <ModSystemLogEntry
                :log="emailLog.log"
                :hide-user-column="hideUserColumn"
                class="tree-entry child-entry email-entry"
                @filter-trace="$emit('filter-trace', $event)"
                @filter-session="$emit('filter-session', $event)"
                @filter-ip="$emit('filter-ip', $event)"
              />
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useSystemLogsStore } from '../stores/systemlogs'

defineOptions({
  name: 'ModSystemLogTreeNode',
})

const BATCH_SIZE = 50

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  hideUserColumn: {
    type: Boolean,
    default: false,
  },
})

// eslint-disable-next-line no-unused-vars
const emit = defineEmits(['filter-trace', 'filter-session', 'filter-ip'])

const systemLogsStore = useSystemLogsStore()

const loadMoreSentinel = ref(null)
const visibleChildCount = ref(BATCH_SIZE)
let observer = null
const expandedRoutes = ref({})
const expandedApis = ref({})
const toggledRoutes = ref({})

const isPageLoadGroup = computed(() => props.node.type === 'page-load-group')

const isPageLoadExpanded = computed(() => {
  if (!isPageLoadGroup.value) return false
  return systemLogsStore.isGroupExpanded(props.node.groupKey)
})

const pageLoadChildCount = computed(() => {
  if (!isPageLoadGroup.value) return 0
  return props.node.children?.length || 0
})

const pageLoadTimestampRange = computed(() => {
  if (!isPageLoadGroup.value) return ''
  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }
  const first = formatTime(props.node.firstTimestamp)
  const last = formatTime(props.node.lastTimestamp)
  if (first === last) return first
  return `${first} - ${last}`
})

const isTraceGroup = computed(() => props.node.type === 'trace-group')

const hasChildren = computed(() => {
  // Has children if it's a trace group with more than 1 log.
  // Use childCount from summary if available.
  if (props.node.childCount !== undefined) {
    return isTraceGroup.value && props.node.childCount > 1
  }
  return isTraceGroup.value && totalLogCount.value > 1
})

const childCount = computed(() => {
  // Use childCount from summary if available.
  if (props.node.childCount !== undefined) {
    return props.node.childCount
  }
  return totalLogCount.value
})

const parentLog = computed(() => {
  // For trace-group, use parent; for standalone, use log.
  return isTraceGroup.value ? props.node.parent : props.node.log
})

const isExpanded = computed(() => {
  if (!isTraceGroup.value) return false
  return systemLogsStore.isGroupExpanded(props.node.trace_id)
})

const isLoading = computed(() => {
  // Check if children are being loaded.
  return props.node.loading || false
})

const childrenLoaded = computed(() => {
  // Check if children have been fetched.
  return props.node.children && props.node.children.length > 0
})

// Get all logs in chronological order.
// Note: parent log is NOT included here - it's shown separately at the top level.
const allLogsChronological = computed(() => {
  if (!isTraceGroup.value) return []

  const allLogs = []
  if (props.node.children) {
    for (const child of props.node.children) {
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
})

// Build hierarchical tree: Route > API > Server logs
const hierarchicalTree = computed(() => {
  if (!isTraceGroup.value) return []

  // Use allLogsChronological
  const allLogs = [...allLogsChronological.value]

  // Build hierarchy: routes > API calls > server logs
  const routes = []
  let currentRoute = null

  // Helper to extract route from any log that has it.
  const getRouteFromLog = (log) => {
    const raw = log.raw || {}
    // Check for route in various fields.
    const routeName = raw.page_name || raw.url || raw.route || null
    if (routeName) {
      return routeName.startsWith('/') ? routeName : `/${routeName}`
    }
    return null
  }

  for (const item of allLogs) {
    const log = item.log
    const isPageView =
      log.source === 'client' && log.raw?.event_type === 'page_view'
    const isApiCall = log.source === 'api'
    // Email logs include laravel-batch and email sources, or batch logs about emails
    const isEmailLog =
      log.source === 'laravel-batch' ||
      log.source === 'email' ||
      (log.source === 'batch' &&
        (log.text?.toLowerCase().includes('email') ||
          log.text?.toLowerCase().includes('mail')))
    const isServerLog =
      ['logs_table', 'batch', 'email', 'laravel-batch'].includes(log.source) &&
      !isEmailLog
    const isClientEvent = log.source === 'client' && !isPageView

    if (isPageView) {
      // Start a new route.
      const pageName = getRouteFromLog(log) || '/Unknown'
      currentRoute = {
        type: 'route',
        log,
        pageName,
        apiCalls: [],
        otherLogs: [],
        emailLogs: [],
      }
      routes.push(currentRoute)
    } else if (isEmailLog) {
      // Email log - add to current route's emailLogs
      if (!currentRoute) {
        currentRoute = {
          type: 'route',
          log: null,
          pageName: '(Emails)',
          apiCalls: [],
          otherLogs: [],
          emailLogs: [],
        }
        routes.push(currentRoute)
      }
      currentRoute.emailLogs.push(item)
    } else if (isApiCall) {
      // API call - add to current route or create orphan route.
      if (!currentRoute) {
        currentRoute = {
          type: 'route',
          log: null,
          pageName: '(API calls)',
          apiCalls: [],
          otherLogs: [],
          emailLogs: [],
        }
        routes.push(currentRoute)
      }
      currentRoute.apiCalls.push({
        type: 'api-call',
        log,
        serverLogs: [],
      })
    } else if (isServerLog) {
      // Server log - attach to most recent API call.
      if (currentRoute && currentRoute.apiCalls.length > 0) {
        const lastApi = currentRoute.apiCalls[currentRoute.apiCalls.length - 1]
        lastApi.serverLogs.push(item)
      } else if (currentRoute) {
        currentRoute.otherLogs.push(item)
      } else {
        // Orphan server log.
        currentRoute = {
          type: 'route',
          log: null,
          pageName: '(Background)',
          apiCalls: [],
          otherLogs: [item],
          emailLogs: [],
        }
        routes.push(currentRoute)
      }
    } else if (isClientEvent) {
      // Other client events - check if they have route info.
      const eventRoute = getRouteFromLog(log)

      if (!currentRoute) {
        // Create a new route using the event's route if available.
        currentRoute = {
          type: 'route',
          log: eventRoute ? log : null,
          pageName: eventRoute || '(Events)',
          apiCalls: [],
          otherLogs: [],
          emailLogs: [],
        }
        routes.push(currentRoute)
      } else if (eventRoute && currentRoute.pageName.startsWith('(')) {
        // Update the route name if we have one and current is a placeholder.
        currentRoute.pageName = eventRoute
        currentRoute.log = log
      }
      currentRoute.otherLogs.push(item)
    }
  }

  return routes
})

const totalLogCount = computed(() => {
  // Only count top-level items: routes + their direct otherLogs.
  // API calls are nested within routes and shown when route is expanded.
  let count = 0
  for (const route of hierarchicalTree.value) {
    count++ // Route itself
    count += route.otherLogs.length
  }
  return count
})

const visibleChildren = computed(() => {
  // Flatten for pagination (simplified)
  return hierarchicalTree.value.slice(0, visibleChildCount.value)
})

const hasMoreChildren = computed(() => {
  return totalLogCount.value > visibleChildCount.value
})

const remainingChildCount = computed(() => {
  return totalLogCount.value - visibleChildCount.value
})

// Extract routes from all client page_view logs for breadcrumb summary.
// Uses routeSummary from node if available (lazy loading mode).
const routeBreadcrumbs = computed(() => {
  if (!isTraceGroup.value) return null

  // Use routeSummary from summary data if available.
  if (props.node.routeSummary && props.node.routeSummary.length > 0) {
    return props.node.routeSummary
  }

  // Fallback: build from loaded children.
  const routes = []
  for (const item of allLogsChronological.value) {
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
})

// Get truncated routes array for breadcrumb display
const truncatedBreadcrumbs = computed(() => {
  const routes = routeBreadcrumbs.value
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
})

// Return routes as breadcrumb segments (each route is shown as-is).
const breadcrumbSegments = computed(() => {
  const routes = truncatedBreadcrumbs.value
  if (!routes || routes.length === 0) return []
  return routes
})

// Check if breadcrumbs were truncated
const isTruncated = computed(() => {
  const routes = routeBreadcrumbs.value
  if (!routes) return false
  return truncatedBreadcrumbs.value.length < routes.length
})

// Check if any breadcrumb indicates mobile app (capacitor://)
const isMobileApp = computed(() => {
  const routes = routeBreadcrumbs.value
  if (!routes) return false
  return routes.some(
    (r) => r.startsWith('capacitor://') || r.includes('capacitor://')
  )
})

// Keep formattedBreadcrumbs for template
const formattedBreadcrumbs = computed(() => {
  return breadcrumbSegments.value.length > 0
})

// Generate a fallback description when no route breadcrumbs available
const summaryDescription = computed(() => {
  const parts = []

  // Count user actions and API calls from the node
  if (props.node.childCount) {
    parts.push(
      `${props.node.childCount} log${props.node.childCount !== 1 ? 's' : ''}`
    )
  }

  // Add source info if available
  if (props.node.sources && props.node.sources.length > 0) {
    const sourceList = props.node.sources.join(', ')
    parts.push(`(${sourceList})`)
  }

  // Fallback to parentLog info if available
  if (parts.length === 0 && parentLog.value) {
    const raw = parentLog.value.raw || {}
    if (raw.page_name || raw.url) {
      return raw.page_name || raw.url
    }
  }

  return parts.length > 0 ? parts.join(' ') : 'Session activity'
})

// Get first timestamp for collapsed summary.
// Uses node summary data if available.
const firstTimestamp = computed(() => {
  if (props.node.firstTimestamp) {
    return props.node.firstTimestamp
  }
  const logs = allLogsChronological.value
  if (logs.length === 0) return null
  return logs[0].log.timestamp
})

// Get last timestamp for collapsed summary.
// Uses node summary data if available.
const lastTimestamp = computed(() => {
  if (props.node.lastTimestamp) {
    return props.node.lastTimestamp
  }
  const logs = allLogsChronological.value
  if (logs.length === 0) return null
  return logs[logs.length - 1].log.timestamp
})

// Format timestamp for display
const timestampRange = computed(() => {
  if (!firstTimestamp.value) return null
  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }
  const first = formatTime(firstTimestamp.value)
  const last = formatTime(lastTimestamp.value)
  if (first === last) return first
  return `${first} - ${last}`
})

watch(isExpanded, (newVal) => {
  if (newVal) {
    // Reset visible count when expanding
    visibleChildCount.value = BATCH_SIZE
    // Set up observer after DOM updates
    nextTick(() => {
      setupObserver()
    })
  } else {
    // Clean up observer when collapsing
    cleanupObserver()
  }
})

onMounted(() => {
  if (isExpanded.value) {
    setupObserver()
  }
})

onBeforeUnmount(() => {
  cleanupObserver()
})

// Format breadcrumb segment - strip capacitor://localhost prefix
function formatBreadcrumbSegment(segment) {
  if (segment.startsWith('capacitor://localhost')) {
    return segment.replace('capacitor://localhost', '')
  }
  if (segment.startsWith('/capacitor://localhost')) {
    return segment.replace('/capacitor://localhost', '')
  }
  return segment
}

// Check if a specific route is from mobile app (capacitor://)
function isRouteFromMobile(route) {
  if (!route || !route.pageName) return false
  return (
    route.pageName.includes('capacitor://') ||
    route.pageName.startsWith('/capacitor://')
  )
}

function togglePageLoadExpand() {
  if (isPageLoadGroup.value) {
    systemLogsStore.toggleGroupExpanded(props.node.groupKey)
  }
}

async function toggleExpand() {
  if (isTraceGroup.value) {
    const wasExpanded = isExpanded.value
    systemLogsStore.toggleGroupExpanded(props.node.trace_id)

    // If expanding and children not yet loaded, fetch them.
    if (!wasExpanded && !childrenLoaded.value && props.node.trace_id) {
      // Pass time bounds from the summary for a more efficient query.
      const timeBounds =
        props.node.firstTimestamp && props.node.lastTimestamp
          ? {
              start: props.node.firstTimestamp,
              end: props.node.lastTimestamp,
            }
          : null
      await systemLogsStore.fetchTraceChildren(props.node.trace_id, timeBounds)
    }
  }
}

function loadMoreChildren() {
  visibleChildCount.value = Math.min(
    visibleChildCount.value + BATCH_SIZE,
    childCount.value
  )
  // Re-observe after loading more
  nextTick(() => {
    setupObserver()
  })
}

function setupObserver() {
  cleanupObserver()
  if (!hasMoreChildren.value) return

  const sentinel = loadMoreSentinel.value
  if (!sentinel) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMoreChildren()
      }
    },
    {
      rootMargin: '200px',
    }
  )
  observer.observe(sentinel)
}

function cleanupObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

function toggleRoute(routeIdx) {
  toggledRoutes.value[routeIdx] = true
  expandedRoutes.value[routeIdx] = !expandedRoutes.value[routeIdx]
}

function toggleApi(routeIdx, apiIdx) {
  const key = `${routeIdx}-${apiIdx}`
  expandedApis.value[key] = !expandedApis.value[key]
}

function isRouteExpanded(routeIdx) {
  return !!expandedRoutes.value[routeIdx]
}

function isRouteVisible(routeIdx, route) {
  // Route is visible if explicitly expanded OR auto-expand applies (when not toggled)
  return (
    isRouteExpanded(routeIdx) ||
    (!toggledRoutes.value[routeIdx] && shouldAutoExpand(route))
  )
}

function isApiExpanded(routeIdx, apiIdx) {
  const key = `${routeIdx}-${apiIdx}`
  return !!expandedApis.value[key]
}

function shouldAutoExpand(route) {
  // Auto-expand if only 1 API call or no API calls (just other logs)
  return route.apiCalls.length <= 1
}

function hasRouteChildren(route) {
  // Route has expandable children if it has API calls, other logs, or email logs
  return (
    route.apiCalls.length > 0 ||
    route.otherLogs.length > 0 ||
    (route.emailLogs?.length || 0) > 0
  )
}

async function expand() {
  // Expand this node if it's not already expanded (called by parent via ref).
  if (isTraceGroup.value && !isExpanded.value) {
    await toggleExpand()
  }
  if (isPageLoadGroup.value && !isPageLoadExpanded.value) {
    togglePageLoadExpand()
  }

  // After children are loaded, expand all routes and APIs within this node
  if (isExpanded.value || isPageLoadExpanded.value) {
    // Wait for next tick to ensure children are rendered
    await nextTick()
    expandAllInternal()
  }
}

function expandAllInternal() {
  // Expand all routes within this node
  const routes = hierarchicalTree.value || []
  for (let routeIdx = 0; routeIdx < routes.length; routeIdx++) {
    const route = routes[routeIdx]
    if (hasRouteChildren(route) && !isRouteExpanded(routeIdx)) {
      toggledRoutes.value[routeIdx] = true
      expandedRoutes.value[routeIdx] = true
    }
    // Also expand all APIs within this route
    for (let apiIdx = 0; apiIdx < route.apiCalls.length; apiIdx++) {
      const api = route.apiCalls[apiIdx]
      if (api.serverLogs.length > 0 && !isApiExpanded(routeIdx, apiIdx)) {
        const key = `${routeIdx}-${apiIdx}`
        expandedApis.value[key] = true
      }
    }
  }
}

defineExpose({ expand })
</script>

<style scoped>
.tree-node {
  position: relative;
}

.tree-row {
  display: flex;
  align-items: stretch;
  /* Add consistent left padding so entries without expand buttons align with those that have them */
  padding-left: 60px;
}

.tree-row:has(.tree-toggle-area) {
  /* Remove padding when toggle area is present */
  padding-left: 0;
}

/* Fixed width toggle area for consistent alignment */
.tree-toggle-area {
  flex: 0 0 60px;
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

.duplicate-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 18px;
  padding: 0 6px;
  margin-right: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: #17a2b8;
  border-radius: 9px;
  flex-shrink: 0;
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
  flex: 0 0 200px;
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

.summary-fallback {
  font-size: 0.85rem;
  color: #6c757d;
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

.mobile-indicator {
  color: #6f42c1;
  font-size: 0.9rem;
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

.email-entry {
  background: #f0fff0;
  border-left: 2px solid #28a745;
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

/* Page Load Group styles */
.page-load-group {
  border: 1px solid #bee5eb;
  background: #d1ecf1;
  margin-bottom: 4px;
}

.page-load-header {
  display: flex;
  align-items: stretch;
  cursor: pointer;
  transition: background 0.15s;
}

.page-load-header:hover {
  background: #c3e6ec;
}

.page-load-toggle {
  background: #17a2b8;
}

.page-load-toggle:hover {
  background: #138496;
}

.page-load-summary {
  display: flex;
  align-items: center;
  flex: 1;
  min-height: 40px;
  padding: 6px 0;
}

.page-load-badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.page-load-info {
  font-size: 0.85rem;
  color: #0c5460;
}

.page-load-children {
  margin-left: 24px;
  padding: 4px 0;
  background: #fff;
  border-left: 2px solid #17a2b8;
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
