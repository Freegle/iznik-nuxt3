<template>
  <client-only>
    <div :class="selected ? 'selected' : ''" @click="selectMe">
      <div v-if="chatmessage?.type === 'Default'">
        <chat-message-text
          :id="id"
          :chatid="chatid"
          :pov="pov"
          :highlight-emails="highlightEmails"
        />
      </div>
      <chat-message-image
        v-else-if="chatmessage?.type === 'Image'"
        :id="id"
        :chatid="chatid"
        :pov="pov"
      />
      <div v-else-if="chatmessage?.type === 'Interested'">
        <chat-message-interested
          v-if="otheruser || chat.chattype === 'User2Mod'"
          :id="id"
          :chatid="chatid"
          :pov="pov"
          :highlight-emails="highlightEmails"
        />
      </div>
      <div v-else-if="chatmessage?.type === 'Completed' && otheruser">
        <chat-message-completed
          v-if="otheruser"
          :id="id"
          :chatid="chatid"
          :pov="pov"
        />
      </div>
      <div v-else-if="chatmessage?.type === 'Promised' && otheruser">
        <chat-message-promised
          v-if="otheruser"
          :id="id"
          :chatid="chatid"
          :pov="pov"
        />
      </div>
      <div v-else-if="chatmessage?.type === 'Reneged' && otheruser">
        <chat-message-reneged
          v-if="otheruser"
          :id="id"
          :chatid="chatid"
          :pov="pov"
        />
      </div>
      <div v-else-if="chatmessage?.type === 'Address' && otheruser">
        <chat-message-address
          v-if="otheruser"
          :id="id"
          :chatid="chatid"
          :pov="pov"
        />
      </div>
      <div v-else-if="chatmessage?.type === 'Nudge' && otheruser">
        <chat-message-nudge
          v-if="otheruser"
          :id="id"
          :chatid="chatid"
          :pov="pov"
        />
      </div>
      <div v-else-if="chatmessage?.type === 'ModMail'">
        <chat-message-mod-mail :id="id" :chatid="chatid" :pov="pov" />
      </div>
      <div v-else-if="chatmessage?.type === 'Schedule' && otheruser">
        <chat-message-schedule
          v-if="otheruser"
          :id="id"
          :chatid="chatid"
          :pov="pov"
        />
      </div>
      <div v-else-if="chatmessage?.type === 'ScheduleUpdated' && otheruser">
        <chat-message-schedule
          v-if="otheruser"
          :id="id"
          :chatid="chatid"
          :pov="pov"
        />
      </div>
      <div v-else-if="supportOrAdmin">
        Unknown chat message type {{ chatmessage?.type }}
      </div>
      <chat-message-warning v-if="phoneNumber" />
      <chat-message-date-read
        :id="id"
        :chatid="chatid"
        :last="last"
        :pov="pov"
      />
      <div v-if="selected">
        <b-button variant="link" @click="markUnseen"> Mark unread </b-button>
      </div>
    </div>
  </client-only>
</template>
<script>
import { useChatStore } from '../stores/chat'
import { setupChat } from '../composables/useChat'
import ChatMessageText from './ChatMessageText'
import ChatMessageImage from './ChatMessageImage'
import ChatMessageInterested from './ChatMessageInterested'
import ChatMessageCompleted from './ChatMessageCompleted'
import ChatMessagePromised from './ChatMessagePromised'
import ChatMessageReneged from './ChatMessageReneged'
import ChatMessageAddress from './ChatMessageAddress'
import ChatMessageNudge from './ChatMessageNudge'
import ChatMessageDateRead from './ChatMessageDateRead'
import ChatMessageModMail from './ChatMessageModMail'
import ChatMessageSchedule from './ChatMessageSchedule'
import ChatMessageWarning from '~/components/ChatMessageWarning'
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'

// System chat message doesn't seem to be used;
export default {
  components: {
    ChatMessageWarning,
    ChatMessageDateRead,
    ChatMessageText,
    ChatMessageImage,
    ChatMessageInterested,
    ChatMessageCompleted,
    ChatMessagePromised,
    ChatMessageAddress,
    ChatMessageReneged,
    ChatMessageNudge,
    ChatMessageModMail,
    ChatMessageSchedule,
  },
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
    prevmessage: {
      type: Number,
      required: false,
      default: null,
    },
  },
  async setup(props) {
    const chatStore = useChatStore()

    const { chat, chatmessages, otheruser } = await setupChat(props.chatid)

    // TODO MINOR Should this be in composable, and indexed better?  Similar code elsewhere
    const chatmessage = computed(() => {
      return chatmessages.value.find((m) => {
        return m.id === props.id
      })
    })

    return {
      chatStore,
      chat,
      chatmessage,
      otheruser,
    }
  },
  data() {
    return {
      selected: false,
      options: [
        {
          name: 'Mark unread',
        },
      ],
    }
  },
  computed: {
    phoneNumber() {
      let ret = false

      if (this.chatmessage && this.chatmessage.message) {
        const re = /\+(\d\d)[^:]/gm
        const matches = re.exec(this.chatmessage.message)

        if (matches && matches.length > 1) {
          const country = matches[1]

          if (parseInt(country) !== 44) {
            ret = true
          }
        }
      }

      return ret
    },
  },
  methods: {
    selectMe() {
      if (this.chatmessage?.userid !== this.myid) {
        this.selected = true
      }
    },
    async markUnseen() {
      await this.$store.dispatch('chats/markUnseen', {
        chatid: this.chat.id,
        msgid: this.prevmessage,
      })

      this.selected = false
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.selected {
  border: 1px solid $color-blue--bright;
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

:deep(.card) {
  border-radius: 10px;
}

:deep(.chatMessage) {
  border: 1px solid $color-gray--light;
  border-radius: 10px;
  padding: 2px 4px 2px 4px;
  word-wrap: break-word;
  line-height: 1.75;

  @include media-breakpoint-up(md) {
    padding: 4px 8px 4px 8px;
  }
}

:deep(.chatMessage__owner) {
  background-color: $color-white;
  order: 2;
}

:deep(.myChatMessage) {
  .chatMessage__owner {
    background-color: $color-green--light;
    order: 0;
  }

  .chatMessage {
    margin-left: auto;
  }

  .chatMessageProfilePic {
    left: 0;
  }
}

:deep(.chatMessageProfilePic) {
  min-width: 25px;
  position: relative;
  top: 3px;
  left: 3px;
  margin-right: 5px;

  @include media-breakpoint-up(md) {
    min-width: 35px;
  }
}

:deep(.chatMessageWrapper) {
  display: flex;
  padding-right: 10px;

  &.myChatMessage {
    padding-left: 10px;
    padding-right: 0;
  }
}

:deep(.highlight) {
  color: $color-orange--dark !important;
  background-color: initial;
}
</style>
