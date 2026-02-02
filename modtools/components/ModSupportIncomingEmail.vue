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
        !store.incomingError &&
        store.incomingEntries.length === 0
      "
      variant="warning"
    >
      No incoming email logs found for this time range. Make sure incoming email
      logging is enabled and Loki is receiving logs.
    </NoticeMessage>

    <!-- Charts -->
    <ModIncomingEmailCharts />

    <!-- Results table -->
    <div v-if="store.filteredIncomingEntries.length > 0">
      <b-table
        :items="store.filteredIncomingEntries"
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
import { ref } from 'vue'
import NoticeMessage from '~/components/NoticeMessage.vue'
import ModEmailDateFilter from '~/modtools/components/ModEmailDateFilter.vue'
import ModIncomingEmailDetail from '~/modtools/components/ModIncomingEmailDetail.vue'
import ModIncomingEmailCharts from '~/modtools/components/ModIncomingEmailCharts.vue'
import { useEmailTrackingStore } from '~/modtools/stores/emailtracking'
import { useEmailDateFormat } from '~/modtools/composables/useEmailDateFormat'

const store = useEmailTrackingStore()
const { formatEmailDate } = useEmailDateFormat()

const showDetail = ref(false)
const selectedEntry = ref(null)

const fields = [
  { key: 'timestamp', label: 'Time', sortable: true },
  { key: 'envelope_from', label: 'From' },
  { key: 'envelope_to', label: 'To' },
  { key: 'subject', label: 'Subject' },
  { key: 'routing_outcome', label: 'Outcome', sortable: true },
]

function onFilterFetch({ lokiRange, start, end }) {
  // Use Loki relative range if available, otherwise fall back to ISO dates.
  if (lokiRange) {
    store.incomingTimeRange = lokiRange
  } else {
    store.incomingTimeRange = start
  }

  store.fetchIncomingEmails()
  store.fetchBounceEvents()
}

function loadMore() {
  store.fetchIncomingEmails(true)
}

function filterOutcome(outcome) {
  store.incomingOutcomeFilter =
    store.incomingOutcomeFilter === outcome ? '' : outcome
}

function onRowClick(item) {
  selectedEntry.value = item
  showDetail.value = true
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
    dropped: 'secondary',
  }
  return variants[outcome] || 'light'
}
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

.clickable-rows :deep(tbody tr) {
  cursor: pointer;
}
</style>
