<template>
  <div>
    <b-row class="m-0">
      <b-col ref="mapcont" class="p-0">
        <client-only>
          <div class="d-flex justify-content-between">
            <SpinButton
              variant="secondary"
              class="mb-2 ml-0 ml-md-2"
              button-title="Find my location"
              done-icon=""
              :icon-name="
                locationFailed ? 'exclamation-triangle' : 'map-marker-alt'
              "
              label="Find my location"
              size="lg"
              @handle="findLoc"
            />
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
            <l-tile-layer :url="osmtile()" :attribution="attribution()" />
            <l-marker :lat-lng="center" :interactive="false" />
          </l-map>
        </client-only>
      </b-col>
    </b-row>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeMount, nextTick } from 'vue'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import SpinButton from './SpinButton'
import { attribution, osmtile, loadLeaflet } from '~/composables/useMap'
import { MAX_MAP_ZOOM } from '~/constants'
import { useRuntimeConfig } from '#app'

const props = defineProps({
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
})

// Elements refs
const map = ref(null)
const mapcont = ref(null)

// State refs
const locationFailed = ref(false)
const mapObject = ref(null)
const center = ref([53.945, -2.5209])

function getCenter() {
  return center.value
}

// Expose getCenter method for component use
defineExpose({
  getCenter,
})

const zoom = ref(14)

// Setup
const runtimeConfig = useRuntimeConfig()
const serviceUrl = runtimeConfig.public.GEOCODE

if (process.client) {
  await import('leaflet/dist/leaflet-src.esm')
}

// Computed properties
const mapWidth = computed(() => {
  return mapcont.value?.$el.clientWidth
})

const mapHeight = computed(() => {
  let height = 0

  if (process.client) {
    height = Math.floor(window.innerHeight / 2)
    height = height < 200 ? 200 : height
  }

  return height
})

// Lifecycle hooks
onBeforeMount(() => {
  zoom.value = props.initialZoom
})

onMounted(async () => {
  await loadLeaflet()
})

function findLoc(callback) {
  try {
    if (
      navigator &&
      navigator.geolocation &&
      navigator.geolocation.getCurrentPosition
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Show close to where we think they are.
          mapObject.value.flyTo(
            [position.coords.latitude, position.coords.longitude],
            16
          )
          callback()
        },
        () => {
          locationFailed.value = true
          callback()
        }
      )
    } else {
      console.log('Navigation not supported.  ')
      locationFailed.value = true
      callback()
    }
  } catch (e) {
    console.error('Find location failed with', e)
    locationFailed.value = true
    callback()
  }
}

function idle() {
  center.value = mapObject.value.getCenter()
}

async function ready() {
  if (process.client) {
    mapObject.value = map.value.leafletObject

    const { Geocoder } = await import('leaflet-control-geocoder/src/control')
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
        nameProperties: ['name', 'street', 'suburb', 'hamlet', 'town', 'city'],
        serviceUrl,
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
          zoom.value = 14

          nextTick(() => {
            // Move the map to the location we've found.
            console.log('Fly to', swlat, swlng, nelat, nelng)
            mapObject.value.flyToBounds([
              [swlat, swlng],
              [nelat, nelng],
            ])
          })
        }
      })
      .addTo(mapObject.value)
  }
}
</script>
