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

<script setup>
import { ref, computed, watch } from 'vue'
import { useSystemLogsStore } from '../stores/systemlogs'
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

const emit = defineEmits([
  'search',
  'refresh',
  'clear-user',
  'clear-group',
  'clear-msg',
  'update:userid',
  'update:groupid',
  'update:msgid',
  'expand-all',
])

const systemLogsStore = useSystemLogsStore()
const userStore = useUserStore()

const userIdInput = ref('')
const msgIdInput = ref('')
const groupIdInput = ref('')
const ipInput = ref('')
const emailInput = ref('')
const lookingUpEmail = ref(false)
const emailLookupError = ref(null)
const timeOptions = [
  { value: '1h', label: 'Last hour' },
  { value: '24h', label: 'Last day' },
  { value: '7d', label: 'Last week' },
  { value: '30d', label: 'Last month' },
  { value: '365d', label: 'Last year' },
  { value: 'ever', label: 'All time' },
]

const timeRange = computed({
  get() {
    return systemLogsStore.timeRange
  },
  set(value) {
    systemLogsStore.setTimeRange(value)
  },
})

const showPolling = computed({
  get() {
    return systemLogsStore.showPolling
  },
  set(value) {
    systemLogsStore.setShowPolling(value)
  },
})

const loading = computed(() => systemLogsStore.loading)

const timeRangeLabel = computed(() => {
  const option = timeOptions.find((o) => o.value === timeRange.value)
  return option ? option.label : 'Time'
})

watch(
  () => props.userid,
  (val) => {
    userIdInput.value = val || ''
  },
  { immediate: true }
)

watch(
  () => props.groupid,
  (val) => {
    groupIdInput.value = val || ''
  },
  { immediate: true }
)

watch(
  () => props.msgid,
  (val) => {
    msgIdInput.value = val || ''
  },
  { immediate: true }
)

async function doSearch() {
  // If email is entered, clear user ID first then look up to get the correct user ID
  if (emailInput.value.trim()) {
    userIdInput.value = ''
    await lookupEmail()
    // Even if user not found, we still search by email address
  }

  // Apply ID filters before searching
  if (userIdInput.value) {
    emit('update:userid', parseInt(userIdInput.value, 10))
  } else {
    emit('update:userid', null)
  }
  if (msgIdInput.value) {
    emit('update:msgid', parseInt(msgIdInput.value, 10))
  } else {
    emit('update:msgid', null)
  }
  if (groupIdInput.value) {
    emit('update:groupid', parseInt(groupIdInput.value, 10))
  } else {
    emit('update:groupid', null)
  }
  if (ipInput.value) {
    systemLogsStore.setIpFilter(ipInput.value.trim())
  } else {
    systemLogsStore.setIpFilter(null)
  }
  // Set email filter to search by email address in logs (in addition to user ID)
  if (emailInput.value.trim()) {
    systemLogsStore.setEmailFilter(emailInput.value.trim())
  } else {
    systemLogsStore.setEmailFilter(null)
  }
  emit('search')
}

function setTimeRange(value) {
  systemLogsStore.setTimeRange(value)
  emit('search')
}

async function lookupEmail() {
  const email = emailInput.value.trim()
  if (!email) {
    return
  }

  lookingUpEmail.value = true
  emailLookupError.value = null

  try {
    userStore.clear()
    await userStore.fetchMT({
      search: email,
      emailhistory: true,
    })

    const users = Object.values(userStore.list)
    if (users.length === 0) {
      emailLookupError.value =
        'No user found for this email - searching by email only.'
    } else if (users.length === 1) {
      userIdInput.value = users[0].id.toString()
      // Keep email in field - we'll search by BOTH user ID and email
    } else {
      userIdInput.value = users[0].id.toString()
      // Keep email in field - we'll search by BOTH user ID and email
      emailLookupError.value = `Found ${users.length} users, using first: #${users[0].id}`
    }
  } catch (e) {
    console.error('Email lookup failed:', e)
    emailLookupError.value = 'Failed to lookup email.'
  } finally {
    lookingUpEmail.value = false
  }
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
  right: 8px;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  color: #6c757d;
  z-index: 5;
  pointer-events: none;
  font-size: 0.8rem;
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
