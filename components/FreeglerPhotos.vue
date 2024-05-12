<template>
  <div class="d-flex flex-column justify-content-between">
    <BCarousel
      class="carousel"
      ride="carousel"
      fade
      background="/landingpage/frame.png"
    >
      <BCarouselSlide
        v-for="img in [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25,
        ]"
        :key="'slide-' + img"
      >
        <template #img>
          <div class="layout">
            <b-img fluid src="/landingpage/frame.png" class="frame" />
            <b-img
              fluid
              lazy
              :src="'/landingpage/Freegler' + img + '.jpeg'"
              class="image"
            />
          </div>
        </template>
      </BCarouselSlide>
    </BCarousel>
  </div>
  <p class="text-center text--smallest">
    Photos of real freeglers, kindly taken by
    <ExternalLink href="https://www.alexbamford.com/">Alex Bamford</ExternalLink
    >. Back when wearing masks was a thing...
  </p>
</template>
<script setup lang="ts"></script>
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
