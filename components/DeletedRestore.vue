<template>
  <b-row>
    <b-col cols="12" xl="6" offset-xl="3" class="bottom verytop">
      <NoticeMessage
        v-if="me && me.deleted"
        variant="danger"
        class="mb-3 text-center"
      >
        <p class="text--large font-weight-bold">
          <v-icon icon="exclamation-triangle" />
          You deleted your account {{ timeago(me.deleted) }}. It will be
          completely removed soon.
        </p>
        <p class="font-weight-bold">
          Meanwhile, other freeglers can't see your details, posts or chats.
        </p>
        <p>
          If you've done this by mistake, or changed your mind, please click
          here:
        </p>
        <div class="d-flex justify-content-around">
          <SpinButton
            label="Restore your account"
            variant="primary"
            @handle="restore"
          />
        </div>
      </NoticeMessage>
    </b-col>
  </b-row>
</template>
<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

async function restore(handle) {
  await authStore.restore()
  handle()
}
</script>
<style scoped>
.bottom {
  position: fixed;
  bottom: 0;
}
</style>
