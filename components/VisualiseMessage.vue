<template>
  <l-moving-marker
    v-if="currlat !== null"
    :key="'visualisemessage-' + id"
    :lat-lng="[currlat, currlng]"
    title="post"
    :duration="2000"
    :icon="mapicon"
  />
</template>
<script>
const LMovingMarker = () => import('vue2-leaflet-movingmarker')

export default {
  components: { LMovingMarker },
  props: {
    id: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      L: null,
      currlat: null,
      currlng: null,
    }
  },
  computed: {
    mapicon() {
      return this.L.icon({
        iconUrl: this.icon,
        iconSize: [100, 100],
        iconAnchor: [30, 110],
        className: 'border border-primary rounded item-image',
      })
    },
  },
  async beforeCreate() {
    // We can only render this on the client.  Pre-render fails, and vue-leaflet doesn't seem to render the map in
    // any case.  See https://github.com/vue-leaflet/vue-leaflet/discussions/208.
    if (process.client) {
      const L = await import('leaflet/dist/leaflet-src.esm')
      this.L = L
    }
  },
  mounted() {
    this.currlat = this.lat
    this.currlng = this.lng
  },
  methods: {
    setLatLng(lat, lng) {
      this.currlat = lat
      this.currlng = lng
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.item-image {
  animation-duration: 1s;
  animation-iteration-count: 1;

  animation-name: fadein-animation;
  animation-timing-function: ease;
}

@keyframes fadein-animation {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
