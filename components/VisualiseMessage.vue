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
<script setup>
import { ref, onMounted } from 'vue'

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

const currlat = ref(null)
const currlng = ref(null)

onMounted(() => {
  currlat.value = props.lat
  currlng.value = props.lng
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

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
