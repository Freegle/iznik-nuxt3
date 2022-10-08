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
    <b-img-lazy
      v-if="chatmessage.image"
      fluid
      class="chatimage clickme img-thumbnail rounded"
      generator-unable-to-provide-required-alt=""
      :src="chatmessage.image.path"
      @click.native="zoom = true"
      @error.native="brokenImage"
    />
    <ProfileImage
      v-if="messageIsFromCurrentUser"
      :image="chatMessageProfileImage"
      is-thumbnail
      size="sm"
      class="ml-1 mb-1 mt-1 inline"
    />
    <b-modal
      :id="'photoModal-' + chatmessage.id"
      ref="photoModal"
      v-model="zoom"
      size="lg"
      no-stacking
      ok-only
    >
      <template #default>
        <b-img-lazy
          v-if="chatmessage.image"
          fluid
          generator-unable-to-provide-required-alt=""
          :src="chatmessage.image.path"
          @error.native="brokenImage"
        />
      </template>
      <template #modal-footer>
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
