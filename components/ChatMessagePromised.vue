<template>
  <div class="clearfix">
    <div v-if="chatmessage.userid != myid" class="media">
      <div v-if="!refmsg">
        This chat message refers to a post which has been deleted.
      </div>
      <b-card v-else border-variant="success" class="ml-2">
        <b-card-title>
          <nuxt-link
            no-prefetch
            :to="
              (messageIsFromCurrentUser ? '/mypost/' : '/message/') + refmsgid
            "
          >
            <b-img
              v-if="refmsg?.attachments?.length > 0"
              class="float-end ml-1"
              rounded
              thumbnail
              generator-unable-to-provide-required-alt=""
              lazy
              :src="refmsg.attachments[0].paththumb"
              width="70px"
              @error="brokenImage"
            />
          </nuxt-link>
          <ProfileImage
            :image="otheruser.profile.paththumb"
            class="mr-1 mb-1 mt-1 inline"
            is-thumbnail
            size="sm"
          />
          <span class="small black">Good news! You've been promised this:</span>
          <br />
          <nuxt-link
            no-prefetch
            :to="
              (messageIsFromCurrentUser ? '/mypost/' : '/message/') + refmsgid
            "
          >
            <h4>
              {{ refmsg?.subject }}
            </h4>
          </nuxt-link>
          <AddToCalendar v-if="tryst" :ics="tryst.ics" class="mr-2" />
          <notice-message
            v-if="refmsg.outcomes?.length || refmsg.deleted"
            class="mt-2 mb-2"
          >
            <v-icon icon="info-circle" />
            <span v-if="refmsg.type === 'Offer'">
              This is no longer available.
            </span>
            <span v-else> They are no longer looking for this. </span>
          </notice-message>
        </b-card-title>
        <b-card-text>
          <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
            <span>
              <span
                v-if="
                  chatmessage.secondsago < 60 ||
                  chatmessage.id > chat.lastmsgseen
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
          </div>
        </b-card-text>
      </b-card>
    </div>
    <div v-else class="media float-end">
      <div v-if="!refmsg">
        This chat message refers to a post which has been deleted.
      </div>
      <b-card v-else border-variant="success">
        <b-card-title>
          <nuxt-link
            no-prefetch
            :to="
              (messageIsFromCurrentUser ? '/mypost/' : '/message/') + refmsgid
            "
          >
            <b-img
              v-if="refmsg && refmsg.attachments?.length > 0"
              class="float-end"
              rounded
              thumbnail
              generator-unable-to-provide-required-alt=""
              lazy
              :src="refmsg.attachments[0].paththumb"
              width="70px"
              @error="brokenImage"
            />
          </nuxt-link>
          <div class="d-flex justify-content-start align-items-center">
            <ProfileImage
              :image="me.profile.path"
              class="mr-1 inline"
              is-thumbnail
              size="sm"
            />
            <div class="small black">
              You promised <strong>{{ otheruser.displayname }}</strong
              >:
            </div>
          </div>
          <nuxt-link
            no-prefetch
            :to="
              (messageIsFromCurrentUser ? '/mypost/' : '/message/') + refmsgid
            "
            class="nodecor"
          >
            <h4>
              {{ refmsg?.subject }}
            </h4>
          </nuxt-link>
          <p v-if="tryst?.arrangedfor" class="small text-info">
            Handover arranged for
            <strong
              ><DateFormatted :value="tryst.arrangedfor" format="weekdaytime"
            /></strong>
          </p>
          <div
            v-if="refmsg"
            class="d-flex mt-1 flex-wrap justify-content-between"
          >
            <template v-if="tryst">
              <AddToCalendar :ics="tryst.ics" class="mr-2 mb-1" />
              <b-button
                v-if="refmsg.promisecount && refmsg.availablenow"
                variant="secondary"
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
              class="align-middle mr-2 mb-1"
              @click="unpromise"
            >
              Unpromise
            </b-button>
            <b-button
              v-if="refmsg.availablenow"
              variant="primary"
              class="mr-1 mb-1"
              @click="outcome('Taken')"
            >
              Mark as TAKEN
            </b-button>
          </div>
          <PromiseModal
            v-if="showPromise"
            :messages="[refmsg]"
            :selected-message="refmsgid"
            :users="otheruser ? [otheruser] : []"
            :selected-user="otheruser ? otheruser.id : null"
            @hidden="showPromise = false"
          />
        </b-card-title>
        <b-card-text>
          <div :class="emessage ? 'media-body chatMessage' : 'media-body'">
            <span>
              <span
                v-if="
                  chatmessage.secondsago < 60 ||
                  chatmessage.id > chat.lastmsgseen
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
          </div>
          <p v-if="!refmsg?.availablenow" class="text-muted">
            This has now been taken.
          </p>
        </b-card-text>
      </b-card>
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
<script>
import { useTrystStore } from '../stores/tryst'
import { fetchOurOffers } from '../composables/useThrottle'
import { useChatStore } from '../stores/chat'
import { fetchReferencedMessage } from '../composables/useChat'
import { useMessageStore } from '../stores/message'
import DateFormatted from './DateFormatted'
import AddToCalendar from '~/components/AddToCalendar'
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'
const OutcomeModal = defineAsyncComponent(() =>
  import('~/components/OutcomeModal')
)

const RenegeModal = defineAsyncComponent(() => import('./RenegeModal'))
const PromiseModal = defineAsyncComponent(() =>
  import('~/components/PromiseModal')
)

export default {
  components: {
    OutcomeModal,
    AddToCalendar,
    ProfileImage,
    RenegeModal,
    PromiseModal,
    DateFormatted,
  },
  extends: ChatBase,
  async setup(props) {
    const trystStore = useTrystStore()
    const chatStore = useChatStore()

    await trystStore.fetch()

    await fetchReferencedMessage(props.chatid, props.id)

    return {
      trystStore,
      chatStore,
    }
  },
  data() {
    return {
      showRenege: false,
      showOutcome: false,
      outcomeType: null,
      showPromise: false,
    }
  },
  computed: {
    tryst() {
      return this.otheruser
        ? this.trystStore?.getByUser(this.otheruser.id)
        : null
    },
    takenBy() {
      let ret = null

      if (this.otheruser) {
        ret = this.otheruser
        ret.userid = this.otheruser.id
        ret.count = 1
      }

      return ret
    },
  },
  methods: {
    unpromise() {
      this.showRenege = true
      fetchOurOffers()
    },
    changeTime() {
      this.showPromise = true
    },
    fetchMessages() {
      this.chatStore.fetchMessages(this.chatmessage.chatid)
    },
    async outcome(type) {
      const messageStore = useMessageStore()
      await messageStore.fetch(this.refmsgid)

      this.showOutcome = true
      this.outcomeType = type
    },
  },
}
</script>
