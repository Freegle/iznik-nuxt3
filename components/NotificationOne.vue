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
<script>
import { setupNotification } from '../composables/useNotification'
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

export default {
  components: {
    NotificationGiftAid,
    NotificationLovedPost,
    NotificationLovedComment,
    NotificationCommentOnPost,
    NotificationCommentOnComment,
    NotificationExhort,
    NotificationAboutMe,
    NotificationOpenPosts,
  },
  inheritAttrs: false,
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const ret = await setupNotification(props.id)
    return ret
  },
  methods: {
    markSeen() {
      if (!this.notification?.seen) {
        this.notificationStore.seen(this.id)
      }
    },
    click() {
      this.markSeen()

      if (this.notification.url) {
        window.open(this.notification.url)
      } else if (this.newsfeed) {
        this.$router.push('/chitchat/' + this.newsfeed.id)
      }
    },
    showModal() {
      this.$emit('showModal')
    },
  },
}
</script>
<style scoped>
.notification__wrapper {
  white-space: normal;
}
</style>
