<template>
  <div />
</template>
<script>
import { useUserStore } from '../stores/user'
import { useChatStore } from '../stores/chat'
import { useMessageStore } from '../stores/message'
import { useGroupStore } from '../stores/group'
import { twem } from '~/composables/useTwem'
import { EMAIL_REGEX, MT_EMAIL_REGEX } from '~/constants'

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
    regexEmailMT() {
      return MT_EMAIL_REGEX.toString()
    },
    emessage() {
      let m = this.chatmessage?.message

      try {
        if (m) {
          if (typeof m === 'number') {
            // This can happen if people post just numeric values.
            m += ''
          }
          const tidied = m.replace(/(\r\n|\r|\n){2,}/g, '$1\n').trim()

          try {
            return twem(tidied)
          } catch (e) {
            console.error('emessage A', e.message)
          }
          return tidied
        }
      } catch (e) {
        console.error('emessage B', e.message)
      }
      return ''
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
      if (this.chatmessage?.refmsg) return this.chatmessage.refmsg.id
      return this.chatmessage?.refmsgid
    },
    refmsg() {
      if (this.chatmessage?.refmsg) return this.chatmessage?.refmsg
      const messageStore = useMessageStore()
      return this.refmsgid ? messageStore?.byId(this.refmsgid) : null
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
        // For User2Mod chats we want the user on the left hand side
        return this.chat.user1id !== this.chatmessage?.userid
      } else {
        return this.chatmessage?.userid === this.myid
      }
    },
    // There is duplicate code here vs the useChat composable.  But we want the benefit of extending a component to pick
    // up the props, and Vue3's extend intentionally doesn't allow us to provide a setup() method from which we could
    // use the composable.  Probably there is a way to handle this better.
    chat() {
      const chatStore = useChatStore()
      return chatStore.byChatId(this.chatid)
    },
    chatmessage() {
      return useChatStore().messageById(this.id)
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
      event.target.src = '/defaultprofile.png'
    },
    refetch() {
      if (this.chatmessage?.refmsgid) {
        const messageStore = useMessageStore()
        messageStore.fetch(this.chatmessage.refmsgid)
      }
    },
    async fetchMessage() {
      const id = this.chatmessage?.refmsgid

      if (id) {
        const messageStore = useMessageStore()
        const groupStore = useGroupStore()

        // Fetch the message info.
        try {
          await messageStore.fetch(id)

          const message = messageStore.byId(id)

          if (message) {
            message.groups.forEach(async (g) => {
              await groupStore.fetch(g.groupid)
            })
          }
        } catch (e) {
          console.log('Message fetch failed', id, e)
        }
      }
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
  line-height: 1.5;
}
</style>
