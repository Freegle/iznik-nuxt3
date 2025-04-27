<template>
  <div @click="rotateIt">
    <b-img lazy :src="photo.path" fluid :class="rotatingClass" />
  </div>
</template>
<script setup>
import { ref, computed, onBeforeMount } from 'vue'

const props = defineProps({
  photo: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['rotate'])

const rotate = ref(0)

const rotatingClass = computed(() => {
  return 'square clickme rotate' + rotate.value
})

onBeforeMount(() => {
  rotate.value = props.photo.rotate
})

function rotateIt() {
  rotate.value += 90

  if (rotate.value > 270) {
    rotate.value = 0
  }

  emit('rotate', rotate.value)
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.square {
  object-fit: cover;
  margin: auto;
  width: 80px;
  height: 80px;

  @include media-breakpoint-up(sm) {
    width: 120px;
    height: 120px;
  }
  @include media-breakpoint-up(lg) {
    width: 150px;
    height: 150px;
  }
}

.rotate90 {
  transform: rotate(90deg);
  -ms-transform: rotate(90deg); /* IE 9 */
  -moz-transform: rotate(90deg); /* Firefox */
  -webkit-transform: rotate(90deg); /* Safari and Chrome */
  -o-transform: rotate(90deg); /* Opera */
}

.rotate180 {
  transform: rotate(180deg);
  -ms-transform: rotate(180deg); /* IE 9 */
  -moz-transform: rotate(180deg); /* Firefox */
  -webkit-transform: rotate(180deg); /* Safari and Chrome */
  -o-transform: rotate(180deg); /* Opera */
}

.rotate270 {
  transform: rotate(270deg);
  -ms-transform: rotate(270deg); /* IE 9 */
  -moz-transform: rotate(270deg); /* Firefox */
  -webkit-transform: rotate(270deg); /* Safari and Chrome */
  -o-transform: rotate(270deg); /* Opera */
}
</style>
