<template>
  <div class="gallery-section">
    <div ref="galleryWall" class="gallery-wall">
      <!-- Left side frames -->
      <div
        v-for="(idx, i) in leftIndices"
        :key="'left-' + i"
        class="frame-wrapper frame-wrapper--side"
      >
        <div class="frame-container">
          <div class="photo-wrapper">
            <ProxyImage
              :src="photo(idx)"
              alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
              class-name="frame-photo"
            />
          </div>
          <ProxyImage
            src="/landingpage/frame.png"
            class-name="frame-overlay"
            alt=""
          />
        </div>
      </div>

      <!-- Center frame (larger) -->
      <div class="frame-wrapper frame-wrapper--center">
        <div class="frame-container">
          <div class="photo-wrapper">
            <ProxyImage
              :src="photo(centerIndex)"
              alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
              class-name="frame-photo"
            />
          </div>
          <ProxyImage
            src="/landingpage/frame.png"
            class-name="frame-overlay"
            alt=""
          />
        </div>
      </div>

      <!-- Right side frames -->
      <div
        v-for="(idx, i) in rightIndices"
        :key="'right-' + i"
        class="frame-wrapper frame-wrapper--side"
      >
        <div class="frame-container">
          <div class="photo-wrapper">
            <ProxyImage
              :src="photo(idx)"
              alt="Picture of a real freegler, looking happy. Photo by Alex Bamford."
              class-name="frame-photo"
            />
          </div>
          <ProxyImage
            src="/landingpage/frame.png"
            class-name="frame-overlay"
            alt=""
          />
        </div>
      </div>
    </div>

    <!-- Slogan below the gallery -->
    <div class="gallery-slogan">
      <h1 class="slogan-title">
        <span class="slogan-line1">Share the love.</span>
        <span class="slogan-line2">Love the share.</span>
      </h1>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useState } from '#imports'

const SIDE_FRAME_WIDTH = 160
const CENTER_FRAME_WIDTH = 220
const GAP = 12
const PADDING = 32
const TOTAL_PHOTOS = 18

const galleryWall = ref(null)
const containerWidth = ref(768)

// Use useState to preserve random indices across SSR -> client hydration
const shuffledIndices = useState('freegler-carousel-photos', () => {
  // Generate shuffled array once on SSR, reused on client
  const indices = Array.from({ length: TOTAL_PHOTOS }, (_, i) => i + 1)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
})

let resizeObserver = null

const sideFrameCount = computed(() => {
  const availableWidth = containerWidth.value - CENTER_FRAME_WIDTH - PADDING
  const frameWithGap = SIDE_FRAME_WIDTH + GAP
  const totalSideFrames = Math.floor(availableWidth / frameWithGap)
  return Math.floor(totalSideFrames / 2)
})

// Use shuffled indices from SSR state
const centerIndex = computed(() => shuffledIndices.value[0])

const leftIndices = computed(() => {
  const count = sideFrameCount.value
  const indices = []
  for (let i = 0; i < count; i++) {
    indices.push(shuffledIndices.value[1 + i])
  }
  return indices
})

const rightIndices = computed(() => {
  const count = sideFrameCount.value
  const startIdx = 1 + sideFrameCount.value
  const indices = []
  for (let i = 0; i < count; i++) {
    indices.push(shuffledIndices.value[startIdx + i])
  }
  return indices
})

function photo(index) {
  return '/landingpage/Freegler' + index + '.jpeg'
}

function updateWidth() {
  if (galleryWall.value) {
    containerWidth.value = galleryWall.value.offsetWidth
  }
}

onMounted(() => {
  updateWidth()

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateWidth)
    if (galleryWall.value) {
      resizeObserver.observe(galleryWall.value)
    }
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.gallery-section {
  width: 100%;
  margin: 0;
  padding: 0;
}

.gallery-wall {
  /* Wallpaper background */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  min-height: 32vh;
  padding: 1.5rem 1rem;
  padding-top: calc(1.5rem + 17px);
  margin-top: -17px;
  position: relative;

  /* Wallpaper background */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url('/wallpaper.png');
    background-repeat: repeat;
    pointer-events: none;
  }
}

.frame-wrapper {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.frame-wrapper--side {
  width: min(160px, 22vh);
}

.frame-wrapper--center {
  width: min(220px, 30vh);
}

.frame-container {
  position: relative;
  width: 100%;
  aspect-ratio: 0.8;
  overflow: hidden;
}

.photo-wrapper {
  position: absolute;
  top: max(13%, 22px);
  left: max(14%, 24px);
  right: max(14%, 24px);
  bottom: max(15%, 26px);
  overflow: hidden;
}

:deep(.frame-photo),
:deep(.frame-photo img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  object-position: bottom;
}

:deep(.frame-overlay),
:deep(.frame-overlay img) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none;
}

.gallery-slogan {
  text-align: center;
  padding: 0.75rem 1rem;
  background: white;
}

.slogan-title {
  font-size: clamp(1rem, 3vw, 1.5rem);
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
}

.slogan-line1 {
  display: block;
  color: $colour-header;
}

.slogan-line2 {
  display: block;
  color: $colour-success;
}
</style>
