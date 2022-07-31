<template>
  <div class="pb-1 clearfix">
    <div v-if="chatmessage.userid != myid" class="media">
      <div v-if="!refmsg">
        This chat message refers to a post which has been deleted.
      </div>
      <b-card v-else border-variant="success" class="ml-2">
        <b-card-title>
          <nuxt-link
            :to="
              (messageIsFromCurrentUser ? '/myposts/' : '/message/') + refmsgid
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
            :image="otheruser.profile.turl"
            class="mr-1 mb-1 mt-1 inline"
            is-thumbnail
            size="sm"
          />
          <span class="small black">Good news! You've been promised this:</span>
          <br />
          <nuxt-link
            :to="
              (messageIsFromCurrentUser ? '/myposts/' : '/message/') + refmsgid
            "
          >
            <h4>
              {{ refmsg?.subject }}
            </h4>
          </nuxt-link>
          <AddToCalendar v-if="tryst" :ics="tryst.ics" class="mr-2" />
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
            :to="
              (messageIsFromCurrentUser ? '/myposts/' : '/message/') + refmsgid
            "
          >
            <b-img
              v-if="
                refmsg && refmsg.attachments && refmsg.attachments.length > 0
              "
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
          <ProfileImage
            :image="me.profile.turl"
            class="mr-1 mb-1 mt-1 inline"
            is-thumbnail
            size="sm"
          />
          <span class="small black"
            >You promised <strong>{{ otheruser.displayname }}</strong
            >:</span
          >
          <br />
          <nuxt-link
            :to="
              (messageIsFromCurrentUser ? '/myposts/' : '/message/') + refmsgid
            "
          >
            <h4>
              {{ refmsg?.subject }}
            </h4>
          </nuxt-link>
          <p v-if="trystdate" class="small text-info">
            Handover arranged for <strong>{{ trystdate }}</strong>
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
            ref="promise"
            :messages="[refmsg]"
            :selected-message="refmsgid"
            :users="otheruser ? [otheruser] : []"
            :selected-user="otheruser ? otheruser.id : null"
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
      ref="renege"
      :messages="[refmsgid]"
      :selected-message="refmsgid"
      :users="[otheruser]"
      :selected-user="otheruser.id"
      @hide="fetchMessages"
    />
    <OutcomeModal
      v-if="showOutcome && refmsgid"
      :id="refmsgid"
      ref="outcomeModal"
      :taken-by="takenBy"
      @outcome="fetchMessage"
    />
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { useTrystStore } from '../stores/tryst'
import { fetchOurOffers } from '../composables/useThrottle'
import { useChatStore } from '../stores/chat'
import { fetchReferencedMessage } from '../composables/useChat'
import OutcomeModal from '@/components/OutcomeModal'
import AddToCalendar from '~/components/AddToCalendar'
import ChatBase from '~/components/ChatBase'
import ProfileImage from '~/components/ProfileImage'

const RenegeModal = () => import('./RenegeModal')
const PromiseModal = () => import('~/components/PromiseModal')

export default {
  components: {
    OutcomeModal,
    AddToCalendar,
    ProfileImage,
    RenegeModal,
    PromiseModal,
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
      showPromise: false,
    }
  },
  computed: {
    tryst() {
      return this.otheruser
        ? this.trystStore.getByUser(this.otheruser.id)
        : null
    },
    trystdate() {
      return this.tryst
        ? dayjs(this.tryst.arrangedfor).format('dddd Do HH:mm a')
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
      this.waitForRef('renege', () => {
        this.$refs.renege.show()
        fetchOurOffers()
      })
    },
    changeTime() {
      this.showPromise = true

      this.waitForRef('promise', () => {
        this.$refs.promise.show()
      })
    },
    fetchMessages() {
      this.chatStore.fetchMessages(this.chatmessage.chatid)
    },
    async outcome(type) {
      // TODO Outcomes.
      await this.$store.dispatch('messages/fetch', {
        id: this.refmsgid,
      })

      this.showOutcome = true
      this.waitForRef('outcomeModal', () => {
        this.$refs.outcomeModal.show(type)
      })
    },
  },
}
</script>
<style scoped lang="scss">
.unpromise__slash {
  transform: rotate(180deg);
  color: $color-red;
}
</style>
