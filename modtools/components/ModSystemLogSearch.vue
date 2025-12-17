<template>
  <div class="search-bar mb-3">
    <!-- Row 1: ID Filters and Time Range -->
    <b-row class="g-2 align-items-center">
      <!-- User ID -->
      <b-col cols="4" md="2">
        <b-input-group size="sm" class="id-input">
          <b-input-group-text>User</b-input-group-text>
          <b-form-input
            v-model="userIdInput"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="#"
            @keyup.enter="doSearch"
          />
        </b-input-group>
      </b-col>

      <!-- Post ID -->
      <b-col cols="4" md="2">
        <b-input-group size="sm" class="id-input">
          <b-input-group-text>Post</b-input-group-text>
          <b-form-input
            v-model="msgIdInput"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="#"
            @keyup.enter="doSearch"
          />
        </b-input-group>
      </b-col>

      <!-- Group ID -->
      <b-col cols="4" md="2">
        <b-input-group size="sm" class="id-input">
          <b-input-group-text>Group</b-input-group-text>
          <b-form-input
            v-model="groupIdInput"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="#"
            @keyup.enter="doSearch"
          />
        </b-input-group>
      </b-col>

      <!-- IP Address -->
      <b-col cols="6" md="3">
        <b-input-group size="sm" class="id-input">
          <b-input-group-text>IP</b-input-group-text>
          <b-form-input
            v-model="ipInput"
            type="text"
            placeholder="Filter by IP"
            @keyup.enter="doSearch"
          />
        </b-input-group>
      </b-col>

      <!-- Time Range -->
      <b-col cols="6" md="3">
        <b-dropdown
          variant="outline-secondary"
          size="sm"
          class="w-100 time-dropdown"
        >
          <template #button-content>
            <span class="dropdown-label">{{ timeRangeLabel }}</span>
          </template>
          <b-dropdown-item
            v-for="option in timeOptions"
            :key="option.value"
            :active="timeRange === option.value"
            @click="setTimeRange(option.value)"
          >
            {{ option.label }}
          </b-dropdown-item>
        </b-dropdown>
      </b-col>
    </b-row>

    <!-- Row 2: Email Lookup (Search Now will trigger lookup) -->
    <b-row class="g-2 mt-2 align-items-center">
      <b-col cols="12" md="6">
        <b-input-group size="sm">
          <b-input-group-text>Email</b-input-group-text>
          <b-form-input
            v-model="emailInput"
            type="email"
            placeholder="Look up user by email..."
            :disabled="lookingUpEmail"
            autocapitalize="none"
            autocomplete="off"
            @keyup.enter="doSearch"
          />
          <v-icon
            v-if="lookingUpEmail"
            icon="sync"
            class="fa-spin email-spinner"
          />
        </b-input-group>
      </b-col>
      <b-col v-if="emailLookupError" cols="12" md="6">
        <small
          :class="
            emailLookupError.includes('Found') ? 'text-info' : 'text-danger'
          "
        >
          {{ emailLookupError }}
        </small>
      </b-col>
    </b-row>

    <!-- Row 3: Text Search and Search Button -->
    <div class="d-flex gap-2 mt-2 align-items-center filters-row">
      <!-- Text Search (text only, not email) -->
      <div class="flex-grow-1">
        <b-input-group size="sm">
          <b-form-input
            v-model="searchText"
            placeholder="Search in log text..."
            @keyup.enter="doSearch"
          />
          <b-button
            v-if="searchText"
            variant="outline-secondary"
            size="sm"
            @click="clearSearch"
          >
            <v-icon icon="times" />
          </b-button>
        </b-input-group>
      </div>

      <!-- Search Now Button -->
      <b-button
        variant="primary"
        :disabled="loading"
        class="search-btn"
        @click="doSearch"
      >
        <v-icon icon="search" :class="{ 'fa-spin': loading }" />
        {{ loading ? 'Searching...' : 'Search Now' }}
      </b-button>
    </div>

    <!-- Filters Row with Source Dropdown -->
    <div class="filters-bar mt-2 d-flex align-items-center">
      <!-- Left side: Active filters -->
      <div
        class="active-filters-left d-flex align-items-center flex-wrap flex-grow-1"
      >
        <span class="me-2 text-muted small">Filters:</span>
        <b-badge
          v-if="userid"
          variant="info"
          class="me-1 filter-badge"
          @click="clearUserFilter"
        >
          User #{{ userid }}
          <v-icon icon="times" scale="0.7" />
        </b-badge>
        <b-badge
          v-if="msgid"
          variant="info"
          class="me-1 filter-badge"
          @click="clearMsgFilter"
        >
          Post #{{ msgid }}
          <v-icon icon="times" scale="0.7" />
        </b-badge>
        <b-badge
          v-if="groupid > 0"
          variant="info"
          class="me-1 filter-badge"
          @click="clearGroupFilter"
        >
          Group #{{ groupid }}
          <v-icon icon="times" scale="0.7" />
        </b-badge>
        <b-badge
          v-if="traceId"
          variant="secondary"
          class="me-1 filter-badge"
          @click="clearTraceFilter"
        >
          Trace: {{ traceId.slice(0, 8) }}...
          <v-icon icon="times" scale="0.7" />
        </b-badge>
        <b-badge
          v-if="sessionId"
          variant="secondary"
          class="me-1 filter-badge"
          @click="clearSessionFilter"
        >
          Session: {{ sessionId.slice(0, 8) }}...
          <v-icon icon="times" scale="0.7" />
        </b-badge>
        <b-badge
          v-if="ipAddress"
          variant="warning"
          class="me-1 filter-badge"
          @click="clearIpFilter"
        >
          IP: {{ ipAddress }}
          <v-icon icon="times" scale="0.7" />
        </b-badge>
        <b-button
          v-if="hasActiveFilters"
          variant="link"
          size="sm"
          class="p-0"
          @click="clearAllFilters"
        >
          Clear all
        </b-button>
      </div>

      <!-- Right side: App source, Polling checkbox and Source Filters -->
      <div class="app-source-filter me-3">
        <b-button-group size="sm">
          <b-button
            :variant="appSource === 'fd' ? 'primary' : 'outline-secondary'"
            @click="appSource = 'fd'"
          >
            FD
          </b-button>
          <b-button
            :variant="appSource === 'mt' ? 'primary' : 'outline-secondary'"
            @click="appSource = 'mt'"
          >
            MT
          </b-button>
          <b-button
            :variant="appSource === 'both' ? 'primary' : 'outline-secondary'"
            @click="appSource = 'both'"
          >
            Both
          </b-button>
        </b-button-group>
      </div>

      <label class="polling-checkbox me-3 small">
        <input v-model="showPolling" type="checkbox" class="me-1" />
        Show polling
      </label>

      <b-dropdown
        variant="outline-secondary"
        size="sm"
        auto-close="outside"
        class="source-dropdown ms-2"
      >
        <template #button-content>
          <span class="dropdown-label">{{ sourceLabel }}</span>
        </template>
        <b-dropdown-form class="source-filter-form">
          <label
            v-for="source in availableSources"
            :key="source.value"
            class="source-filter-item"
            :title="source.tooltip"
          >
            <input
              v-model="localSources"
              type="checkbox"
              :value="source.value"
              class="source-checkbox"
            />
            <span class="source-label">{{ source.label }}</span>
            <v-icon
              icon="question-circle"
              class="source-help-icon"
              scale="0.7"
            />
          </label>
        </b-dropdown-form>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
import { useSystemLogsStore } from '../stores/systemlogs'
import { useUserStore } from '~/stores/user'

export default {
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
  emits: [
    'search',
    'refresh',
    'clear-user',
    'clear-group',
    'clear-msg',
    'update:userid',
    'update:groupid',
    'update:msgid',
  ],
  setup() {
    const systemLogsStore = useSystemLogsStore()
    const userStore = useUserStore()
    return { systemLogsStore, userStore }
  },
  data() {
    return {
      searchText: '',
      userIdInput: '',
      msgIdInput: '',
      groupIdInput: '',
      ipInput: '',
      emailInput: '',
      lookingUpEmail: false,
      emailLookupError: null,
      localSources: ['client', 'api', 'logs_table', 'email', 'batch'],
      timeOptions: [
        { value: '1h', label: 'Last hour' },
        { value: '24h', label: 'Last day' },
        { value: '7d', label: 'Last week' },
        { value: '30d', label: 'Last month' },
        { value: '365d', label: 'Last year' },
        { value: 'ever', label: 'All time' },
      ],
      availableSources: [
        {
          value: 'client',
          label: 'User Actions',
          tooltip:
            'What users do on the website - clicking buttons, viewing pages, errors they see.',
        },
        {
          value: 'api',
          label: 'API Requests',
          tooltip:
            'Behind-the-scenes requests the website makes - loading data, saving changes.',
        },
        {
          value: 'logs_table',
          label: 'Mod Actions',
          tooltip:
            'Things moderators do - approving posts, editing members, sending messages.',
        },
        {
          value: 'email',
          label: 'Emails',
          tooltip: 'Emails sent to users - digests, notifications, replies.',
        },
        {
          value: 'batch',
          label: 'Batch Jobs',
          tooltip:
            'Automated tasks that run regularly - sending digests, cleaning up old data.',
        },
      ],
    }
  },
  computed: {
    timeRange: {
      get() {
        return this.systemLogsStore.timeRange
      },
      set(value) {
        this.systemLogsStore.setTimeRange(value)
      },
    },
    sortDirection: {
      get() {
        return this.systemLogsStore.sortDirection
      },
      set(value) {
        this.systemLogsStore.setSortDirection(value)
      },
    },
    showPolling: {
      get() {
        return this.systemLogsStore.showPolling
      },
      set(value) {
        this.systemLogsStore.setShowPolling(value)
      },
    },
    appSource: {
      get() {
        return this.systemLogsStore.appSource
      },
      set(value) {
        this.systemLogsStore.setAppSource(value)
      },
    },
    traceId() {
      return this.systemLogsStore.traceId
    },
    sessionId() {
      return this.systemLogsStore.sessionId
    },
    ipAddress() {
      return this.systemLogsStore.ipAddress
    },
    loading() {
      return this.systemLogsStore.loading
    },
    timeRangeLabel() {
      const option = this.timeOptions.find((o) => o.value === this.timeRange)
      return option ? option.label : 'Time'
    },
    sourceLabel() {
      const count = this.localSources.length
      if (count === 0) return 'No sources'
      if (count === this.availableSources.length) return 'All sources'
      if (count === 1) {
        const source = this.availableSources.find(
          (s) => s.value === this.localSources[0]
        )
        return source ? source.label : 'Sources'
      }
      return `${count} sources`
    },
    hasActiveFilters() {
      return (
        this.userid ||
        this.groupid ||
        this.msgid ||
        this.traceId ||
        this.sessionId ||
        this.ipAddress ||
        this.searchText
      )
    },
  },
  watch: {
    userid: {
      immediate: true,
      handler(val) {
        this.userIdInput = val || ''
      },
    },
    groupid: {
      immediate: true,
      handler(val) {
        this.groupIdInput = val || ''
      },
    },
    msgid: {
      immediate: true,
      handler(val) {
        this.msgIdInput = val || ''
      },
    },
    'systemLogsStore.sources': {
      immediate: true,
      handler(val) {
        if (val && val.length > 0) {
          this.localSources = [...val]
        }
      },
    },
  },
  methods: {
    async doSearch() {
      // If email is entered, look it up first
      if (this.emailInput.trim()) {
        await this.lookupEmail()
        // lookupEmail will set userIdInput if found, then we continue
        if (!this.userIdInput) {
          // Email lookup failed, don't search
          return
        }
      }

      // Sync sources to store
      this.systemLogsStore.setSources([...this.localSources])

      // Apply ID filters before searching
      if (this.userIdInput) {
        this.$emit('update:userid', parseInt(this.userIdInput, 10))
      } else {
        this.$emit('update:userid', null)
      }
      if (this.msgIdInput) {
        this.$emit('update:msgid', parseInt(this.msgIdInput, 10))
      } else {
        this.$emit('update:msgid', null)
      }
      if (this.groupIdInput) {
        this.$emit('update:groupid', parseInt(this.groupIdInput, 10))
      } else {
        this.$emit('update:groupid', null)
      }
      if (this.ipInput) {
        this.systemLogsStore.setIpFilter(this.ipInput.trim())
      } else {
        this.systemLogsStore.setIpFilter(null)
      }
      this.systemLogsStore.setSearch(this.searchText)
      this.$emit('search')
    },
    clearSearch() {
      this.searchText = ''
      this.systemLogsStore.setSearch('')
      this.$emit('search')
    },
    setTimeRange(value) {
      this.systemLogsStore.setTimeRange(value)
      this.$emit('search')
    },
    clearUserFilter() {
      this.userIdInput = ''
      this.$emit('clear-user')
    },
    clearMsgFilter() {
      this.msgIdInput = ''
      this.$emit('clear-msg')
    },
    clearGroupFilter() {
      this.groupIdInput = ''
      this.$emit('clear-group')
    },
    clearTraceFilter() {
      this.systemLogsStore.setTraceFilter(null)
      this.$emit('search')
    },
    clearSessionFilter() {
      this.systemLogsStore.setSessionFilter(null)
      this.$emit('search')
    },
    clearIpFilter() {
      this.ipInput = ''
      this.systemLogsStore.setIpFilter(null)
      this.$emit('search')
    },
    clearAllFilters() {
      this.searchText = ''
      this.userIdInput = ''
      this.msgIdInput = ''
      this.groupIdInput = ''
      this.ipInput = ''
      this.emailInput = ''
      this.emailLookupError = null
      this.systemLogsStore.setSearch('')
      this.systemLogsStore.setTraceFilter(null)
      this.systemLogsStore.setSessionFilter(null)
      this.systemLogsStore.setIpFilter(null)
      this.$emit('clear-user')
      this.$emit('clear-group')
      this.$emit('clear-msg')
      this.$emit('search')
    },
    async lookupEmail() {
      const email = this.emailInput.trim()
      if (!email) {
        return
      }

      this.lookingUpEmail = true
      this.emailLookupError = null

      try {
        this.userStore.clear()
        await this.userStore.fetchMT({
          search: email,
          emailhistory: true,
        })

        const users = Object.values(this.userStore.list)
        if (users.length === 0) {
          this.emailLookupError = 'No user found for this email.'
        } else if (users.length === 1) {
          this.userIdInput = users[0].id.toString()
          this.emailInput = ''
        } else {
          this.userIdInput = users[0].id.toString()
          this.emailInput = ''
          this.emailLookupError = `Found ${users.length} users, using first: #${users[0].id}`
        }
      } catch (e) {
        console.error('Email lookup failed:', e)
        this.emailLookupError = 'Failed to lookup email.'
      } finally {
        this.lookingUpEmail = false
      }
    },
  },
}
</script>

<style scoped>
.search-bar {
  background: #fff;
  padding: 16px;
  border: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Dropdown styling */
:deep(.time-dropdown .btn),
:deep(.source-dropdown .btn) {
  background: #fff;
  border-color: #ced4da;
  color: #495057;
  font-size: 0.875rem;
}

:deep(.time-dropdown .btn:hover),
:deep(.source-dropdown .btn:hover) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.dropdown-label {
  color: #212529;
}

/* Source filter dropdown */
.source-filter-form {
  padding: 8px 12px;
  min-width: 160px;
}

.source-filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  cursor: pointer;
  font-size: 0.875rem;
  color: #212529;
  transition: background 0.15s;
  margin: 0;
}

.source-filter-item:hover {
  color: #0d6efd;
}

.source-checkbox {
  width: 16px;
  height: 16px;
  margin: 0;
  cursor: pointer;
  accent-color: #0d6efd;
}

.source-label {
  flex: 1;
  user-select: none;
}

.source-help-icon {
  color: #adb5bd;
  margin-left: auto;
  flex-shrink: 0;
}

/* Input group styling */
:deep(.input-group-text) {
  background: #f8f9fa;
  border-color: #ced4da;
  color: #6c757d;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}

:deep(.form-control) {
  border-color: #ced4da;
}

:deep(.form-control:focus) {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.15rem rgba(13, 110, 253, 0.15);
}

/* Email spinner */
.email-spinner {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

/* Filters bar */
.filters-bar {
  gap: 8px;
}

.active-filters-left {
  gap: 4px;
}

.filter-badge {
  cursor: pointer;
  font-weight: normal;
  font-size: 0.8rem;
  padding: 4px 8px;
  transition: opacity 0.15s;
}

.filter-badge:hover {
  opacity: 0.8;
}

/* Search button */
.search-btn {
  white-space: nowrap;
}

/* Filters row */
.filters-row {
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .filters-row {
    flex-wrap: nowrap;
  }
}

.filters-row .source-dropdown {
  flex-shrink: 0;
}

.filters-row .search-btn {
  flex-shrink: 0;
}

/* App source filter */
.app-source-filter {
  flex-shrink: 0;
}

.app-source-filter .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.app-source-filter .btn.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: #fff;
}

.app-source-filter .btn.btn-outline-secondary {
  background-color: transparent;
  border-color: #6c757d;
  color: #6c757d;
}

.app-source-filter .btn.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: #fff;
}

/* Polling checkbox */
.polling-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #6c757d;
  white-space: nowrap;
  user-select: none;
}

.polling-checkbox:hover {
  color: #495057;
}

.polling-checkbox input {
  cursor: pointer;
  accent-color: #0d6efd;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-bar {
    padding: 12px;
  }

  :deep(.time-dropdown .btn),
  :deep(.source-dropdown .btn) {
    font-size: 0.8rem;
    padding: 0.375rem 0.5rem;
  }

  .collapse-check {
    font-size: 0.8rem;
  }
}
</style>
