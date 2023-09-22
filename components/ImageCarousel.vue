<template>
  <div>
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
        <inner-image-zoom
          :key="'image-' + attachment.id"
          class="zind"
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
      type: Number,
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
