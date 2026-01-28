<template>
  <div class="pos">
    <b-button v-if="scrollY > 50" variant="secondary" @click="scrollToTop">
      <v-icon icon="caret-up" />
      <span class="d-none d-md-inline">
        {{ prepend }}
        Top
      </span>
    </b-button>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  prepend: {
    type: String,
    required: false,
    default: null,
  },
})

const scrollY = ref(0)

function handleScroll() {
  scrollY.value = window.scrollY
}

function scrollToTop() {
  window.scrollTo(0, 0)
}

onMounted(() => {
  if (process.client) {
    window.addEventListener('scroll', handleScroll)
  }
})

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('scroll', handleScroll)
    scrollY.value = 0
  }
})
</script>
<style>
.pos {
  position: fixed;
  top: 90px;
  right: 25px;
  z-index: 1000;
}
</style>
