<template>
  <div class="incoming-email-container">
    <NoticeMessage variant="info" class="mb-3">
      <p class="mb-0">
        <strong>Incoming email routing.</strong> Shows emails received and how
        they were routed.
      </p>
    </NoticeMessage>

    <!-- Shared date filter -->
    <ModEmailDateFilter
      :loading="store.incomingLoading"
      fetch-label="Fetch"
      default-preset="day"
      @fetch="onFilterFetch"
    />

    <!-- Headline stats cards - grouped by delivered/not delivered -->
    <div v-if="totalIncomingCount > 0" class="mb-3">
      <!-- Total -->
      <div class="stats-flex mb-2">
        <ModEmailStatCard
          :value="totalIncomingCount"
          label="Total"
          clickable
          :active="!store.incomingOutcomeFilter"
          value-color="primary"
          @click="filterOutcome('')"
        />
      </div>

      <!-- Delivered outcomes -->
      <div v-if="deliveredOutcomes.length > 0" class="stats-group mb-2">
        <div class="stats-group-label text-success">
          <v-icon name="bi-check-circle" class="me-1" />
          Delivered
        </div>
        <div class="stats-flex">
          <ModEmailStatCard
            v-for="item in deliveredOutcomes"
            :key="item.outcome"
            :value="item.count"
            :label="item.outcome"
            clickable
            :active="store.incomingOutcomeFilter === item.outcome"
            @click="filterOutcome(item.outcome)"
          />
        </div>
      </div>

      <!-- Not delivered outcomes -->
      <div v-if="notDeliveredOutcomes.length > 0" class="stats-group mb-2">
        <div class="stats-group-label text-danger">
          <v-icon name="bi-x-circle" class="me-1" />
          Not Delivered
        </div>
        <div class="stats-flex">
          <ModEmailStatCard
            v-for="item in notDeliveredOutcomes"
            :key="item.outcome"
            :value="item.count"
            :label="item.outcome"
            clickable
            :active="store.incomingOutcomeFilter === item.outcome"
            @click="filterOutcome(item.outcome)"
          />
        </div>
      </div>

      <!-- Error outcomes (failed to parse/process) -->
      <div v-if="errorOutcomes.length > 0" class="stats-group">
        <div class="stats-group-label text-warning">
          <v-icon name="bi-exclamation-triangle" class="me-1" />
          Error
        </div>
        <div class="stats-flex">
          <ModEmailStatCard
            v-for="item in errorOutcomes"
            :key="item.outcome"
            :value="item.count"
            :label="item.outcome"
            clickable
            :active="store.incomingOutcomeFilter === item.outcome"
            @click="filterOutcome(item.outcome)"
          />
        </div>
      </div>

      <!-- Bounces received -->
      <div v-if="bounceStats.total > 0" class="stats-group mt-2">
        <div class="stats-group-label text-danger">
          <v-icon name="bi-envelope-x" class="me-1" />
          Bounces Received
        </div>
        <div class="stats-flex">
          <ModEmailStatCard
            :value="bounceStats.total"
            label="Total"
            value-color="danger"
            clickable
            :active="bounceFilter === 'all'"
            @click="filterBounce('all')"
          />
          <ModEmailStatCard
            :value="bounceStats.permanent"
            label="Permanent"
            value-color="danger"
            clickable
            :active="bounceFilter === 'permanent'"
            @click="filterBounce('permanent')"
          />
          <ModEmailStatCard
            :value="bounceStats.temporary"
            label="Temporary"
            value-color="warning"
            clickable
            :active="bounceFilter === 'temporary'"
            @click="filterBounce('temporary')"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.incomingLoading && !store.incomingEntries.length">
      <div class="text-center py-3">
        <span class="spinner-border spinner-border-sm" />
        Loading...
      </div>
    </div>

    <!-- Error -->
    <NoticeMessage v-if="store.incomingError" variant="danger" class="mb-3">
      {{ store.incomingError }}
    </NoticeMessage>

    <!-- No data -->
    <NoticeMessage
      v-if="
        !store.incomingLoading &&
        !store.incomingCountsLoading &&
        !store.incomingError &&
        store.incomingCountsTotal === 0 &&
        store.incomingEntries.length === 0
      "
      variant="warning"
    >
      No incoming email logs found for this time range. Make sure incoming email
      logging is enabled and Loki is receiving logs.
    </NoticeMessage>

    <!-- Charts -->
    <ModIncomingEmailCharts />

    <!-- Search -->
    <div class="mb-3">
      <b-input
        v-model="searchInput"
        placeholder="Search by from, to, subject, or outcome..."
        size="sm"
        @input="onSearchInput"
      />
    </div>

    <!-- Results table -->
    <div v-if="displayedEntries.length > 0">
      <b-table
        :items="displayedEntries"
        :fields="fields"
        striped
        hover
        small
        responsive
        :sort-by="[{ key: 'timestamp', order: 'desc' }]"
        class="clickable-rows"
        @row-clicked="onRowClick"
      >
        <template #cell(timestamp)="data">
          {{ formatEmailDate(data.value) }}
        </template>
        <template #cell(routing_outcome)="data">
          <b-badge :variant="outcomeVariant(data.value)">
            {{ formatOutcomeLabel(data.item) }}
          </b-badge>
        </template>
        <template #cell(envelope_from)="data">
          <span class="text-truncate d-inline-block" style="max-width: 200px">
            {{ data.value }}
          </span>
        </template>
        <template #cell(envelope_to)="data">
          <span class="text-truncate d-inline-block" style="max-width: 200px">
            {{ data.value }}
          </span>
        </template>
        <template #cell(subject)="data">
          <span class="text-truncate d-inline-block" style="max-width: 300px">
            {{ data.value }}
          </span>
        </template>
      </b-table>

      <!-- Load more -->
      <div v-if="store.incomingHasMore" class="text-center mt-2">
        <b-button
          size="sm"
          variant="outline-primary"
          :disabled="store.incomingLoading"
          @click="loadMore"
        >
          <span
            v-if="store.incomingLoading"
            class="spinner-border spinner-border-sm me-1"
          />
          Load more
        </b-button>
      </div>
    </div>

    <!-- Detail modal -->
    <ModIncomingEmailDetail v-model="showDetail" :entry="selectedEntry" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import NoticeMessage from '~/components/NoticeMessage.vue'
import ModEmailDateFilter from '~/modtools/components/ModEmailDateFilter.vue'
import ModIncomingEmailDetail from '~/modtools/components/ModIncomingEmailDetail.vue'
import ModIncomingEmailCharts from '~/modtools/components/ModIncomingEmailCharts.vue'
import ModEmailStatCard from '~/modtools/components/ModEmailStatCard.vue'
import { useEmailTrackingStore } from '~/modtools/stores/emailtracking'
import { useEmailDateFormat } from '~/modtools/composables/useEmailDateFormat'

const store = useEmailTrackingStore()
const { formatEmailDate } = useEmailDateFormat()

// Define which outcomes are delivered vs not delivered vs error
const DELIVERED_OUTCOMES = [
  'Pending',
  'Approved',
  'ToUser',
  'ToVolunteers',
  'ToSystem',
  'Receipt',
]
const NOT_DELIVERED_OUTCOMES = ['Dropped', 'IncomingSpam']
const ERROR_OUTCOMES = ['Error']

// Computed properties to group outcomes
const deliveredOutcomes = computed(() => {
  if (!store.incomingOutcomeCounts) return []
  return Object.entries(store.incomingOutcomeCounts)
    .filter(([outcome]) => DELIVERED_OUTCOMES.includes(outcome))
    .map(([outcome, count]) => ({ outcome, count }))
    .sort(
      (a, b) =>
        DELIVERED_OUTCOMES.indexOf(a.outcome) -
        DELIVERED_OUTCOMES.indexOf(b.outcome)
    )
})

const notDeliveredOutcomes = computed(() => {
  if (!store.incomingOutcomeCounts) return []
  return Object.entries(store.incomingOutcomeCounts)
    .filter(([outcome]) => NOT_DELIVERED_OUTCOMES.includes(outcome))
    .map(([outcome, count]) => ({ outcome, count }))
    .sort(
      (a, b) =>
        NOT_DELIVERED_OUTCOMES.indexOf(a.outcome) -
        NOT_DELIVERED_OUTCOMES.indexOf(b.outcome)
    )
})

const errorOutcomes = computed(() => {
  if (!store.incomingOutcomeCounts) return []
  return Object.entries(store.incomingOutcomeCounts)
    .filter(([outcome]) => ERROR_OUTCOMES.includes(outcome))
    .map(([outcome, count]) => ({ outcome, count }))
})

// Use actual total from counts, fall back to entries length if counts not loaded yet.
const totalIncomingCount = computed(() => {
  return store.incomingCountsTotal || store.incomingEntries.length
})

// Bounce stats from the email tracking stats API (bounces_emails table).
// Falls back to Loki logs if stats not available.
const bounceStats = computed(() => {
  // Prefer stats from the database (via formattedStats getter).
  if (store.formattedStats?.totalBounces > 0) {
    return {
      total: store.formattedStats.totalBounces,
      permanent: store.formattedStats.permanentBounces,
      temporary: store.formattedStats.temporaryBounces,
    }
  }
  // Fall back to Loki logs if stats not available.
  const entries = store.bounceEntries || []
  const permanent = entries.filter((e) => e.is_permanent).length
  const temporary = entries.filter((e) => !e.is_permanent).length
  return {
    total: entries.length,
    permanent,
    temporary,
  }
})

const showDetail = ref(false)
const selectedEntry = ref(null)
const searchInput = ref('')
const bounceFilter = ref(null) // null, 'all', 'permanent', 'temporary'
let searchTimeout = null

const fields = [
  { key: 'timestamp', label: 'Time', sortable: true },
  { key: 'envelope_from', label: 'From' },
  { key: 'envelope_to', label: 'To' },
  { key: 'subject', label: 'Subject' },
  { key: 'routing_outcome', label: 'Outcome', sortable: true },
]

function fetchAll() {
  store.fetchIncomingEmails()
  store.fetchIncomingCounts()
  store.fetchBounceEvents()
  // Also fetch stats and time series to get accurate bounce data from database.
  store.fetchStats()
  store.fetchTimeSeries()
}

function onFilterFetch({ lokiRange, start, end }) {
  if (lokiRange) {
    store.incomingTimeRange = lokiRange
  } else {
    store.incomingTimeRange = start
  }

  // Set filters for stats endpoint to match the time range.
  if (start) {
    store.setFilters({ start, end: end || '' })
  }

  fetchAll()
}

function onSearchInput() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.incomingSearch = searchInput.value
    store.fetchIncomingEmails()
    store.fetchIncomingCounts()
  }, 500)
}

function loadMore() {
  store.fetchIncomingEmails(true)
}

function filterOutcome(outcome) {
  // Clear bounce filter when selecting a different outcome.
  bounceFilter.value = null
  const newOutcome = store.incomingOutcomeFilter === outcome ? '' : outcome
  store.incomingOutcomeFilter = newOutcome
  store.fetchIncomingEmails()
}

function filterBounce(type) {
  // Toggle off if clicking the same filter.
  if (bounceFilter.value === type) {
    bounceFilter.value = null
    store.incomingOutcomeFilter = ''
    // Restore user's search term.
    store.incomingSearch = searchInput.value
  } else {
    bounceFilter.value = type
    // Bounces are routed as ToSystem, so filter to that outcome.
    store.incomingOutcomeFilter = 'ToSystem'
    // Add server-side search for bounce to filter efficiently.
    // For permanent/temporary, include that in the search.
    if (type === 'permanent') {
      store.incomingSearch = 'permanent bounce'
    } else if (type === 'temporary') {
      store.incomingSearch = 'temporary bounce'
    } else {
      store.incomingSearch = 'bounce'
    }
  }
  store.fetchIncomingEmails()
}

// Displayed entries - no client-side filtering needed now since server filters.
const displayedEntries = computed(() => {
  return store.filteredIncomingEntries
})

function onRowClick(item) {
  selectedEntry.value = item
  showDetail.value = true
}

function normalizeOutcome(outcome) {
  if (!outcome) return 'Unknown'
  return outcome.charAt(0).toUpperCase() + outcome.slice(1)
}

function formatOutcomeLabel(item) {
  const outcome = normalizeOutcome(item.routing_outcome)
  const reason = item.routing_reason || ''

  // For ToSystem, add a brief indicator of what type
  if (outcome === 'ToSystem' && reason) {
    const reasonLower = reason.toLowerCase()
    if (reasonLower.includes('bounce')) return 'System: Bounce'
    if (reasonLower.includes('fbl')) return 'System: FBL'
    if (reasonLower.includes('taken') || reasonLower.includes('received'))
      return 'System: Outcome'
    if (
      reasonLower.includes('unsubscribe') ||
      reasonLower.includes('digest off') ||
      reasonLower.includes('events off') ||
      reasonLower.includes('newsletters off') ||
      reasonLower.includes('relevant off') ||
      reasonLower.includes('volunteering off') ||
      reasonLower.includes('notification mails off')
    )
      return 'System: Unsub'
    if (reasonLower.includes('subscribe command')) return 'System: Sub'
    if (reasonLower.includes('closed group')) return 'System: Closed'
    return 'System'
  }

  // For Dropped, show brief reason
  if (outcome === 'Dropped' && reason) {
    const reasonLower = reason.toLowerCase()
    if (reasonLower.includes('auto-reply')) return 'Dropped: Auto-reply'
    if (reasonLower.includes('self-sent')) return 'Dropped: Self'
    if (reasonLower.includes('spammer')) return 'Dropped: Spammer'
    if (reasonLower.includes('bounce')) return 'Dropped: Bounce'
    return 'Dropped'
  }

  // For Error, show what failed
  if (outcome === 'Error' && reason) {
    const reasonLower = reason.toLowerCase()
    if (reasonLower.includes('parse')) return 'Error: Parse'
    if (reasonLower.includes('bounce')) return 'Error: Bounce'
    return 'Error'
  }

  return outcome
}

function outcomeVariant(outcome) {
  const normalized = normalizeOutcome(outcome)
  const variants = {
    Approved: 'success',
    Pending: 'warning',
    Dropped: 'secondary',
    ToUser: 'info',
    ToVolunteers: 'primary',
    IncomingSpam: 'danger',
    ToSystem: 'dark',
    Error: 'warning',
  }
  return variants[normalized] || 'light'
}
</script>

<style scoped>
.stats-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stats-group {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background-color: #f8f9fa;
}

.stats-group-label {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.clickable-rows :deep(tbody tr) {
  cursor: pointer;
}
</style>
