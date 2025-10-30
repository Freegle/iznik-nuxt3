<template>
  <b-modal
    ref="modal"
    :title="message.subject"
    ok-only
    ok-variant="secondary"
    ok-title="Close"
    fullscreen
  >
    <ImageCarousel
      v-if="message?.attachments?.length"
      :message-id="message.id"
      :attachments="message.attachments"
    />
  </b-modal>
</template>

<script setup>
import { computed } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'
import ImageCarousel from '~/components/ImageCarousel'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const messageStore = useMessageStore()

const { modal } = useOurModal()

const message = computed(() => {
  return messageStore?.byId(props.id)
})
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
