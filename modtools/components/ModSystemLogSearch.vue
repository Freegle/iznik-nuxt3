<template>
  <div class="search-bar mb-3">
    <!-- Row 1: User-related filters (User ID, Email, IP) with user icon -->
    <b-row class="g-2 align-items-center">
      <b-col cols="12" md="6">
        <div class="filter-group">
          <div class="filter-group-header">
            <v-icon icon="user" class="filter-group-icon" />
            <span class="filter-group-label">User</span>
          </div>
          <div class="filter-group-inputs">
            <b-input-group size="sm" class="id-input">
              <b-input-group-text>#</b-input-group-text>
              <b-form-input
                v-model="userIdInput"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                placeholder="ID"
                @keyup.enter="doSearch"
              />
            </b-input-group>
            <b-input-group size="sm" class="flex-grow-1 email-input-group">
              <b-form-input
                v-model="emailInput"
                type="email"
                placeholder="Email"
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
            <b-input-group size="sm" class="ip-input">
              <b-form-input
                v-model="ipInput"
                type="text"
                placeholder="IP"
                @keyup.enter="doSearch"
              />
            </b-input-group>
          </div>
          <small
            v-if="emailLookupError"
            :class="
              emailLookupError.includes('Found') ? 'text-info' : 'text-danger'
            "
          >
            {{ emailLookupError }}
          </small>
        </div>
      </b-col>

      <!-- Post filter with envelope icon -->
      <b-col cols="6" md="2">
        <div class="filter-group">
          <div class="filter-group-header">
            <v-icon icon="envelope" class="filter-group-icon" />
            <span class="filter-group-label">Post</span>
          </div>
          <b-input-group size="sm" class="id-input">
            <b-input-group-text>#</b-input-group-text>
            <b-form-input
              v-model="msgIdInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="ID"
              @keyup.enter="doSearch"
            />
          </b-input-group>
        </div>
      </b-col>

      <!-- Group filter with users icon -->
      <b-col cols="6" md="2">
        <div class="filter-group">
          <div class="filter-group-header">
            <v-icon icon="users" class="filter-group-icon" />
            <span class="filter-group-label">Group</span>
          </div>
          <b-input-group size="sm" class="id-input">
            <b-input-group-text>#</b-input-group-text>
            <b-form-input
              v-model="groupIdInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="ID"
              @keyup.enter="doSearch"
            />
          </b-input-group>
        </div>
      </b-col>
    </b-row>

    <!-- Row 2: Time Range, Search Button, Expand All, and Controls -->
    <div class="d-flex gap-2 mt-2 align-items-center filters-row">
      <!-- Time Range -->
      <b-dropdown variant="outline-secondary" class="time-dropdown">
        <template #button-content>
          <v-icon icon="clock" class="me-1" />
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

      <!-- Expand All Button -->
      <b-button variant="primary" @click="$emit('expand-all')">
        <v-icon icon="expand" />
        Expand All
      </b-button>

      <div class="flex-grow-1" />

      <label class="polling-checkbox small">
        <input v-model="showPolling" type="checkbox" class="me-1" />
        Show polling
      </label>
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
    'expand-all',
  ],
  setup() {
    const systemLogsStore = useSystemLogsStore()
    const userStore = useUserStore()
    return { systemLogsStore, userStore }
  },
  data() {
    return {
      userIdInput: '',
      msgIdInput: '',
      groupIdInput: '',
      ipInput: '',
      emailInput: '',
      lookingUpEmail: false,
      emailLookupError: null,
      timeOptions: [
        { value: '1h', label: 'Last hour' },
        { value: '24h', label: 'Last day' },
        { value: '7d', label: 'Last week' },
        { value: '30d', label: 'Last month' },
        { value: '365d', label: 'Last year' },
        { value: 'ever', label: 'All time' },
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
    hasActiveFilters() {
      return (
        this.userid ||
        this.groupid ||
        this.msgid ||
        this.traceId ||
        this.sessionId ||
        this.ipAddress
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
  },
  methods: {
    async doSearch() {
      // If email is entered, look it up first to get user ID
      if (this.emailInput.trim()) {
        await this.lookupEmail()
        // Even if user not found, we still search by email address
      }

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
      // Set email filter to search by email address in logs (in addition to user ID)
      if (this.emailInput.trim()) {
        this.systemLogsStore.setEmailFilter(this.emailInput.trim())
      } else {
        this.systemLogsStore.setEmailFilter(null)
      }
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
      this.userIdInput = ''
      this.msgIdInput = ''
      this.groupIdInput = ''
      this.ipInput = ''
      this.emailInput = ''
      this.emailLookupError = null
      this.systemLogsStore.setTraceFilter(null)
      this.systemLogsStore.setSessionFilter(null)
      this.systemLogsStore.setIpFilter(null)
      this.systemLogsStore.setEmailFilter(null)
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
          this.emailLookupError =
            'No user found for this email - searching by email only.'
        } else if (users.length === 1) {
          this.userIdInput = users[0].id.toString()
          // Keep email in field - we'll search by BOTH user ID and email
        } else {
          this.userIdInput = users[0].id.toString()
          // Keep email in field - we'll search by BOTH user ID and email
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

/* Filter group styling */
.filter-group {
  background: #f8f9fa;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
}

.filter-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.filter-group-icon {
  color: #6c757d;
  font-size: 0.9rem;
}

.filter-group-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group-inputs {
  display: flex;
  gap: 4px;
  align-items: center;
}

.filter-group-inputs .id-input {
  width: 90px;
  flex-shrink: 0;
}

.filter-group-inputs .ip-input {
  width: 90px;
  flex-shrink: 0;
}

.filter-group-inputs :deep(.form-control) {
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
}

.filter-group-inputs :deep(.input-group-text) {
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
}

/* Dropdown styling */
:deep(.time-dropdown .btn) {
  background: #fff;
  border-color: #ced4da;
  color: #495057;
  font-size: 0.875rem;
}

:deep(.time-dropdown .btn:hover) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.dropdown-label {
  color: #212529;
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

/* Email input with spinner */
.email-input-group {
  position: relative;
}

.email-spinner {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 5;
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

.filters-row .search-btn {
  flex-shrink: 0;
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
