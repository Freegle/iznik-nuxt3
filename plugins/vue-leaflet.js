// plugins/leaflet.ts
import {
  LMap,
  LTileLayer,
  LMarker,
  LCircleMarker,
  LIcon,
  LPolygon,
  LGeoJson,
  LControl,
  LFeatureGroup,
  LTooltip,
  LRectangle,
} from '@vue-leaflet/vue-leaflet/src/components'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('l-map', LMap)
  nuxtApp.vueApp.component('l-marker', LMarker)
  nuxtApp.vueApp.component('l-tile-layer', LTileLayer)
  nuxtApp.vueApp.component('l-icon', LIcon)
  nuxtApp.vueApp.component('l-polygon', LPolygon)
  nuxtApp.vueApp.component('l-geojson', LGeoJson)
  nuxtApp.vueApp.component('l-circle-marker', LCircleMarker)
  nuxtApp.vueApp.component('l-control', LControl)
  nuxtApp.vueApp.component('l-feature-group', LFeatureGroup)
  nuxtApp.vueApp.component('l-tooltip', LTooltip)
  nuxtApp.vueApp.component('l-rectangle', LRectangle)
})
