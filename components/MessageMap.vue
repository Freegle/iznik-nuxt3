<template>
  <l-map
    ref="map"
    :zoom="12"
    :max-zoom="maxZoom"
    :style="'width: 100%; height: ' + height + 'px'"
    :options="mapOptions"
    @ready="idle"
  >
    <l-tile-layer :url="osmtile" :attribution="attribution" />
    <!--    <l-marker-->
    <!--      v-if="home"-->
    <!--      :lat-lng="[home.lat, home.lng]"-->
    <!--      :interactive="false"-->
    <!--      :icon="homeicon"-->
    <!--      class="bg-none"-->
    <!--    />-->
    <l-marker
      :lat-lng="[position.lat, position.lng]"
      :interactive="false"
      :icon="blurmarker"
    />
    <l-geojson v-if="boundary" :geojson="boundaryJSON" :options="cgaOptions" />
  </l-map>
</template>
<script>
// eslint-disable-next-line node/no-deprecated-api
import Wkt from 'wicket'
import { MAX_MAP_ZOOM } from '~/constants'
// TODO
// import map from '@/mixins/map.js'

const AREA_FILL_COLOUR = 'darkblue'
const CGA_BOUNDARY_COLOUR = 'darkblue'

export default {
  // mixins: [map],
  props: {
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
  },
  data() {
    return {
      L: null,
    }
  },
  computed: {
    mapOptions() {
      return {
        // On mobile require two-finger interaction.
        dragging: !this.locked && (!this.L || !this.L.Browser.mobile),
        touchZoom: !this.locked,
        scrollWheelZoom: false,
        bounceAtZoomLimits: true,
      }
    },
    cgaOptions() {
      return {
        fillColor: AREA_FILL_COLOUR,
        fillOpacity: 0,
        color: CGA_BOUNDARY_COLOUR,
      }
    },
    // homeicon() {
    // Render the component off document.
    // // TODO
    // const Mine = Vue.extend(HomeIcon)
    // let re = new Mine()
    //
    // re = re.$mount().$el
    //
    // return new this.L.DivIcon({
    //   html: re.outerHTML,
    //   className: 'bg-none',
    // })
    // },
    blurmarker() {
      return this.L
        ? new this.L.Icon({
            iconUrl: '/blurmarker.png',
            iconSize: [100, 100],
          })
        : null
    },
    boundaryJSON() {
      const wkt = new Wkt.Wkt()
      try {
        wkt.read(this.boundary)
        return wkt.toJson()
      } catch (e) {
        console.log('WKT error', this.boundary, e)
      }

      return null
    },
    osmtile() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.public.OSM_TILE
    },
    attribution() {
      return 'Map data &copy; <a href="https://www.openstreetmap.org/" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    },
  },
  async beforeCreate() {
    if (process.client) {
      const L = await import('leaflet/dist/leaflet-src.esm')
      this.L = L
    }
  },
  methods: {
    idle(themap) {
      if (this.home) {
        // We want to show both the centre and the marker.
        // eslint-disable-next-line new-cap
        const fg = new this.L.featureGroup([
          // eslint-disable-next-line new-cap
          new this.L.marker([this.position.lat, this.position.lng]),
          // eslint-disable-next-line new-cap
          new this.L.marker([this.home.lat, this.home.lng]),
        ])

        themap.fitBounds(fg.getBounds().pad(0.1))
      } else {
        // eslint-disable-next-line new-cap
        const fg = new this.L.featureGroup([
          // eslint-disable-next-line new-cap
          new this.L.marker([this.position.lat, this.position.lng]),
        ])

        themap.fitBounds(fg.getBounds().pad(0.1))
        themap.setZoom(MAX_MAP_ZOOM)
      }

      const zoomControl = this.$el.querySelector('.leaflet-top.leaflet-left')
      zoomControl.className = 'leaflet-top leaflet-right'
    },
  },
}
</script>
