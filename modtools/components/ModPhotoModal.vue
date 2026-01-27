<template>
  <b-modal
    :id="'photoModal-' + attachment.id"
    ref="modal"
    :title="message.subject"
    size="lg"
    no-stacking
    ok-only
  >
    <template #default>
      <PostPhoto
        v-bind="attachment"
        :thumbnail="false"
        :externalmods="externalmods"
        @remove="removePhoto"
        @updated="updatedPhoto"
      />
    </template>

    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  attachment: {
    type: Object,
    required: true,
  },
  message: {
    type: Object,
    required: true,
  },
  externalmods: {
    type: Object,
    required: true,
  },
})

const { modal, show, hide } = useOurModal()
const messageStore = useMessageStore()

async function updatedPhoto() {
  await messageStore.patch({ id: props.message.id })
}

async function removePhoto(id) {
  const attachments = []

  props.message.attachments.forEach((a) => {
    if (a.id !== id) {
      attachments.push(a.id)
    }
  })

  await messageStore.patch({ id: props.message.id, attachments })
}

defineExpose({ show, hide })
</script>

<style scoped>
.square {
  object-fit: cover;
  max-width: 200px;
  min-width: 200px;
  min-height: 200px;
  max-height: 200px;
  width: 200px;
  height: 200px;
}

:deep(img) {
  width: 100%;
}
</style>
