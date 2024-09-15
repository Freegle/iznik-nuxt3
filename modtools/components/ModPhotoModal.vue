<template>
  <b-modal ref="modal" :id="'photoModal-' + attachment.id" :title="message.subject" size="lg" no-stacking ok-only>
    <template #default>
      <PostPhoto v-bind="attachment" :thumbnail="false" @remove="removePhoto" />
    </template>

    <template #footer>
      <b-button variant="white" @click="hide">
        Close
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { useModal } from '~/composables/useModal'
import { useMessageStore } from '../../stores/message'

export default {
  props: {
    attachment: {
      type: Object,
      required: true
    },
    message: {
      type: Object,
      required: true
    }
  },
  setup() {
    const { modal, hide } = useModal()
    const messageStore = useMessageStore()
    return { messageStore, modal, hide }
  },
  methods: {
    async removePhoto(id) {
      const attachments = []

      this.message.attachments.forEach(a => {
        if (a.id !== id) {
          attachments.push(a.id)
        }
      })

      await this.messageStore.patch(this.message.id, attachments)
    }
  }
}
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
