<template>
  <div ref="gridRef" class="photo-grid">
    <div v-for="i in photoCount" :key="i" class="photo-cell">
      <ProxyImage
        :src="photoSrc(i - 1)"
        :preload="i <= 4"
        :loading="i > 4 ? 'lazy' : undefined"
        alt="Happy freegler with their freegled item. Photo by Alex Bamford."
        class-name="grid-photo"
        :width="600"
        :height="800"
        sizes="(max-width: 576px) 188px, (max-width: 768px) 256px, 248px"
      />
    </div>
  </div>
</template>

<script setup>
import { useState, ref, onMounted } from '#imports'

const TOTAL_PHOTOS = 25

const shuffledPhotos = useState('photo-grid-shuffle', () => {
  const indices = Array.from({ length: TOTAL_PHOTOS }, (_, i) => i + 1)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
})

/* Render enough cells for the largest breakpoint (5 cols x 3 rows). CSS hides extras on smaller screens. */
const photoCount = 15

function photoSrc(index) {
  return (
    '/landingpage/Freegler' +
    shuffledPhotos.value[index % TOTAL_PHOTOS] +
    '.jpeg'
  )
}

const gridRef = ref(null)

onMounted(() => {
  if (!gridRef.value) return

  const imgs = gridRef.value.querySelectorAll('img')

  imgs.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded')
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), {
        once: true,
      })
      img.addEventListener('error', () => img.classList.add('loaded'), {
        once: true,
      })
    }
  })
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;

  @include media-breakpoint-up(sm) {
    gap: 4px;
  }

  @include media-breakpoint-up(md) {
    grid-template-columns: repeat(3, 1fr);
  }

  @include media-breakpoint-up(lg) {
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
  }

  @include media-breakpoint-up(xl) {
    grid-template-columns: repeat(5, 1fr);
  }
}

.photo-cell {
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: $color-green--dark;

  /* Mobile: show 4 (2x2) */
  &:nth-child(n + 5) {
    display: none;
  }

  /* Tablet: show 9 (3x3) */
  @include media-breakpoint-up(md) {
    &:nth-child(n + 5) {
      display: block;
    }
    &:nth-child(n + 10) {
      display: none;
    }
  }

  /* Desktop: show 12 (4x3) */
  @include media-breakpoint-up(lg) {
    &:nth-child(n + 10) {
      display: block;
    }
    &:nth-child(n + 13) {
      display: none;
    }
  }

  /* Wide desktop: show 15 (5x3) */
  @include media-breakpoint-up(xl) {
    &:nth-child(n + 13) {
      display: block;
    }
  }
}

:deep(.grid-photo),
:deep(.grid-photo img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
  object-position: center 20%;
}

:deep(.grid-photo img) {
  opacity: 0;
  transition: opacity 0.4s ease-in;

  &.loaded {
    opacity: 1;
  }
}
</style>
