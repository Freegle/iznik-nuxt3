<template>
  <div ref="wrapper" class="wrapper">
    <p class="text-center small">
      Drag image around. Zoom with pinch (on mobile) or Ctrl+mouse wheel. Width
    </p>
    <b-carousel
      :id="'message-carousel-' + messageId"
      v-model="slide"
      img-width="100%"
      :interval="0"
      no-touch
      fade
      :controls="false"
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
    <div v-if="attachments?.length > 1">
      <Teleport to="body">
        <b-button v-if="slide > 0" class="prev" @click="prev">
          <v-icon icon="arrow-circle-left" scale="2" />
        </b-button>
      </Teleport>
      <Teleport to="body">
        <b-button
          v-if="slide < attachments.length - 1"
          class="next"
          @click="next"
        >
          <v-icon icon="arrow-circle-right" />
        </b-button>
      </Teleport>
    </div>
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

// We have these buttons teleported to body because otherwise we can't do a position fixed, which doesn't work in
// a modal where a transform has been applied.
function next() {
  slide.value++
}
function prev() {
  slide.value--
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

.prev,
.next {
  background-color: transparent;
  z-index: 11000 !important;
  position: fixed;
  border: none;
  opacity: 0.5;

  :deep(svg) {
    width: 50px;
    height: 50px;
  }
}

.prev {
  top: 50vh;
  left: 20px;
}
.next {
  top: 50vh;
  right: 20px;
}

.wrapper {
  min-height: calc(80vh - $sticky-banner-height-mobile);
  width: 100%;

  @include media-breakpoint-up(md) {
    min-height: calc(80vh - $sticky-banner-height-desktop);
  }
}
</style>
