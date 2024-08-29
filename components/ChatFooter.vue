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
            v-if="faraway"
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
            @closed="uploading = false"
          />
        </div>
        <label for="chatmessage" class="visually-hidden">Chat message</label>
        <div v-if="!imageid" :style="height">
          <b-form-textarea
            v-if="enterNewLine && !otheruser?.spammer"
            id="chatmessage"
            ref="chatarea"
            v-model="sendmessage"
            debounce="500"
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
            debounce="500"
            class="h-100"
            placeholder="Type here..."
            enterkeyhint="send"
            autocapitalize="none"
            @keydown="typing"
            @keydown.enter.exact.prevent
            @keyup.enter.exact="send"
            @keydown.enter.shift.exact.prevent="newline"
            @keydown.alt.shift.enter.exact.prevent="newline"
            @focus="markRead"
          />
          <Dropdown
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
        <div v-else class="d-flex justify-content-end pt-2 pb-2">
          <OurUploadedImage
            :src="imageuid"
            :modifiers="imagemods"
            alt="Chat Photo"
            :width="200"
            :height="200"
            sizes="200px"
          />
          <div class="ml-1">
            <b-button title="Remove photo" @click="removeImage">
              <v-icon icon="trash-alt" scale="1.5" />
            </b-button>
          </div>
        </div>
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
  </div>
</template>
<script>
import pluralize from 'pluralize'
import getCaretCoordinates from 'textarea-caret'
import { Dropdown } from 'floating-vue'
import { mapWritableState } from 'pinia'
import { FAR_AWAY, TYPING_TIME_INVERVAL } from '../constants'
import { setupChat } from '../composables/useChat'
import { useMiscStore } from '../stores/misc'
import { useMessageStore } from '../stores/message'
import { fetchOurOffers } from '../composables/useThrottle'
import { useAuthStore } from '../stores/auth'
import { useAddressStore } from '../stores/address'
import SpinButton from './SpinButton'
import { untwem } from '~/composables/useTwem'

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

export default {
  components: {
    SpinButton,
    NudgeTooSoonWarningModal,
    NudgeWarningModal,
    UserRatings,
    OurUploader,
    NoticeMessage,
    PromiseModal,
    AddressModal,
    ProfileModal,
    ChatRSVPModal,
    MicroVolunteering,
    Dropdown,
  },
  props: {
    id: { type: Number, required: true },
  },
  async setup(props) {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const messageStore = useMessageStore()
    const addressStore = useAddressStore()

    const {
      chat,
      otheruser,
      tooSoonToNudge,
      chatStore,
      chatmessages,
      milesaway,
      milesstring,
    } = await setupChat(props.id)

    return {
      chat,
      otheruser,
      tooSoonToNudge,
      miscStore,
      chatStore,
      messageStore,
      addressStore,
      chatmessages,
      authStore,
      milesaway,
      milesstring,
    }
  },
  data() {
    return {
      sending: false,
      uploading: false,
      showMicrovolunteering: false,
      showNotices: true,
      showPromise: false,
      showPromiseMaybe: false,
      showProfileModal: false,
      showAddress: false,
      sendmessage: null,
      RSVP: false,
      likelymsg: null,
      ouroffers: [],
      imagethumb: null,
      imageid: null,
      imageuid: null,
      imagemods: null,
      showNudgeTooSoonWarningModal: false,
      showNudgeWarningModal: false,
      hideSuggestedAddress: false,
      caretPosition: { top: 0, left: 0 },
      currentAtts: [],
    }
  },
  computed: {
    ...mapWritableState(useMiscStore, ['lastTyping']),
    shrink() {
      return this.sendmessage?.length > 120
    },
    height() {
      // Bootstrap Vue Next doesn't yet have autoresizing.
      const height = Math.min(6, Math.round(this.sendmessage?.length / 60))

      return 'height: ' + (height + 6) + 'em'
    },
    noticesToShow() {
      return (
        this.badratings ||
        this.expectedreplies ||
        this.otheruser?.spammer ||
        this.otheruser?.deleted ||
        this.thumbsdown ||
        this.faraway
      )
    },
    faraway() {
      return this.milesaway && this.milesaway > FAR_AWAY
    },
    thumbsdown() {
      return this.otheruser?.info?.ratings?.Mine === 'Down'
    },
    badratings() {
      let ret = false

      if (
        this.otheruser?.info?.ratings &&
        this.otheruser.info.ratings.Down > 2 &&
        this.otheruser.info.ratings.Down * 2 > this.otheruser.info.ratings.Up
      ) {
        ret = true
      }

      return ret
    },
    enterNewLine: {
      get() {
        return this.me?.settings?.enterNewLine
      },
      async set(newVal) {
        const settings = this.me.settings
        settings.enterNewLine = newVal

        await this.authStore.saveAndGet({
          settings,
        })
      },
    },
    expectedreplies() {
      if (this.otheruser?.expectedreplies) {
        pluralize.addIrregularRule('freegler is', 'freeglers are')
        return pluralize('freegler is', this.otheruser?.expectedreplies, true)
      }

      return null
    },
    possibleAddresses() {
      const seen = {}
      const ret = []

      Object.values(this.addressStore.properties).forEach((p) => {
        if (!seen[p.singleline]) {
          ret.push(p)
          seen[p.singleline] = true
        }
      })

      ret.sort((a, b) => {
        return a.singleline.localeCompare(b.singleline)
      })

      return ret
    },
    suggestedAddress() {
      let ret = null
      let bestMatch = 0
      let bestAddr = null

      const sendMessageLength = this.sendmessage?.length
      const possibleAddressesLength = this.possibleAddresses?.length
      const sendLower = this.sendmessage?.toLowerCase()

      if (sendMessageLength >= 3 && possibleAddressesLength) {
        // Scan through the possible addresses, looking for the longest prefix of the address which appears as a
        // suffix of the typed message.  This finds when they're typing a possibly matching address.
        for (let i = 0; i < possibleAddressesLength; i++) {
          const addr = this.possibleAddresses[i].singleline.toLowerCase()

          for (let j = 1; j <= addr.length; j++) {
            const prefix = addr.substring(0, j)
            const suffix = sendLower.substring(sendLower.length - j)

            if (prefix === suffix && prefix.length > bestMatch) {
              bestMatch = prefix.length
              bestAddr = this.possibleAddresses[i]
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
    },
    showSuggested() {
      return !this.hideSuggestedAddress && this.suggestedAddress !== null
    },
  },
  watch: {
    suggestedAddress: {
      async handler(newVal) {
        if (newVal?.address?.singleline?.length !== newVal?.matchedLength) {
          this.hideSuggestedAddress = false
          await this.$nextTick()
          this.updateCaretPosition()
        }
      },
      deep: true,
    },
    sendmessage(newVal, oldVal) {
      // This will result in the chat header shrinking once you start typing, to give more room, and then
      // expanding back again if you delete everything.
      this.$emit('typing', newVal?.length)
    },
    me: {
      async handler(newVal, oldVal) {
        if (newVal?.settings?.mylocation?.id) {
          // We know our postcode.  This will usually be the case if we've posted.
          //
          // Fetch the addresses in that postcode - we can then spot them when people type and suggest
          // them.
          await this.addressStore.fetchProperties(
            newVal?.settings?.mylocation?.id
          )
        }
      },
      immediate: true,
    },
    showSuggested(newVal) {
      if (newVal) {
        this.$api.bandit.shown({
          uid: 'SuggestedAddress',
          variant: 'chosen',
        })
        this.$api.bandit.shown({
          uid: 'SuggestedAddress',
          variant: 'cancel',
        })
      }
    },
    currentAtts: {
      handler(newVal) {
        if (newVal) {
          // We have uploaded a photo.
          this.uploading = false

          // Show the chat busy indicator.
          this.chatBusy = true

          // We have uploaded a photo.  Post a chatmessage referencing it.
          this.imageid = newVal[0].id
          this.imageuid = newVal[0].ouruid
          this.imagemods = newVal[0].externalmods
        }
      },
      deep: true,
    },
  },
  mounted() {
    setTimeout(() => {
      this.showNotices = false
    }, 30000)
  },
  methods: {
    updateCaretPosition() {
      const textarea = this.$refs.chatarea.$el
      const caretPosition = getCaretCoordinates(textarea, textarea.selectionEnd)
      const textareaPosition = textarea.getBoundingClientRect()
      this.caretPosition = {
        top: caretPosition.top + textareaPosition.top,
        left: caretPosition.left + textareaPosition.left,
      }
    },
    async applySuggestedAddress() {
      const matchedLength = this.suggestedAddress.matchedLength
      const suggestedAddress = this.suggestedAddress.address.singleline
      // No need to apply suggestion if length of match and address are equal
      if (matchedLength === suggestedAddress.length) {
        return
      }
      this.sendmessage =
        this.sendmessage.substring(0, this.sendmessage.length - matchedLength) +
        this.suggestedAddress.address.singleline +
        ' '
      this.hideSuggestedAddress = true
      await this.$nextTick()
      const el = this.$refs.chatarea?.$el

      if (el) {
        setTimeout(() => {
          // Focus at end of text.
          el.focus()
          el.selectionStart = this.sendmessage.length
        }, 100)
      }
    },
    async markRead() {
      await this.chatStore.markRead(this.id)
      this._updateAfterSend()
    },
    async _updateAfterSend() {
      this.sending = false

      // Fetch the messages again to pick up the new one.
      await this.fetchMessages()
      this.$emit('scrollbottom')

      // We also want to trigger an update in the chat list.
      await this.chatStore.fetchChat(this.id)
    },
    async doNudge() {
      await this.chatStore.nudge(this.id)
      this._updateAfterSend()
    },
    nudge() {
      this.showNudgeWarningModal = true
    },
    nudgeTooSoon() {
      this.showNudgeTooSoonWarningModal = true
    },
    newline() {
      const p = this.$refs.chatarea.selectionStart
      if (p) {
        this.sendmessage =
          this.sendmessage.substring(0, p) +
          '\n' +
          this.sendmessage.substring(p)
        this.$nextTick(() => {
          this.$refs.chatarea.selectionStart = p + 1
          this.$refs.chatarea.selectionEnd = p + 1
        })
      } else {
        this.sendmessage += '\n'
      }
    },
    async addressBook() {
      await this.addressStore.fetch()

      this.showAddress = true
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // processed callback below.
      this.uploading = true
    },
    promise(date, maybe) {
      // Show the modal first, as eye candy.
      this.showPromiseMaybe = !!maybe
      this.showPromise = !maybe

      this.$nextTick(async () => {
        this.ouroffers = await fetchOurOffers()

        // Find the last message referenced in this chat, if any.  That's the most likely one you'd want to promise,
        // so it should be the default.
        this.likelymsg = 0

        for (const msg of this.chatmessages) {
          if (msg.type === 'Interested' && msg.refmsgid) {
            // Check that it's still in our list of messages
            for (const ours of this.ouroffers) {
              if (
                ours.id === msg.refmsgid &&
                !ours.promised &&
                (!ours.outcomes || ours.outcomes.length === 0)
              ) {
                this.likelymsg = msg.refmsgid
                this.showPromise = true
              }
            }
          }
        }
      })
    },
    showInfo() {
      this.showProfileModal = true
    },
    async send(callback) {
      if (!this.sending) {
        if (this.imageid) {
          this.sending = true

          await this.chatStore.send(this.id, null, null, this.imageid)
          await this._updateAfterSend()
          this.sending = false
          this.imagethumb = null
          this.imageid = null
        } else {
          let msg = this.sendmessage

          if (msg) {
            this.sending = true

            // If the current last message in this chat is an "interested" from the other party, then we're going to ask
            // if they expect a reply.
            const RSVP =
              this.chatmessages.length &&
              this.chatmessages[this.chatmessages.length - 1].type ===
                'Interested' &&
              this.chatmessages[this.chatmessages.length - 1].userid !==
                this.myid &&
              this.chat.chattype === 'User2User'

            // Encode up any emojis.
            msg = untwem(msg)

            // Send it
            await this.chatStore.send(this.id, msg)

            // Clear the message now it's sent.
            this.sendmessage = ''

            await this._updateAfterSend()

            if (RSVP) {
              this.RSVP = true
            } else {
              // We've sent a message.  This would be a good time to do some microvolunteering.
              this.showMicrovolunteering = true
            }
          }
        }
      }

      if (typeof callback === 'function') {
        // For the send-on-enter case we are passed the native event, whereas for SpinButton we are passed a callback.
        callback()
      }
    },
    async fetchMessages() {
      await this.chatStore.fetchMessages(this.id)
    },
    async sendAddress(id) {
      await this.chatStore.send(this.id, null, id)
      await this._updateAfterSend

      // If we've sent an address to someone who has recently replied to an offer, then it's quite likely that we
      // are promising the item to them.  Pop up a modified Promise modal to make it easy to do that.
      this.promise(null, true)
    },
    removeImage() {
      this.imageid = null
      this.imagethumb = null
    },
    async typing() {
      const now = new Date().getTime()

      if (!this.lastTyping || now - this.lastTyping > TYPING_TIME_INVERVAL) {
        // Let the server know that we are typing, no more frequently than every 10 seconds.
        await this.chatStore.typing(this.id)
        this.lastTyping = now
      }
    },
    async sendSuggestedAddress() {
      // We want to send the address.  First we need to make sure it's in our address book.
      this.$api.bandit.chosen({
        uid: 'SuggestedAddress',
        variant: 'chosen',
      })

      const toSend = JSON.parse(JSON.stringify(this.suggestedAddress.address))
      const matchLen = this.suggestedAddress.matchedLength
      await this.addressStore.fetch()

      // Check if it's already in the address book.
      let found = null
      for (const addrid in this.addressStore.list) {
        const addr = this.addressStore.list[addrid]

        if (addr.singleline === toSend.singleline) {
          found = addr.id
          break
        }
      }

      if (!found) {
        // It's not in the address book.  Add it.
        found = await this.addressStore.add({
          pafid: toSend.id,
        })
      }

      if (found) {
        await this.sendAddress(found)
      }

      // Remove this.bestAddressMatch characters from the end of the message.
      this.sendmessage = this.sendmessage.substring(
        0,
        this.sendmessage.length - matchLen
      )

      this.hideSuggestedAddress = true
      this.$refs.chatarea.focus()
    },
    rejectSuggestedAddress() {
      this.hideSuggestedAddress = true

      this.$api.bandit.chosen({
        uid: 'SuggestedAddress',
        variant: 'cancel',
        message: this.sendmessage,
      })
    },
  },
}
</script>
<style scoped lang="scss">
@import 'https://unpkg.com/floating-vue@^2.0.0-beta.1/dist/style.css';

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
}
</style>
