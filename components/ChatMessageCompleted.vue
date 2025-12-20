<template>
  <div class="chat-message-completed">
    <!-- Received completion (from other user) -->
    <div v-if="chatmessage?.userid != myid" class="completed-message">
      <div v-if="!refmsg" class="text-muted small">
        This chat message refers to a post (<v-icon
          icon="hashtag"
          class="text-muted fa-0-8x"
        />{{ chatmessage.refmsgid }}) which has been deleted.
      </div>
      <div v-else class="completed-wrapper">
        <ChatMessageCard :id="refmsgid" />
        <notice-message class="mt-2">
          <v-icon icon="info-circle" />
          <span v-if="refmsg?.type === 'Offer'">
            This is no longer available.
          </span>
          <span v-else> Thanks, this has now been received. </span>
        </notice-message>
        <div v-if="emessage" class="completed-text mt-2">
          <span class="preline forcebreak">{{ emessage }}</span>
        </div>
        <div v-else class="text-muted small mt-1">
          This is an automated message.
        </div>
      </div>
    </div>

    <!-- Sent completion (from current user) -->
    <div v-else class="completed-message completed-message--mine">
      <div v-if="!refmsg" class="text-muted small">
        This chat message refers to a post (<v-icon
          icon="hashtag"
          class="text-muted fa-0-8x"
        />{{ chatmessage.refmsgid }}) which has been deleted.
      </div>
      <div v-else class="completed-wrapper">
        <ChatMessageCard :id="refmsgid" :show-location="false" />
        <notice-message class="mt-2">
          <v-icon icon="info-circle" />
          <span v-if="refmsg?.type === 'Offer'">
            We've let them know this is no longer available.
          </span>
          <span v-else> This has now been received. </span>
        </notice-message>
        <div v-if="emessage" class="completed-text mt-2">
          <span class="preline forcebreak">{{ emessage }}</span>
        </div>
        <div v-else class="text-muted small mt-1">
          This is an automated message.
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useChatMessageBase } from '~/composables/useChat'
import { useMessageStore } from '~/stores/message'
import ChatMessageCard from '~/components/ChatMessageCard'

const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
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
})

// Use the chat base composable
const { chatmessage, emessage, refmsg, refmsgid, myid } = useChatMessageBase(
  props.chatid,
  props.id,
  props.pov
)

if (refmsgid.value) {
  useMessageStore().fetch(refmsgid.value)
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.chat-message-completed {
  max-width: 100%;

  @include media-breakpoint-up(lg) {
    max-width: 400px;
  }
}

.completed-message {
  width: 100%;
}

.completed-message--mine {
  margin-left: auto;
}

.completed-wrapper {
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.completed-text {
  font-size: 0.9rem;
  padding: 8px;
  background: $color-gray--lighter;
  border-radius: 8px;
}
</style>
