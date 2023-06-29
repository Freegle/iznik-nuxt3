<template>
  <div v-if="userid !== myid" class="d-inline clickme">
    <div id="sizer" ref="sizer" class="d-none d-md-block" />
    <div>
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
  </div>
</template>
<script>
import { useChatStore } from '../stores/chat'
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

    return {
      chatStore,
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
        const chatid = await this.chatStore.openChatToMods(this.groupid)

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

          // If we hit the back button, then the code in MessageList to scroll into view will bring us back to the
          // right place.
          router.push('/chats/' + chatid)
        }
      }
    },
  },
}
</script>
