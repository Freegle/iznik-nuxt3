<template>
  <div class="cont bg-white">
    <div v-if="uploading" class="bg-white">
      <OurFilePond
        imgtype="ChatMessage"
        imgflag="chatmessage"
        @photoProcessed="photoProcessed"
      />
    </div>
    <div>
      <div v-if="showNotices && noticesToShow" class="d-flex">
        <div class="flex-grow-1">
          <notice-message
            v-if="badratings"
            variant="warning"
            class="clickme"
            @click.native="showInfo"
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
            v-else-if="expectedreply"
            variant="warning"
            class="clickme"
            @click.native="showInfo"
          >
            <v-icon icon="exclamation-triangle" />&nbsp;{{
              expectedreply
                | pluralize(['freegler is', 'freeglers are'], {
                  includeNumber: true,
                })
            }}
            still waiting for them to reply on here.
          </notice-message>
          <notice-message v-if="otheruser?.spammer" variant="danger">
            This person has been reported as a spammer or scammer. Please do not
            talk to them and under no circumstances send them any money. Do not
            arrange anything by courier.
          </notice-message>
        </div>
        <div
          class="float-end ml-2 mr-2 mt-2 clickme"
          title="Hide warnings"
          @click="showNotices = false"
        >
          <v-icon icon="times-circle" scale="1.5" />
        </div>
      </div>
      <div>
        <label for="chatmessage" class="sr-only">Chat message</label>
        <b-form-textarea
          v-if="enterNewLine && !otheruser?.spammer"
          id="chatmessage"
          ref="chatarea"
          v-model="sendmessage"
          placeholder="Type here..."
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
          autocapitalize="none"
          @keydown.enter.exact.prevent
          @keyup.enter.exact="send"
          @keydown.enter.shift.exact.prevent="newline"
          @keydown.alt.shift.exact.prevent="newline"
          @focus="markRead"
        />
      </div>
    </div>
    <div v-if="!otheruser?.spammer" class="bg-white pt-1 pb-1">
      <div class="d-none d-lg-block">
        <span v-if="chat && chat.chattype === 'User2User' && otheruser">
          <b-button
            v-b-tooltip.hover.top
            variant="secondary"
            title="Promise an item to this person"
            @click="promise(null)"
          >
            <v-icon icon="handshake" class="fa-fw" />&nbsp;Promise
          </b-button>
          <b-button
            v-if="!simple"
            v-b-tooltip.hover.top
            variant="secondary"
            title="Send your address"
            @click="addressBook"
          >
            <v-icon icon="address-book" class="fa-fw" />&nbsp;Address
          </b-button>
          <b-button
            v-if="!simple && !tooSoonToNudge"
            v-b-tooltip.hover.top
            variant="secondary"
            title="Waiting for a reply?  Nudge this freegler."
            @click="nudge"
          >
            <v-icon icon="bell" class="fa-fw" />&nbsp;Nudge
          </b-button>
          <div
            v-if="!simple && tooSoonToNudge"
            class="d-inline"
            @click="nudgeTooSoon"
          >
            <b-button
              v-b-tooltip.hover.top
              variant="secondary"
              title="It's too soon to nudge"
            >
              <v-icon icon="bell" class="fa-fw" />&nbsp;Nudge
            </b-button>
          </div>
        </span>
        <span v-if="chat && chat.chattype === 'User2Mod'">
          <b-button v-if="mod" variant="secondary" @click="spamReport">
            <v-icon icon="ban" /> Spammer
          </b-button>
          <external-link
            href="https://discourse.ilovefreegle.org/c/central"
            class="nocolor btn btn-secondary"
          >
            <v-icon icon="question-circle" /> Central
          </external-link>
        </span>
        <b-button variant="primary" class="float-end ml-1" @click="send">
          Send&nbsp;
          <v-icon
            v-if="sending"
            icon="sync"
            class="fa-spin"
            title="Sending..."
          />
          <v-icon v-else icon="angle-double-right" title="Send" />
        </b-button>
        <b-button variant="secondary" class="float-end" @click="photoAdd">
          <v-icon icon="camera" />
        </b-button>
      </div>
      <div class="d-flex d-lg-none justify-content-between align-middle">
        <div
          v-if="chat && chat.chattype === 'User2User' && otheruser"
          v-b-tooltip.hover.top
          title="Promise an item to this person"
          class="ml-1 mr-2"
          @click="promise(null)"
        >
          <v-icon scale="2" icon="handshake" class="fa-mob" />
          <div class="mobtext text--smallest">Promise</div>
        </div>
        <div
          v-if="chat && chat.chattype === 'User2User' && otheruser && !simple"
          v-b-tooltip.hover.top
          title="Send your address"
          disabled
          class="mr-2"
          @click="addressBook"
        >
          <v-icon scale="2" icon="address-book" class="fa-mob" />
          <div class="mobtext text--smallest">Address</div>
        </div>
        <div
          v-if="chat && chat.chattype === 'User2Mod' && mod"
          v-b-tooltip.hover.top
          title="Report as spammer"
          class="mr-2"
          @click="spamReport"
        >
          <v-icon scale="2" icon="ban" class="fa-mob" />
          <div class="mobtext text--smallest">Spammer</div>
        </div>
        <div
          v-if="chat && chat.chattype === 'User2Mod' && mod"
          v-b-tooltip.hover.top
          title="Ask on Central for help"
          class="mr-2"
        >
          <external-link
            href="https://discourse.ilovefreegle.org/c/central"
            class="nocolor"
          >
            <v-icon scale="2" icon="question-circle" class="fa-mob" />
          </external-link>
          <div class="mobtext text--smallest">Central</div>
        </div>
        <div
          v-if="
            chat &&
            chat.chattype === 'User2User' &&
            otheruser &&
            !tooSoonToNudge &&
            !simple
          "
          v-b-tooltip.hover.top
          title="Waiting for a reply?  Nudge this freegler."
          class="mr-2"
          @click="nudge"
        >
          <v-icon scale="2" icon="bell" class="fa-mob" />
          <div class="mobtext text--smallest">Nudge</div>
        </div>
        <div
          v-if="
            chat &&
            chat.chattype === 'User2User' &&
            otheruser &&
            tooSoonToNudge &&
            !simple
          "
          v-b-tooltip.hover.top
          title="It's too soon to nudge."
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
      ref="promise"
      :messages="ouroffers"
      :selected-message="likelymsg ? likelymsg : 0"
      :users="otheruser ? [otheruser] : []"
      :selected-user="otheruser ? otheruser.id : null"
    />
    <ProfileModal
      v-if="otheruser"
      :id="otheruser ? otheruser.id : null"
      ref="profile"
    />
    <!--    <AddressModal ref="addressModal" :choose="true" @chosen="sendAddress" TODO />-->
    <ChatRSVPModal v-if="RSVP" :id="id" ref="rsvp" :user="otheruser" />
    <NudgeTooSoonWarningModal ref="nudgetoosoonwarning" @confirm="doNudge" />
    <NudgeWarningModal ref="nudgewarning" @confirm="doNudge" />
    <MicroVolunteering v-if="showMicrovolunteering" />
  </div>
</template>
<script>
import { setupChat } from '../composables/useChat'
import { useMiscStore } from '../stores/misc'
import ExternalLink from './ExternalLink'

// Don't use dynamic imports because it stops us being able to scroll to the bottom after render.
const OurFilePond = () => import('~/components/OurFilePond')
const UserRatings = () => import('~/components/UserRatings')
const PromiseModal = () => import('~/components/PromiseModal')
const ProfileModal = () => import('~/components/ProfileModal')
const NoticeMessage = () => import('~/components/NoticeMessage')
const ChatRSVPModal = () => import('~/components/ChatRSVPModal')
const NudgeWarningModal = () => import('~/components/NudgeWarningModal')
const NudgeTooSoonWarningModal = () =>
  import('~/components/NudgeTooSoonWarningModal')
const MicroVolunteering = () => import('~/components/MicroVolunteering')

export default {
  components: {
    NudgeTooSoonWarningModal,
    NudgeWarningModal,
    ExternalLink,
    UserRatings,
    OurFilePond,
    NoticeMessage,
    PromiseModal,
    ProfileModal,
    ChatRSVPModal,
    MicroVolunteering,
  },
  props: {
    id: { type: Number, required: true },
  },
  async setup(props) {
    const miscStore = useMiscStore()
    const { chat, otheruser, tooSoonToNudge } = await setupChat(props.id)

    return { chat, otheruser, tooSoonToNudge, miscStore }
  },
  data() {
    return {
      sending: false,
      uploading: false,
      showMicrovolunteering: false,
      showNotices: true, // TODO Add timer
    }
  },
  computed: {
    expectedreply() {
      return this.otheruser?.info?.expectedreply
    },
    noticesToShow() {
      return this.badratings || this.expectedreply || this.otheruser?.spammer
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
    enterNewLine() {
      // TODO Store enternewline in settings
      return false
    },
    // TODO MINOR Consider showing handover prompt in less annoying way.
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
</style>
