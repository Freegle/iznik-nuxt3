<template>
  <div class="incoming-email-container">
    <NoticeMessage variant="info" class="mb-3">
      <p class="mb-0">
        <strong>Incoming email routing.</strong> Shows emails received and how
        they were routed by the incoming mail processor. Data comes from Loki
        logs.
      </p>
    </NoticeMessage>

    <!-- Date range selector -->
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <b-button-group size="sm">
        <b-button
          v-for="range in timeRanges"
          :key="range.value"
          :variant="
            store.incomingTimeRange === range.value
              ? 'primary'
              : 'outline-primary'
          "
          @click="setTimeRange(range.value)"
        >
          {{ range.label }}
        </b-button>
      </b-button-group>

      <b-button
        size="sm"
        variant="outline-secondary"
        :disabled="store.incomingLoading"
        @click="refresh"
      >
        <b-icon icon="arrow-clockwise" />
        Refresh
      </b-button>
    </div>

    <!-- Headline stats cards -->
    <div v-if="store.incomingEntries.length > 0" class="mb-3">
      <div class="d-flex flex-wrap gap-2 mb-2">
        <div
          class="stat-card p-2 border rounded text-center"
          :class="{
            'border-primary': !store.incomingOutcomeFilter,
            'bg-light': !store.incomingOutcomeFilter,
          }"
          role="button"
          @click="filterOutcome('')"
        >
          <div class="stat-count font-weight-bold">
            {{ store.incomingEntries.length }}
          </div>
          <div class="stat-label small text-muted">Total</div>
        </div>
        <div
          v-for="(count, outcome) in store.incomingOutcomeCounts"
          :key="outcome"
          class="stat-card p-2 border rounded text-center"
          :class="{
            'border-primary': store.incomingOutcomeFilter === outcome,
            'bg-light': store.incomingOutcomeFilter === outcome,
          }"
          role="button"
          @click="filterOutcome(outcome)"
        >
          <div class="stat-count font-weight-bold">{{ count }}</div>
          <div class="stat-label small text-muted">{{ outcome }}</div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-3">
      <b-input
        v-model="store.incomingSearch"
        placeholder="Search by from, to, subject, or outcome..."
        size="sm"
      />
    </div>

    <!-- Loading -->
    <div v-if="store.incomingLoading && !store.incomingEntries.length">
      <b-skeleton-table :rows="5" :columns="5" />
    </div>

    <!-- Error -->
    <NoticeMessage v-if="store.incomingError" variant="danger" class="mb-3">
      {{ store.incomingError }}
    </NoticeMessage>

    <!-- No data -->
    <NoticeMessage
      v-if="
        !store.incomingLoading &&
        !store.incomingError &&
        store.incomingEntries.length === 0
      "
      variant="warning"
    >
      No incoming email logs found for this time range. Make sure incoming email
      logging is enabled and Loki is receiving logs.
    </NoticeMessage>

    <!-- Results table -->
    <div v-if="store.filteredIncomingEntries.length > 0">
      <b-table
        :items="store.filteredIncomingEntries"
        :fields="fields"
        striped
        hover
        small
        responsive
        sort-by="timestamp"
        sort-desc
      >
        <template #cell(timestamp)="data">
          {{ formatTime(data.value) }}
        </template>
        <template #cell(routing_outcome)="data">
          <b-badge :variant="outcomeVariant(data.value)">
            {{ data.value }}
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
          <b-icon
            v-if="store.incomingLoading"
            icon="arrow-clockwise"
            animation="spin"
          />
          Load more
        </b-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import NoticeMessage from '~/components/NoticeMessage.vue'
import { useEmailTrackingStore } from '~/modtools/stores/emailtracking'

const store = useEmailTrackingStore()

const timeRanges = [
  { label: '1 hour', value: '1h' },
  { label: '24 hours', value: '24h' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
]

const fields = [
  { key: 'timestamp', label: 'Time', sortable: true },
  { key: 'envelope_from', label: 'From' },
  { key: 'envelope_to', label: 'To' },
  { key: 'subject', label: 'Subject' },
  { key: 'routing_outcome', label: 'Outcome', sortable: true },
]

function setTimeRange(range) {
  store.incomingTimeRange = range
  store.fetchIncomingEmails()
}

function refresh() {
  store.fetchIncomingEmails()
}

function loadMore() {
  store.fetchIncomingEmails(true)
}

function filterOutcome(outcome) {
  store.incomingOutcomeFilter =
    store.incomingOutcomeFilter === outcome ? '' : outcome
}

function formatTime(ts) {
  return dayjs(ts).format('YYYY-MM-DD HH:mm:ss')
}

function outcomeVariant(outcome) {
  const variants = {
    Approved: 'success',
    Pending: 'warning',
    Dropped: 'secondary',
    ToUser: 'info',
    ToVolunteers: 'primary',
    IncomingSpam: 'danger',
    ToSystem: 'dark',
  }
  return variants[outcome] || 'light'
}

// Fetch on mount.
onMounted(() => {
  if (store.incomingEntries.length === 0) {
    store.fetchIncomingEmails()
  }
})
</script>

<style scoped>
.stat-card {
  min-width: 80px;
  cursor: pointer;
  transition: all 0.15s;
}

.stat-card:hover {
  background-color: #f0f0f0;
}

.stat-count {
  font-size: 1.25rem;
}
</style>
