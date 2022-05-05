<template>
  <b-modal
    v-if="message"
    id="photoModal"
    v-model="showModal"
    :title="message.subject"
    size="lg"
    ok-only
  >
    <ImageCarousel
      :message-id="message.id"
      :attachments="message.attachments"
    />
    <template slot="modal-footer" slot-scope="{ cancel }">
      <b-button variant="secondary" @click="cancel"> Close </b-button>
    </template>
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
