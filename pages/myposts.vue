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

            <MyPostsPostsList
              v-if="offers"
              type="Offer"
              :posts="offers"
              @load-more="loadMoreOffers"
            />

            <MyPostsPostsList
              v-if="wanteds"
              type="Wanted"
              :posts="wanteds"
              @load-more="loadMoreWanteds"
            />

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
import dayjs from 'dayjs'
import { useAuthStore } from '../stores/auth'
import { useMessageStore } from '../stores/message'
import { useMiscStore } from '../stores/misc'
import { useSearchStore } from '../stores/search'
import { buildHead } from '~/composables/useBuildHead'

import VisibleWhen from '~/components/VisibleWhen'
import SidebarLeft from '~/components/SidebarLeft'
import SidebarRight from '~/components/SidebarRight'
import ExpectedRepliesWarning from '~/components/ExpectedRepliesWarning'
import JobsTopBar from '~/components/JobsTopBar'
import MyPostsPostsList from '~/components/MyPostsPostsList.vue'
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

const messages = ref([])
let expand = false

if (myid) {
  messages.value = await messageStore.fetchByUser(myid, false, true)
  expand = messages.value.length <= 5

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

const offers = computed(() => {
  return messages.value.filter((message) => message.type === 'Offer')
})

async function loadMoreOffers($state) {
  if (offers.value.length - 1 > offers.value.length) {
    // $state.complete()
  } else {
    await messageStore.fetch(offers.value[offers.value.length - 1].id)
    // $state.loaded()
  }
}

const wanteds = computed(() => {
  return messages.value.filter((message) => message.type === 'Wanted')
})

async function loadMoreWanteds($state) {
  if (wanteds.value.length - 1 > wanteds.value.length) {
    // $state.complete()
  } else {
    await messageStore.fetch(wanteds.value[wanteds.value.length - 1].id)
    // $state.loaded()
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
