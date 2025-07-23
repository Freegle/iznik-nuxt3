<template>
  <div class="cont bg-white">
    <div>
      <notice-message v-if="otheruser?.deleted" variant="info" class="mb-2">
        This freegler has deleted their account, so you can't chat to them.
      </notice-message>
      <div v-else-if="showNotices && noticesToShow" class="d-flex">
        <div class="flex-grow-1">
          <notice-message
            v-if="badratings"
            variant="warning"
            class="clickme"
            @click="showInfo"
          >
            <p>
              <v-icon icon="exclamation-triangle" />&nbsp;This freegler has a
              lot of thumbs down ratings. That might not be their fault, but
              please make very clear arrangements. If you have a good experience
              with them, give them a thumbs up.
            </p>
            <UserRatings
              v-if="chat.otheruid"
              :id="chat.otheruid"
              :key="'otheruser-' + chat.otheruid"
            />
          </notice-message>
          <notice-message
            v-else-if="expectedreplies"
            variant="warning"
            class="clickme"
            @click="showInfo"
          >
            <v-icon icon="exclamation-triangle" />&nbsp;{{ expectedreplies }}
            still waiting for them to reply on here.
          </notice-message>
          <notice-message v-if="otheruser?.spammer" variant="danger">
            This person has been reported as a spammer or scammer. Please do not
            talk to them and under no circumstances send them any money. Do not
            arrange anything by courier.
          </notice-message>
          <notice-message
            v-if="faraway && !isMT"
            variant="warning"
            class="clickme"
            @click="showInfo"
          >
            <p>
              <v-icon icon="exclamation-triangle" />&nbsp;This freegler is
              {{ milesstring }}
              from you. If you are collecting from them, please make sure you
              can get there. If they are collecting from you, please
              double-check they have transport.
            </p>
          </notice-message>
          <notice-message v-if="thumbsdown" variant="warning">
            <p>
              <v-icon icon="exclamation-triangle" />&nbsp;You previously gave
              this freegler a thumbs down.
            </p>
          </notice-message>
          <ModComments
            v-if="mod && chat && chat.chattype === 'User2Mod' && otheruser"
            :user="otheruser"
            class="mt-1"
            @editing="editing"
          />
        </div>
        <b-button
          variant="warning"
          class="float-end bg-warning"
          title="Hide warnings"
          @click="showNotices = false"
        >
          <v-icon icon="times-circle" scale="1.5" />
        </b-button>
      </div>
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
        <b-form-textarea
          v-if="enterNewLine && !otheruser?.spammer"
          id="chatmessage"
          ref="chatarea"
          v-model="sendmessage"
          class="h-100"
          placeholder="Type here..."
          enterkeyhint="enter"
          @keydown="typing"
          @focus="markRead"
        />
        <b-form-textarea
          v-else-if="!otheruser?.spammer"
          id="chatmessage"
          ref="chatarea"
          v-model="sendmessage"
          class="h-100"
          placeholder="Type here..."
          enterkeyhint="send"
          autocapitalize="none"
          @keydown="typing"
          @keydown.enter.exact.prevent
          @keyup.enter.exact="sendOnEnter"
          @keydown.enter.shift.exact.prevent="newline"
          @keydown.alt.shift.enter.exact.prevent="newline"
          @focus="markRead"
        />
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
      <div class="d-none d-lg-block">
        <span v-if="chat && chat.chattype === 'User2User' && otheruser">
          <b-button
            v-b-tooltip="'Promise an item to this freegler'"
            variant="secondary"
            class="ml-1 mr-2"
            @click="promise(null)"
          >
            <v-icon icon="handshake" class="fa-fw" />&nbsp;Promise
          </b-button>
          <b-button
            v-b-tooltip="'Send your address'"
            variant="secondary"
            class="mr-2"
            @click="addressBook"
          >
            <v-icon icon="address-book" class="fa-fw" />&nbsp;Address
          </b-button>
          <b-button
            v-if="!tooSoonToNudge"
            v-b-tooltip="'Waiting for a reply?  Nudge this freegler.'"
            variant="secondary"
            class="mr-2"
            @click="nudge"
          >
            <v-icon icon="bell" class="fa-fw" />&nbsp;Nudge
          </b-button>
          <div
            v-if="tooSoonToNudge"
            v-b-tooltip="
              'You need to wait a day since the last message before nudging.'
            "
            class="d-inline"
          >
            <b-button variant="secondary" class="mr-2" @click="nudgeTooSoon">
              <v-icon icon="bell" class="fa-fw" />&nbsp;Nudge
            </b-button>
          </div>
        </span>
        <span v-if="chat && chat.chattype === 'User2Mod'">
          <b-button v-if="mod" variant="secondary" @click="spamReport">
            <v-icon icon="ban" /> Spammer
          </b-button>
          <external-link
            v-if="chat && chat.chattype === 'User2Mod' && mod"
            href="https://discourse.ilovefreegle.org/c/central"
            class="nocolor btn btn-secondary"
          >
            <v-icon icon="question-circle" /> Central
          </external-link>
          <b-button
            v-if="chat && chat.chattype === 'User2Mod' && mod"
            v-b-tooltip.hover.top
            title="Ask Support for help"
            variant="secondary"
            @click="confirmReferToSupport"
          >
            <v-icon icon="question-circle" /> Refer to Support
          </b-button>
          <b-button
            v-if="chat && chat.chattype === 'User2Mod' && mod"
            v-b-tooltip.hover.top
            title="Add a note for this member, and optionally alert other groups"
            variant="secondary"
            @click="addAComment"
          >
            <v-icon icon="tag" /> Add note
          </b-button>
        </span>
        <SpinButton
          size="md"
          variant="primary"
          class="float-end ml-2 mr-2"
          :button-title="sending ? 'Sending...' : 'Send'"
          label="Send"
          icon-name="angle-double-right"
          done-icon=""
          iconlast
          @handle="send"
        />
        <b-button
          v-b-tooltip="'Upload a photo'"
          variant="secondary"
          class="float-end"
          @click="photoAdd"
        >
          <v-icon icon="camera" />
          Photo
        </b-button>
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
    <ConfirmModal
      v-if="showConfirmModal"
      title="Refer this chat to Support?"
      message="The Support volunteers will have a look at the chat and get back to you by email."
      @confirm="referToSupport"
      @hidden="showConfirmModal = false"
    />
    <ModSpammerReport
      v-if="showSpamModal && modchatuser"
      :user="modchatuser"
      @hidden="showSpamModal = false"
    />
    <ModCommentAddModal
      v-if="showAddCommentModal && modchatuser"
      :user="modchatuser"
      :groupid="chat.group.id"
      @hidden="showAddCommentModal = false"
    />
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
import { setupChat } from '../composables/useChat'
import { useMiscStore } from '../stores/misc'
import { fetchOurOffers } from '../composables/useThrottle'
import { useAuthStore } from '../stores/auth'
import { useAddressStore } from '../stores/address'
import SpinButton from './SpinButton'
import { untwem } from '~/composables/useTwem'
import 'floating-vue/dist/style.css'
import Api from '~/api'
import { useMe } from '~/composables/useMe'
import { useUserStore } from '~/stores/user' // MT...
import { useNuxtApp } from '#app'
const { $api } = useNuxtApp()

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
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
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
const userStore = useUserStore() // MT

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
const dontHideNotices = ref(false) // MT
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
const showSpamModal = ref(false) // MT..
const showConfirmModal = ref(false)
const showAddCommentModal = ref(false)
const isMT = ref(miscStore.modtools)
const modchatuser = ref(null)
if (miscStore.modtools && chat.value.user1id) {
  await userStore.fetch(chat.value.user1id)
  modchatuser.value = userStore.byId(chat.value.user1id)
}

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
    otheruser.value?.spammer ||
    otheruser.value?.deleted ||
    thumbsdown.value ||
    faraway.value ||
    (miscStore.modtools && // MT
      otheruser.value &&
      otheruser.value.comments &&
      otheruser.value.comments.length)
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
    if (miscStore.modtools) {
      // MT
      return !miscStore?.get('enternewlinemt')
    }
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
const editing = () => {
  // MT
  dontHideNotices.value = true
}

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

const spamReport = () => {
  // MT..
  showSpamModal.value = true
}
const referToSupport = () => {
  $api.chat.referToSupport(props.id)
}
const confirmReferToSupport = () => {
  showConfirmModal.value = true
}
const addAComment = () => {
  showAddCommentModal.value = true
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

const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

watch(showSuggested, (newVal) => {
  if (newVal) {
    api.bandit.shown({
      uid: 'SuggestedAddress',
      variant: 'chosen',
    })
    api.bandit.shown({
      uid: 'SuggestedAddress',
      variant: 'cancel',
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
    if (!dontHideNotices.value) {
      showNotices.value = false
    }
  }, 30000)
})
</script>
<style scoped lang="scss">
.mobtext {
  text-align: center !important;
}

.fa-mob {
  height: 2rem;
  width: 100%;
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
}

.btn-warning {
  background-color: $color-yellow-1 !important;
  color: black !important;
  border: 0;
}

.maxheight {
  max-height: 33vh;
}

:deep(textarea) {
  transition: height 1s;

  height: v-bind(height) !important;
}
</style>
