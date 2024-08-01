<template>
  <zoom-pinch
    ref="zoompinchRef"
    v-model:transform="transform"
    :rotation="false"
    mouse
    touch
    wheel
    gesture
    :min-scale="0.5"
    :max-scale="10"
    :width="Math.round(width * 0.95)"
    :height="Math.round(height * 0.95)"
    :style="
      'width: ' +
      Math.round(width * 0.95) +
      'px; height: ' +
      Math.round(height * 0.95) +
      'px'
    "
  >
    <template #canvas>
      <OurUploadedImage
        v-if="attachment.ouruid"
        :src="attachment.ouruid"
        :modifiers="attachment.externalmods"
        alt="Item picture"
        :width="Math.round(width * 0.95)"
        lazy
      />
      <NuxtPicture
        v-else-if="attachment.externaluid"
        format="webp"
        provider="uploadcare"
        :src="attachment.externaluid"
        :modifiers="attachment.externalmods"
        alt="Item picture"
        :width="Math.round(width * 0.95)"
        lazy
      />
      <b-img
        v-else
        generator-unable-to-provide-required-alt=""
        title="Item picture"
        :src="attachment.path"
        itemprop="image"
        class="w-100"
        lazy
      />
    </template>
  </zoom-pinch>
</template>
<script setup>
import { Zoompinch as ZoomPinch } from 'zoompinch'
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

function fit() {
  transform.value = { x: 0, y: 0, scale: 1, rotate: 0 }
  // zoompinchRef.value?.applyTransform(1, [0.5, 0.5], [1, 1])
}

onMounted(() => {
  setTimeout(() => fit(true))
})

watch(
  () => zoompinchRef.value?.wrapperBounds,
  () => {
    requestAnimationFrame(() => {
      zoompinchRef.value?.applyTransform(1, [0.5, 0.5], [0.5, 0.5], false)
    })
  }
)

watch(
  () => props.zoom,
  (newVal) => {
    zoompinchRef.value?.applyTransform(newVal, [0.5, 0.5], [0.5, 0.5], false)
  }
)

onMounted(() => {
  console.log('zl', zoompinchRef)
  fit()
})
</script>
