<template>
  <b-modal
    v-if="message"
    id="photoModal"
    v-model="showModal"
    :title="message.subject"
    size="lg"
    ok-only
    ok-variant="secondary"
    ok-title="Close"
  >
    <ImageCarousel
      :message-id="message.id"
      :attachments="message.attachments"
    />
  </b-modal>
</template>
<script>
import { useMessageStore } from '../stores/message'
import modal from '@/mixins/modal'
import ImageCarousel from '@/components/ImageCarousel'

export default {
  components: { ImageCarousel },
  mixins: [modal],
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props, ctx) {
    const messageStore = useMessageStore()
    return { messageStore }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
  },
}
</script>
<style scoped lang="scss">
:deep(.carousel-caption) {
  position: unset !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

:deep(.carousel-item.active) {
  background-color: transparent !important;
}
</style>
