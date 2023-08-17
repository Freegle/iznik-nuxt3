<template>
  <client-only v-if="me">
    <b-container fluid class="p-0 p-xl-2">
      <h1 class="visually-hidden">My posts</h1>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1">
          <VisibleWhen :at="['lg', 'xl']">
            <SidebarLeft />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
          <ExpectedRepliesWarning
            v-if="me && me.expectedreplies"
            :count="me.expectedreplies"
            :chats="me.expectedchats"
          />
          <div v-if="!me" class="d-flex justify-content-center mt-4 flex-wrap">
            <b-button variant="primary" size="lg" @click="forceLogin">
              Log in to continue <v-icon icon="angle-double-right" />
            </b-button>
          </div>
          <div v-else>
            <VisibleWhen :at="['xs', 'sm', 'md']">
              <JobsTopBar />
            </VisibleWhen>
            <b-card
              class="mt-2"
              border-variant="info"
              header="info"
              header-bg-variant="info"
              header-text-variant="white"
              no-body
            >
              <template #header>
                <div class="d-flex justify-content-between">
                  <h2 class="d-inline header--size3">
                    <v-icon icon="gift" scale="2" /> Your OFFERs
                  </h2>
                  <span v-if="oldOfferCount > 0">
                    <span v-if="showOldOffers">
                      <b-button
                        variant="secondary"
                        title="Show old OFFERs"
                        @click="toggleOldOffers"
                      >
                        Hide {{ oldOfferCountStr }}
                      </b-button>
                    </span>
                    <span v-else>
                      <b-button variant="secondary" @click="toggleOldOffers">
                        +{{ oldOfferCountStr }}
                      </b-button>
                    </span>
                  </span>
                </div>
              </template>
              <b-card-body class="p-1 p-lg-3">
                <b-card-text class="text-center">
                  <p v-if="activeOfferCount > 0" class="text-muted">
                    Stuff you're giving away.
                  </p>
                  <b-img
                    v-if="busyOffers && offers.length === 0"
                    lazy
                    src="/loader.gif"
                    alt="Loading..."
                    width="100px"
                  />
                  <div
                    v-if="
                      busyOffers ||
                      activeOfferCount > 0 ||
                      (showOldOffers && offers.length > 0)
                    "
                  >
                    <div
                      v-for="message in offersShown"
                      :key="'message-' + message.id"
                      class="p-0 text-start mt-1"
                    >
                      <MyMessage
                        :id="message.id"
                        :show-old="showOldOffers"
                        :expand="expand"
                      />
                    </div>
                    <InfiniteLoading
                      :key="infiniteIdOffers"
                      :distance="distance"
                      @infinite="loadMoreOffers"
                    />
                  </div>
                  <div v-else>
                    <b-row>
                      <b-col>
                        <p>You have no active OFFERs.</p>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col class="text-center">
                        <b-button
                          to="/give"
                          class="mt-1"
                          size="lg"
                          variant="primary"
                        >
                          <v-icon icon="gift" />&nbsp;OFFER something
                        </b-button>
                      </b-col>
                    </b-row>
                  </div>
                </b-card-text>
              </b-card-body>
            </b-card>
            <b-card
              class="mt-2"
              border-variant="info"
              header="info"
              header-bg-variant="info"
              header-text-variant="white"
              no-body
            >
              <template #header>
                <div class="d-flex justify-content-between">
                  <h2 class="d-inline header--size3">
                    <v-icon icon="shopping-cart" scale="2" /> Your WANTEDs
                  </h2>
                  <span v-if="oldWantedCount > 0">
                    <span v-if="showOldWanteds">
                      <b-button
                        variant="secondary"
                        title="Show old WANTEDs"
                        @click="toggleOldWanteds"
                      >
                        Hide {{ oldWantedCountStr }}
                      </b-button>
                    </span>
                    <span v-else>
                      <b-button variant="secondary" @click="toggleOldWanteds">
                        +{{ oldWantedCountStr }}
                      </b-button>
                    </span>
                  </span>
                </div>
              </template>
              <b-card-body class="p-1 p-lg-3">
                <b-card-text class="text-center">
                  <p v-if="activeWantedCount > 0" class="text-muted">
                    Stuff you're trying to find.
                  </p>
                  <div
                    v-if="
                      busyWanteds ||
                      activeWantedCount > 0 ||
                      (showOldWanteds && wanteds.length > 0)
                    "
                  >
                    <div
                      v-for="message in wantedsShown"
                      :key="'message-' + message.id"
                      class="p-0 text-start mt-1"
                    >
                      <MyMessage
                        :id="message.id"
                        :show-old="showOldWanteds"
                        :expand="expand"
                      />
                    </div>
                    <infinite-loading
                      :key="infiniteIdWanteds"
                      :distance="distance"
                      @infinite="loadMoreWanteds"
                    />
                  </div>
                  <div v-else>
                    <p>You have no active WANTEDs.</p>
                    <div class="d-flex justify-content-around mb-2">
                      <b-button
                        to="/find"
                        class="mt-1"
                        size="lg"
                        variant="secondary"
                      >
                        <v-icon icon="shopping-cart" />&nbsp;Ask for something
                      </b-button>
                    </div>
                  </div>
                </b-card-text>
              </b-card-body>
            </b-card>
            <b-card
              class="mt-2"
              border-variant="info"
              header="info"
              header-bg-variant="info"
              header-text-variant="white"
              no-body
            >
              <template #header>
                <h2 class="d-inline header--size3">
                  <v-icon icon="search" scale="2" /> Your Searches
                </h2>
              </template>
              <b-card-body class="p-1 p-lg-3">
                <b-card-text class="text-center">
                  <p v-if="searches?.length > 0" class="text-muted">
                    What you've recently searched for - click to search again.
                    These are also email alerts - we'll mail you matching posts.
                  </p>
                  <ul
                    v-if="searches?.length"
                    class="list-group list-group-horizontal flex-wrap"
                  >
                    <UserSearch
                      v-for="search in searches"
                      :key="'search-' + search.id"
                      :search="search"
                      class="text-start mt-1 list-group-item bg-white border text-nowrap mr-2"
                    />
                  </ul>
                  <div v-else>
                    <p>Nothing here yet. Why not...</p>
                    <b-button
                      to="/find"
                      class="mt-1"
                      size="lg"
                      variant="secondary"
                    >
                      <v-icon icon="shopping-cart" />&nbsp;Ask for stuff
                    </b-button>
                  </div>
                </b-card-text>
              </b-card-body>
            </b-card>
          </div>
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1">
          <VisibleWhen :at="['lg', 'xl']">
            <SidebarRight show-job-opportunities />
          </VisibleWhen>
        </b-col>
      </b-row>
      <DonationAskModal ref="askmodal" :groupid="donationGroup" />
    </b-container>
  </client-only>
</template>

<script setup>
import { useRoute } from 'vue-router'
import pluralize from 'pluralize'
import dayjs from 'dayjs'
import { useAuthStore } from '../stores/auth'
import { useMessageStore } from '../stores/message'
import { useMiscStore } from '../stores/misc'
import { useSearchStore } from '../stores/search'
import { buildHead } from '~/composables/useBuildHead'

import VisibleWhen from '~/components/VisibleWhen'
import InfiniteLoading from '~/components/InfiniteLoading'
import SidebarLeft from '~/components/SidebarLeft'
import SidebarRight from '~/components/SidebarRight'
import ExpectedRepliesWarning from '~/components/ExpectedRepliesWarning'
import JobsTopBar from '~/components/JobsTopBar'
import MyMessage from '~/components/MyMessage.vue'
import UserSearch from '~/components/UserSearch.vue'
import DonationAskModal from '~/components/DonationAskModal'

const authStore = useAuthStore()
const messageStore = useMessageStore()
const miscStore = useMiscStore()
const searchStore = useSearchStore()

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

definePageMeta({
  layout: 'login',
})

useHead(
  buildHead(
    route,
    runtimeConfig,
    'My Posts',
    "See OFFERs/WANTEDs that you've posted, and replies to them.",
    null,
    {
      class: 'overflow-y-scroll',
    }
  )
)

// save this page as the favorite one, so that the user is automatically redirected here the next time they load the app
const existingHomepage = miscStore.get('lasthomepage')

if (existingHomepage !== 'myposts') {
  miscStore.set({
    key: 'lasthomepage',
    value: 'myposts',
  })
}

const askmodal = ref()

const myid = authStore.user?.id

let messages = []
let expand = false

if (myid) {
  messages = await messageStore.fetchByUser(myid, false, true)
  expand = messages.length <= 5

  // No need to wait for searches - often below the fold.
  searchStore.fetch(myid)
}

const { $bus } = useNuxtApp()
onMounted(() => {
  const lastAsk = miscStore.get('lastdonationask')
  let canAsk =
    !lastAsk || new Date().getTime() - lastAsk > 60 * 60 * 1000 * 24 * 7

  // Donation ask on Browse page is only used when we have a specific push.
  canAsk = false

  if (canAsk) {
    ask()

    miscStore.set({
      key: 'lastdonationask',
      value: new Date().getTime(),
    })
  }

  $bus.$on('outcome', (params) => {
    const { groupid, outcome } = params

    if (outcome === 'Taken' || outcome === 'Received') {
      // If someone has set up a regular donation, then we don't ask them to donate again.  Wouldn't be fair to
      // pester them.

      if (!me?.donorrecurring && canAsk) {
        donationGroup.value = groupid
        ask()

        miscStore.set({
          key: 'lastdonationask',
          value: new Date().getTime(),
        })
      }
    }
  })
})

const distance = ref(1000)

const busyOffers = ref(true)
const showOldOffers = ref(false)

const offers = computed(() => {
  return (
    messages
      ?.filter(
        (message) =>
          message.type === 'Offer' &&
          (showOldOffers.value || !message.hasoutcome)
      )
      .sort(sortPosts) ?? []
  )
})

const infiniteIdOffers = ref(1)
watch(offers, () => infiniteIdOffers.value++)

const oldOfferCount = computed(() => {
  return messages.filter(
    (message) => message.type === 'Offer' && message.hasoutcome
  ).length
})

const oldOfferCountStr = computed(() => {
  return pluralize('old OFFER', oldOfferCount.value, true)
})

const activeOfferCount = computed(() => {
  return messages.filter(
    (message) => message.type === 'Offer' && !message.hasoutcome
  ).length
})

const offersToShow = ref(0)

const offersShown = computed(() => {
  return offers.value.slice(0, offersToShow.value)
})

async function loadMoreOffers($state) {
  offersToShow.value++

  if (offersToShow.value > offers.value.length) {
    offersToShow.value = offers.value.length
    busyOffers.value = false
    $state.complete()
  } else {
    await messageStore.fetch(offers.value[offersToShow.value - 1].id)
    $state.loaded()
  }
}

function toggleOldOffers() {
  showOldOffers.value = !showOldOffers.value
}

const busyWanteds = ref(true)
const showOldWanteds = ref(false)

const wanteds = computed(() => {
  return (
    messages
      ?.filter(
        (message) =>
          message.type === 'Wanted' &&
          (showOldOffers.value || !message.hasoutcome)
      )
      .sort(sortPosts) ?? []
  )
})

const infiniteIdWanteds = ref(1)
watch(wanteds, () => infiniteIdWanteds.value++)

const oldWantedCount = computed(() => {
  return messages.filter(
    (message) => message.type === 'Wanted' && message.hasoutcome
  ).length
})

const oldWantedCountStr = computed(() => {
  return pluralize('old WANTED', oldWantedCount.value, true)
})

const activeWantedCount = computed(() => {
  return messages.filter(
    (message) => message.type === 'Wanted' && !message.hasoutcome
  ).length
})

const wantedsToShow = ref(1)

const wantedsShown = computed(() => {
  return wanteds.value.slice(0, wantedsToShow.value)
})

async function loadMoreWanteds($state) {
  wantedsToShow.value++

  if (wantedsToShow.value > wanteds.value.length) {
    wantedsToShow.value = wanteds.value.length
    busyWanteds.value = false
    $state.complete()
  } else {
    await messageStore.fetch(wanteds.value[wantedsToShow.value - 1].id)
    $state.loaded()
  }
}

function toggleOldWanteds() {
  showOldWanteds.value = !showOldWanteds.value
}

function sortPosts(a, b) {
  // Show promised items first, then by most recently posted.

  const showOld =
    a.type === 'Offer' ? showOldOffers.value : showOldWanteds.value

  if (!showOld && a.promised && !b.promised) {
    return -1
  } else if (!showOld && b.promised && !a.promised) {
    return 1
  } else {
    return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
  }
}

const searches = computed(() => {
  // Show the searches within the last 90 days, most recent first. Anything older is less likely to be relevant
  // and it stops it growing forever, forcing them to delete things.

  let ret = searchStore?.list

  if (ret) {
    const now = dayjs()
    ret = ret.filter((a) => {
      const daysago = now.diff(dayjs(a.date), 'day')
      return daysago <= 90
    })
    ret.sort((a, b) => a.daysago - b.daysago)
  }

  return ret
})

const donationGroup = ref(null)

async function ask(groupid) {
  await waitForRef('askmodal')
  askmodal.value.show('video')
}

function forceLogin() {
  authStore.forceLogin = true
}
</script>
