<template>
  <l-map
    ref="map"
    :zoom="12"
    :max-zoom="maxZoom"
    :style="'width: 100%; height: ' + height + 'px'"
    :options="mapOptions"
    @ready="idle"
  >
    <l-tile-layer :url="osmtile()" :attribution="attribution()" />
    <l-marker v-if="home" :lat-lng="home">
      <l-icon>
        <HomeIcon />
      </l-icon>
    </l-marker>
    <l-marker
      :lat-lng="[position.lat, position.lng]"
      :interactive="false"
      :icon="blurmarker"
    />
  </l-map>
</template>
<script setup>
import { computed, ref } from 'vue'
import HomeIcon from './HomeIcon'
import { MAX_MAP_ZOOM } from '~/constants'
import {
  attribution as getAttribution,
  osmtile as getOsmTile,
} from '~/composables/useMap'

const props = defineProps({
  home: {
    type: Object,
    required: false,
    default: null,
  },
  position: {
    type: Object,
    required: true,
  },
  locked: {
    type: Boolean,
    required: false,
    default: false,
  },
  boundary: {
    type: String,
    required: false,
    default: null,
  },
  maxZoom: {
    type: Number,
    required: false,
    default: MAX_MAP_ZOOM,
  },
  height: {
    type: Number,
    required: false,
    default: 200,
  },
})

const map = ref(null)
const osmtile = getOsmTile()
const attribution = getAttribution()
let L = null

if (process.client) {
  L = await import('leaflet/dist/leaflet-src.esm')
}

const mapOptions = computed(() => {
  return {
    // On mobile require two-finger interaction.
    dragging: !props.locked && (!L || !L.Browser.mobile),
    touchZoom: !props.locked,
    scrollWheelZoom: false,
    bounceAtZoomLimits: true,
  }
})

const blurmarker = computed(() => {
  return L
    ? new L.Icon({
        iconUrl: '/blurmarker.png',
        iconSize: [100, 100],
      })
    : null
})

function idle(themap) {
  if (props.home?.lat || props.home?.lng) {
    // We want to show both the centre and the marker.
    // eslint-disable-next-line new-cap
    const fg = new L.featureGroup([
      // eslint-disable-next-line new-cap
      new L.marker([props.position.lat, props.position.lng]),
      // eslint-disable-next-line new-cap
      new L.marker([props.home.lat, props.home.lng]),
    ])

    const fitTo = fg.getBounds().pad(0.1)
    if (fitTo.isValid()) {
      themap.fitBounds(fitTo)
    }
  } else {
    // eslint-disable-next-line new-cap
    const fg = new L.featureGroup([
      // eslint-disable-next-line new-cap
      new L.marker([props.position.lat, props.position.lng]),
    ])

    themap.fitBounds(fg.getBounds().pad(0.1))
    themap.setZoom(MAX_MAP_ZOOM)
  }

  const zoomControl = map.value.$el.querySelector('.leaflet-top.leaflet-left')
  if (zoomControl) {
    zoomControl.className = 'leaflet-top leaflet-right'
  }
}
</script>
