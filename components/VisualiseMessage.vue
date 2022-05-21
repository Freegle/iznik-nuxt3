<template>
  <l-marker
    v-if="currlat !== null"
    :key="'visualisemessage-' + id"
    :lat-lng="[currlat, currlng]"
    title="post"
    :duration="2000"
  >
    <l-icon
      :icon-url="icon"
      :icon-size="[100, 100]"
      :icon-anchor="[30, 110]"
      class-name="border border-primary rounded item-image"
    />
  </l-marker>
</template>
<script>
// const LMovingMarker = () => import('vue2-leaflet-movingmarker')

export default {
  // components: { LMovingMarker },
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
      currlat: null,
      currlng: null,
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
