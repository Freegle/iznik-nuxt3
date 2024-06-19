<template>
  <div class="d-flex flex-column justify-content-between">
    <div class="flex-grow-1">
      <client-only fallback-tag="div">
        <BCarousel
          class="carousel"
          ride="carousel"
          fade
          :background="background"
        >
          <BCarouselSlide
            v-for="img in [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20, 21, 22, 23, 24, 25,
            ]"
            :key="'slide-' + img"
          >
            <template #img>
              <div class="layout">
                <b-img
                  fluid
                  :src="background"
                  class="frame"
                  alt="Ornate gold picture frame. Image courtesy of https://pixabay.com/users/avantrend-321510/"
                />
                <b-img
                  fluid
                  lazy
                  :src="photo(img)"
                  alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
                  class="image"
                />
              </div>
            </template>
          </BCarouselSlide>
        </BCarousel>
        <template #fallback>
          <div class="layout">
            <img
              data-v-2fbdba03=""
              class="img-fluid frame"
              :src="background"
              loading="eager"
              alt="Ornate gold picture frame. Image courtesy of https://pixabay.com/users/avantrend-321510/"
            /><img
              data-v-2fbdba03=""
              class="img-fluid image"
              :src="photo(1)"
              loading="lazy"
              alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
            />
          </div>
        </template>
      </client-only>
    </div>
    <p class="text-center text--smallest">
      Photos of real freeglers, kindly taken by
      <ExternalLink href="https://www.alexbamford.com/"
        >Alex Bamford</ExternalLink
      >. Back when wearing masks was a thing...
    </p>
  </div>
</template>
<script setup lang="ts">
import { imageProxy } from '~/composables/useImageProxy'

const background = computed(() => {
  return imageProxy('/landingpage/frame.png', '/-/resize/634/-/format/webp/')
})

function photo(img) {
  return imageProxy(
    '/landingpage/Freegler' + img + '.jpeg',
    '/-/resize/634/-/format/webp/'
  )
}
</script>
<style scoped lang="scss">
.layout {
  max-height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.frame,
.image {
  grid-row: 1/2;
  grid-column: 1/2;
  max-height: 100%;
}

.frame {
  pointer-events: none;
  z-index: 2;
}

.image {
  padding: 17%;
  z-index: 1;
}
</style>
