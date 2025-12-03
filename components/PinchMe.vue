<template>
  <div
    class="pinchwrapper justify-content-around"
    :style="
      'width: ' +
      Math.round(width * 0.95) +
      'px; height: ' +
      Math.round(height * 0.95) +
      'px'
    "
    @dblclick="handleDoubleTap"
    @touchend="handleTouchEnd"
  >
    <zoom-pinch
      ref="zoompinchRef"
      v-model:transform="transform"
      class="zoompinch"
      :class="{ 'not-zoomed': !isZoomed }"
      :rotation="false"
      :bounds="true"
      mouse
      touch
      wheel
      gesture
      :min-scale="1"
      :max-scale="10"
      :width="imageWidth"
      :height="imageHeight"
    >
      <template #canvas>
        <OurUploadedImage
          v-if="attachment.ouruid"
          :src="attachment.ouruid"
          :modifiers="attachment.externalmods"
          alt="Item picture"
          lazy
        />
        <NuxtPicture
          v-else-if="attachment.externaluid"
          format="webp"
          provider="uploadcare"
          :src="attachment.externaluid"
          :modifiers="attachment.externalmods"
          alt="Item picture"
          lazy
        />
        <b-img
          v-else
          generator-unable-to-provide-required-alt=""
          title="Item picture"
          :src="attachment.path"
          itemprop="image"
          lazy
        />
      </template>
    </zoom-pinch>
  </div>
</template>
<script setup>
import { Zoompinch as ZoomPinch } from 'zoompinch'
import { onBeforeUnmount, computed, watch } from 'vue'
import { ref } from '#imports'

const emit = defineEmits(['zoom-change'])

const props = defineProps({
  attachment: {
    type: Object,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  zoom: {
    type: Number,
    required: false,
    default: 1,
  },
})

const zoompinchRef = ref(null)
const transform = ref({ x: 0, y: 0, scale: 1, rotate: 0 })

// Double-tap detection for touch devices
const lastTapTime = ref(0)
const DOUBLE_TAP_DELAY = 300

function handleTouchEnd(e) {
  // Only handle single-finger taps
  if (e.touches.length > 0) return

  const now = Date.now()
  if (now - lastTapTime.value < DOUBLE_TAP_DELAY) {
    // Double tap detected
    handleDoubleTap()
    lastTapTime.value = 0
  } else {
    lastTapTime.value = now
  }
}

function handleDoubleTap() {
  if (isZoomed.value) {
    resetTransform()
  }
}

// Expose whether image is zoomed for parent component
const isZoomed = computed(() => transform.value.scale > 1.05)

// Reset transform to default (used when swiping between images)
function resetTransform() {
  transform.value = { x: 0, y: 0, scale: 1, rotate: 0 }
}

// Emit when zoom state changes so parent can track it reliably
watch(isZoomed, (newValue) => {
  emit('zoom-change', newValue)
})

defineExpose({
  isZoomed,
  transform,
  resetTransform,
})

function fit() {
  requestAnimationFrame(() => {
    transform.value = { x: 0, y: 0, scale: 1, rotate: 0 }
  })
}

onMounted(() => {
  console.log('[PINCHME] Mounted, width:', props.width, 'height:', props.height)
  console.log(
    '[PINCHME] attachment:',
    JSON.stringify({
      ouruid: props.attachment?.ouruid,
      externaluid: props.attachment?.externaluid,
      path: props.attachment?.path,
    })
  )
  setTimeout(() => fit(true))
})

watch(
  () => zoompinchRef.value?.wrapperBounds,
  (newVal) => {
    fit()
  }
)

watch(
  () => props.zoom,
  (newVal) => {
    console.log('Zoom to', newVal)
    transform.value.scale = newVal
  }
)

// Continuously clamp position when not zoomed - watch entire transform
watch(
  transform,
  (t) => {
    if (t.scale <= 1.05) {
      // Not zoomed - force position to center
      if (t.x !== 0 || t.y !== 0) {
        transform.value.x = 0
        transform.value.y = 0
      }
    }
  },
  { deep: true }
)

let monitorTimeout = null
const imageWidth = ref(props.width)
const imageHeight = ref(props.height)

function getNaturalSizes() {
  const parent = zoompinchRef.value?.$el

  if (parent) {
    const img = parent.querySelector('img')
    if (
      img &&
      img.naturalWidth &&
      img.naturalHeight &&
      img.naturalHeight !== imageHeight.value &&
      img.naturalWidth !== imageWidth.value
    ) {
      imageWidth.value = img.naturalWidth
      imageHeight.value = img.naturalHeight
      fit()
    }
  }

  monitorTimeout = setTimeout(getNaturalSizes, 100)
}

onMounted(() => {
  console.log('zl', zoompinchRef)
  getNaturalSizes()
  fit()
})

onBeforeUnmount(() => {
  clearTimeout(monitorTimeout)
})
</script>
<style scoped lang="scss">
.zoompinch {
  width: 100%;
  height: 100%;
  cursor: move;

  &.not-zoomed {
    touch-action: pan-x pan-y;
  }
}

:deep(.wrapper) {
  border: none;
}
</style>
