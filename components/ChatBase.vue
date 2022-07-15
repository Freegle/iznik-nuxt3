<template>
  <div />
</template>
<script>
import { useUserStore } from '../stores/user'
import { useChatStore } from '../stores/chat'
import { useMessageStore } from '../stores/message'
import { twem } from '~/composables/useTwem'
import { EMAIL_REGEX } from '~/constants'

export default {
  props: {
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
  },
  computed: {
    regexEmail() {
      return EMAIL_REGEX
    },
    emessage() {
      const trim = this.chatmessage?.message
        .replace(/(\r\n|\r|\n){2,}/g, '$1\n')
        .trim()

      return twem(trim)
    },
    chatMessageUser() {
      const userStore = useUserStore()

      if (this.chatmessage?.userid) {
        return userStore.byId(this.chatmessage.userid)
      }

      return null
    },
    chatMessageProfileImage() {
      return this.chatmessage.userid === this.myid
        ? this.me.profile.paththumb
        : this.chat?.icon
    },
    refmsgid() {
      return this.chatmessage?.refmsgid
    },
    refmsg() {
      const messageStore = useMessageStore()
      return this.refmsgid ? messageStore.byId(this.refmsgid) : null
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
      if (this.chat?.chattype === 'User2Mod') {
        // For User2Mod chats we want it on the right hand side we sent it.
        return this.chatmessage?.userid === this.myid
      } else {
        return this.chatmessage?.userid === this.myid
      }
    },
    // There is duplicate code here vs the useChat composable.  But we want the benefit of extending a component to pick
    // up the props, and Vue3's extend intentionally doesn't allow us to provide a setup() method from which we could
    // use the composable.  Probably there is a way to handle this better.
    chat() {
      const chatStore = useChatStore()
      return chatStore.byId(this.chatid)
    },
    chatmessage() {
      const chatStore = useChatStore()
      const chatmessages = chatStore.messagesById(this.chatid)
      return chatmessages.find((m) => {
        return m.id === this.id
      })
    },
    otheruser() {
      const userStore = useUserStore()

      if (this.chat?.otheruid) {
        return userStore.byId(this.chat.otheruid)
      } else {
        return null
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
