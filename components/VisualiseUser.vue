<template>
  <l-marker
    v-if="currlat !== null"
    :key="'visualiseuser-' + id"
    :lat-lng="[currlat, currlng]"
    title="Freegler"
    :duration="2000"
  >
    <l-icon>
      <ProfileImage :image="icon" border size="lg-always" :lazy="false" />
    </l-icon>
  </l-marker>
</template>
<script>
import ProfileImage from './ProfileImage'
// const LMovingMarker = () => import('vue2-leaflet-movingmarker')

export default {
  components: { ProfileImage },
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
:deep(img) {
  animation-duration: 1s;
  animation-iteration-count: 1;

  animation-name: bounce-animation;
  animation-timing-function: ease;
}

@keyframes bounce-animation {
  0% {
    transform: translateY(-40px);
    opacity: 0.1;
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-25px);
  }
  50% {
    transform: translateY(-10px);
  }
  70% {
    transform: translateY(-6px);
  }
  90% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
