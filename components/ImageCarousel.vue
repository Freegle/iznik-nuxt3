<template>
  <div>
    <b-carousel
      :id="'message-carousel-' + messageId"
      v-model="slide"
      img-width="100%"
      :interval="0"
      no-touch
      :controls="attachments.length > 1"
      @sliding-end="slideEnd"
    >
      <b-carousel-slide
        v-for="(attachment, index) in attachments"
        :id="'message-carousel-' + messageId + '-' + index"
        :key="'mesagephohoto-' + attachment.id"
        :active="slide === index"
      >
        <inner-image-zoom
          zoom-type="click"
          :src="attachment.path"
          :alt="'Message photo ' + index"
          :zoom-scale="3"
        />
      </b-carousel-slide>
    </b-carousel>
  </div>
</template>
<script>
import 'vue-inner-image-zoom/lib/vue-inner-image-zoom.css'
import InnerImageZoom from 'vue-inner-image-zoom'

export default {
  components: {
    'inner-image-zoom': InnerImageZoom,
  },
  props: {
    messageId: {
      type: String,
      required: true,
    },
    attachments: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      slide: 0,
    }
  },
  methods: {
    slideEnd(slide) {
      this.slide = slide
    },
  },
}
</script>
<style scoped lang="scss">
//:deep(.carousel-caption) {
//  position: unset !important;
//}
//
//:deep(:not(.vh--none) .messagePhoto) {
//  max-height: calc(100vh - 150px) !important;
//  object-fit: cover;
//}
//
//:deep(.width) {
//  width: 100% !important;
//
//  div:not(.vh--message-bottom) {
//    width: 100% !important;
//  }
//}
</style>
