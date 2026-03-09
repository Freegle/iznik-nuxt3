// plugins/leaflet.ts
import { defineAsyncComponent } from 'vue'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component(
    'l-map',
    defineAsyncComponent(async () => {
      await import('leaflet/dist/leaflet.css')
      return import('@vue-leaflet/vue-leaflet/src/components/LMap')
    })
  )
  nuxtApp.vueApp.component(
    'l-marker',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LMarker')
    )
  )
  nuxtApp.vueApp.component(
    'l-tile-layer',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LTileLayer')
    )
  )
  nuxtApp.vueApp.component(
    'l-icon',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LIcon')
    )
  )
  nuxtApp.vueApp.component(
    'l-polygon',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LPolygon')
    )
  )
  nuxtApp.vueApp.component(
    'l-geojson',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LGeoJson')
    )
  )
  nuxtApp.vueApp.component(
    'l-circle-marker',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LCircleMarker')
    )
  )
  nuxtApp.vueApp.component(
    'l-control',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LControl')
    )
  )
  nuxtApp.vueApp.component(
    'l-feature-group',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LFeatureGroup')
    )
  )
  nuxtApp.vueApp.component(
    'l-tooltip',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LTooltip')
    )
  )
  nuxtApp.vueApp.component(
    'l-rectangle',
    defineAsyncComponent(() =>
      import('@vue-leaflet/vue-leaflet/src/components/LRectangle')
    )
  )
})
