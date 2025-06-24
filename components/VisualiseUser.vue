<template>
  <l-marker
    v-if="currlat !== null"
    :key="'visualiseuser-' + id"
    ref="marker"
    :lat-lng="[currlat, currlng]"
    title="Freegler"
    :duration="2000"
  >
    <l-icon>
      <ProfileImage :image="icon" border size="lg-always" :lazy="false" />
    </l-icon>
  </l-marker>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import ProfileImage from './ProfileImage'

const props = defineProps({
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
})

const marker = ref(null)
const currlat = ref(null)
const currlng = ref(null)

if (process.client) {
  await import('leaflet/dist/leaflet-src.esm')
}

onMounted(() => {
  currlat.value = props.lat
  currlng.value = props.lng
})
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
