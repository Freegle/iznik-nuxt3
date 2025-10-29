<template>
  <div
    v-if="notification"
    class="notification__wrapper"
    :class="notification?.seen ? 'border-bottom' : 'bg-info border-bottom'"
    @click="click"
    @mouseover="markSeen"
  >
    <NotificationLovedPost v-if="notification.type === 'LovedPost'" :id="id" />
    <NotificationLovedComment
      v-else-if="notification.type === 'LovedComment'"
      :id="id"
    />
    <NotificationCommentOnPost
      v-else-if="notification.type === 'CommentOnYourPost'"
      :id="id"
    />
    <NotificationCommentOnComment
      v-else-if="notification.type === 'CommentOnCommented'"
      :id="id"
    />
    <NotificationExhort v-else-if="notification.type === 'Exhort'" :id="id" />
    <NotificationAboutMe
      v-else-if="notification.type === 'AboutMe'"
      :id="id"
      @show-modal="showModal"
    />
    <NotificationGiftAid v-else-if="notification.type === 'GiftAid'" :id="id" />
    <NotificationOpenPosts
      v-else-if="notification.type === 'OpenPosts'"
      :id="id"
    />
    <span v-else-if="notification.type === 'TryFeed'" />
    <span v-else> Unknown notification {{ notification.type }} </span>
  </div>
</template>
<script setup>
import { defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { setupNotification } from '~/composables/useNotification'

const NotificationGiftAid = defineAsyncComponent(() =>
  import('~/components/NotificationGiftAid')
)
const NotificationLovedPost = defineAsyncComponent(() =>
  import('~/components/NotificationLovedPost')
)
const NotificationLovedComment = defineAsyncComponent(() =>
  import('~/components/NotificationLovedComment')
)
const NotificationCommentOnPost = defineAsyncComponent(() =>
  import('~/components/NotificationCommentOnPost')
)
const NotificationCommentOnComment = defineAsyncComponent(() =>
  import('~/components/NotificationCommentOnComment')
)
const NotificationExhort = defineAsyncComponent(() =>
  import('~/components/NotificationExhort')
)
const NotificationAboutMe = defineAsyncComponent(() =>
  import('~/components/NotificationAboutMe')
)
const NotificationOpenPosts = defineAsyncComponent(() =>
  import('~/components/NotificationOpenPosts')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['showModal'])
const router = useRouter()

// Setup notification
const { notification, notificationStore, newsfeed } = await setupNotification(
  props.id
)

function markSeen() {
  if (!notification.value?.seen) {
    notificationStore.seen(props.id)
  }
}

function click() {
  markSeen()

  if (notification.value?.url) {
    window.open(notification.value.url)
  } else if (newsfeed?.value) {
    router.push('/chitchat/' + newsfeed.value.id)
  }
}

function showModal() {
  emit('showModal')
}
</script>
<style scoped>
.notification__wrapper {
  white-space: normal;
}
</style>
