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
        <SupporterInfoModal
          v-if="showSupporterInfo"
          ref="supporterInfoModal"
          @hidden="showSupporterInfo = false"
        />
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
        <notice-message v-if="user.expectedreplies" variant="warning">
          <v-icon icon="exclamation-triangle" />&nbsp;{{ expectedreplies }}
          still waiting for them to reply on here.
        </notice-message>
        <template #header>
          <v-icon icon="info-circle" /> About this freegler
        </template>
        <b-card-body sub-title="" class="p-0 pt-1">
          <p v-if="publicLocation">
            <v-icon icon="map-marker-alt" class="fa-fw" />&nbsp;
            <span v-if="publicLocation">
              <span v-if="publicLocation.location">
                {{ publicLocation.location
                }}<span v-if="milesaway">, {{ milesaway }} away.</span>
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
              :jobs="false"
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
              :jobs="false"
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
<script setup>
import pluralize from 'pluralize'
import { ref, computed, defineAsyncComponent } from 'vue'
import { useUserStore } from '~/stores/user'
import { milesAway } from '~/composables/useDistance'
import { useMessageStore } from '~/stores/message'
import NoticeMessage from '~/components/NoticeMessage'
import { twem } from '~/composables/useTwem'
import { useAuthStore } from '~/stores/auth'

import ReplyTime from '~/components/ReplyTime'
import ProfileHeader from '~/components/ProfileHeader'
const MessageList = defineAsyncComponent(() =>
  import('~/components/MessageList.vue')
)
const SupporterInfoModal = defineAsyncComponent(() =>
  import('~/components/SupporterInfoModal.vue')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  header: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const userStore = useUserStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const me = authStore.user

const invalidUser = ref(false)
const showSupporterInfo = ref(false)
const supporterInfoModal = ref(null)

// Get active messages
const messages = await messageStore.fetchByUser(props.id, true, true)

// Load them into store.
messages.forEach((message) => {
  messageStore.fetch(message.id)
})

// Get public location.
await userStore.fetchPublicLocation(props.id)

const user = computed(() => {
  return props.id ? userStore?.byId(props.id) : null
})

const publicLocation = computed(() => {
  return props.id ? userStore?.publicLocationById(props.id) : null
})

function active(type) {
  const ret = []

  for (const message of messages) {
    if (message.type === type && !message.successful) {
      ret.push(message)
    }
  }

  return ret
}

const activeOffers = computed(() => {
  return active('Offer')
})

const activeWanteds = computed(() => {
  return active('Wanted')
})

const aboutme = computed(() => {
  return user.value?.aboutme ? twem(user.value.aboutme.text) : null
})

const expectedreplies = computed(() => {
  pluralize.addIrregularRule('freegler is', 'freeglers are')
  return pluralize('freegler is', user.value?.expectedreplies, true)
})

const milesaway = computed(() => {
  const milesfrome =
    user.value?.info?.milesaway ??
    milesAway(me?.lat, me?.lng, user.value?.lat, user.value?.lng)
  if (milesfrome == null) return ''
  return pluralize('mile', milesfrome, true)
})

const activeOFFERCount = computed(() => {
  return pluralize('active OFFER', activeOffers.value.length, true)
})

const activeWANTEDCount = computed(() => {
  return pluralize('active WANTED', activeWanteds.value.length, true)
})

const recentOFFERCount = computed(() => {
  return pluralize('OFFER', user.value?.info?.offers, true)
})

const recentWANTEDCount = computed(() => {
  return pluralize('WANTED', user.value?.info?.wanteds, true)
})

const recentReplyCount = computed(() => {
  return pluralize('reply', user.value?.info?.replies, true)
})

const recentCollectedCount = computed(() => {
  return pluralize('item', user.value?.info?.collected, true)
})

function supporterInfo() {
  showSupporterInfo.value = true
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
