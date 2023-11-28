<template>
  <div class="cont bg-white">
    <div v-if="uploading" class="bg-white">
      <OurFilePond
        imgtype="ChatMessage"
        imgflag="chatmessage"
        @photo-processed="photoProcessed"
      />
    </div>
    <div>
      <div v-if="showNotices && noticesToShow" class="d-flex">
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
      <div>
        <label for="chatmessage" class="visually-hidden">Chat message</label>
        <div v-if="!imagethumb">
          <b-form-textarea
            v-if="enterNewLine && !otheruser?.spammer"
            id="chatmessage"
            ref="chatarea"
            v-model="sendmessage"
            placeholder="Type here..."
            enterkeyhint="enter"
            rows="3"
            max-rows="8"
            @focus="markRead"
          />
          <b-form-textarea
            v-else-if="!otheruser?.spammer"
            id="chatmessage"
            ref="chatarea"
            v-model="sendmessage"
            placeholder="Type here..."
            rows="3"
            max-rows="8"
            enterkeyhint="send"
            autocapitalize="none"
            @keydown.enter.exact.prevent
            @keyup.enter.exact="send"
            @keydown.enter.shift.exact.prevent="newline"
            @focus="markRead"
          />
        </div>
        <div v-else class="d-flex justify-content-end pt-2 pb-2">
          <b-img :src="imagethumb" fluid />
          <div>
            <b-button title="Remove photo" @click="removeImage">
              <v-icon icon="times-circle" scale="1.5" />
            </b-button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!otheruser?.spammer" class="bg-white pt-1 pb-1">
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
        <b-button variant="primary" class="float-end ml-2 mr-2" @click="send">
          Send&nbsp;
          <v-icon
            v-if="sending"
            icon="sync"
            class="fa-spin"
            title="Sending..."
          />
          <v-icon v-else icon="angle-double-right" title="Send" />
        </b-button>
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
          v-b-tooltip="'Promise an item to this freegler'"
          class="ml-1 mr-2"
          @click="promise(null)"
        >
          <v-icon scale="2" icon="handshake" class="fa-mob" />
          <div class="mobtext text--smallest">Promise</div>
        </div>
        <div
          v-if="chat && chat.chattype === 'User2User' && otheruser"
          v-b-tooltip="'Send your address'"
          disabled
          class="mr-2"
          @click="addressBook"
        >
          <v-icon scale="3" icon="address-book" class="fa-mob" />
          <div class="mobtext text--smallest">Address</div>
        </div>
        <div
          v-if="chat && chat.chattype === 'User2Mod' && mod"
          v-b-tooltip="'Report as spammer'"
          class="mr-2"
          @click="spamReport"
        >
          <v-icon scale="2" icon="ban" class="fa-mob" />
          <div class="mobtext text--smallest">Spammer</div>
        </div>
        <div
          v-if="
            chat &&
            chat.chattype === 'User2User' &&
            otheruser &&
            !tooSoonToNudge
          "
          v-b-tooltip="'Waiting for a reply?  Nudge this freegler.'"
          class="mr-2"
          @click="nudge"
        >
          <v-icon scale="2" icon="bell" class="fa-mob" />
          <div class="mobtext text--smallest">Nudge</div>
        </div>
        <div
          v-if="
            chat && chat.chattype === 'User2User' && otheruser && tooSoonToNudge
          "
          v-b-tooltip="
            'You need to wait a day since the last message before nudging.'
          "
          class="mr-2"
          @click="nudgeTooSoon"
        >
          <v-icon scale="2" icon="bell" class="fa-mob" />
          <div class="mobtext text--smallest">Nudge</div>
        </div>
        <div class="" @click="photoAdd">
          <v-icon scale="2" icon="camera" class="fa-mob" />
          <div class="mobtext text--smallest">Photo</div>
        </div>
        <b-button variant="primary" @click="send">
          Send
          <v-icon
            v-if="sending"
            icon="sync"
            class="fa-spin"
            title="Sending..."
          />
          <v-icon v-else icon="angle-double-right" title="Send" />
        </b-button>
      </div>
    </div>
    <PromiseModal
      v-if="showPromise"
      :messages="ouroffers"
      :selected-message="likelymsg ? likelymsg : 0"
      :users="otheruser ? [otheruser] : []"
      :selected-user="otheruser ? otheruser.id : null"
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
import { setupChat } from '../composables/useChat'
import { useMiscStore } from '../stores/misc'
import { useMessageStore } from '../stores/message'
import { fetchOurOffers } from '../composables/useThrottle'
import { useAuthStore } from '../stores/auth'
import { useAddressStore } from '../stores/address'
import { untwem } from '~/composables/useTwem'

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
const OurFilePond = () => import('~/components/OurFilePond')
const UserRatings = () => import('~/components/UserRatings')
const PromiseModal = () =>
  defineAsyncComponent(() => import('~/components/PromiseModal'))
const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)
const AddressModal = defineAsyncComponent(() =>
  import('~/components/AddressModal')
)
const NoticeMessage = () => import('~/components/NoticeMessage')
const ChatRSVPModal = defineAsyncComponent(() =>
  import('~/components/ChatRSVPModal')
)
const NudgeWarningModal = defineAsyncComponent(() =>
  import('~/components/NudgeWarningModal')
)
const NudgeTooSoonWarningModal = defineAsyncComponent(() =>
  import('~/components/NudgeTooSoonWarningModal')
)
const MicroVolunteering = () => import('~/components/MicroVolunteering')

export default {
  components: {
    NudgeTooSoonWarningModal,
    NudgeWarningModal,
    UserRatings,
    OurFilePond,
    NoticeMessage,
    PromiseModal,
    AddressModal,
    ProfileModal,
    ChatRSVPModal,
    MicroVolunteering,
  },
  props: {
    id: { type: Number, required: true },
  },
  async setup(props) {
    const authStore = useAuthStore()
    const miscStore = useMiscStore()
    const messageStore = useMessageStore()
    const addressStore = useAddressStore()

    const { chat, otheruser, tooSoonToNudge, chatStore, chatmessages } =
      await setupChat(props.id)

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
    }
  },
  data() {
    return {
      sending: false,
      uploading: false,
      showMicrovolunteering: false,
      showNotices: true,
      showPromise: false,
      showProfileModal: false,
      showAddress: false,
      sendmessage: null,
      RSVP: false,
      likelymsg: null,
      typingLastMessage: null,
      typingTimer: null,
      ouroffers: [],
      imagethumb: null,
      imageid: null,
      showNudgeTooSoonWarningModal: false,
      showNudgeWarningModal: false,
    }
  },
  computed: {
    noticesToShow() {
      return this.badratings || this.expectedreplies || this.otheruser?.spammer
    },
    badratings() {
      let ret = false

      if (
        this.otheruser?.info?.ratings &&
        this.otheruser.info.ratings.Down > 2 &&
        this.otheruser.info.ratings.Down > 2 * this.otheruser.info.ratings.Up
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
  },
  beforeUnmount() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer)
    }
  },
  mounted() {
    setTimeout(() => {
      this.showNotices = false
    }, 30000)
  },
  methods: {
    async markRead() {
      await this.chatStore.markRead(this.id)
      this._updateAfterSend()
    },
    async _updateAfterSend() {
      this.sending = false
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
      // Fetch the address book here to avoid an async setup which causes issues with waitForRef.
      await this.addressStore.fetch()

      this.showAddress = true
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // processed callback below.
      this.uploading = true
    },
    promise(date) {
      // Show the modal first, as eye candy.
      this.showPromise = true

      this.$nextTick(async () => {
        this.ouroffers = await fetchOurOffers()

        // Find the last message referenced in this chat, if any.  That's the most likely one you'd want to promise,
        // so it should be the default.
        this.likelymsg = 0

        for (const msg of this.chatmessages) {
          if (msg.refmsg) {
            // Check that it's still in our list of messages
            for (const ours of this.ouroffers) {
              if (
                ours.id === msg.refmsg.id &&
                !ours.promised &&
                (!ours.outcomes || ours.outcomes.length === 0)
              ) {
                this.likelymsg = msg.refmsg.id
              }
            }
          }
        }
      })
    },
    showInfo() {
      this.showProfileModal = true
    },
    async send() {
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

          // Start the timer which indicates we may still be typing.
          this.startTypingTimer()
        }
      }
    },
    startTypingTimer() {
      // We want to let the server know regularly that we are still typing.  This will bump earlier recent chat
      // messages so that they don't get send out by email.  This helps with people who don't expect enter to act
      // as send.
      if (!this.typingTimer) {
        this.typingLastMessage = this.sendmessage
        this.typingTimer = setTimeout(this.stillTyping, 10000)
      }
    },
    async stillTyping() {
      if (this.sendmessage !== this.typingLastMessage) {
        // We are still typing.
        await this.chatStore.typing(this.id)
        this.startTypingTimer()
      }
    },
    fetchMessages() {
      this.chatStore.fetchMessages(this.id)
    },
    async sendAddress(id) {
      await this.chatStore.send(this.id, null, id)
      await this._updateAfterSend
    },
    photoProcessed(imageid, imagethumb, image) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      // Show the chat busy indicator.
      this.chatBusy = true

      // We have uploaded a photo.  Post a chatmessage referencing it.
      this.imagethumb = imagethumb
      this.imageid = imageid
    },
    removeImage() {
      this.imageid = null
      this.imagethumb = null
    },
  },
}
</script>

<style scoped lang="scss">
.mobtext {
  text-align: center !important;
}

.fa-mob {
  height: 2rem;
  width: 100%;
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
</style>
