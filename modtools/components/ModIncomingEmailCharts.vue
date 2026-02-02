<template>
  <div v-if="store.incomingEntries.length > 0" class="charts-section mb-3">
    <div class="charts-grid">
      <!-- Incoming Email Rate Chart -->
      <div class="chart-container">
        <h6 class="chart-title">Incoming Email Rate</h6>
        <GChart
          v-if="emailRateData"
          type="LineChart"
          :data="emailRateData"
          :options="emailRateOptions"
          class="chart"
        />
        <div v-else class="chart-empty text-muted">
          Not enough data for chart.
        </div>
      </div>

      <!-- Bounce Rate Chart -->
      <div class="chart-container">
        <h6 class="chart-title">Bounce Rate</h6>
        <div v-if="store.bounceLoading" class="chart-loading">
          <span class="spinner-border spinner-border-sm me-2" />
          Loading bounce data...
        </div>
        <GChart
          v-else-if="bounceRateData"
          type="LineChart"
          :data="bounceRateData"
          :options="bounceRateOptions"
          class="chart"
        />
        <div v-else class="chart-empty text-muted">
          No bounce data available.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { GChart } from 'vue-google-charts'
import { useEmailTrackingStore } from '~/modtools/stores/emailtracking'

const store = useEmailTrackingStore()

/**
 * Auto-select bucket size based on time range of data.
 */
function getBucketMs(entries) {
  if (entries.length < 2) return 3600000 // 1hr default
  const times = entries.map((e) => new Date(e.timestamp).getTime())
  const range = Math.max(...times) - Math.min(...times)
  if (range <= 3600000) return 300000 // 1hr → 5min buckets
  if (range <= 86400000) return 3600000 // 24hr → 1hr buckets
  if (range <= 604800000) return 21600000 // 7d → 6hr buckets
  return 86400000 // 30d → 1day buckets
}

/**
 * Bucket entries by time and count per category.
 */
function bucketize(entries, categoryKey) {
  if (!entries.length) return { buckets: [], categories: [] }

  const bucketMs = getBucketMs(entries)
  const categories = new Set()
  const bucketMap = {}

  entries.forEach((entry) => {
    const ts = new Date(entry.timestamp).getTime()
    const bucketTs = Math.floor(ts / bucketMs) * bucketMs
    const cat = entry[categoryKey] || 'Unknown'
    categories.add(cat)

    if (!bucketMap[bucketTs]) bucketMap[bucketTs] = {}
    bucketMap[bucketTs][cat] = (bucketMap[bucketTs][cat] || 0) + 1
  })

  const sortedBuckets = Object.keys(bucketMap)
    .map(Number)
    .sort((a, b) => a - b)
  const catList = [...categories].sort()

  return { buckets: sortedBuckets, categories: catList, bucketMap }
}

const emailRateData = computed(() => {
  const entries = store.incomingEntries
  if (entries.length < 2) return null

  const { buckets, categories, bucketMap } = bucketize(
    entries,
    'routing_outcome'
  )
  if (buckets.length < 2) return null

  const header = ['Time', ...categories]
  const rows = buckets.map((ts) => {
    const date = new Date(ts)
    return [date, ...categories.map((cat) => bucketMap[ts][cat] || 0)]
  })

  return [header, ...rows]
})

const emailRateOptions = {
  curveType: 'function',
  legend: { position: 'bottom' },
  chartArea: { width: '85%', height: '65%' },
  vAxis: { title: 'Count', viewWindow: { min: 0 } },
  hAxis: { title: 'Time' },
  isStacked: true,
  animation: { startup: true, duration: 500, easing: 'out' },
}

const bounceRateData = computed(() => {
  const entries = store.bounceEntries
  if (!entries || entries.length < 2) return null

  const { buckets, categories, bucketMap } = bucketize(entries, 'subtype')
  if (buckets.length < 2) return null

  const header = ['Time', ...categories]
  const rows = buckets.map((ts) => {
    const date = new Date(ts)
    return [date, ...categories.map((cat) => bucketMap[ts][cat] || 0)]
  })

  return [header, ...rows]
})

const bounceRateOptions = {
  curveType: 'function',
  legend: { position: 'bottom' },
  chartArea: { width: '85%', height: '65%' },
  vAxis: { title: 'Count', viewWindow: { min: 0 } },
  hAxis: { title: 'Time' },
  colors: ['#dc3545', '#ffc107'],
  animation: { startup: true, duration: 500, easing: 'out' },
}
</script>

<style scoped>
.charts-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.chart-container {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 1rem;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-title {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #495057;
  text-align: center;
  width: 100%;
}

.chart {
  width: 100%;
  height: 220px;
}

.chart-loading,
.chart-empty {
  text-align: center;
  padding: 2rem;
}
</style>
