<template>
  <div class="cont bg-white">
    <div>
      <ChatNotice v-if="otheruser?.deleted" variant="info">
        This freegler has deleted their account, so you can't chat to them.
      </ChatNotice>
      <template v-else>
        <ChatNotice
          v-if="showSpammerWarning && otheruser?.spammer"
          variant="danger"
          title="Spammer Alert"
          dismissible
          @dismiss="showSpammerWarning = false"
        >
          This person has been reported as a spammer or scammer. Please do not
          talk to them and under no circumstances send them any money. Do not
          arrange anything by courier.
        </ChatNotice>
        <div v-if="showNotices && noticesToShow" class="notices-container">
          <ChatNotice
            v-if="badratings && !otheruser?.spammer"
            variant="warning"
            title="Low Ratings"
            dismissible
            @click="showInfo"
            @dismiss="showNotices = false"
          >
            This freegler has a lot of thumbs down ratings. That might not be
            their fault, but please make very clear arrangements. If you have a
            good experience with them, give them a thumbs up.
            <UserRatings
              v-if="chat.otheruid"
              :id="chat.otheruid"
              :key="'otheruser-' + chat.otheruid"
              class="mt-2"
            />
          </ChatNotice>
          <ChatNotice
            v-else-if="expectedreplies && !otheruser?.spammer"
            variant="warning"
            title="Slow Replies"
            dismissible
            @click="showInfo"
            @dismiss="showNotices = false"
          >
            {{ expectedreplies }} still waiting for them to reply on here.
          </ChatNotice>
          <ChatNotice
            v-if="faraway && !otheruser?.spammer"
            variant="warning"
            title="Far Away"
            icon="map-marker-alt"
            dismissible
            @click="showInfo"
            @dismiss="showNotices = false"
          >
            This freegler is {{ milesstring }} from you. If you are collecting
            from them, please make sure you can get there. If they are
            collecting from you, please double-check they have transport.
          </ChatNotice>
          <ChatNotice
            v-if="thumbsdown && !otheruser?.spammer"
            variant="warning"
            title="Previous Rating"
            icon="thumbs-down"
            dismissible
            @dismiss="showNotices = false"
          >
            You previously gave this freegler a thumbs down.
          </ChatNotice>
        </div>
      </template>
      <div v-if="!otheruser?.deleted">
        <div v-if="uploading" class="bg-white">
          <OurUploader
            v-model="currentAtts"
            type="ChatMessage"
            start-open
            multiple
          />
        </div>
        <label for="chatmessage" class="visually-hidden">Chat message</label>
        <div class="textarea-wrapper">
          <div v-if="!sendmessage && !isFocused" class="textarea-placeholder">
            <span class="placeholder-text">{{ displayedText }}</span>
            <JumpingDots v-if="showDots" size="sm" class="placeholder-dots" />
          </div>
          <b-form-textarea
            v-if="enterNewLine && !otheruser?.spammer"
            id="chatmessage"
            ref="chatarea"
            v-model="sendmessage"
            class="h-100"
            enterkeyhint="enter"
            @keydown="typing"
            @focus="onFocus"
            @blur="onBlur"
          />
          <b-form-textarea
            v-else-if="!otheruser?.spammer"
            id="chatmessage"
            ref="chatarea"
            v-model="sendmessage"
            class="h-100"
            enterkeyhint="send"
            autocapitalize="none"
            @keydown="typing"
            @keydown.enter.exact.prevent
            @keyup.enter.exact="sendOnEnter"
            @keydown.enter.shift.exact.prevent="newline"
            @keydown.alt.shift.enter.exact.prevent="newline"
            @focus="onFocus"
            @blur="onBlur"
          />
        </div>
        <Dropdown
          v-if="showSuggested"
          placement="top"
          :shown="showSuggested"
          :triggers="[]"
          :auto-hide="false"
          class="position-absolute"
          :style="
            caretPosition
              ? {
                  top: `${caretPosition.top}px`,
                  left: `${caretPosition.left}px`,
                }
              : {}
          "
        >
          <template #popper>
            <div
              style="cursor: pointer"
              class="px-2 py-2"
              @mousedown="applySuggestedAddress()"
            >
              {{ suggestedAddress?.address?.singleline }}
            </div>
          </template>
        </Dropdown>
      </div>
    </div>
    <div
      v-if="!otheruser?.spammer && !otheruser?.deleted"
      class="bg-white pt-1 pb-1"
    >
      <div class="d-none d-lg-flex action-bar">
        <div
          v-if="chat && chat.chattype === 'User2User' && otheruser"
          class="action-buttons"
        >
          <button
            v-b-tooltip="'Promise an item to this freegler'"
            class="action-chip"
            @click="promise(null)"
          >
            <v-icon icon="handshake" class="action-icon" />
            <span>Promise</span>
          </button>
          <button
            v-b-tooltip="'Send your address'"
            class="action-chip"
            @click="addressBook"
          >
            <v-icon icon="address-book" class="action-icon" />
            <span>Address</span>
          </button>
          <button
            v-if="!tooSoonToNudge"
            v-b-tooltip="'Waiting for a reply? Nudge this freegler.'"
            class="action-chip"
            @click="nudge"
          >
            <v-icon icon="bell" class="action-icon" />
            <span>Nudge</span>
          </button>
          <button
            v-if="tooSoonToNudge"
            v-b-tooltip="
              'You need to wait a day since the last message before nudging.'
            "
            class="action-chip disabled"
            @click="nudgeTooSoon"
          >
            <v-icon icon="bell" class="action-icon" />
            <span>Nudge</span>
          </button>
        </div>
        <div class="send-area">
          <button
            v-b-tooltip="'Upload a photo'"
            class="action-chip"
            @click="photoAdd"
          >
            <v-icon icon="camera" class="action-icon" />
            <span>Photo</span>
          </button>
          <SpinButton
            size="md"
            variant="primary"
            class="send-button"
            :button-title="sending ? 'Sending...' : 'Send'"
            label="Send"
            icon-name="angle-double-right"
            done-icon=""
            iconlast
            @handle="send"
          />
        </div>
      </div>
      <div class="d-flex d-lg-none justify-content-between align-middle">
        <div
          v-if="chat && chat.chattype === 'User2User' && otheruser"
          class="ml-1 mr-2"
          @click="promise(null)"
        >
          <v-icon
            scale="2"
            icon="handshake"
            class="fa-mob"
            :class="{ shrink: shrink }"
          />
          <div class="mobtext text--smallest">Promise</div>
        </div>
        <div
          v-if="chat && chat.chattype === 'User2User' && otheruser"
          disabled
          class="mr-2"
          @click="addressBook"
        >
          <v-icon
            scale="3"
            icon="address-book"
            class="fa-mob"
            :class="{ shrink: shrink }"
          />
          <div class="mobtext text--smallest">Address</div>
        </div>
        <div
          v-if="chat && chat.chattype === 'User2Mod' && mod"
          class="mr-2"
          @click="spamReport"
        >
          <v-icon
            scale="2"
            icon="ban"
            class="fa-mob"
            :class="{ shrink: shrink }"
          />
          <div class="mobtext text--smallest">Spammer</div>
        </div>
        <div
          v-if="
            chat &&
            chat.chattype === 'User2User' &&
            otheruser &&
            !tooSoonToNudge
          "
          class="mr-2"
          @click="nudge"
        >
          <v-icon
            scale="2"
            icon="bell"
            class="fa-mob"
            :class="{ shrink: shrink }"
          />
          <div class="mobtext text--smallest">Nudge</div>
        </div>
        <div
          v-if="
            chat && chat.chattype === 'User2User' && otheruser && tooSoonToNudge
          "
          class="mr-2"
          @click="nudgeTooSoon"
        >
          <v-icon
            scale="2"
            icon="bell"
            class="fa-mob"
            :class="{ shrink: shrink }"
          />
          <div class="mobtext text--smallest">Nudge</div>
        </div>
        <div class="" @click="photoAdd">
          <v-icon
            scale="2"
            icon="camera"
            class="fa-mob"
            :class="{ shrink: shrink }"
          />
          <div class="mobtext text--smallest">Photo</div>
        </div>
        <SpinButton
          variant="primary"
          size="md"
          label="Send"
          icon-name="angle-double-right"
          :class="{ shrink: shrink }"
          done-icon=""
          iconlast
          @handle="send"
        />
      </div>
    </div>
    <PromiseModal
      v-if="showPromise"
      :messages="ouroffers"
      :selected-message="likelymsg ? likelymsg : 0"
      :users="otheruser ? [otheruser] : []"
      :selected-user="otheruser ? otheruser.id : null"
      :maybe="showPromiseMaybe"
      @hide="fetchMessages"
      @hidden="showPromise = false"
    />
    <ProfileModal
      v-if="showProfileModal && otheruser"
      :id="otheruser ? otheruser.id : null"
      @hidden="showProfileModal = false"
    />
    <AddressModal
      v-if="showAddress"
      :choose="true"
      t-o-d-o
      @chosen="sendAddress"
      @hidden="showAddress = false"
    />
    <ChatRSVPModal
      v-if="RSVP"
      :id="id"
      ref="rsvp"
      :user="otheruser"
      @hidden="RSVP = false"
    />
    <NudgeTooSoonWarningModal
      v-if="showNudgeTooSoonWarningModal"
      @confirm="doNudge"
      @hidden="showNudgeTooSoonWarningModal = false"
    />
    <NudgeWarningModal
      v-if="showNudgeWarningModal"
      @confirm="doNudge"
      @hidden="showNudgeWarningModal = false"
    />
    <MicroVolunteering v-if="showMicrovolunteering" />
  </div>
</template>
<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  defineAsyncComponent,
} from 'vue'
import pluralize from 'pluralize'
import getCaretCoordinates from 'textarea-caret'
import { Dropdown } from 'floating-vue'
import { storeToRefs } from 'pinia'
import { FAR_AWAY, TYPING_TIME_INVERVAL } from '../constants'
import SpinButton from './SpinButton'
import { setupChat } from '~/composables/useChat'
import { useMiscStore } from '~/stores/misc'
import { useMessageStore } from '~/stores/message'
import { fetchOurOffers } from '~/composables/useThrottle'
import { useAuthStore } from '~/stores/auth'
import { useAddressStore } from '~/stores/address'
import { untwem } from '~/composables/useTwem'
import 'floating-vue/dist/style.css'
import { action } from '~/composables/useClientLog'
import { useMe } from '~/composables/useMe'
import { useTypewriter } from '~/composables/useTypewriter'
import JumpingDots from '~/components/JumpingDots.vue'
import ChatNotice from '~/components/ChatNotice.vue'

// Define props
const props = defineProps({
  id: { type: Number, required: true },
})

// Define emits
const emit = defineEmits(['typing', 'scrollbottom'])

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const UserRatings = defineAsyncComponent(() =>
  import('~/components/UserRatings')
)
const PromiseModal = defineAsyncComponent(() =>
  import('~/components/PromiseModal')
)
const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)
const AddressModal = defineAsyncComponent(() =>
  import('~/components/AddressModal')
)
const ChatRSVPModal = defineAsyncComponent(() =>
  import('~/components/ChatRSVPModal')
)
const NudgeWarningModal = defineAsyncComponent(() =>
  import('~/components/NudgeWarningModal')
)
const NudgeTooSoonWarningModal = defineAsyncComponent(() =>
  import('~/components/NudgeTooSoonWarningModal')
)
const MicroVolunteering = defineAsyncComponent(() =>
  import('~/components/MicroVolunteering')
)

const { me, myid } = useMe()

// Setup stores
const authStore = useAuthStore()
const miscStore = useMiscStore()
const addressStore = useAddressStore()

// Setup chat data
const {
  chat,
  otheruser,
  tooSoonToNudge,
  chatStore,
  chatmessages,
  milesaway,
  milesstring,
} = await setupChat(props.id)

// Extract writable state from store
const { lastTyping } = storeToRefs(miscStore)

// Refs (former data properties)
const sending = ref(false)
const uploading = ref(false)
const showMicrovolunteering = ref(false)
const showNotices = ref(true)
const showSpammerWarning = ref(true)
const showPromise = ref(false)
const showPromiseMaybe = ref(false)
const showProfileModal = ref(false)
const showAddress = ref(false)
const sendmessage = ref(null)
const RSVP = ref(false)
const likelymsg = ref(null)
const ouroffers = ref([])
const showNudgeTooSoonWarningModal = ref(false)
const showNudgeWarningModal = ref(false)
const hideSuggestedAddress = ref(false)
const caretPosition = ref({ top: 0, left: 0 })
const currentAtts = ref([])
const chatarea = ref(null)
const rsvp = ref(null)
const isFocused = ref(false)

// Typewriter animation for placeholder
const {
  displayedText,
  showDots,
  startAnimation: startTypewriterAnimation,
} = useTypewriter('Type here', {
  typingSpeed: 80,
  dotsDisplayTime: 1500,
  maxCycles: 3,
  finalText: 'Type here.',
})

// Computed properties
const shrink = computed(() => {
  return sendmessage.value?.length > 120
})

const height = computed(() => {
  // Bootstrap Vue Next doesn't yet have autoresizing.
  const heightValue = Math.min(6, Math.round(sendmessage.value?.length / 60))
  return heightValue + 6 + 'rem'
})

const noticesToShow = computed(() => {
  return (
    badratings.value ||
    expectedreplies.value ||
    otheruser.value?.deleted ||
    thumbsdown.value ||
    faraway.value
  )
})

const faraway = computed(() => {
  return milesaway.value && milesaway.value > FAR_AWAY
})

const thumbsdown = computed(() => {
  return otheruser.value?.info?.ratings?.Mine === 'Down'
})

const badratings = computed(() => {
  let ret = false

  if (
    otheruser.value?.info?.ratings &&
    otheruser.value.info.ratings.Down > 2 &&
    otheruser.value.info.ratings.Down * 2 > otheruser.value.info.ratings.Up
  ) {
    ret = true
  }

  return ret
})

const enterNewLine = computed({
  get() {
    return me.value?.settings?.enterNewLine
  },
  set: async (newVal) => {
    const settings = me.value.settings
    settings.enterNewLine = newVal

    await authStore.saveAndGet({
      settings,
    })
  },
})

const expectedreplies = computed(() => {
  if (otheruser.value?.expectedreplies) {
    pluralize.addIrregularRule('freegler is', 'freeglers are')
    return pluralize('freegler is', otheruser.value?.expectedreplies, true)
  }

  return null
})

const possibleAddresses = computed(() => {
  const seen = {}
  const ret = []

  Object.values(addressStore.properties).forEach((p) => {
    if (!seen[p.singleline]) {
      ret.push(p)
      seen[p.singleline] = true
    }
  })

  ret.sort((a, b) => {
    return a.singleline.localeCompare(b.singleline)
  })

  return ret
})

const suggestedAddress = computed(() => {
  let ret = null
  let bestMatch = 0
  let bestAddr = null

  const sendMessageLength = sendmessage.value?.length
  const possibleAddressesLength = possibleAddresses.value?.length
  const sendLower = sendmessage.value?.toLowerCase()

  if (sendMessageLength >= 3 && possibleAddressesLength) {
    // Scan through the possible addresses, looking for the longest prefix of the address which appears as a
    // suffix of the typed message. This finds when they're typing a possibly matching address.
    for (let i = 0; i < possibleAddressesLength; i++) {
      const addr = possibleAddresses.value[i].singleline.toLowerCase()

      for (let j = 1; j <= addr.length; j++) {
        const prefix = addr.substring(0, j)
        const suffix = sendLower.substring(sendLower.length - j)

        if (prefix === suffix && prefix.length > bestMatch) {
          bestMatch = prefix.length
          bestAddr = possibleAddresses.value[i]
        }
      }
    }
  }

  if (bestMatch >= 3) {
    ret = {
      address: bestAddr,
      matchedLength: bestMatch,
    }
  }

  return ret
})

const showSuggested = computed(() => {
  return !hideSuggestedAddress.value && suggestedAddress.value !== null
})

// Methods
const updateCaretPosition = () => {
  const textarea = chatarea.value.$el
  const caretCoords = getCaretCoordinates(textarea, textarea.selectionEnd)
  const textareaPosition = textarea.getBoundingClientRect()
  caretPosition.value = {
    top: caretCoords.top + textareaPosition.top,
    left: caretCoords.left + textareaPosition.left,
  }
}

const applySuggestedAddress = async () => {
  const matchedLength = suggestedAddress.value.matchedLength
  const suggestedAddressText = suggestedAddress.value.address.singleline
  // No need to apply suggestion if length of match and address are equal
  if (matchedLength === suggestedAddressText.length) {
    return
  }
  sendmessage.value =
    sendmessage.value.substring(0, sendmessage.value.length - matchedLength) +
    suggestedAddress.value.address.singleline +
    ' '
  hideSuggestedAddress.value = true
  await nextTick()
  const el = chatarea.value?.$el

  if (el) {
    setTimeout(() => {
      // Focus at end of text.
      el.focus()
      el.selectionStart = sendmessage.value.length
    }, 100)
  }
}

const _updateAfterSend = async () => {
  sending.value = false

  // Fetch the messages again to pick up the new one.
  await fetchMessages()
  emit('scrollbottom')

  // We also want to trigger an update in the chat list.
  await chatStore.fetchChat(props.id)
}

const markRead = async () => {
  await chatStore.markRead(props.id)
  _updateAfterSend()
}

const onFocus = () => {
  isFocused.value = true
  markRead()
}

const onBlur = () => {
  isFocused.value = false
}

const doNudge = async () => {
  await chatStore.nudge(props.id)
  _updateAfterSend()
}

const nudge = () => {
  showNudgeWarningModal.value = true
}

const nudgeTooSoon = () => {
  showNudgeTooSoonWarningModal.value = true
}

const newline = () => {
  const p = chatarea.value.selectionStart
  if (p) {
    sendmessage.value =
      sendmessage.value.substring(0, p) + '\n' + sendmessage.value.substring(p)
    nextTick(() => {
      chatarea.value.selectionStart = p + 1
      chatarea.value.selectionEnd = p + 1
    })
  } else {
    sendmessage.value += '\n'
  }
}

const addressBook = async () => {
  await addressStore.fetch()
  showAddress.value = true
}

const photoAdd = () => {
  // Flag that we're uploading. This will trigger the render of the filepond instance and subsequently the
  // processed callback below.
  uploading.value = true
}

const promise = (date, maybe) => {
  // Show the modal first, as eye candy.
  showPromiseMaybe.value = !!maybe
  showPromise.value = !maybe

  nextTick(async () => {
    ouroffers.value = await fetchOurOffers()

    // Find the last message referenced in this chat, if any. That's the most likely one you'd want to promise,
    // so it should be the default.
    likelymsg.value = 0

    // Collect refmsgids from chat messages and ensure they're in the offers list
    const messageStore = useMessageStore()
    const refMsgIds = new Set()

    for (const msg of chatmessages.value) {
      if (msg.type === 'Interested' && msg.refmsgid) {
        refMsgIds.add(msg.refmsgid)
      }
    }

    // Fetch and add any referenced messages not already in ouroffers
    const referencedOffers = []
    for (const refmsgid of refMsgIds) {
      const existingIndex = ouroffers.value.findIndex((o) => o.id === refmsgid)
      if (existingIndex !== -1) {
        // Already in list - remove it so we can add it to the top
        referencedOffers.push(ouroffers.value.splice(existingIndex, 1)[0])
      } else {
        // Not in list - fetch it
        const refMsg = await messageStore.fetch(refmsgid)
        if (
          refMsg &&
          refMsg.type === 'Offer' &&
          refMsg.fromuser === myid.value &&
          !refMsg.successful
        ) {
          referencedOffers.push(refMsg)
        }
      }
    }

    // Sort referenced messages by most recent first
    referencedOffers.sort((a, b) => {
      const dateA = new Date(a.arrival || 0)
      const dateB = new Date(b.arrival || 0)
      return dateB - dateA
    })

    // Put referenced messages at the top, deduplicate by id
    const seen = new Set(referencedOffers.map((o) => o.id))
    const otherOffers = ouroffers.value.filter((o) => !seen.has(o.id))
    ouroffers.value = [...referencedOffers, ...otherOffers]

    // Now find the most likely message to pre-select
    for (const msg of chatmessages.value) {
      if (msg.type === 'Interested' && msg.refmsgid) {
        // Check that it's still in our list of messages
        for (const ours of ouroffers.value) {
          if (
            ours.id === msg.refmsgid &&
            !ours.promised &&
            (!ours.outcomes || ours.outcomes.length === 0)
          ) {
            likelymsg.value = msg.refmsgid
            showPromise.value = true
          }
        }
      }
    }
  })
}

const showInfo = () => {
  showProfileModal.value = true
}

const sendOnEnter = () => {
  send()
}

const send = async (callback) => {
  if (!sending.value) {
    let msg = sendmessage.value

    if (msg) {
      sending.value = true

      // If the current last message in this chat is an "interested" from the other party, then we're going to ask
      // if they expect a reply.
      const needRSVP =
        chatmessages.value.length &&
        chatmessages.value[chatmessages.value.length - 1].type ===
          'Interested' &&
        chatmessages.value[chatmessages.value.length - 1].userid !==
          myid.value &&
        chat.value.chattype === 'User2User'

      // Encode up any emojis.
      msg = untwem(msg)

      // Send it
      await chatStore.send(props.id, msg)

      // Clear the message now it's sent.
      sendmessage.value = ''

      await _updateAfterSend()

      if (needRSVP) {
        RSVP.value = true
      } else {
        // We've sent a message. This would be a good time to do some microvolunteering.
        showMicrovolunteering.value = true
      }
    }
  }

  if (typeof callback === 'function') {
    // For the send-on-enter case we are passed the native event, whereas for SpinButton we are passed a callback.
    callback()
  }
}

const fetchMessages = async () => {
  await chatStore.fetchMessages(props.id)
}

const sendAddress = async (id) => {
  await chatStore.send(props.id, null, id)
  await _updateAfterSend()

  // If we've sent an address to someone who has recently replied to an offer, then it's quite likely that we
  // are promising the item to them. Pop up a modified Promise modal to make it easy to do that.
  promise(null, true)
}

const typing = async () => {
  const now = new Date().getTime()

  if (!lastTyping.value || now - lastTyping.value > TYPING_TIME_INVERVAL) {
    // Let the server know that we are typing, no more frequently than every 10 seconds.
    await chatStore.typing(props.id)
    lastTyping.value = now
  }
}

// Watch for changes
watch(
  suggestedAddress,
  async (newVal) => {
    if (newVal?.address?.singleline?.length !== newVal?.matchedLength) {
      hideSuggestedAddress.value = false
      await nextTick()
      updateCaretPosition()
    }
  },
  { deep: true }
)

watch(sendmessage, (newVal, oldVal) => {
  // This will result in the chat header shrinking once you start typing, to give more room, and then
  // expanding back again if you delete everything. Only emit the event when the state changes.
  if ((newVal && !oldVal) || (!newVal && oldVal)) {
    emit('typing', newVal?.length)
  }
})

watch(
  () => me.value,
  async (newVal) => {
    if (newVal?.settings?.mylocation?.id) {
      // We know our postcode. This will usually be the case if we've posted.
      //
      // Fetch the addresses in that postcode - we can then spot them when people type and suggest
      // them.
      await addressStore.fetchProperties(newVal?.settings?.mylocation?.id)
    }
  },
  { immediate: true }
)

watch(showSuggested, (newVal) => {
  if (newVal) {
    action('SuggestedAddress shown', {
      address: suggestedAddress.value?.address?.singleline,
    })
  }
})

watch(
  currentAtts,
  async (newVal) => {
    if (newVal?.length) {
      sending.value = true

      console.log('Upload photos', JSON.stringify(newVal))

      const promises = []

      newVal.forEach((att) => {
        console.log('Send', att.id, props.id)
        promises.push(chatStore.send(props.id, null, null, att.id))
      })

      await Promise.all(promises)

      await _updateAfterSend()
      sending.value = false
      uploading.value = false
      currentAtts.value = []
    }
  },
  { deep: true }
)

// Lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    showNotices.value = false
  }, 30000)

  // Delay typewriter animation to start after the profile card collapses
  // Profile card: 800ms delay + 3000ms display + 500ms collapse animation = ~4300ms
  setTimeout(() => {
    startTypewriterAnimation()
  }, 4500)
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.mobtext {
  text-align: center !important;
  font-size: 0.65rem;
  font-weight: 500;
  color: $color-gray--dark;
  margin-top: 2px;
}

.fa-mob {
  height: 1.25rem;
  width: 100%;
  color: $colour-success;
}

.shrink {
  height: 0.8rem;
}

.nocolor {
  color: initial;
}

.cont {
  display: grid;
  grid-template-columns: auto;
  grid-auto-rows: max-content;
  border-top: 1px solid $color-gray--light;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.send-area {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: $color-gray--lighter;
  border: 1px solid $color-gray--light;
  color: $color-gray--darker;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: darken($color-gray--lighter, 5%);
    border-color: $color-gray--normal;
  }

  &:active {
    background-color: darken($color-gray--lighter, 10%);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-icon {
    color: $colour-success;
    font-size: 1rem;
  }
}

.send-button {
  padding: 6px 16px;
}

.notices-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 4px;
}

.btn-warning {
  background-color: $color-yellow-1 !important;
  color: black !important;
  border: 0;
}

.maxheight {
  max-height: 33vh;
}

.textarea-wrapper {
  position: relative;
  width: 100%;
}

.textarea-placeholder {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
  z-index: 1;
}

.placeholder-text {
  color: $color-gray--normal;
  font-size: 0.9rem;
}

.placeholder-dots {
  margin-left: 2px;
  margin-top: 4px;
}

:deep(textarea) {
  transition: height 1s;
  height: v-bind(height) !important;
  max-height: calc(50vh - 120px);
  overflow-y: auto !important;
  border: 1px solid $color-gray--light;
  border-radius: 0;
  padding: 10px 12px;
  font-size: 0.9rem;
  resize: none;
  background-color: #fafafa;

  &:focus {
    outline: none;
    background-color: $color-white;
    border-color: $color-gray--normal;
  }

  @include media-breakpoint-down(md) {
    padding: 8px 10px;
  }
}

// Mobile action bar styling
.d-flex.d-lg-none {
  padding: 4px 2px;
  gap: 2px;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px 6px;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    cursor: pointer;
    min-width: 44px;

    &:active {
      background-color: $color-gray--lighter;
    }
  }
}
</style>
