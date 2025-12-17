<template>
  <div class="log-entry" :class="entryClass">
    <!-- Main row using flex for consistent alignment -->
    <div class="log-row">
      <!-- Timestamp column -->
      <div class="log-col log-col-time">
        <span class="timestamp font-monospace">{{ formattedTime }}</span>
        <!-- Count badge inline with time when collapsed -->
        <span
          v-if="count > 1"
          class="count-badge"
          role="button"
          :title="`${count} similar entries from ${firstTime} to ${lastTime}. Click to expand.`"
          @click="toggleExpanded"
        >
          <v-icon :icon="isExpanded ? 'minus' : 'plus'" scale="0.6" />
          {{ count }}x
        </span>
        <!-- Placeholder to maintain column alignment when no count badge -->
        <span v-else class="count-badge-placeholder" />
      </div>

      <!-- Source column -->
      <div class="log-col log-col-source">
        <b-badge :variant="sourceVariant" class="source-badge">
          {{ sourceLabel }}
        </b-badge>
      </div>

      <!-- User column (hidden when filtering by user) -->
      <div v-if="!hideUserColumn" class="log-col log-col-user">
        <div v-if="displayUser" class="user-display">
          <ProfileImage
            v-if="displayUser.profile?.url"
            :image="displayUser.profile.url"
            class="user-avatar"
            size="sm"
            is-thumbnail
          />
          <v-icon v-else icon="user" class="user-avatar-placeholder" />
          <div class="user-info-stacked">
            <ExternalLink
              :href="'https://www.ilovefreegle.org/profile/' + displayUser.id"
              class="user-link"
              :title="'View on Freegle: ' + (displayUser.displayname || 'User')"
            >
              {{ displayUser.displayname || 'User' }}
            </ExternalLink>
            <span class="user-id text-muted">#{{ displayUser.id }}</span>
          </div>
        </div>
        <span v-else-if="log.user_id" class="text-muted user-placeholder">
          <v-icon icon="user" class="text-faded" />
          #{{ log.user_id }}
          <span
            v-if="userLoading"
            class="spinner-border spinner-border-sm ms-1"
          />
        </span>
        <span v-else-if="log.source === 'api'" class="text-muted small">
          Not logged in
          <span
            v-if="ipAddress"
            class="ip-address ms-1"
            role="button"
            @click="filterByIp"
          >
            {{ ipAddress }}
          </span>
        </span>
      </div>

      <!-- Action column -->
      <div class="log-col log-col-action" :class="levelClass">
        <div class="action-content">
          <div class="action-main">
            <span class="action-text">{{ actionTextClean }}</span>
            <!-- Crash indicator -->
            <ExternalLink
              v-if="sentryEventId"
              :href="sentryUrl"
              class="sentry-indicator"
              title="View crash details"
            >
              <v-icon icon="exclamation-triangle" scale="0.8" />
            </ExternalLink>
            <!-- Group display -->
            <span v-if="displayGroup" class="entity-tag group-tag">
              <ProfileImage
                v-if="displayGroup.profile"
                :image="displayGroup.profile"
                class="entity-avatar"
                is-thumbnail
              />
              <ExternalLink
                :href="
                  'https://www.ilovefreegle.org/explore/' +
                  displayGroup.nameshort
                "
                :title="'View group on Freegle: ' + displayGroup.nameshort"
              >
                {{ displayGroup.nameshort || displayGroup.namedisplay }}
              </ExternalLink>
            </span>
            <span
              v-else-if="log.group_id"
              class="entity-tag group-tag text-muted"
            >
              group #{{ log.group_id }}
            </span>
            <!-- Message display -->
            <span v-if="log.message_id" class="entity-tag message-tag">
              <v-icon icon="envelope" scale="0.8" />
              <ExternalLink
                :href="'https://www.ilovefreegle.org/message/' + log.message_id"
                :title="'View message on Freegle'"
              >
                {{ messageSubject || `#${log.message_id}` }}
              </ExternalLink>
            </span>
          </div>
          <div
            v-if="rawApiCall || ipAddress || sessionUrl"
            class="api-details text-muted"
          >
            <span v-if="rawApiCall">{{ rawApiCall }}</span>
            <span v-if="duration">{{ duration }}</span>
            <span
              v-if="ipAddress"
              class="ip-address"
              role="button"
              @click="filterByIp"
            >
              {{ ipAddress }}
            </span>
            <span v-if="sessionUrl" class="session-url" :title="sessionUrl">
              {{ sessionUrlDisplay }}
            </span>
          </div>
          <!-- Device info summary for client logs -->
          <div v-if="hasDeviceInfo" class="device-info-summary">
            <span class="device-chip" :title="deviceInfo.type">
              <v-icon :icon="deviceInfo.typeIcon" scale="0.8" />
            </span>
            <span class="device-chip browser-chip" :title="deviceInfo.browser">
              <v-icon :icon="deviceInfo.browserIcon" scale="0.8" />
            </span>
            <span
              v-if="deviceInfo.screenSize"
              class="device-chip screen-chip"
              :title="'Viewport: ' + deviceInfo.screenSize"
            >
              {{ deviceInfo.screenSize }}
            </span>
            <span
              v-if="deviceInfo.isApp"
              class="device-chip app-chip"
              :title="
                deviceInfo.appManufacturer +
                ' ' +
                deviceInfo.appModel +
                ' (' +
                deviceInfo.appPlatform +
                ')' +
                (deviceInfo.appVersion ? ' v' + deviceInfo.appVersion : '')
              "
            >
              <v-icon
                :icon="
                  deviceInfo.appPlatform === 'ios'
                    ? ['fab', 'apple']
                    : ['fab', 'android']
                "
                scale="0.8"
              />
              <span v-if="deviceInfo.appVersion"
                >v{{ deviceInfo.appVersion }}</span
              >
              <span v-else>App</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Details button -->
      <div class="log-col log-col-expand">
        <button
          class="details-btn"
          title="View details"
          @click="showModal = true"
        >
          <v-icon icon="info-circle" />
        </button>
      </div>
    </div>

    <!-- Expanded individual entries when count badge is clicked -->
    <div v-if="count > 1 && isExpanded" class="expanded-entries">
      <div
        v-for="(entry, idx) in entries"
        :key="entry.id || idx"
        class="expanded-entry-row"
      >
        <span class="expanded-time font-monospace text-muted">
          {{ formatEntryTime(entry.timestamp) }}
        </span>
        <span class="expanded-action text-muted">
          {{ formatEntryText(entry) }}
        </span>
      </div>
    </div>

    <!-- Details Modal -->
    <b-modal
      v-model="showModal"
      title="Log Details"
      size="lg"
      hide-footer
      scrollable
    >
      <div class="log-details-modal">
        <!-- Header summary -->
        <div class="detail-header mb-3">
          <b-badge :variant="sourceVariant" class="me-2">{{
            sourceLabel
          }}</b-badge>
          <span class="text-muted">{{ fullTimestamp }}</span>
        </div>

        <!-- Action summary -->
        <div class="detail-section">
          <h6>Action</h6>
          <p class="mb-0">{{ actionText }}</p>
        </div>

        <!-- User info -->
        <div v-if="log.user_id" class="detail-section">
          <h6>User</h6>
          <div class="user-display-block">
            <ProfileImage
              v-if="displayUser?.profile?.url"
              :image="displayUser.profile.url"
              class="user-avatar me-2"
              size="sm"
              is-thumbnail
            />
            <v-icon v-else icon="user" class="me-2" />
            <div v-if="displayUser" class="user-info-block">
              <ExternalLink
                :href="'https://www.ilovefreegle.org/profile/' + displayUser.id"
              >
                {{ displayUser.displayname }}
              </ExternalLink>
              <div class="text-muted small">#{{ displayUser.id }}</div>
            </div>
            <span v-else>#{{ log.user_id }}</span>
          </div>
        </div>

        <!-- By user (if different) -->
        <div
          v-if="log.byuser_id && log.byuser_id !== log.user_id"
          class="detail-section"
        >
          <h6>Action By</h6>
          <div class="user-display-block">
            <ProfileImage
              v-if="byUser?.profile?.url"
              :image="byUser.profile.url"
              class="user-avatar me-2"
              size="sm"
              is-thumbnail
            />
            <v-icon v-else icon="user" class="me-2" />
            <div v-if="byUser" class="user-info-block">
              <ExternalLink
                :href="'https://www.ilovefreegle.org/profile/' + byUser.id"
              >
                {{ byUser.displayname }}
              </ExternalLink>
              <div class="text-muted small">#{{ byUser.id }}</div>
            </div>
            <span v-else>#{{ log.byuser_id }}</span>
          </div>
        </div>

        <!-- Group -->
        <div v-if="log.group_id" class="detail-section">
          <h6>Group</h6>
          <div v-if="displayGroup">
            <ProfileImage
              v-if="displayGroup.profile"
              :image="displayGroup.profile"
              class="entity-avatar me-2"
              is-thumbnail
            />
            <ExternalLink
              :href="
                'https://www.ilovefreegle.org/explore/' + displayGroup.nameshort
              "
            >
              {{ displayGroup.namedisplay || displayGroup.nameshort }}
            </ExternalLink>
            <span class="text-muted ms-1">(#{{ log.group_id }})</span>
          </div>
          <span v-else>#{{ log.group_id }}</span>
        </div>

        <!-- Message -->
        <div v-if="log.message_id" class="detail-section">
          <h6>Message</h6>
          <v-icon icon="envelope" class="me-1" />
          <ExternalLink
            :href="'https://www.ilovefreegle.org/message/' + log.message_id"
          >
            {{ messageSubject || `Message #${log.message_id}` }}
          </ExternalLink>
          <span class="text-muted ms-1">(#{{ log.message_id }})</span>
        </div>

        <!-- Log text -->
        <div v-if="log.text" class="detail-section">
          <h6>Log Text</h6>
          <p class="mb-0">{{ log.text }}</p>
        </div>

        <!-- API call details -->
        <div v-if="rawApiCall" class="detail-section">
          <h6>API Call</h6>
          <code>{{ rawApiCall }}</code>
          <span v-if="duration" class="text-muted ms-2">{{ duration }}</span>
        </div>

        <!-- API Headers (fetched separately) -->
        <div v-if="isApiLog" class="detail-section">
          <h6>Request Headers</h6>
          <div v-if="headersLoading" class="text-muted">
            <span class="spinner-border spinner-border-sm me-2" />
            Loading headers...
          </div>
          <div v-else-if="headersError" class="text-danger small">
            {{ headersError }}
          </div>
          <div v-else-if="apiHeaders?.request_headers">
            <pre class="raw-json small-json">{{
              formatJson(apiHeaders.request_headers)
            }}</pre>
          </div>
          <div v-else class="text-muted small">No headers available</div>
        </div>

        <div
          v-if="isApiLog && apiHeaders?.response_headers"
          class="detail-section"
        >
          <h6>Response Headers</h6>
          <pre class="raw-json small-json">{{
            formatJson(apiHeaders.response_headers)
          }}</pre>
        </div>

        <!-- Query Parameters -->
        <div
          v-if="queryParams && Object.keys(queryParams).length > 0"
          class="detail-section"
        >
          <h6>Query Parameters</h6>
          <pre class="raw-json small-json">{{ formatJson(queryParams) }}</pre>
        </div>

        <!-- Request Body -->
        <div
          v-if="requestBody && Object.keys(requestBody).length > 0"
          class="detail-section"
        >
          <h6>Request Body</h6>
          <pre class="raw-json small-json">{{ formatJson(requestBody) }}</pre>
        </div>

        <!-- Response Body -->
        <div
          v-if="responseBody && Object.keys(responseBody).length > 0"
          class="detail-section"
        >
          <h6>Response</h6>
          <pre class="raw-json small-json">{{ formatJson(responseBody) }}</pre>
        </div>

        <!-- Trace ID -->
        <div v-if="log.trace_id" class="detail-section">
          <h6>Trace ID</h6>
          <code class="me-2">{{ log.trace_id }}</code>
          <b-button
            size="sm"
            variant="outline-secondary"
            @click="filterByTraceAndClose"
          >
            <v-icon icon="filter" scale="0.8" /> Filter by trace
          </b-button>
        </div>

        <!-- Session ID -->
        <div v-if="log.session_id" class="detail-section">
          <h6>Session ID</h6>
          <code class="me-2">{{ log.session_id }}</code>
          <b-button
            size="sm"
            variant="outline-secondary"
            @click="filterBySessionAndClose"
          >
            <v-icon icon="filter" scale="0.8" /> Filter by session
          </b-button>
        </div>

        <!-- IP Address -->
        <div v-if="ipAddress" class="detail-section">
          <h6>IP Address</h6>
          <code class="me-2">{{ ipAddress }}</code>
          <b-button
            size="sm"
            variant="outline-secondary"
            @click="filterByIpAndClose"
          >
            <v-icon icon="filter" scale="0.8" /> Filter by IP
          </b-button>
        </div>

        <!-- Crash Link -->
        <div v-if="sentryEventId" class="detail-section">
          <h6>Crash</h6>
          <ExternalLink :href="sentryUrl" class="sentry-link">
            <v-icon icon="exclamation-triangle" class="me-1" />
            View crash details
          </ExternalLink>
          <code class="ms-2 small text-muted">{{ sentryEventId }}</code>
        </div>

        <!-- Device Info -->
        <div v-if="hasDeviceInfo" class="detail-section">
          <h6>Device Info</h6>
          <div class="device-info-detail">
            <div class="device-info-row">
              <v-icon :icon="deviceInfo.typeIcon" class="device-icon" />
              <span class="device-label">Type:</span>
              <span class="device-value">{{ deviceInfo.type }}</span>
            </div>
            <div class="device-info-row">
              <v-icon :icon="deviceInfo.browserIcon" class="device-icon" />
              <span class="device-label">Browser:</span>
              <span class="device-value">{{ deviceInfo.browser }}</span>
            </div>
            <div class="device-info-row">
              <v-icon icon="laptop" class="device-icon" />
              <span class="device-label">OS:</span>
              <span class="device-value">{{ deviceInfo.os }}</span>
            </div>
            <div v-if="deviceInfo.screenSize" class="device-info-row">
              <v-icon icon="expand" class="device-icon" />
              <span class="device-label">Viewport:</span>
              <span class="device-value">{{ deviceInfo.screenSize }}</span>
            </div>
            <div v-if="deviceInfo.isApp" class="device-info-row">
              <v-icon
                :icon="
                  deviceInfo.appPlatform === 'ios'
                    ? ['fab', 'apple']
                    : ['fab', 'android']
                "
                class="device-icon"
              />
              <span class="device-label">App:</span>
              <span class="device-value">
                {{ deviceInfo.appManufacturer }} {{ deviceInfo.appModel }}
                <span v-if="deviceInfo.appVersion"
                  >(v{{ deviceInfo.appVersion }})</span
                >
              </span>
            </div>
          </div>
        </div>

        <!-- Raw JSON -->
        <div class="detail-section">
          <h6>Raw Data</h6>
          <pre class="raw-json">{{ formattedRaw }}</pre>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { useSystemLogsStore } from '../stores/systemlogs'
import {
  formatLogText,
  getLogLevelClass,
  getLogSourceVariant,
  formatLogTimestamp,
} from '../composables/useSystemLogFormatter'
import { useUserStore } from '~/stores/user'
import { useGroupStore } from '~/stores/group'
import api from '~/api'

export default {
  props: {
    log: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    firstTimestamp: {
      type: String,
      default: null,
    },
    lastTimestamp: {
      type: String,
      default: null,
    },
    entries: {
      type: Array,
      default: () => [],
    },
    hideUserColumn: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['filter-trace', 'filter-session', 'filter-ip'],
  setup() {
    const userStore = useUserStore()
    const groupStore = useGroupStore()
    const systemLogsStore = useSystemLogsStore()
    return { userStore, groupStore, systemLogsStore }
  },
  data() {
    return {
      userLoading: false,
      groupLoading: false,
      isExpanded: false,
      showModal: false,
      // API headers (fetched on demand for v1 API logs)
      apiHeaders: null,
      headersLoading: false,
      headersError: null,
    }
  },
  computed: {
    formattedTime() {
      return formatLogTimestamp(this.log.timestamp, 'short')
    },
    fullTimestamp() {
      return formatLogTimestamp(this.log.timestamp, 'full')
    },
    firstTime() {
      return formatLogTimestamp(
        this.firstTimestamp || this.log.timestamp,
        'short'
      )
    },
    lastTime() {
      return formatLogTimestamp(
        this.lastTimestamp || this.log.timestamp,
        'short'
      )
    },
    sourceLabel() {
      // For logs_table, determine if this is a user action or a mod action.
      // User actions: User type logs where byuser_id equals user_id or is null.
      // Mod actions: Logs where byuser_id differs from user_id (mod acting on user).
      if (this.log.source === 'logs_table') {
        const isModAction =
          this.log.byuser_id &&
          this.log.user_id &&
          this.log.byuser_id !== this.log.user_id
        return isModAction ? 'Mod' : 'User'
      }

      const labels = {
        api: 'API',
        client: 'User',
        email: 'Email',
        batch: 'Batch',
      }
      return labels[this.log.source] || this.log.source
    },
    sourceVariant() {
      // For logs_table, use primary (blue) for user actions, secondary (gray) for mod actions.
      if (this.log.source === 'logs_table') {
        const isModAction =
          this.log.byuser_id &&
          this.log.user_id &&
          this.log.byuser_id !== this.log.user_id
        return isModAction ? 'secondary' : 'primary'
      }
      return getLogSourceVariant(this.log.source)
    },
    levelClass() {
      return getLogLevelClass(this.log)
    },
    actionText() {
      return formatLogText(this.log)
    },
    actionTextClean() {
      // Remove duration from action text (we display it separately)
      let text = this.actionText.replace(/\s*\(\d+ms\)\s*$/, '').trim()

      // Enrich with actual entity names where we have them
      // Replace user #ID with username
      if (this.displayUser?.displayname) {
        text = text.replace(
          new RegExp(`user #${this.log.user_id}\\b`, 'gi'),
          this.displayUser.displayname
        )
      }

      // Replace group #ID with group name
      if (this.displayGroup?.nameshort) {
        text = text.replace(
          new RegExp(`group #${this.log.group_id}\\b`, 'gi'),
          this.displayGroup.nameshort
        )
      }

      return text
    },
    duration() {
      // Extract duration from action text or raw data
      const match = this.actionText.match(/\((\d+ms)\)/)
      if (match) return match[1]
      const raw = this.log.raw || {}
      if (raw.duration_ms) return `${Math.round(raw.duration_ms)}ms`
      return null
    },
    rawApiCall() {
      // Show raw API call for API source logs
      if (this.log.source !== 'api') return null
      const raw = this.log.raw || {}
      const method = raw.method || 'GET'
      // v2 uses 'path' (e.g., "/apiv2/messages"), v1 uses 'call' (e.g., "messages")
      let endpoint = raw.endpoint || raw.path || raw.call
      if (!endpoint) return null
      // Ensure endpoint starts with a slash and has proper prefix
      if (!endpoint.startsWith('/')) {
        // v1 API - add /api/ prefix
        endpoint = '/api/' + endpoint
      }
      return `${method} ${endpoint}`
    },
    entryClass() {
      const classes = []
      // For API logs, only show error styling for actual errors:
      // - HTTP 5xx status codes
      // - v1 API responses where ret.status != 0
      // Normal 401/403 responses are NOT errors.
      if (this.log.source === 'api') {
        const raw = this.log.raw || {}
        const statusCode = raw.status_code || raw.status || 200
        const retStatus = raw.response_body?.ret || raw.ret
        if (statusCode >= 500 || (retStatus !== undefined && retStatus !== 0)) {
          classes.push('log-error')
        }
      } else if (this.log.level === 'error') {
        classes.push('log-error')
      } else if (this.log.level === 'warn') {
        classes.push('log-warn')
      }
      return classes
    },
    displayUser() {
      if (this.log.user_id) {
        return this.userStore.list[this.log.user_id]
      }
      return null
    },
    byUser() {
      if (this.log.byuser_id) {
        return this.userStore.list[this.log.byuser_id]
      }
      return null
    },
    displayGroup() {
      if (this.log.group_id) {
        return this.groupStore.list[this.log.group_id]
      }
      return null
    },
    messageSubject() {
      // Try to get subject from raw data
      const raw = this.log.raw || {}
      return raw.message?.subject || raw.subject || null
    },
    formattedRaw() {
      return JSON.stringify(this.log.raw || {}, null, 2)
    },
    ipAddress() {
      const raw = this.log.raw || {}
      const ip = raw.ip || raw.ip_address || raw.client_ip || null
      // Filter out placeholder addresses that aren't useful.
      if (ip === '0.0.0.0' || ip === '::') {
        return null
      }
      return ip
    },
    sessionUrl() {
      // Get the page URL from client logs.
      const raw = this.log.raw || {}
      return raw.url || null
    },
    sessionUrlDisplay() {
      // Show a shortened version of the URL (pathname only).
      if (!this.sessionUrl) return null
      try {
        const url = new URL(this.sessionUrl)
        // Show pathname, truncated if long.
        const path = url.pathname + url.search
        return path.length > 50 ? path.substring(0, 47) + '...' : path
      } catch {
        return this.sessionUrl.substring(0, 50)
      }
    },
    queryParams() {
      const raw = this.log.raw || {}
      return raw.query_params || null
    },
    requestBody() {
      const raw = this.log.raw || {}
      return raw.request_body || null
    },
    responseBody() {
      const raw = this.log.raw || {}
      return raw.response_body || null
    },
    // Check if this is an API log (headers are logged separately for both v1 and v2)
    isApiLog() {
      return this.log.source === 'api'
    },
    // Get the request_id for correlation with headers
    requestId() {
      const raw = this.log.raw || {}
      return raw.request_id || null
    },
    /* Device info parsing for session_start and client logs */
    deviceInfo() {
      const raw = this.log.raw || {}
      const ua = raw.user_agent || this.log.user_agent || ''
      if (!ua) return null

      const info = {
        type: 'desktop',
        typeIcon: 'desktop',
        browser: 'unknown',
        browserIcon: 'globe-europe',
        os: 'unknown',
        screenSize: null,
      }

      // Detect device type
      if (/mobile|android.*mobile|iphone|ipod/i.test(ua)) {
        info.type = 'mobile'
        info.typeIcon = 'mobile-alt'
      } else if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) {
        info.type = 'tablet'
        info.typeIcon = 'tablet-alt'
      }

      // Detect browser - use FontAwesome brand icons.
      if (/edg/i.test(ua)) {
        info.browser = 'Edge'
        info.browserIcon = ['fab', 'edge']
      } else if (/chrome/i.test(ua) && !/edg/i.test(ua)) {
        info.browser = 'Chrome'
        info.browserIcon = ['fab', 'chrome']
      } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        info.browser = 'Safari'
        info.browserIcon = ['fab', 'safari']
      } else if (/firefox/i.test(ua)) {
        info.browser = 'Firefox'
        info.browserIcon = ['fab', 'firefox-browser']
      }

      // Detect OS
      if (/windows/i.test(ua)) {
        info.os = 'Windows'
      } else if (/macintosh|mac os/i.test(ua)) {
        info.os = 'macOS'
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        info.os = 'iOS'
      } else if (/android/i.test(ua)) {
        info.os = 'Android'
      } else if (/linux/i.test(ua)) {
        info.os = 'Linux'
      }

      // Get screen size from raw data (session_start logs)
      if (raw.viewport_width && raw.viewport_height) {
        info.screenSize = `${raw.viewport_width}×${raw.viewport_height}`
      }

      // Get app-specific info
      if (raw.app_platform) {
        info.isApp = true
        info.appPlatform = raw.app_platform
        info.appModel = raw.app_model
        info.appManufacturer = raw.app_manufacturer
        info.appVersion = raw.app_version || null
      }

      return info
    },
    hasDeviceInfo() {
      return (
        this.deviceInfo &&
        (this.deviceInfo.browser !== 'unknown' || this.deviceInfo.screenSize)
      )
    },
    sentryEventId() {
      // Get Sentry event ID from raw data for error logs.
      const raw = this.log.raw || {}
      return raw.sentry_event_id || null
    },
    sentryUrl() {
      // Generate Sentry URL for the event.
      if (!this.sentryEventId) return null
      // Freegle Sentry organization and project.
      return `https://freegle.sentry.io/issues/?query=${this.sentryEventId}`
    },
  },
  watch: {
    'log.user_id': {
      immediate: true,
      handler(id) {
        if (id && !this.userStore.list[id]) {
          this.fetchUser(id)
        }
      },
    },
    'log.byuser_id': {
      immediate: true,
      handler(id) {
        if (id && !this.userStore.list[id]) {
          this.fetchUser(id)
        }
      },
    },
    'log.group_id': {
      immediate: true,
      handler(id) {
        if (id && !this.groupStore.list[id]) {
          this.fetchGroup(id)
        }
      },
    },
    showModal(newVal) {
      // Fetch headers when modal opens for API logs
      if (newVal && this.isApiLog && !this.apiHeaders && !this.headersLoading) {
        this.fetchApiHeaders()
      }
    },
  },
  methods: {
    async fetchUser(id) {
      if (!id) return
      this.userLoading = true
      try {
        await this.userStore.fetch(id)
      } catch (e) {
        console.error('Failed to fetch user', id, e)
      } finally {
        this.userLoading = false
      }
    },
    async fetchGroup(id) {
      if (!id) return
      this.groupLoading = true
      try {
        await this.groupStore.fetch(id)
      } catch (e) {
        console.error('Failed to fetch group', id, e)
      } finally {
        this.groupLoading = false
      }
    },
    formatEntryTime(timestamp) {
      return formatLogTimestamp(timestamp, 'short')
    },
    formatEntryText(entry) {
      return formatLogText(entry)
    },
    formatJson(data) {
      return JSON.stringify(data, null, 2)
    },
    toggleExpanded() {
      this.isExpanded = !this.isExpanded
    },
    filterByTrace() {
      this.$emit('filter-trace', this.log.trace_id)
    },
    filterBySession() {
      this.$emit('filter-session', this.log.session_id)
    },
    filterByIp() {
      this.$emit('filter-ip', this.ipAddress)
    },
    filterByTraceAndClose() {
      this.showModal = false
      this.$emit('filter-trace', this.log.trace_id)
    },
    filterBySessionAndClose() {
      this.showModal = false
      this.$emit('filter-session', this.log.session_id)
    },
    filterByIpAndClose() {
      this.showModal = false
      this.$emit('filter-ip', this.ipAddress)
    },
    async fetchApiHeaders() {
      if (!this.isApiLog) return

      this.headersLoading = true
      this.headersError = null

      try {
        const config = useRuntimeConfig()

        let response
        if (this.requestId) {
          // Use request_id for precise correlation
          response = await api(config).systemlogs.fetchHeadersByRequestId(
            this.requestId
          )
        } else {
          // Fallback to timestamp-based matching for older logs
          const raw = this.log.raw || {}
          response = await api(config).systemlogs.fetchHeadersByTimestamp(
            this.log.timestamp,
            raw.endpoint || raw.call,
            this.log.user_id
          )
        }

        if (response.logs && response.logs.length > 0) {
          // Find the best match (by request_id if available)
          const match = this.requestId
            ? response.logs.find((l) => l.raw?.request_id === this.requestId)
            : response.logs[0]
          if (match) {
            this.apiHeaders = match.raw || {}
          }
        }
      } catch (e) {
        console.error('Failed to fetch API headers', e)
        this.headersError = e.message || 'Failed to fetch headers'
      } finally {
        this.headersLoading = false
      }
    },
  },
}
</script>

<style scoped>
.log-entry {
  border-bottom: 1px solid #eee;
  position: relative;
}

.log-entry:hover {
  background: #f8f9fa;
}

.log-entry.log-error {
  background: #fff5f5;
  border-left: 3px solid #dc3545;
}

.log-entry.log-warn {
  background: #fffbf0;
  border-left: 3px solid #ffc107;
}

/* Main row layout */
.log-row {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  min-height: 36px;
}

.log-col {
  padding: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-col-time {
  flex: 0 0 160px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-col-source {
  flex: 0 0 70px;
}

.log-col-user {
  flex: 0 0 180px;
  position: relative;
}

.log-col-action {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.log-col-expand {
  flex: 0 0 30px;
  text-align: center;
}

/* Timestamp */
.timestamp {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Count badge - distinct from source badges */
.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: #e9ecef;
  color: #495057;
  border: 1px solid #ced4da;
  padding: 1px 6px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 40px;
}

.count-badge:hover {
  background: #dee2e6;
  border-color: #adb5bd;
}

/* Placeholder to maintain alignment when no count badge */
.count-badge-placeholder {
  display: inline-block;
  min-width: 40px;
  height: 1em;
}

/* Source badge */
.source-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 2px 6px;
}

/* User display */
.user-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.user-avatar {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  max-width: 32px !important;
  max-height: 32px !important;
  border-radius: 50%;
  object-fit: cover;
}

:deep(.user-avatar img),
:deep(.user-avatar .b-avatar),
.user-avatar :deep(img) {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  max-width: 32px !important;
  max-height: 32px !important;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  color: #adb5bd;
}

.user-avatar-sm {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.user-info {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.user-info-stacked {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-link {
  font-size: 0.85rem;
  text-decoration: none;
  color: #212529;
}

.user-link:hover {
  text-decoration: underline;
}

.user-id {
  font-size: 0.7rem;
}

.user-placeholder {
  font-size: 0.8rem;
}

/* User continuation indicator - continuous vertical line on entry */
.log-entry.has-user-continuation::after {
  content: '';
  position: absolute;
  /* Position at user column: row-padding(12) + time(160) + source(70) + 12px into user col */
  left: 254px;
  top: -1px;
  bottom: -1px;
  width: 2px;
  background: #dee2e6;
  z-index: 2;
}

.user-same-indicator {
  display: none;
}

.user-continuation {
  /* Keep column layout but hide content */
}

/* Action text */
.action-text {
  font-size: 0.85rem;
}

/* Duration */
.duration {
  font-size: 0.7rem;
}

/* API details */
.api-details {
  font-size: 0.7rem;
  font-family: monospace;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* IP address */
.ip-address {
  color: #6c757d;
  cursor: pointer;
  transition: color 0.15s;
}

.ip-address:hover {
  color: #0d6efd;
  text-decoration: underline;
}

/* Crash indicator */
.sentry-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  color: #dc3545;
  transition: color 0.15s;
}

.sentry-indicator:hover {
  color: #b02a37;
}

/* Crash link button in details modal */
.sentry-link {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background-color: #dc3545;
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.sentry-link:hover {
  background-color: #b02a37;
  color: white;
  text-decoration: none;
}

/* Session URL */
.session-url {
  color: #6c757d;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Entity tags */
.entity-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  font-size: 0.8rem;
}

.entity-avatar {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.group-tag {
  background: #e7f3ff;
  color: #0056b3;
}

.group-tag a {
  color: inherit;
  text-decoration: none;
}

.group-tag a:hover {
  text-decoration: underline;
}

.message-tag {
  background: #e8f5e9;
  color: #2e7d32;
}

.message-tag a {
  color: inherit;
  text-decoration: none;
}

.message-tag a:hover {
  text-decoration: underline;
}

/* Trace/session badges */
.trace-badge,
.session-badge {
  background: #6c757d;
  color: white;
  padding: 1px 5px;
  font-size: 0.65rem;
  font-family: monospace;
}

.trace-badge.clickable,
.session-badge.clickable {
  cursor: pointer;
}

.trace-badge.clickable:hover,
.session-badge.clickable:hover {
  background: #5a6268;
}

/* Details button */
.details-btn {
  background: none;
  border: none;
  padding: 4px 6px;
  color: #adb5bd;
  cursor: pointer;
  transition: color 0.15s;
}

.details-btn:hover {
  color: #0d6efd;
}

/* Expanded entries when count badge clicked */
.expanded-entries {
  margin-left: 172px;
  padding: 4px 12px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.expanded-entry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 0;
  font-size: 0.8rem;
}

.expanded-time {
  flex: 0 0 100px;
  font-size: 0.75rem;
}

.expanded-action {
  flex: 1;
  font-size: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .log-col-time {
    flex: 0 0 140px;
  }

  .log-col-user {
    flex: 0 0 140px;
  }

  .time-range-expanded {
    padding-left: 12px;
  }
}

@media (max-width: 768px) {
  .log-row {
    flex-wrap: wrap;
    padding: 8px;
  }

  .log-col-time {
    flex: 0 0 50%;
    order: 1;
  }

  .log-col-source {
    flex: 0 0 auto;
    order: 2;
  }

  .log-col-expand {
    flex: 0 0 auto;
    order: 3;
    margin-left: auto;
  }

  .log-col-user {
    flex: 0 0 100%;
    order: 4;
    padding-top: 4px;
  }

  .log-col-action {
    flex: 0 0 100%;
    order: 5;
    padding-top: 4px;
  }

  .time-range-expanded {
    margin-left: 0;
    padding-left: 8px;
  }
}

/* Modal styling */
.log-details-modal {
  padding: 0;
}

.detail-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.detail-section {
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f4;
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h6 {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin-bottom: 6px;
}

.detail-section p,
.detail-section code {
  font-size: 0.9rem;
}

.detail-section code {
  background: #f8f9fa;
  padding: 2px 6px;
  font-size: 0.8rem;
}

.user-display-block {
  display: flex;
  align-items: flex-start;
}

.user-info-block {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.log-details-modal .raw-json {
  font-size: 0.75rem;
  max-height: 300px;
  overflow: auto;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 12px;
  margin-top: 4px;
}

.log-details-modal .small-json {
  max-height: 150px;
  font-size: 0.7rem;
}

/* Device info summary (inline in log row) */
.device-info-summary {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
}

.device-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 5px;
  font-size: 0.65rem;
  background: #f1f3f5;
  color: #495057;
  border: 1px solid #dee2e6;
}

.device-chip.browser-chip {
  background: #e7f3ff;
  border-color: #b3d9ff;
  color: #0056b3;
}

.device-chip.screen-chip {
  background: #f8f9fa;
  border-color: #ced4da;
  color: #6c757d;
  font-family: monospace;
}

.device-chip.app-chip {
  background: #e8f5e9;
  border-color: #a5d6a7;
  color: #2e7d32;
}

/* Device info detail (in modal) */
.device-info-detail {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-info-row {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.device-info-row .device-icon {
  width: 24px;
  min-width: 24px;
  flex-shrink: 0;
  text-align: center;
  margin-right: 8px;
}

.device-info-row .device-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 70px;
  width: 70px;
  flex-shrink: 0;
}

.device-info-row .device-value {
  flex: 1;
}
</style>
