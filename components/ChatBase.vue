<template>
  <div />
</template>
<script>
import { useUserStore } from '../stores/user'
import { twem } from '~/composables/useTwem'
import { EMAIL_REGEX } from '~/constants'

export default {
  props: {
    chat: {
      type: Object,
      required: true,
    },
    chatmessage: {
      type: Object,
      required: true,
    },
    otheruser: {
      type: Object,
      required: false,
      default: null,
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
  },
  setup() {
    const userStore = useUserStore()
    let chatMessageUser = null

    // Get the user for the message.
    console.log('Fetch user', this.chatmessage?.userid)
    if (this.chatmessage?.userid) {
      userStore.fetch(this.chatmessage.userid)
      chatMessageUser = computed(() => userStore.get(this.chatmessage.userid))
    }

    return { userStore, chatMessageUser }
  },
  computed: {
    regexEmail() {
      return EMAIL_REGEX
    },
    emessage() {
      const trim = this.chatmessage.message
        .replace(/(\r\n|\r|\n){2,}/g, '$1\n')
        .trim()

      return twem(trim)
    },
    chatMessageProfileImage() {
      return this.chatMessageUser
        ? this.chatMessageUser.profile.turl
        : this.chat.icon
    },
    refmsg() {
      return this.chatmessage.refmsg
        ? this.chatmessage.refmsg
        : {
            subject: 'A message which no longer exists',
          }
    },
    // We override the normal methods because we might have an explicit point-of-view to honour.
    me() {
      if (!this.pov) {
        return this.realMe
      } else if (this.chat.user1 && this.chat.user1.id === this.pov) {
        return this.chat.user1
      } else if (this.chat.user2 && this.chat.user2.id === this.pov) {
        return this.chat.user2
      } else {
        return this.realMe
      }
    },
    messageIsFromCurrentUser() {
      if (this.chat.chattype === 'User2Mod') {
        // For User2Mod chats we want it on the right hand side we sent it.
        return this.chatmessage.userid === this.me.id
      } else {
        return this.chatmessage.userid === this.me.id
      }
    },
  },
  methods: {
    brokenImage(event) {
      event.target.src = require('~/static/defaultprofile.png')
    },
    refetch() {
      // TODO This is a poor way of refreshing this individual message, but there isn't a server call for it.
      this.$store.dispatch('chatmessages/fetch', {
        chatid: this.chatmessage.chatid,
        limit: 100,
        noContext: true,
      })
    },
  },
}
</script>
<style scoped lang="scss">
.chatMessage {
  border: 1px solid $color-gray--light;
  border-radius: 10px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 4px;
  padding-right: 2px;
  word-wrap: break-word;
  line-height: 1.75;
}
</style>
