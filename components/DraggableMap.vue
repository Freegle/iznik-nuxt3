<template>
  <div>
    <b-row class="m-0">
      <b-col ref="mapcont" class="p-0">
        <client-only>
          <div class="d-flex justify-content-between">
            <b-button
              variant="secondary"
              size="lg"
              class="mb-2 ml-0 ml-md-2"
              title="Find my location"
              @click="findLoc"
            >
              <v-icon v-if="locating" icon="sync" class="fa-spin" />
              <v-icon v-else-if="locationFailed" icon="exclamation-triangle" />
              <v-icon v-else icon="map-marker-alt" />
              &nbsp;Find my location
            </b-button>
          </div>
          <l-map
            ref="map"
            :zoom="zoom"
            :center="center"
            :style="'width: ' + mapWidth + '; height: ' + mapHeight + 'px'"
            :max-zoom="maxZoom"
            @ready="ready"
            @moveend="idle"
          >
            <l-tile-layer :url="osmtile" :attribution="attribution" />
            <l-marker :lat-lng="center" :interactive="false" />
          </l-map>
        </client-only>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import { attribution, osmtile, loadLeaflet } from '../composables/useMap'
import { MAX_MAP_ZOOM } from '~/constants'
import { useRuntimeConfig } from '#app'

export default {
  components: {},
  props: {
    initialZoom: {
      type: Number,
      required: false,
      default: 5,
    },
    maxZoom: {
      type: Number,
      required: false,
      default: MAX_MAP_ZOOM,
    },
  },
  async setup() {
    const runtimeConfig = useRuntimeConfig()
    const serviceUrl = runtimeConfig.public.GEOCODE

    let L = null

    if (process.client) {
      L = await import('leaflet/dist/leaflet-src.esm')
    }

    return {
      L,
      osmtile: osmtile(),
      attribution: attribution(),
      serviceUrl,
    }
  },
  data() {
    return {
      locating: false,
      locationFailed: false,
      mapObject: null,
      center: [53.945, -2.5209],
      zoom: 14,
    }
  },
  computed: {
    mapWidth() {
      const contWidth = this.$refs.mapcont?.$el.clientWidth
      return contWidth
    },
    mapHeight() {
      let height = 0

      if (process.client) {
        height = Math.floor(window.innerHeight / 2)
        height = height < 200 ? 200 : height
      }

      return height
    },
  },
  async mounted() {
    await loadLeaflet()
  },
  created() {
    this.zoom = this.initialZoom
  },
  methods: {
    getCenter() {
      return this.center
    },
    findLoc() {
      try {
        if (
          navigator &&
          navigator.geolocation &&
          navigator.geolocation.getCurrentPosition
        ) {
          this.locating = true
          navigator.geolocation.getCurrentPosition((position) => {
            // Show close to where we think they are.
            this.mapObject.flyTo(
              [position.coords.latitude, position.coords.longitude],
              16
            )
          })
        } else {
          console.log('Navigation not supported.  ')
          this.locationFailed = true
        }
      } catch (e) {
        console.error('Find location failed with', e)
        this.locationFailed = true
      }

      this.locating = false
    },
    idle() {
      this.center = this.mapObject.getCenter()
    },
    async ready() {
      const self = this

      await this.waitForRef('map')
      if (process.client) {
        this.mapObject = this.$refs.map.leafletObject

        const { Geocoder } = await import(
          'leaflet-control-geocoder/src/control'
        )
        const { Photon } = await import(
          'leaflet-control-geocoder/src/geocoders/photon'
        )

        new Geocoder({
          placeholder: 'Search for a place...',
          defaultMarkGeocode: false,
          geocoder: new Photon({
            geocodingQueryParams: {
              bbox: '-7.57216793459, 49.959999905, 1.68153079591, 58.6350001085',
            },
            nameProperties: [
              'name',
              'street',
              'suburb',
              'hamlet',
              'town',
              'city',
            ],
            serviceUrl: this.serviceUrl,
          }),
          collapsed: false,
        })
          .on('markgeocode', function (e) {
            if (e && e.geocode && e.geocode.bbox) {
              const bbox = e.geocode.bbox

              const sw = bbox.getSouthWest()
              const ne = bbox.getNorthEast()
              console.log('BBOX', bbox, sw, ne)

              const bounds = new window.L.LatLngBounds([
                [sw.lat, sw.lng],
                [ne.lat, ne.lng],
              ]).pad(0.1)

              // For reasons I don't understand, leaflet throws errors if we don't make these local here.
              const swlat = bounds.getSouthWest().lat
              const swlng = bounds.getSouthWest().lng
              const nelat = bounds.getNorthEast().lat
              const nelng = bounds.getNorthEast().lng

              // Empty out the query box so that the dropdown closes.
              this.setQuery('')
              this.zoom = 14

              self.$nextTick(() => {
                // Move the map to the location we've found.
                console.log('Fly to', swlat, swlng, nelat, nelng)
                self.mapObject.flyToBounds([
                  [swlat, swlng],
                  [nelat, nelng],
                ])
              })
            }
          })
          .addTo(this.mapObject)
      }
    },
  },
}
</script>
