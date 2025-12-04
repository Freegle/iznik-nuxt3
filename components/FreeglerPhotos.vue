<template>
  <div class="freegler-photos test-freegler-photos">
    <div class="photo-container">
      <!-- Static frame overlay -->
      <ProxyImage
        src="/landingpage/frame.png"
        class-name="static-frame"
        alt="Ornate gold picture frame"
        sizes="1px sm:576px md:768px"
      />

      <!-- Static first photo for SSR -->
      <div class="ssr-photo">
        <ProxyImage
          preload
          :src="photo(1)"
          alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
          class-name="freegler-image test-freegler-image"
          sizes="1px sm:576px md:768px"
        />
      </div>

      <!-- Rotating photos (client-side only) -->
      <client-only>
        <BCarousel
          class="photos-carousel test-photos-carousel"
          ride="carousel"
          fade
        >
          <BCarouselSlide
            v-for="img in [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
              20, 21, 22, 23, 24, 25,
            ]"
            :key="'slide-' + img"
            class="test-photo-slide"
          >
            <template #img>
              <ProxyImage
                loading="lazy"
                :src="photo(img)"
                alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
                class-name="freegler-image test-freegler-image"
                sizes="1px sm:576px md:768px"
              />
            </template>
          </BCarouselSlide>
        </BCarousel>
      </client-only>
    </div>

    <p class="credit text-center text--smallest test-photo-credit">
      Photos of real freeglers, kindly taken by
      <ExternalLink href="https://www.alexbamford.com/"
        >Alex Bamford</ExternalLink
      >. Back when wearing masks was a thing...
    </p>
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

.freegler-photos {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.photo-container {
  position: relative;
  display: block;
  width: 100%;
}

// Static frame - always on top
:deep(.static-frame),
:deep(.static-frame img) {
  position: relative;
  z-index: 10;
  pointer-events: none;
  display: block;
  width: 100%;
  height: auto;
}

// Carousel positioned behind frame - must exactly fill frame opening
.photos-carousel {
  position: absolute;
  top: 11%;
  left: 12%;
  right: 12%;
  bottom: 13%;
  z-index: 1;
  overflow: hidden;
}

:deep(.carousel-inner),
:deep(.carousel-item) {
  height: 100%;
}

// Fade transition
:deep(.carousel-item) {
  transition: opacity 0.8s ease-in-out;
}

:deep(.carousel-item-start) {
  opacity: 0;
}

:deep(.freegler-image),
:deep(.freegler-image img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  object-position: top;
  padding: 0 !important;
}

// SSR photo - same positioning as carousel, hidden when carousel loads
.ssr-photo {
  position: absolute;
  top: 11%;
  left: 12%;
  right: 12%;
  bottom: 13%;
  z-index: 1;
  overflow: hidden;

  :deep(.freegler-image),
  :deep(.freegler-image img) {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
    object-position: top;
    padding: 0 !important;
  }
}

// Hide SSR photo when carousel is present
.photos-carousel ~ .ssr-photo,
.photos-carousel + .ssr-photo {
  display: none;
}

.credit {
  margin-top: 0.5rem;

  /* Hide on mobile/tablet layouts (below lg) - desktop layout starts at lg */
  @include media-breakpoint-down(lg) {
    display: none;
  }
}
</style>
