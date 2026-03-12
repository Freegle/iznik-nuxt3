<template>
  <span v-if="attachment" class="clickme">
    <PostPhoto
      v-bind="attachment"
      :externalmods="mods"
      :show-ai-badge="true"
      @remove="removePhoto"
      @updated="updatedPhoto"
      @click="showModal"
    />
    <ModPhotoModal
      v-if="zoom"
      ref="modphotomodal"
      :messageid="messageid"
      :attachmentid="attachmentid"
    />
  </span>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useMessageStore } from '~/stores/message'

const PostPhoto = defineAsyncComponent(() =>
  import('../../components/PostPhoto')
)

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

const messageStore = useMessageStore()

const zoom = ref(false)
const modphotomodal = ref(null)

const message = computed(() => messageStore.byId(props.messageid))

const attachment = computed(() => {
  return message.value?.attachments?.find((a) => a.id === props.attachmentid)
})

const mods = computed(() => {
  if (attachment.value?.mods) {
    const jsonmods = JSON.parse(attachment.value.mods)
    if (!jsonmods) return {}
    return jsonmods
  }
  return {}
})

function showModal() {
  zoom.value = true
  modphotomodal.value?.show()
}

async function removePhoto(id) {
  console.log('MP removePhoto', id, props.messageid)
  const attachments = []

  message.value?.attachments?.forEach((a) => {
    if (a.id !== id) {
      attachments.push(a.id)
    }
  })

  await messageStore.patch({ id: props.messageid, attachments })
}

async function updatedPhoto() {
  await messageStore.patch({ id: props.messageid })
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
  width: 200px;
  height: 200px;
  object-fit: cover;
}
</style>
