<template>
  <div>
    <div v-if="user">
      <b-card
        v-if="header"
        variant="white"
        border-variant="success"
        class="mt-1"
      >
        <b-card-body sub-title="" class="p-0">
          <profile-header :id="id" class="m-0" />
        </b-card-body>
      </b-card>
      <NoticeMessage
        v-if="user.supporter"
        variant="primary"
        class="supporter d-flex justify-content-between flex-wrap"
      >
        <span class="align-self-center">
          <v-icon icon="heart" /> Very kindly keeps Freegle running with
          donations of time or money.
        </span>
        <b-button
          variant="link"
          class="align-self-center p-0"
          @click="supporterInfo"
        >
          Find out more
        </b-button>
        <SupporterInfoModal v-if="showSupporterInfo" ref="supporterInfoModal" />
      </NoticeMessage>
      <b-card v-if="aboutme" variant="white" class="mt-2">
        <b-card-body sub-title="" class="p-0">
          <div class="mb-1">
            <blockquote class="font-weight-bold">
              &quot;{{ aboutme }}&quot;
            </blockquote>
          </div>
        </b-card-body>
      </b-card>
      <b-card
        border-variant="success"
        header-bg-variant="success"
        header-text-variant="white"
        class="mt-2"
      >
        <notice-message v-if="user.info.expectedreply" variant="warning">
          <v-icon icon="exclamation-triangle" />&nbsp;{{ expectedreplies }}
          still waiting for them to reply on here.
        </notice-message>
        <template #header>
          <v-icon icon="info-circle" /> About this freegler
        </template>
        <b-card-body sub-title="" class="p-0 pt-1">
          <p v-if="publicLocation">
            <v-icon icon="map-marker-alt" class="fa-fw" />
            <span v-if="publicLocation">
              <span v-if="publicLocation.location">
                {{ publicLocation.location }}, {{ milesaway }}
                away.
              </span>
              <span v-else-if="publicLocation.groupname">
                {{ publicLocation.groupname }}
              </span>
              <span v-else> Unknown </span>
            </span>
          </p>
          <ReplyTime :id="id" />
        </b-card-body>
      </b-card>
      <b-card
        border-variant="success"
        header-text-variant="text-success"
        class="mt-2"
        no-body
      >
        <template #header>
          <v-icon icon="gift" />
          {{ activeOFFERCount }}
        </template>
        <b-card-body sub-title="" class="p-0 pt-2 pb-2">
          <div v-if="activeOffers.length" class="p-2">
            <MessageList
              :messages-for-list="activeOffers"
              selected-type="Offer"
            />
          </div>
          <p v-else class="pl-3">None at the moment.</p>
        </b-card-body>
      </b-card>
      <b-card
        border-variant="success"
        header-text-variant="text-info"
        class="mt-2"
        no-body
      >
        <template #header>
          <v-icon icon="search" />
          {{ activeWANTEDCount }}
        </template>
        <b-card-body sub-title="" class="p-0 pt-2 pb-2">
          <div v-if="activeWanteds.length" class="p-2">
            <MessageList
              :messages-for-list="activeWanteds"
              selected-type="Wanted"
            />
          </div>
          <p v-else class="pl-3">None at the moment.</p>
        </b-card-body>
      </b-card>
      <b-card
        border-variant="success"
        header-bg-variant="info"
        header-text-variant="white"
        class="mt-2"
      >
        <template #header>
          <v-icon icon="chart-bar" />
          <span
            v-if="user.info.offers + user.info.wanteds + user.info.replies > 0"
            class="ml-1"
            >Activity in the last 90 days</span
          >
          <span v-else>No recent activity.</span>
        </template>
        <b-card-body sub-title="" class="p-0 pt-1">
          <b-row
            v-if="user.info.offers + user.info.wanteds + user.info.replies > 0"
          >
            <b-col cols="12" md="4">
              <v-icon icon="gift" />
              {{ recentOFFERCount }}
            </b-col>
            <b-col cols="12" md="4">
              <v-icon icon="search" />
              {{ recentWANTEDCount }}
            </b-col>
            <b-col cols="12" md="4">
              <v-icon icon="envelope" />
              {{ recentReplyCount }}
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <span v-if="user.info.collected">
                <v-icon icon="check" /> Picked up about
                {{ recentCollectedCount }}.
              </span>
              <span v-else>
                <v-icon icon="check" class="text-faded" />&nbsp;Not received any
                items recently, so far as we know.
              </span>
            </b-col>
          </b-row>
        </b-card-body>
      </b-card>
    </div>
    <NoticeMessage v-else-if="invalidUser" variant="danger">
      There is no profile for that user - looks like an invalid user id.
    </NoticeMessage>
  </div>
</template>
<script>
import pluralize from 'pluralize'
import { useUserStore } from '../stores/user'
import { milesAway } from '../composables/useDistance'
import { useMessageStore } from '../stores/message'
import SupporterInfoModal from '~/components/SupporterInfoModal'
import NoticeMessage from '~/components/NoticeMessage'
import { twem } from '~/composables/useTwem'

import ReplyTime from '~/components/ReplyTime'
import MessageList from '~/components/MessageList.vue'
import ProfileHeader from '~/components/ProfileHeader'

export default {
  components: {
    SupporterInfoModal,
    NoticeMessage,
    ReplyTime,
    MessageList,
    ProfileHeader,
  },

  props: {
    id: {
      type: Number,
      required: true,
    },
    header: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  async setup(props) {
    const userStore = useUserStore()
    const messageStore = useMessageStore()

    // Get active messages
    const messages = await messageStore.fetchByUser(props.id, true)

    // Load them into store.
    messages.forEach((message) => {
      messageStore.fetch(message.id)
    })

    // Get public location.
    await userStore.fetchPublicLocation(props.id)

    return {
      userStore,
      messageStore,
      messages,
    }
  },
  data() {
    return {
      invalidUser: false,
      showSupporterInfo: false,
    }
  },
  computed: {
    user() {
      return this.id ? this.userStore.byId(this.id) : null
    },
    publicLocation() {
      return this.id ? this.userStore.publicLocationById(this.id) : null
    },
    activeOffers() {
      return this.active('Offer')
    },
    activeWanteds() {
      return this.active('Wanted')
    },
    aboutme() {
      return this.user?.aboutme ? twem(this.user.aboutme.text) : null
    },
    expectedreplies() {
      pluralize.addIrregularRule('freegler is', 'freeglers are')
      return pluralize('freegler is', this.user?.info?.expectedreply, true)
    },
    milesaway() {
      return pluralize(
        'mile',
        milesAway(this.me?.lat, this.me?.lng, this.user?.lat, this.user?.lng),
        true
      )
    },
    activeOFFERCount() {
      return pluralize('active OFFER', this.activeOffers.length, true)
    },
    activeWANTEDCount() {
      return pluralize('active WANTED', this.activeWanteds.length, true)
    },
    recentOFFERCount() {
      return pluralize('OFFER', this.user?.info?.offers, true)
    },
    recentWANTEDCount() {
      return pluralize('WANTED', this.user?.info?.wanteds, true)
    },
    recentReplyCount() {
      return pluralize('reply', this.user?.info?.replies, true)
    },
    recentCollectedCount() {
      return pluralize('item', this.user?.info?.collected, true)
    },
  },
  methods: {
    active(type) {
      const ret = []

      for (const message of this.messages) {
        if (message.type === type && !message.successful) {
          ret.push(message)
        }
      }

      return ret
    },
    supporterInfo() {
      this.showSupporterInfo = true

      this.waitForRef('supporterInfoModal', () => {
        this.$refs.supporterInfoModal.show()
      })
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.covername {
  left: 108px;
  position: absolute;
  width: calc(100% - 105px);
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
}

.supporter {
  background-color: $color-gold;
  color: white;
}
</style>
