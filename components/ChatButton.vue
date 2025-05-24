<template>
  <div v-if="userid !== myid" class="d-inline clickme">
    <slot>
      <b-button
        :size="size"
        :variant="variant"
        :class="btnClass + ' d-none d-sm-inline'"
        @click="gotoChat(true)"
      >
        <v-icon v-if="showIcon" icon="comments" />
        <span v-if="title" :class="titleClass">
          {{ title }}
        </span>
      </b-button>
      <b-button
        :size="size"
        :variant="variant"
        :class="btnClass + ' d-inline-block d-sm-none'"
        @click="gotoChat(false)"
      >
        <v-icon v-if="showIcon" icon="comments" />
        <span v-if="title" :class="titleClass">
          {{ title }}
        </span>
      </b-button>
    </slot>
  </div>
</template>
<script>
import { useChatStore } from '../stores/chat'
import { useMessageStore } from '../stores/message'
import { useMiscStore } from '~/stores/misc'
import { useRouter } from '#imports'

export default {
  props: {
    size: {
      type: String,
      required: false,
      default: null,
    },
    title: {
      type: String,
      required: false,
      default: null,
    },
    variant: {
      type: String,
      required: false,
      default: 'primary',
    },
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
    userid: {
      type: Number,
      required: false,
      default: null,
    },
    chattype: {
      type: String,
      required: false,
      default: null,
    },
    showIcon: {
      type: Boolean,
      required: false,
      default: true,
    },
    btnClass: {
      type: String,
      required: false,
      default: null,
    },
    titleClass: {
      type: String,
      required: false,
      default: 'ml-1',
    },
  },
  setup() {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    const miscStore = useMiscStore()

    return {
      chatStore,
      messageStore,
      miscStore,
    }
  },
  methods: {
    gotoChat() {
      this.openChat(null, null, null)
    },
    async openChat(event, firstmessage, firstmsgid) {
      const router = useRouter()

      this.$emit('click')
      console.log(
        'Open chat',
        firstmessage,
        firstmsgid,
        this.groupid,
        this.userid
      )

      if (this.groupid > 0) {
        // Open a chat to the mods.  If we are in FD then we just pass the group id and the chat opens from us to the
        // mods; if we're in MT we pass the groupid and userid and it opens from us mods to the user.
        const chatuserid = this.miscStore.modtools ? this.userid : 0
        const chatid = await this.chatStore.openChatToMods(this.groupid, chatuserid)

        router.push('/chats/' + chatid)
      } else if (this.userid > 0) {
        const chatid = await this.chatStore.openChatToUser({
          userid: this.userid,
          chattype: this.chattype,
        })

        if (chatid) {
          if (firstmessage) {
            console.log('First message to send', firstmessage)
            await this.chatStore.send(
              chatid,
              firstmessage,
              null,
              null,
              firstmsgid
            )

            console.log('Sent')

            if (firstmsgid) {
              // Update the message so that the reply count is updated.  No need to wait.
              this.messageStore.fetch(firstmsgid, true)
            }

            // Refresh the message so that our reply will show.
            await this.chatStore.fetchMessages(chatid, true)

            this.$emit('sent')
          }

          // set the flag on the store to let the chat know that a modal asking for
          // contact details should be opened as soon as the chat's loaded
          this.chatStore.showContactDetailsAskModal =
            this.me && !this.me.settings.mylocation

          // We may be called from within a profile modal. We want to skip the navigation guard which would otherwise
          // close the modal.
          router.push({
            name: 'chats-id',
            query: {
              noguard: true,
            },
            params: {
              id: chatid,
            },
          })
        }
      }
    },
  },
}
</script>
