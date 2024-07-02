<template>
  <div ref="wrapper" style="min-height: 80vh; min-width: 95%" class="wrapper">
    <b-carousel
      :id="'message-carousel-' + messageId"
      v-model="slide"
      img-width="100%"
      :interval="0"
      no-touch
      :controls="attachments?.length > 1"
    >
      <b-carousel-slide
        v-for="(attachment, index) in attachments"
        :id="'message-carousel-' + messageId + '-' + index"
        :key="'mesagephohoto-' + attachment.id"
        :active="slide === index"
        class="slide"
      >
        <div class="d-flex justify-content-around">
          <zoom-pinch
            :rotation="false"
            mouse
            touch
            wheel
            gesture
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
              <NuxtPicture
                v-if="attachment.externaluid"
                format="webp"
                provider="uploadcare"
                :src="attachment.externaluid"
                :modifiers="attachment.externalmods"
                alt="Item picture"
                :width="Math.round(width * 0.95)"
              />
              <b-img
                v-else
                generator-unable-to-provide-required-alt=""
                title="Item picture"
                :src="attachment.path"
                itemprop="image"
                class="w-100"
              />
            </template>
          </zoom-pinch>
        </div>
      </b-carousel-slide>
    </b-carousel>
  </div>
</template>
<script setup>
import { useElementSize } from '@vueuse/core'
import { Zoompinch as ZoomPinch } from 'zoompinch'
import { ref } from '#imports'
import 'zoompinch/style.css'

const wrapper = ref(null)

defineProps({
  messageId: {
    type: Number,
    required: true,
  },
  attachments: {
    type: Array,
    required: true,
  },
})

const slide = ref(0)

const { width, height } = useElementSize(wrapper)

// Make width and height <= 3000 as that's an Uploadcare limit.
if (width > 3000) {
  width.value = 3000
}
if (height > 3000) {
  height.value = 3000
}
</script>
<style scoped lang="scss">
:deep(.carousel-control-prev) {
  z-index: 11000 !important;
}

:deep(.carousel-control-next) {
  z-index: 11000 !important;
}

:deep(.iiz__btn) {
  z-index: 11001;
  right: 50%;
}
</style>
