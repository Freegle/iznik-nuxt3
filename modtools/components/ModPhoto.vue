<template>
  <span class="clickme">
    <PostPhoto v-bind="attachment" @remove="removePhoto" @click="zoom = true" />
    <ModPhotoModal v-if="zoom" :attachment="attachment" :message="message" />
  </span>
</template>

<script>
import { useMessageStore } from '../../stores/message'
const PostPhoto = defineAsyncComponent(() => import('../../components/PostPhoto'))

export default {
  components: {
    PostPhoto
  },
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
    const messageStore = useMessageStore()
    return { messageStore }
  },
  data: function () {
    return {
      zoom: false
    }
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
