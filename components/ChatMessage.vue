<template>
  <div :class="{ selected, strike: chatmessage.reviewrejected }" @click="selectMe">
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
      @delete="showDeleteMessageModal"
    />
    <div v-else-if="chatmessage?.type === 'Interested'">
      INTERESTED!
      <chat-message-interested
        v-if="isMT || otheruser || chat.chattype === 'User2Mod'"
        :id="id"
        :chatid="chatid"
        :pov="pov"
        :highlight-emails="highlightEmails"
      />
    </div>
    <div v-else-if="chatmessage?.type === 'Completed'">
      <chat-message-completed :id="id" :chatid="chatid" :pov="pov" />
    </div>
    <div v-else-if="chatmessage?.type === 'Promised'">
      <chat-message-promised
        v-if="otheruser"
        :id="id"
        :chatid="chatid"
        :pov="pov"
      />
    </div>
    <div v-else-if="chatmessage?.type === 'Reneged'">
      <chat-message-reneged
        v-if="otheruser"
        :id="id"
        :chatid="chatid"
        :pov="pov"
      />
    </div>
    <div v-else-if="chatmessage?.type === 'Address'">
      <chat-message-address
        v-if="otheruser"
        :id="id"
        :chatid="chatid"
        :pov="pov"
      />
    </div>
    <div v-else-if="chatmessage?.type === 'Nudge'">
      <chat-message-nudge
        v-if="otheruser"
        :id="id"
        :chatid="chatid"
        :pov="pov"
      />
    </div>
    <div v-else-if="chatmessage.type === 'ReportedUser'">
      <chat-message-report :id="id" :chatid="chatid" :pov="pov" />
    </div>
    <div v-else-if="chatmessage?.type === 'ModMail'">
      <chat-message-mod-mail :id="id" :chatid="chatid" :pov="pov" />
    </div>
    <div v-else-if="chatmessage?.type === 'Schedule'">
      <!--      This type has been retired.-->
    </div>
    <div v-else-if="chatmessage?.type === 'ScheduleUpdated'">
      <!--      This type has been retired.-->
    </div>
    <div v-else>
      Unknown chat message type {{ chatmessage?.type }}, {{ chat }}
      {{ chatmessage }}
    </div>
    <chat-message-warning v-if="phoneNumber" />
    <chat-message-date-read :id="id" :chatid="chatid" :last="last" :pov="pov" />

    <ConfirmModal
      v-if="showConfirmModal"
      @confirm="deleteMessage"
      @hidden="showConfirmModal = false"
    >
      <p>
        We will delete this from our system, so you will no longer see it here.
      </p>
      <p>
        The other freegler may have received the message by email - we can't
        delete that.
      </p>
      <p>Are you sure you want to delete the message?</p>
    </ConfirmModal>
    <ResultModal
      v-if="showDeleteMessageResultModal"
      :title="
        deleteMessageSucceeded ? 'Delete Succeeded' : 'Sorry, that didn\'t work'
      "
      @hidden="showDeleteMessageResultModal = false"
    >
      <template v-if="deleteMessageSucceeded">
        <p>We've deleted your chat message.</p>
      </template>
      <template v-else>
        <p>Please contact <SupportLink /> if you need further help.</p>
      </template>
    </ResultModal>
    <div v-if="selected">
      <b-button
        v-if="chatmessage?.userid !== myid"
        variant="link"
        @click="markUnread"
      >
        Mark unread
      </b-button>
      <b-button v-else variant="link" @click="showDeleteMessageModal">
        Delete
      </b-button>
    </div>
  </div>
</template>
<script>
import { useChatStore } from '../stores/chat'
import { useMiscStore } from '~/stores/misc'
import { setupChat } from '../composables/useChat'
import ChatMessageText from './ChatMessageText'
import ChatMessageImage from './ChatMessageImage'
import ChatMessageInterested from './ChatMessageInterested'
import ChatMessageCompleted from './ChatMessageCompleted'
import ChatMessagePromised from './ChatMessagePromised'
import ChatMessageReneged from './ChatMessageReneged'
import ChatMessageReport from './ChatMessageReport'
import ChatMessageAddress from './ChatMessageAddress'
import ChatMessageNudge from './ChatMessageNudge'
import ChatMessageDateRead from './ChatMessageDateRead'
import ChatMessageModMail from './ChatMessageModMail'
import SupportLink from '~/components/SupportLink.vue'
import ChatMessageWarning from '~/components/ChatMessageWarning'
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
const ConfirmModal = defineAsyncComponent(() =>
  import('~/components/ConfirmModal.vue')
)
const ResultModal = defineAsyncComponent(() =>
  import('~/components/ResultModal.vue')
)

// System chat message doesn't seem to be used;
export default {
  components: {
    ResultModal,
    ConfirmModal,
    ChatMessageWarning,
    ChatMessageDateRead,
    ChatMessageText,
    ChatMessageImage,
    ChatMessageInterested,
    ChatMessageCompleted,
    ChatMessagePromised,
    ChatMessageAddress,
    ChatMessageReneged,
    ChatMessageReport,
    ChatMessageNudge,
    ChatMessageModMail,
    SupportLink,
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
    isMT: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  async setup(props) {
    const chatStore = useChatStore()

    const { chat, otheruser, chatmessage } = await setupChat(
      props.chatid,
      props.id
    )

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
      showDeleteMessageResultModal: false,
      deleteMessageSucceeded: null,
      showConfirmModal: false,
    }
  },
  computed: {
    phoneNumber() {
      let ret = false

      if (this.chatmessage?.message) {
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
    isMessageDeleted() {
      // there should ideally be a flag on the message object indicating whether it's deleted or not, but for now we're
      // instead checking the message contents. If it's "(Message deleted)", then we treat the message as deleted.
      // Though that's obviously not ideal since a user can manually send a message with the same contents and it'd be
      // still considered deleted

      return this.chatmessage.message === '(Message deleted)'
    },
  },
  methods: {
    selectMe() {
      // don't allow to select deleted messages and messages consisting of a single image
      if (!this.isMessageDeleted && !this.chatmessage.imageid)
        this.selected = true
    },
    async markUnread() {
      console.log('Mark unread', this.chatid, this.prevmessage)
      await this.chatStore.markUnread(this.chatid, this.prevmessage)
      this.selected = false
    },
    showDeleteMessageModal() {
      this.showConfirmModal = true
    },
    async deleteMessage() {
      try {
        await this.chatStore.deleteMessage(this.chatid, this.chatmessage.id)
        this.selected = false

        this.deleteMessageSucceeded = true
      } catch (err) {
        this.deleteMessageSucceeded = false
      } finally {
        this.showDeleteMessageResultModal = true
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

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
