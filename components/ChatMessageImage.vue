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
      :height="200"
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
      @error="brokenImage"
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
          @error="brokenImage"
        />
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
<script>
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'

export default {
  components: {
    ProfileImage,
  },
  extends: ChatBase,
  emits: ['delete'],
  data() {
    return {
      zoom: false,
    }
  },
  methods: {
    brokenImage(event) {
      event.target.src = '/placeholder.jpg'
    },
  },
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
