<template>
  <div class="clickme d-flex">
    <div class="d-flex flex-column justify-content-start">
      <ProfileImage
        image="/icon.png"
        class="mr-1 mb-1 ml-1 inline"
        is-thumbnail
        size="lg"
      />
    </div>
    <div class="d-flex flex-column">
      <div class="font-weight-bold">Tell us about yourself!</div>
      <div v-if="!notification.text">
        <p>
          You can introduce to other freeglers by telling us a bit about you.
          You'll get a better response and it makes freegling more fun.
        </p>
        <b-button variant="primary" class="m-1 mb-3" @click="showModal"
          >Introduce yourself</b-button
        >
        <p>Or you can give something away, or ask for something you need.</p>
        <div class="d-flex flex-wrap justify-content-between mb-2">
          <b-button to="/give" variant="primary" class="m-1"
            >Give something</b-button
          >
          <b-button to="/find" variant="secondary" class="m-1"
            >Ask for something</b-button
          >
        </div>
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

const emit = defineEmits(['showModal'])

// Setup notification
const { notification, notificationago } = await setupNotification(props.id)

function showModal() {
  emit('showModal')
}
</script>
