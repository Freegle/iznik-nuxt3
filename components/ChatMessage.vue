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
import { setupChat } from '~/composables/useChat'
import { useChatStore } from '~/stores/chat'
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
  word-wrap: break-word;
  line-height: 1.4;
  font-size: 0.95rem;

  // Only apply bubble styling to simple messages without cards
  &:not(:has(.messagecard)) {
    border: none;
    border-radius: 20px;
    padding: 8px 14px;
    max-width: 85%;

    @include media-breakpoint-up(md) {
      padding: 10px 16px;
      max-width: 70%;
    }
  }

  // Messages with cards get simpler styling
  &:has(.messagecard) {
    border: 1px solid $color-gray--light;
    border-radius: 10px;
    padding: 8px;
    max-width: 100%;
  }
}

:deep(.chatMessage__owner) {
  background-color: #ffffff;
  color: #000000;

  // Only add border/shadow to simple messages
  &:not(:has(.messagecard)) {
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
}

:deep(.myChatMessage) {
  // Only apply green gradient to simple text messages without buttons/complex content
  .chatMessage.chatMessage__owner:not(:has(button)):not(:has(hr)):not(
      :has(.messagecard)
    ) {
    background: linear-gradient(135deg, #5cb85c 0%, #4cae4c 100%);
    color: white;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  .chatMessage {
    margin-left: auto;
  }

  .chatMessageProfilePic {
    display: none;
  }
}

:deep(.chatMessageProfilePic) {
  min-width: 36px;
  width: 36px;
  height: 36px;
  position: relative;
  top: 0;
  left: 0;
  margin-right: 8px;
  flex-shrink: 0;

  img,
  .ProfileImage__container,
  .generated-avatar {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    min-height: 36px !important;
  }

  @include media-breakpoint-up(md) {
    min-width: 40px;
    width: 40px;
    height: 40px;

    img,
    .ProfileImage__container,
    .generated-avatar {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      min-height: 40px !important;
    }
  }
}

:deep(.chatMessageWrapper) {
  display: flex;
  align-items: flex-start;
  padding-right: 15%;
  margin-bottom: 4px;
  gap: 4px;

  &.myChatMessage {
    padding-left: 15%;
    padding-right: 0;
    justify-content: flex-end;
  }
}

:deep(.highlight) {
  color: $color-orange--dark !important;
  background-color: initial;
}
</style>
