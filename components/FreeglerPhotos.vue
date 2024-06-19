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
import { useRuntimeConfig } from '#app'

const runtimeConfig = useRuntimeConfig()
const userSite = runtimeConfig.public.USER_SITE
const proxy = runtimeConfig.public.UPLOADCARE_PROXY

// We use Uploadcare's proxy to serve smaller images.
const background = computed(() => {
  return (
    proxy + '/-/resize/634/-/format/webp/' + userSite + '/landingpage/frame.png'
  )
})

function photo(img) {
  return (
    proxy +
    '/-/resize/634/-/format/webp/' +
    userSite +
    '/landingpage/Freegler' +
    img +
    '.jpeg'
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
