<template>
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
      @delete="showDeleteMessageModal"
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
    <div v-else-if="chatmessage?.type === 'Reminder'">
      <chat-message-reminder :id="id" :chatid="chatid" :pov="pov" />
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
<script setup>
import { useChatStore } from '../stores/chat'
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
import ChatMessageReminder from './ChatMessageReminder'
import { ref, computed } from '#imports'
import SupportLink from '~/components/SupportLink.vue'
import ChatMessageWarning from '~/components/ChatMessageWarning'
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
import { useMe } from '~/composables/useMe'

const ConfirmModal = defineAsyncComponent(() =>
  import('~/components/ConfirmModal.vue')
)
const ResultModal = defineAsyncComponent(() =>
  import('~/components/ResultModal.vue')
)

const props = defineProps({
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
})

const chatStore = useChatStore()
const { myid } = useMe()

// Data properties as refs
const selected = ref(false)
const showDeleteMessageResultModal = ref(false)
const deleteMessageSucceeded = ref(null)
const showConfirmModal = ref(false)

// Setup chat - need this to be awaited
const { chat, otheruser, chatmessage } = await setupChat(props.chatid, props.id)

// Computed properties
const phoneNumber = computed(() => {
  let ret = false

  if (chatmessage?.message) {
    const re = /\+(\d\d)[^:]/gm
    const matches = re.exec(chatmessage.message)

    if (matches && matches.length > 1) {
      const country = matches[1]

      if (parseInt(country) !== 44) {
        ret = true
      }
    }
  }

  return ret
})

const isMessageDeleted = computed(() => {
  // there should ideally be a flag on the message object indicating whether it's deleted or not, but for now we're
  // instead checking the message contents. If it's "(Message deleted)", then we treat the message as deleted.
  // Though that's obviously not ideal since a user can manually send a message with the same contents and it'd be
  // still considered deleted
  return chatmessage.message === '(Message deleted)'
})

// Methods
const selectMe = () => {
  // don't allow to select deleted messages and messages consisting of a single image
  if (!isMessageDeleted.value && !chatmessage.imageid) selected.value = true
}

const markUnread = async () => {
  console.log('Mark unread', props.chatid, props.prevmessage)
  await chatStore.markUnread(props.chatid, props.prevmessage)
  selected.value = false
}

const showDeleteMessageModal = () => {
  showConfirmModal.value = true
}

const deleteMessage = async () => {
  try {
    await chatStore.deleteMessage(props.chatid, props.id)
    selected.value = false

    deleteMessageSucceeded.value = true
  } catch (err) {
    deleteMessageSucceeded.value = false
  } finally {
    showDeleteMessageResultModal.value = true
  }
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
  line-height: 1.5;

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
  padding-right: 20%;

  &.myChatMessage {
    padding-left: 20%;
    padding-right: 0;
  }
}

:deep(.highlight) {
  color: $color-orange--dark !important;
  background-color: initial;
}
</style>
