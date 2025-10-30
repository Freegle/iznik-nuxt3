<template>
  <div class="clickme d-flex">
    <div class="d-flex flex-column justify-content-around">
      <ProfileImage
        image="/icon.png"
        class="mr-1 mb-1 ml-1 inline"
        is-thumbnail
        size="lg"
      />
    </div>
    <div class="d-flex flex-column">
      <div>
        {{ notification.title }}
      </div>
      <div v-if="notification.text">
        "<span class="font-weight-bold">{{ notification.text }}</span
        >"
      </div>
      <abbr class="small">{{ notificationago }}</abbr>
    </div>
  </div>
</template>
<script setup>
import { setupNotification } from '~/composables/useNotification'
import ProfileImage from '~/components/ProfileImage'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

// Setup notification
const { notification, notificationago } = await setupNotification(props.id)
</script>
