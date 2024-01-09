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
        <b-button variant="primary" size="lg" @click="restore">
          Restore your account
        </b-button>
      </NoticeMessage>
    </b-col>
  </b-row>
</template>
<script setup>
function restore() {}
</script>
<style scoped>
.bottom {
  position: fixed;
  bottom: 0;
}
</style>
