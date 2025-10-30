<template>
  <div class="clickme d-flex" @click="goto">
    <div class="d-flex flex-column justify-content-around">
      <ProfileImage
        image="/icon.png"
        class="mr-1 mb-1 ml-1 inline"
        is-thumbnail
        size="lg"
      />
    </div>
    <div class="d-flex flex-column">
      <div>Thank you for donating to Freegle!</div>
      <div v-if="notification.text">
        Your kind donation can go even further if you complete a Gift Aid
        Declaration. Please click here.
      </div>
      <abbr class="small">{{ notificationago }}</abbr>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { setupNotification } from '~/composables/useNotification'
import ProfileImage from '~/components/ProfileImage'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const router = useRouter()

// Setup notification
const { notification, notificationStore, notificationago } =
  await setupNotification(props.id)

function goto() {
  if (!notification.value?.seen) {
    notificationStore.seen(props.id)
  }

  router.push('/giftaid')
}
</script>
