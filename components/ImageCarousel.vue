<template>
  <div ref="wrapper" class="wrapper">
    <p class="text-center small">
      Drag image around. Zoom with pinch (on mobile) or Ctrl+mouse wheel.
    </p>
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
          <PinchMe :attachment="attachment" :width="width" :height="height" />
        </div>
      </b-carousel-slide>
    </b-carousel>
  </div>
</template>
<script setup>
import { useElementSize } from '@vueuse/core'
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
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

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

.wrapper {
  min-height: calc(80vh - $sticky-banner-height-mobile);

  @include media-breakpoint-up(md) {
    min-height: calc(80vh - $sticky-banner-height-desktop);
  }
}
</style>
