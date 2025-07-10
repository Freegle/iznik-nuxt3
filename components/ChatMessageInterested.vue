<template>
  <div
    class="chatMessageWrapper"
    :class="{ myChatMessage: messageIsFromCurrentUser }"
  >
    <div class="chatMessage forcebreak chatMessage__owner">
      <div v-if="chatmessage.userid != myid">
        <ChatMessageSummary
          v-if="refmsgid"
          :id="refmsgid"
          :chatid="chatid"
          class="mt-1 mb-2"
        />
        <div>
          <!-- eslint-disable-next-line -->
          <span v-if="(chatmessage.secondsago < 60) || (chatmessage.id > chat.lastmsgseen)" class="prewrap font-weight-bold" v-html="emessage" />
          <!-- eslint-disable-next-line -->
          <span v-else class="preline forcebreak" v-html="emessage" />
          <b-img
            v-if="chatmessage.image"
            fluid
            :src="chatmessage.image.path"
            lazy
            rounded
          />
        </div>
        <div
          v-if="
            refmsg &&
            refmsg.fromuser === myid &&
            refmsg.type === 'Offer' &&
            (!refmsg.outcomes || !refmsg.outcomes.length)
          "
        >
          <hr class="mb-0" />
          <div class="d-flex justify-content-between flex-wrap mb-2">
            <div
              v-if="!refmsg.promisecount"
              class="mr-2 border-light border-end flex-grow-1 text-center"
            >
              <div class="text-center small text-muted mb-2">
                Still available?
              </div>
              <b-button variant="primary" size="sm" @click="promise">
                <v-icon icon="handshake" /> Promise
              </b-button>
            </div>
            <div class="flex-grow-1">
              <div class="text-center small text-muted mb-2">
                No longer available?
              </div>
              <div class="d-flex justify-content-between ml-2 mr-2">
                <b-button
                  variant="secondary"
                  size="sm"
                  class="mr-1"
                  @click="outcome('Taken', $event)"
                >
                  Mark as TAKEN
                </b-button>
                <b-button
                  variant="secondary"
                  size="sm"
                  @click="outcome('Withdrawn', $event)"
                >
                  Withdraw
                </b-button>
              </div>
            </div>
          </div>
          <OutcomeModal
            v-if="showOutcome && refmsgid"
            :id="refmsgid"
            :type="outcomeType"
            @outcome="fetchMessage"
            @hidden="showOutcome = false"
          />
          <PromiseModal
            v-if="showPromise"
            :messages="[refmsg]"
            :selected-message="refmsg.id"
            :users="otheruser ? [otheruser] : []"
            :selected-user="otheruser ? otheruser.id : null"
            @hidden="promised"
          />
        </div>
      </div>
      <div v-else>
        <ChatMessageSummary v-if="refmsgid" :id="refmsgid" class="mt-1 mb-2" />
        <div>
          <span v-if="!highlightEmails">
            <span
              v-if="
                chatmessage.secondsago < 60 || chatmessage.id > chat.lastmsgseen
              "
              class="prewrap font-weight-bold"
              >{{ emessage }}</span
            >
            <span v-else class="preline forcebreak">{{ emessage }}</span>
            <b-img
              v-if="chatmessage.image"
              fluid
              :src="chatmessage.image.path"
              lazy
              rounded
            />
          </span>
          <span v-else>
            <span
              v-if="
                chatmessage.secondsago < 60 || chatmessage.id > chat.lastmsgseen
              "
              class="font-weight-bold"
            >
              <Highlighter
                :text-to-highlight="emessage"
                :search-words="[regexEmail]"
                highlight-class-name="highlight"
                class="prewrap"
              />
            </span>
            <span v-else>
              <Highlighter
                :text-to-highlight="emessage"
                :search-words="[regexEmail]"
                highlight-class-name="highlight"
                class="preline forcebreak"
              />
            </span>
            <b-img
              v-if="chatmessage.image"
              fluid
              :src="chatmessage.image.path"
              lazy
              rounded
            />
          </span>
        </div>
      </div>
    </div>
    <div class="chatMessageProfilePic">
      <ProfileImage
        :image="chatMessageProfileImage"
        class="ml-1 mb-1 mt-1 inline"
        is-thumbnail
        size="sm"
      />
    </div>
  </div>
</template>
<script setup>
import Highlighter from 'vue-highlight-words'
import {
  fetchReferencedMessage,
  useChatMessageBase,
} from '../composables/useChat'
import { useMessageStore } from '../stores/message'
import { ref, onMounted, computed } from '#imports'
import ProfileImage from '~/components/ProfileImage'
import ChatMessageSummary from '~/components/ChatMessageSummary'
import { useChatStore } from '~/stores/chat'
import { useMe } from '~/composables/useMe'

const OutcomeModal = defineAsyncComponent(() =>
  import('~/components/OutcomeModal')
)
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

const messageStore = useMessageStore()
const chatStore = useChatStore()
const { myid } = useMe()

// Data properties
const showOutcome = ref(false)
const outcomeType = ref(null)
const showPromise = ref(false)

// Get chat base functionality
const {
  chat,
  chatmessage,
  emessage,
  messageIsFromCurrentUser,
  chatMessageProfileImage,
  regexEmail,
  otheruser,
} = useChatMessageBase(props.chatid, props.id, props.pov)

// Computed properties
const refmsgid = computed(() => chatmessage.value?.refmsgid)
const refmsg = computed(() =>
  refmsgid.value ? messageStore.byId(refmsgid.value) : null
)

// Methods
const fetchMessage = async () => {
  if (refmsgid.value) {
    await messageStore.fetch(refmsgid.value)
  }
}

const promise = (e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  showPromise.value = true
}

const promised = () => {
  // Might have a new chat message to show from promising.
  showPromise.value = false
  chatStore.fetchChat(props.chatid)
}

const outcome = async (type, e) => {
  if (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  // Make sure we're up to date.
  await messageStore.fetch(refmsgid.value)

  showOutcome.value = true
  outcomeType.value = type
}

// On mount
onMounted(async () => {
  // Fetch the referenced message
  await fetchReferencedMessage(props.chatid, props.id)
})
</script>
