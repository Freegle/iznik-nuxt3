<template>
  <span class="clickme">
    <PostPhoto
      v-bind="attachment"
      :externalmods="mods"
      @remove="removePhoto"
      @updated="updatedPhoto"
      @clicked="showModal"
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

<script>
import { useMessageStore } from '~/stores/message'
const PostPhoto = defineAsyncComponent(() =>
  import('../../components/PostPhoto')
)

export default {
  components: {
    PostPhoto,
  },
  props: {
    attachment: {
      type: Object,
      required: true,
    },
    message: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const messageStore = useMessageStore()
    return { messageStore }
  },
  data: function () {
    return {
      zoom: false,
    }
  },
  computed: {
    mods() {
      if (this.attachment.mods) {
        const jsonmods = JSON.parse(this.attachment.mods)
        if (!jsonmods) return {}
        return jsonmods
      }
      return {}
    },
  },
  methods: {
    showModal() {
      this.zoom = true
      this.$refs.modphotomodal?.show()
    },
    async removePhoto(id) {
      console.log('MP removePhoto', id, this.message.id)
      const attachments = []

      this.message.attachments.forEach((a) => {
        if (a.id !== id) {
          attachments.push(a.id)
        }
      })

      await this.messageStore.patch({ id: this.message.id, attachments })
    },
    async updatedPhoto() {
      await this.messageStore.patch({ id: this.message.id })
    },
  },
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
