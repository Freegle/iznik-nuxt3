<template>
  <b-card class="mb-3 filter-card">
    <b-form class="filter-form" inline @submit.prevent="onFetch">
      <label class="filter-label">Period:</label>
      <b-form-select
        v-model="datePreset"
        :options="datePresetOptions"
        size="sm"
        style="width: 130px"
        @change="onPresetChange"
      />
      <template v-if="datePreset === 'custom'">
        <label class="filter-label">From:</label>
        <b-form-input
          v-model="startDate"
          type="datetime-local"
          size="sm"
          style="width: 175px"
        />
        <label class="filter-label">To:</label>
        <b-form-input
          v-model="endDate"
          type="datetime-local"
          size="sm"
          style="width: 175px"
        />
      </template>
      <slot name="extra-filters" />
      <b-button type="submit" variant="primary" size="sm" :disabled="loading">
        <span v-if="loading">
          <span class="spinner-border spinner-border-sm me-1" />
          Loading...
        </span>
        <span v-else>{{ fetchLabel }}</span>
      </b-button>
    </b-form>
  </b-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  fetchLabel: {
    type: String,
    default: 'Fetch',
  },
  defaultPreset: {
    type: String,
    default: '7days',
  },
})

const emit = defineEmits(['fetch'])

const datePresetOptions = [
  { text: 'Last hour', value: 'hour' },
  { text: 'Last 24 hours', value: 'day' },
  { text: 'Last 7 days', value: '7days' },
  { text: 'Last 30 days', value: '30days' },
  { text: 'Custom dates', value: 'custom' },
]

// Map presets to Loki-compatible relative time strings.
const presetToLoki = {
  hour: '1h',
  day: '24h',
  '7days': '7d',
  '30days': '30d',
}

const datePreset = ref(props.defaultPreset)
const startDate = ref('')
const endDate = ref('')

function formatDateTimeForAPI(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  )
}

function resolvePresetDates(preset) {
  const now = new Date()
  let start

  switch (preset) {
    case 'hour':
      start = new Date(now)
      start.setHours(start.getHours() - 1)
      return {
        start: formatDateTimeForAPI(start),
        end: formatDateTimeForAPI(now),
      }
    case 'day':
      start = new Date(now)
      start.setDate(start.getDate() - 1)
      return {
        start: formatDateTimeForAPI(start),
        end: formatDateTimeForAPI(now),
      }
    case '7days':
      start = new Date(now)
      start.setDate(start.getDate() - 7)
      return {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      }
    case '30days':
      start = new Date(now)
      start.setDate(start.getDate() - 30)
      return {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      }
    case 'custom':
      return { start: startDate.value, end: endDate.value }
    default:
      start = new Date(now)
      start.setDate(start.getDate() - 7)
      return {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      }
  }
}

function onPresetChange(preset) {
  if (preset === 'custom') return
  onFetch()
}

function onFetch() {
  const dates = resolvePresetDates(datePreset.value)
  const lokiRange = presetToLoki[datePreset.value] || null

  emit('fetch', {
    start: dates.start,
    end: dates.end,
    lokiRange,
    preset: datePreset.value,
  })
}

onMounted(() => {
  // Set initial dates and trigger initial fetch.
  const dates = resolvePresetDates(props.defaultPreset)
  startDate.value = dates.start
  endDate.value = dates.end
  onFetch()
})
</script>

<style scoped>
.filter-card {
  background: #f8f9fa;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
}
</style>
