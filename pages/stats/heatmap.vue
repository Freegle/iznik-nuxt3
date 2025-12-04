<template>
  <client-only>
    <b-row class="text-center m-0">
      <b-col cols="12" lg="6" offset-lg="3">
        <h1>Freegling Heatmap</h1>
        <div v-if="!fetched" class="text-center">
          <h4>Crunching the numbers...</h4>
          <p>This may take a minute.</p>
          <b-img lazy src="/loader.gif" alt="Loading" />
        </div>
        <div v-else>
          <p class="text-center">
            This shows where the most items have been freegled. It might take a
            little while to load.
          </p>
          <p class="text-center">
            The locations are approximate for privacy. The colours are relative
            to the area currently shown.
          </p>
        </div>
        <l-map
          v-if="fetched"
          ref="map"
          v-model:center="center"
          v-model:bounds="bounds"
          v-model:zoom="zoom"
          :style="'width: ' + mapWidth + '; height: ' + mapWidth + 'px'"
          :min-zoom="minZoom"
          :max-zoom="maxZoom"
        >
          <l-tile-layer :url="osmtile()" :attribution="attribution()" />
          <LeafletHeatmap
            v-if="weightedData?.length && zoom"
            :lat-lngs="weightedData"
            :radius="zoom * 3"
            :max-opacity="1"
            :min-opacity="minOpacity"
            :gradient="{
              0.05: 'darkblue',
              0.1: 'darkgreen',
              0.2: 'yellow',
              0.5: 'orange',
              0.8: 'red',
            }"
          />
        </l-map>
      </b-col>
    </b-row>
  </client-only>
</template>
<script setup>
import {
  ref,
  computed,
  defineAsyncComponent,
  onMounted,
  useRoute,
  useHead,
  useRuntimeConfig,
} from '#imports'
import { loadLeaflet, attribution, osmtile } from '~/composables/useMap'
import { useStatsStore } from '~/stores/stats'
import { buildHead } from '~/composables/useBuildHead'

// Import LeafletHeatmap conditionally
let LeafletHeatmap = null

if (process.client) {
  LeafletHeatmap = defineAsyncComponent(() =>
    import('~/components/LeafletHeatmap.vue')
  )
}

// Setup stores and route
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const statsStore = useStatsStore()

// Set page head
useHead(
  buildHead(
    route,
    runtimeConfig,
    'Heatmap',
    'This shows where the most items have been freegled, in pretty colours.'
  )
)

// Reactive state
const fetched = ref(false)
const heatmap = ref(null)
const center = ref([53.945, -2.5209])
const bounds = ref(null)
const zoom = ref(6)
const minZoom = 5
const maxZoom = 13
const map = ref(null)

const mapWidth = computed(() => {
  let height = 0

  if (process.client) {
    height = Math.floor(window.innerHeight - 250)
    height = height < 200 ? 200 : height
  }

  return height
})

const heatMapData = computed(() => {
  const heatmapData = statsStore.heatmap
  const data = []

  if (heatmapData?.forEach) {
    heatmapData.forEach((loc) => {
      data.push([loc.lat, loc.lng, loc.count])
    })
  }

  return data
})

const weightedData = computed(() => {
  const weighted = []

  // We want to ensure that whatever level we're zoomed into, we show something useful.  So we need to weight
  // the data based on what the max value is in the current bounds.  If the max is too high then everything
  // else looks idle, so use a logarithmic scale.
  let currentMax = 0

  if (bounds.value) {
    // If the max is too high, then everything else looks idle.  So use a logarithmic scale.
    const data = []
    heatMapData.value.forEach((d) => {
      if (bounds.value.contains([d[0], d[1]])) {
        currentMax = Math.max(d[2], currentMax)
        data.push(d)
      }
    })

    const minlog = Math.log10(1)
    const maxlog = Math.log10(currentMax)
    const range = maxlog - minlog
    const lineartolog = function (n) {
      if (range) {
        return (Math.log10(n) - minlog) / range
      } else {
        return n
      }
    }

    data.forEach((d) => {
      if (bounds.value.contains([d[0], d[1]])) {
        const val = 1 - lineartolog(1 - d[2] / currentMax)
        if (Number.isFinite(val)) {
          weighted.push([d[0], d[1], val])
        }
      }
    })

    console.log(
      'Weighted',
      currentMax,
      minlog,
      maxlog,
      weighted,
      heatMapData.value
    )
  }

  return weighted
})

const minOpacity = computed(() => {
  return 0.05 + (0.1 * (zoom.value - minZoom)) / (maxZoom - minZoom)
})

// Lifecycle hooks
onMounted(async () => {
  await loadLeaflet()
  bounds.value = window.L.latLngBounds([
    [49.959999905, -7.57216793459],
    [58.6350001085, 1.68153079591],
  ])

  heatmap.value = await statsStore.fetchHeatmap()
  fetched.value = true
})
</script>
