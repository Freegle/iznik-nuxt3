<template>
  <Teleport to="body">
    <div class="fullscreen-viewer" @click="handleBackgroundClick">
      <!-- Back button -->
      <button class="back-button" @click.stop="close">
        <v-icon icon="arrow-left" />
      </button>

      <!-- Image counter -->
      <div v-if="attachmentCount > 1" class="image-counter">
        {{ currentIndex + 1 }} / {{ attachmentCount }}
      </div>

      <!-- Swipeable image area -->
      <div
        ref="imageContainer"
        class="image-container"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <div
          class="images-wrapper"
          :style="imagesWrapperStyle"
          :class="{ transitioning: isTransitioning }"
        >
          <div
            v-for="(attachment, index) in message?.attachments"
            :key="attachment.id || index"
            class="image-slide"
          >
            <PinchMe
              v-if="isReady && Math.abs(index - currentIndex) <= 1"
              :ref="
                (el) => {
                  if (el) pinchRefs[index] = el
                }
              "
              :attachment="attachment"
              :width="containerWidth"
              :height="containerHeight"
              :zoom="1"
            />
          </div>
        </div>
      </div>

      <!-- Navigation dots -->
      <div v-if="attachmentCount > 1" class="nav-dots">
        <span
          v-for="(_, index) in message?.attachments"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click.stop="goToImage(index)"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import { useMessageStore } from '~/stores/message'
import { useModalHistory } from '~/composables/useModalHistory'
import PinchMe from '~/components/PinchMe.vue'
import 'zoompinch/style.css'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['hidden'])

const messageStore = useMessageStore()

// Handle browser back button/swipe to close modal
useModalHistory(`photos-${props.id}`, () => emit('hidden'))

const message = computed(() => messageStore?.byId(props.id))

const attachmentCount = computed(() => message.value?.attachments?.length || 0)

// Current image index
const currentIndex = ref(0)

// Ready flag - wait for modal to be fully rendered before showing PinchMe
const isReady = ref(false)

// Use element size for accurate dimensions (like ImageCarousel does)
const imageContainer = ref(null)
const { width: containerWidth, height: containerHeight } =
  useElementSize(imageContainer)

// Refs to PinchMe components to check zoom state
const pinchRefs = ref({})

// Touch handling for swipe
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchDeltaX = ref(0)
const isSwiping = ref(false)
const isTransitioning = ref(false)

// Check if current image is zoomed
const isCurrentImageZoomed = computed(() => {
  const currentPinch = pinchRefs.value[currentIndex.value]
  return currentPinch?.isZoomed?.value || false
})

// Computed style for the images wrapper
const imagesWrapperStyle = computed(() => {
  const baseTranslate = -currentIndex.value * 100
  const swipeOffset = isSwiping.value
    ? (touchDeltaX.value / (containerWidth.value || 375)) * 100
    : 0
  return {
    transform: `translateX(calc(${baseTranslate}% + ${swipeOffset}%))`,
  }
})

function onTouchStart(e) {
  // Don't interfere with pinch gestures (2+ fingers) or when zoomed
  if (e.touches.length > 1 || isCurrentImageZoomed.value) return

  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  touchDeltaX.value = 0
  isSwiping.value = false
}

function onTouchMove(e) {
  // Don't swipe when zoomed - let pinch-zoom handle panning
  if (e.touches.length > 1 || isCurrentImageZoomed.value) {
    isSwiping.value = false
    return
  }

  const deltaX = e.touches[0].clientX - touchStartX.value
  const deltaY = e.touches[0].clientY - touchStartY.value

  // Only start swiping if horizontal movement is greater than vertical
  if (
    !isSwiping.value &&
    Math.abs(deltaX) > Math.abs(deltaY) &&
    Math.abs(deltaX) > 10
  ) {
    isSwiping.value = true
  }

  if (isSwiping.value) {
    e.preventDefault()
    touchDeltaX.value = deltaX
  }
}

function onTouchEnd() {
  if (!isSwiping.value) return

  const threshold = (containerWidth.value || 375) * 0.2 // 20% of screen width

  if (touchDeltaX.value > threshold && currentIndex.value > 0) {
    // Swipe right - go to previous
    goToImage(currentIndex.value - 1)
  } else if (
    touchDeltaX.value < -threshold &&
    currentIndex.value < attachmentCount.value - 1
  ) {
    // Swipe left - go to next
    goToImage(currentIndex.value + 1)
  }

  isSwiping.value = false
  touchDeltaX.value = 0
}

function goToImage(index) {
  isTransitioning.value = true
  currentIndex.value = index
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

function close() {
  emit('hidden')
}

function handleBackgroundClick(e) {
  // Only close if clicking directly on the background, not on images
  if (e.target.classList.contains('fullscreen-viewer')) {
    close()
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowLeft' && currentIndex.value > 0) {
    goToImage(currentIndex.value - 1)
  } else if (
    e.key === 'ArrowRight' &&
    currentIndex.value < attachmentCount.value - 1
  ) {
    goToImage(currentIndex.value + 1)
  }
}

// Watch for container size to become available
watch(
  () => containerWidth.value,
  (newWidth) => {
    if (newWidth > 0 && containerHeight.value > 0) {
      isReady.value = true
    }
  }
)

onMounted(() => {
  // Prevent body scroll
  document.body.style.overflow = 'hidden'

  // Listen for keyboard events
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Restore body scroll
  document.body.style.overflow = ''

  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.fullscreen-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  touch-action: none;
}

.back-button {
  position: absolute;
  top: env(safe-area-inset-top, 0);
  left: 0;
  margin: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10001;
  font-size: 1.25rem;

  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
}

.image-counter {
  position: absolute;
  top: env(safe-area-inset-top, 0);
  right: 0;
  margin: 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 1rem;
  font-size: 0.875rem;
  z-index: 10001;
}

.image-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.images-wrapper {
  display: flex;
  height: 100%;
  will-change: transform;

  &.transitioning {
    transition: transform 0.3s ease-out;
  }
}

.image-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-dots {
  position: absolute;
  bottom: env(safe-area-inset-bottom, 0);
  left: 0;
  right: 0;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  z-index: 10001;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;

  &.active {
    background: #fff;
    transform: scale(1.25);
  }
}

:deep(.pinchwrapper) {
  background: #000;
}

:deep(.zoompinch) {
  background: #000;
}
</style>
