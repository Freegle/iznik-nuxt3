<template>
  <l-map
    ref="map"
    v-model:zoom="zoom"
    v-model:center="center"
    :style="'width: 100%; height: ' + height + 'px'"
    :max-zoom="maxZoom"
    :options="mapOptions"
    :use-global-leaflet="true"
    @ready="ready"
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
import 'leaflet'
import { computed } from 'vue'
import { LMap, LTileLayer, LMarker, LIcon } from '@vue-leaflet/vue-leaflet'
import HomeIcon from './HomeIcon'
import { useMiscStore } from '~/stores/misc'
import { MAX_MAP_ZOOM } from '~/constants'
import { attribution, osmtile } from '~/composables/useMap'

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

const miscStore = useMiscStore()

const mapOptions = computed(() => ({
  dragging: !props.locked && (!window.L || !window.L.Browser.mobile),
  touchZoom: !props.locked,
  scrollWheelZoom: false,
  bounceAtZoomLimits: true,
}))

const blurmarker = computed(() => {
  const modtools = miscStore.modtools
  return window.L
    ? new window.L.Icon({
        iconUrl: modtools ? '/bluering.png' : '/blurmarker.png',
        iconSize: [100, 100],
      })
    : null
})

const map = ref(null)
const center = ref(new window.L.LatLng(props.position.lat, props.position.lng))
const zoom = ref(MAX_MAP_ZOOM)

function ready() {
  const themap = map.value.leafletObject

  if (props.home?.lat || props.home?.lng) {
    const fg = new window.L.FeatureGroup([
      new window.L.Marker([props.position.lat, props.position.lng]),
      new window.L.Marker([props.home.lat, props.home.lng]),
    ])

    const fitTo = fg.getBounds().pad(0.1)
    if (fitTo.isValid()) {
      themap.fitBounds(fitTo)
    }
  } else {
    center.value = new window.L.LatLng(props.position.lat, props.position.lng)
  }

  const zoomControl = themap._container.querySelector(
    '.leaflet-top.leaflet-left'
  )
  zoomControl.className = 'leaflet-top leaflet-right'
}
</script>
