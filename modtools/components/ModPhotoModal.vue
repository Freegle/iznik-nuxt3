<template>
  <b-modal
    v-if="attachment"
    :id="'photoModal-' + attachmentid"
    ref="modal"
    :title="message?.subject"
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
import { computed } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  messageid: {
    type: Number,
    required: true,
  },
  attachmentid: {
    type: Number,
    required: true,
  },
})

const { modal, show, hide } = useOurModal()
const messageStore = useMessageStore()

const message = computed(() => messageStore.byId(props.messageid))

const attachment = computed(() => {
  return message.value?.attachments?.find((a) => a.id === props.attachmentid)
})

const externalmods = computed(() => {
  if (attachment.value?.mods) {
    const jsonmods = JSON.parse(attachment.value.mods)
    if (!jsonmods) return {}
    return jsonmods
  }
  return {}
})

async function updatedPhoto() {
  await messageStore.patch({ id: props.messageid })
}

async function removePhoto(id) {
  const attachments = []

  message.value?.attachments?.forEach((a) => {
    if (a.id !== id) {
      attachments.push(a.id)
    }
  })

  await messageStore.patch({ id: props.messageid, attachments })
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
