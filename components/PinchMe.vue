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
  >
    <zoom-pinch
      ref="zoompinchRef"
      v-model:transform="transform"
      class="zoompinch"
      :rotation="false"
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
import { onBeforeUnmount, computed } from 'vue'
import { ref } from '#imports'

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

// Expose whether image is zoomed for parent component
const isZoomed = computed(() => transform.value.scale > 1.05)

defineExpose({
  isZoomed,
  transform,
})

function fit() {
  requestAnimationFrame(() => {
    transform.value = { x: 0, y: 0, scale: 1, rotate: 0 }
  })
}

onMounted(() => {
  console.log('Mounted', fit)
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
}

:deep(.wrapper) {
  border: none;
}
</style>
