<template>
  <span class="clickme">
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
      :attachment="attachment"
      :message="message"
      :externalmods="mods"
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
  attachment: {
    type: Object,
    required: true,
  },
  message: {
    type: Object,
    required: true,
  },
})

const messageStore = useMessageStore()

const zoom = ref(false)
const modphotomodal = ref(null)

const mods = computed(() => {
  if (props.attachment.mods) {
    const jsonmods = JSON.parse(props.attachment.mods)
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
  console.log('MP removePhoto', id, props.message.id)
  const attachments = []

  props.message.attachments.forEach((a) => {
    if (a.id !== id) {
      attachments.push(a.id)
    }
  })

  await messageStore.patch({ id: props.message.id, attachments })
}

async function updatedPhoto() {
  await messageStore.patch({ id: props.message.id })
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
