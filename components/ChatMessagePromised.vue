<template>
  <div class="chat-message-promised">
    <!-- Received promise (from other user) -->
    <div v-if="chatmessage?.userid != myid" class="promised-message">
      <div v-if="!refmsg" class="text-muted small">
        This chat message refers to a post (<v-icon
          icon="hashtag"
          class="text-muted fa-0-8x"
        />{{ chatmessage.refmsgid }}) which has been deleted.
      </div>
      <div v-else class="promised-wrapper">
        <div class="promised-header">
          <ProfileImage
            :image="otheruser?.profile?.paththumb"
            :name="otheruser?.displayname"
            class="mr-2 inline"
            is-thumbnail
            size="sm"
          />
          <span class="promised-label"
            >Good news! You've been promised this:</span
          >
        </div>
        <ChatMessageCard :id="refmsgid" />
        <AddToCalendar
          v-if="tryst?.calendarLink"
          :calendar-link="tryst.calendarLink"
          class="mt-2"
        />
        <notice-message
          v-if="refmsg.outcomes?.length || refmsg.deleted"
          class="mt-2"
        >
          <v-icon icon="info-circle" />
          <span v-if="refmsg.type === 'Offer'">
            This is no longer available.
          </span>
          <span v-else> They are no longer looking for this. </span>
        </notice-message>
        <div v-if="emessage" class="promised-text mt-2">
          <span
            v-if="
              chatmessage.secondsago < 60 || chatmessage.id > chat.lastmsgseen
            "
            class="prewrap font-weight-bold"
            >{{ emessage }}</span
          >
          <span v-else class="preline forcebreak">{{ emessage }}</span>
        </div>
      </div>
    </div>

    <!-- Sent promise (from current user) -->
    <div v-else class="promised-message promised-message--mine">
      <div v-if="!refmsg" class="text-muted small">
        This chat message refers to a post (<v-icon
          icon="hashtag"
          class="text-muted fa-0-8x"
        />{{ chatmessage.refmsgid }}) which has been deleted.
      </div>
      <div v-else class="promised-wrapper">
        <div class="promised-header">
          <ProfileImage
            :image="me?.profile?.path"
            :name="me?.displayname"
            class="mr-2 inline"
            is-thumbnail
            size="sm"
          />
          <span class="promised-label">
            You promised <strong>{{ otheruser?.displayname }}</strong
            >:
          </span>
        </div>
        <ChatMessageCard :id="refmsgid" :show-location="false" />
        <p v-if="tryst?.arrangedfor" class="small text-info mt-2 mb-1">
          Handover arranged for
          <strong
            ><DateFormatted :value="tryst.arrangedfor" format="weekdaytime"
          /></strong>
        </p>
        <div v-if="refmsg" class="promised-actions mt-2">
          <template v-if="tryst">
            <AddToCalendar
              v-if="tryst?.calendarLink"
              :calendar-link="tryst.calendarLink"
              class="mr-2 mb-1"
            />
            <b-button
              v-if="refmsg.promisecount && refmsg.availablenow"
              variant="secondary"
              size="sm"
              class="mr-2 mb-1"
              @click="changeTime"
            >
              <v-icon icon="pen" />
              Change time
            </b-button>
          </template>
          <template v-else-if="refmsg.promisecount && refmsg.availablenow">
            <b-button
              variant="secondary"
              size="sm"
              class="mr-2 mb-1"
              @click="changeTime"
            >
              <v-icon icon="pen" />
              Set time
            </b-button>
          </template>
          <b-button
            v-if="refmsg.promisecount && refmsg.availablenow"
            variant="warning"
            size="sm"
            class="mr-2 mb-1"
            @click="unpromise"
          >
            Unpromise
          </b-button>
          <b-button
            v-if="refmsg.availablenow"
            variant="primary"
            size="sm"
            class="mb-1"
            @click="outcome('Taken')"
          >
            Mark as TAKEN
          </b-button>
        </div>
        <notice-message
          v-if="refmsg.outcomes?.length || refmsg.deleted"
          class="mt-2"
        >
          <v-icon icon="info-circle" />
          <span v-if="refmsg.type === 'Offer'">
            This is no longer available.
          </span>
          <span v-else> They are no longer looking for this. </span>
        </notice-message>
        <p v-else-if="!refmsg?.availablenow" class="text-muted small mt-2">
          This has now been taken.
        </p>
        <div v-if="emessage" class="promised-text mt-2">
          <span
            v-if="
              chatmessage.secondsago < 60 || chatmessage.id > chat.lastmsgseen
            "
            class="prewrap font-weight-bold"
            >{{ emessage }}</span
          >
          <span v-else class="preline forcebreak">{{ emessage }}</span>
        </div>
        <PromiseModal
          v-if="showPromise"
          :messages="[refmsg]"
          :selected-message="refmsgid"
          :users="otheruser ? [otheruser] : []"
          :selected-user="otheruser ? otheruser.id : null"
          @hidden="showPromise = false"
        />
      </div>
    </div>
    <RenegeModal
      v-if="showRenege && refmsgid"
      :messages="[refmsgid]"
      :selected-message="refmsgid"
      :users="[otheruser]"
      :selected-user="otheruser.id"
      @hide="fetchMessages"
      @hidden="showRenege = false"
    />
    <OutcomeModal
      v-if="showOutcome && refmsgid"
      :id="refmsgid"
      :taken-by="takenBy"
      :type="outcomeType"
      @outcome="fetchMessage"
      @hidden="showOutcome = false"
    />
  </div>
</template>
<script setup>
import { ref, defineAsyncComponent } from 'vue'
import DateFormatted from './DateFormatted'
import { useTrystStore } from '~/stores/tryst'
import { fetchOurOffers } from '~/composables/useThrottle'
import { useChatStore } from '~/stores/chat'
import {
  fetchReferencedMessage,
  useChatMessageBase,
} from '~/composables/useChat'
import { useMessageStore } from '~/stores/message'
import AddToCalendar from '~/components/AddToCalendar'
import ProfileImage from '~/components/ProfileImage'
import ChatMessageCard from '~/components/ChatMessageCard'

const OutcomeModal = defineAsyncComponent(() =>
  import('~/components/OutcomeModal')
)

const RenegeModal = defineAsyncComponent(() => import('./RenegeModal'))
const PromiseModal = defineAsyncComponent(() =>
  import('~/components/PromiseModal')
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

// Data properties
const showRenege = ref(false)
const showOutcome = ref(false)
const outcomeType = ref(null)
const showPromise = ref(false)

// Stores
const trystStore = useTrystStore()
const chatStore = useChatStore()
const messageStore = useMessageStore()

// Setup
await trystStore.fetch()
await fetchReferencedMessage(props.chatid, props.id)

// Use the chat base composable
const {
  chat,
  chatmessage,
  emessage,
  refmsgid,
  refmsg,
  me,
  myid,
  otheruser,
  fetchMessage,
} = useChatMessageBase(props.chatid, props.id, props.pov)

if (refmsgid.value) {
  useMessageStore().fetch(refmsgid.value)
}

// Component-specific computed properties
const tryst = computed(() => {
  return otheruser.value ? trystStore?.getByUser(otheruser.value.id) : null
})

const takenBy = computed(() => {
  let ret = null

  if (otheruser.value) {
    ret = otheruser.value
    ret.userid = otheruser.value.id
    ret.count = 1
  }

  return ret
})

// Methods
function unpromise() {
  showRenege.value = true
  fetchOurOffers()
}

function changeTime() {
  showPromise.value = true
}

function fetchMessages() {
  chatStore.fetchMessages(chatmessage.value.chatid)
}

async function outcome(type) {
  await messageStore.fetch(refmsgid.value)

  showOutcome.value = true
  outcomeType.value = type
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.chat-message-promised {
  max-width: 100%;

  @include media-breakpoint-up(lg) {
    max-width: 400px;
  }
}

.promised-message {
  width: 100%;
}

.promised-message--mine {
  margin-left: auto;
}

.promised-wrapper {
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.promised-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.promised-label {
  font-size: 0.85rem;
  color: #333;
}

.promised-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.promised-text {
  font-size: 0.9rem;
  padding: 8px;
  background: $color-gray--lighter;
  border-radius: 8px;
}
</style>
