<template>
  <div
    :class="{
      myImage: messageIsFromCurrentUser,
      'd-flex': true,
      'justify-content-end': messageIsFromCurrentUser,
      'justify-content-start': !messageIsFromCurrentUser,
    }"
  >
    <ProfileImage
      v-if="!messageIsFromCurrentUser"
      :image="chatMessageProfileImage"
      is-thumbnail
      size="sm"
      class="mr-1 mb-1 mt-1 inline"
    />
    <OurUploadedImage
      v-if="chatmessage.image?.ouruid"
      :src="chatmessage.image.ouruid"
      :modifiers="chatmessage.image.externalmods"
      alt="Chat Photo"
      :width="200"
      @click="zoom = true"
    />
    <NuxtPicture
      v-else-if="chatmessage.image?.externaluid"
      format="webp"
      fit="cover"
      provider="uploadcare"
      :src="chatmessage.image.externaluid"
      :modifiers="chatmessage.image.externalmods"
      alt="Chat Photo"
      :width="200"
      :height="200"
      @click="zoom = true"
    />
    <b-img
      v-else-if="chatmessage.image"
      lazy
      fluid
      class="chatimage clickme img-thumbnail rounded"
      generator-unable-to-provide-required-alt=""
      :src="chatmessage.image.path"
      @click="zoom = true"
      @error="imageError"
    />
    <ProfileImage
      v-if="messageIsFromCurrentUser"
      :image="chatMessageProfileImage"
      is-thumbnail
      size="sm"
      class="ml-1 mb-1 mt-1 inline"
    />
    <b-modal
      ref="photoModal"
      v-model="zoom"
      scrollable
      size="lg"
      no-stacking
      ok-only
    >
      <template #default>
        <div class="d-flex justify-content-around">
          <NuxtPicture
            v-if="chatmessage.image?.externaluid"
            format="webp"
            fit="cover"
            provider="uploadcare"
            :src="chatmessage.image.externaluid"
            :modifiers="chatmessage.image.externalmods"
            alt="Chat Photo"
          />
          <b-img
            v-else-if="chatmessage.image"
            lazy
            fluid
            generator-unable-to-provide-required-alt=""
            :src="chatmessage.image.path"
            @error="imageError"
          />
        </div>
      </template>
      <template #footer>
        <b-button variant="outline-danger" @click="$emit('delete')">
          Delete
        </b-button>
        <b-button variant="white" @click="zoom = false"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useChatMessageBase } from '../composables/useChat'
import ProfileImage from '~/components/ProfileImage'
import OurUploadedImage from '~/components/OurUploadedImage'

const props = defineProps({
  chatid: {
    type: Number,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  last: {
    type: Boolean,
    required: false,
    default: false,
  },
  pov: {
    type: Number,
    required: false,
    default: null,
  },
  highlightEmails: {
    type: Boolean,
    required: false,
    default: false,
  },
})

defineEmits(['delete'])

// State
const zoom = ref(false)

// Use the chat base composable
const { chatmessage, messageIsFromCurrentUser, chatMessageProfileImage } =
  useChatMessageBase(props.chatid, props.id, props.pov)

// Methods
function imageError(event) {
  event.target.src = '/placeholder.jpg'
}
</script>
<style scoped>
.chatimage {
  max-height: 50vh;
}

:deep(.chatMessage) {
  border: none !important;
}

:deep(.myImage) {
  margin-left: auto;
}
</style>
