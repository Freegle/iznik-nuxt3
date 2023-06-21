<template>
  <client-only>
    <b-row class="text-center m-0">
      <b-col cols="12" md="6" offset-md="3">
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
          :min-zoom="5"
          :max-zoom="13"
          @ready="idle"
          @moveend="boundsChanged"
        >
          <l-tile-layer :url="osmtile" :attribution="attribution" />
          <LeafletHeatmap
            v-if="weightedData?.length && zoom"
            :lat-lngs="weightedData"
            :radius="zoom * 3"
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
<script>
import { useRoute } from 'vue-router'
import { loadLeaflet } from '../../composables/useMap'
import { useStatsStore } from '../../stores/stats'
import { attribution, osmtile } from '~/composables/useMap'
import { buildHead } from '~/composables/useBuildHead'

let LeafletHeatmap = null

if (process.client) {
  LeafletHeatmap = () => import('~/components/LeafletHeatmap')
}

export default {
  components: { LeafletHeatmap },
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()
    const statsStore = useStatsStore()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Heatmap',
        'This shows where the most items have been freegled, in pretty colours.'
      )
    )

    return {
      statsStore,
      osmtile: osmtile(),
      attribution: attribution(),
    }
  },
  data: function () {
    return {
      fetched: false,
      heatmap: null,
      center: [53.945, -2.5209],
      bounds: null,
      zoom: 6,
      max: 0,
    }
  },
  computed: {
    mapHeight() {
      const contWidth = this.$refs.mapcont ? this.$refs.mapcont.$el.width : 0
      return contWidth
    },
    mapWidth() {
      let height = 0

      if (process.client) {
        height = Math.floor(window.innerHeight - 250)
        height = height < 200 ? 200 : height
      }

      return height
    },
    heatMapData() {
      const heatmap = this.statsStore.heatmap

      const data = []

      if (heatmap?.forEach) {
        heatmap.forEach((loc) => {
          data.push([loc.lat, loc.lng, loc.count])
        })
      }

      return data
    },
    weightedData() {
      const weighted = []

      // We want to ensure that whatever level we're zoomed into, we show something useful.  So we need to weight
      // the data based on what the max value is in the current bounds.  If the max is too high then everything
      // else looks idle, so use a logarithmic scale.
      let max = 0

      if (this.bounds) {
        // If the max is too high, then everything else looks idle.  So use a logarithmic scale.
        const data = []
        this.heatMapData.forEach((d) => {
          if (this.bounds.contains([d[0], d[1]])) {
            max = Math.max(d[2], max)
            data.push(d)
          }
        })

        const minlog = Math.log10(1)
        const maxlog = Math.log10(max)
        const range = maxlog - minlog
        const lineartolog = function (n) {
          return (Math.log10(n) - minlog) / range
        }

        data.forEach((d) => {
          if (this.bounds.contains([d[0], d[1]])) {
            weighted.push([d[0], d[1], 1 - lineartolog(1 - d[2] / max)])
          }
        })
      }

      return weighted
    },
  },
  async mounted() {
    await loadLeaflet()
    this.bounds = window.L.latLngBounds([
      [49.959999905, -7.57216793459],
      [58.6350001085, 1.68153079591],
    ])

    this.heatmap = await this.statsStore.fetchHeatmap()
    this.fetched = true
  },
}
</script>
