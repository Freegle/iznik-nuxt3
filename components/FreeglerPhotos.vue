<template>
  <div class="d-flex flex-column justify-content-between">
    <div class="flex-grow-1">
      <client-only fallback-tag="div">
        <!--    todo    ride="carousel"-->
        <BCarousel class="carousel" fade background="/landingpage/frame.png">
          <BCarouselSlide
            v-for="img in [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20, 21, 22, 23, 24, 25,
            ]"
            :key="'slide-' + img"
          >
            <template #img>
              <div class="layout">
                <ProxyImage
                  loading="lazy"
                  src="/landingpage/frame.png"
                  class-name="frame"
                  alt="Ornate gold picture frame. Image courtesy of https://pixabay.com/users/avantrend-321510/"
                  sizes="1px sm:576px md:768"
                />
                <ProxyImage
                  loading="lazy"
                  :src="photo(img)"
                  alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
                  class-name="image"
                  sizes="1px sm:576px md:768"
                />
                <p class="text-center text--smallest credit">
                  Photos of real freeglers, kindly taken by
                  <ExternalLink href="https://www.alexbamford.com/"
                    >Alex Bamford</ExternalLink
                  >. Back when wearing masks was a thing...
                </p>
              </div>
            </template>
          </BCarouselSlide>
        </BCarousel>
        <template #fallback>
          <div class="layout">
            <ProxyImage
              preload
              src="/landingpage/frame.png"
              class-name="frame"
              alt="Ornate gold picture frame. Image courtesy of https://pixabay.com/users/avantrend-321510/"
              sizes="1px sm:576px md:768"
            />
            <ProxyImage
              preload
              :src="photo(1)"
              alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
              class-name="image"
              sizes="1px sm:576px md:768"
            />
          </div>
        </template>
      </client-only>
    </div>
  </div>
</template>
<script setup lang="ts">
function photo(img) {
  return '/landingpage/Freegler' + img + '.jpeg'
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.layout {
  max-height: 100%;
  display: grid;
  grid-template-columns: min-content;
  grid-template-rows: 1fr;
}

.frame,
.image {
  grid-row: 1/2;
  grid-column: 1/2;
  max-height: 100%;
}

.frame {
  :deep(img) {
    pointer-events: none;
    z-index: 2;
    min-height: 300px;
    position: relative;
    max-height: 50vh;

    @include media-breakpoint-up(sm) {
      max-height: 28vh;
    }

    @include media-breakpoint-up(lg) {
      max-height: 50vh;
    }
  }
}

.image {
  max-width: 100%;

  :deep(img) {
    padding: 7vh;
    z-index: 1;
    object-fit: cover;
    max-height: 50vh;
    min-height: 300px;
    position: relative;

    @include media-breakpoint-up(sm) {
      padding: 4vh;
      max-height: 28vh;
    }

    @include media-breakpoint-up(lg) {
      padding: 7vh;
      max-height: 50vh;
    }
  }
}
</style>
