<template>
  <b-container fluid>
    <h1 class="sr-only">My posts</h1>
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
          <b-card v-if="contactPicker" border-variant="info">
            <InviteContacts class="bg-white" />
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
                  <v-icon icon="gift" scale="2" /> Your OFFERs
                </h2>
                <span v-if="oldOfferCount > 0">
                  <span v-if="showOldOffers" class="float-right">
                    <b-button
                      variant="secondary"
                      title="Show old OFFERs"
                      @click="toggleOldOffer"
                    >
                      Hide {{ oldOfferCountStr }}
                    </b-button>
                  </span>
                  <span v-else class="float-right">
                    <b-button variant="secondary" @click="toggleOldOffer">
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
                  src="~/static/loader.gif"
                  alt="Loading..."
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
                    class="p-0 text-left mt-1"
                  >
                    <MyMessage
                      :id="message.id"
                      :show-old="showOldOffers"
                      :expand="expand"
                    />
                  </div>
                  <infinite-loading
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
                  <span v-if="showOldWanteds" class="float-right">
                    <b-button
                      variant="secondary"
                      title="Show old WANTEDs"
                      @click="toggleOldWanted"
                    >
                      Hide {{ oldWantedCountStr }}
                    </b-button>
                  </span>
                  <span v-else class="float-right">
                    <b-button variant="secondary" @click="toggleOldWanted">
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
                    class="p-0 text-left mt-1"
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
                    class="text-left mt-1 list-group-item bg-white border text-nowrap mr-2"
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
</template>
<script>
import { useRoute } from 'vue-router'
import pluralize from 'pluralize'
import dayjs from 'dayjs'
import InviteContacts from '../components/InviteContacts'
import VisibleWhen from '../components/VisibleWhen'
import { useGroupStore } from '../stores/group'
import { useAuthStore } from '../stores/auth'
import { useMessageStore } from '../stores/message'
import { useMiscStore } from '../stores/misc'
import { useComposeStore } from '../stores/compose'
import { useSearchStore } from '../stores/search'
import { buildHead } from '~/composables/useBuildHead'
import InfiniteLoading from '~/components/InfiniteLoading'
const JobsTopBar = () => import('~/components/JobsTopBar')
const MyMessage = () => import('~/components/MyMessage.vue')
const SidebarLeft = () => import('~/components/SidebarLeft')
const SidebarRight = () => import('~/components/SidebarRight')
const DonationAskModal = () => import('~/components/DonationAskModal')
const ExpectedRepliesWarning = () =>
  import('~/components/ExpectedRepliesWarning')

export default {
  components: {
    VisibleWhen,
    InviteContacts,
    JobsTopBar,
    MyMessage,
    SidebarLeft,
    SidebarRight,
    DonationAskModal,
    ExpectedRepliesWarning,
    InfiniteLoading,
  },
  mixins: [buildHead],
  async setup() {
    const authStore = useAuthStore()
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()
    const miscStore = useMiscStore()
    const composeStore = useComposeStore()
    const searchStore = useSearchStore()

    useHead(
      buildHead(
        'My Posts',
        "See OFFERs/WANTEDs that you've posted, and replies to them.",
        null,
        {
          class: 'overflow-y-scroll',
        }
      )
    )

    // We want this to be our next home page.
    const existingHomepage = miscStore.get('lasthomepage')

    if (existingHomepage !== 'myposts') {
      miscStore.set({
        key: 'lasthomepage',
        value: 'myposts',
      })
    }

    // We might have parameters from just having posted.
    const route = useRoute()
    const newuser = route.params.newuser
    const newpassword = route.params.newpassword

    const myid = authStore.user?.id

    let messages = []
    let expand = false

    if (myid) {
      messages = await messageStore.fetchByUser(myid, false)
      expand = messages.length <= 5

      // No need to wait for searches - often below the fold.
      searchStore.fetch(myid)
    }

    return {
      authStore,
      groupStore,
      messageStore,
      miscStore,
      composeStore,
      searchStore,
      newuser,
      newpassword,
      messages,
      expand,
    }
  },
  data() {
    return {
      id: null,
      busyOffers: true,
      busyWanteds: true,
      context: null,
      showOldOffers: false,
      showOldWanteds: false,
      offersToShow: 0,
      wantedsToShow: 0,
      infiniteIdOffers: 1,
      infiniteIdWanteds: 1,
      distance: 1000,
      donationGroup: null,
    }
  },
  computed: {
    postcode() {
      return this.composeStore.postcode
    },
    wanteds() {
      const ret = this.messages.filter(
        (m) => m.type === 'Wanted' && (this.showOldWanteds || !m.hasoutcome)
      )
      ret.sort(this.postSort)
      return ret
    },
    offers() {
      const ret = this.messages.filter(
        (m) => m.type === 'Offer' && (this.showOldOffers || !m.hasoutcome)
      )
      ret.sort(this.postSort)
      return ret
    },
    offersShown() {
      return this.offers.slice(0, this.offersToShow)
    },
    wantedsShown() {
      return this.wanteds.slice(0, this.wantedsToShow)
    },
    oldOfferCount() {
      let count = 0

      if (this.messages) {
        for (const message of this.messages) {
          if (message.type === 'Offer' && message.hasoutcome) {
            count++
          }
        }
      }

      return count
    },
    oldOfferCountStr() {
      return pluralize('old OFFER', this.oldOfferCount, true)
    },
    oldWantedCount() {
      let count = 0

      if (this.messages) {
        for (const message of this.messages) {
          if (message.type === 'Wanted' && message.hasoutcome) {
            count++
          }
        }
      }

      return count
    },
    oldWantedCountStr() {
      return pluralize('old WANTED', this.oldWantedCount, true)
    },
    activeOfferCount() {
      let count = 0

      for (const message of this.messages) {
        if (message.type === 'Offer' && !message.hasoutcome) {
          count++
        }
      }

      return count
    },
    activeWantedCount() {
      let count = 0

      for (const message of this.messages) {
        if (message.type === 'Wanted' && !message.hasoutcome) {
          count++
        }
      }

      return count
    },
    searches() {
      // Show the searches within the last 90 days, most recent first.  Anything older is less likely to be relevant
      // and it stops it growing forever, forcing them to delete things.
      let ret = this.searchStore.list
      const now = dayjs()
      ret = ret.filter((a) => {
        const daysago = now.diff(dayjs(a.date), 'day')
        return daysago <= 90
      })
      ret.sort((a, b) => a.daysago - b.daysago)

      return ret
    },
    contactPicker() {
      if (process.server) {
        return false
      } else {
        const ret =
          'contacts' in window.navigator && 'ContactsManager' in window
        return ret
      }
    },
  },
  watch: {
    offers() {
      this.infiniteIdOffers++
    },
    wanteds() {
      this.infiniteIdWanteds++
    },
  },
  mounted() {
    const lastask = this.miscStore.get('lastdonationask')
    let canask =
      !lastask || new Date().getTime() - lastask > 60 * 60 * 1000 * 24 * 7

    // Donation ask on Browse page is only used when we have a specific push.
    canask = false

    if (canask) {
      this.ask()

      this.miscStore.set({
        key: 'lastdonationask',
        value: new Date().getTime(),
      })
    }

    this.$bus.$on('outcome', (params) => {
      const { groupid, outcome } = params

      if (outcome === 'Taken' || outcome === 'Received') {
        // If someone has set up a regular donation, then we don't ask them to donate again.  Wouldn't be fair to
        // pester them.
        if (!this.me.donorrecurring && canask) {
          this.donationGroup = groupid
          this.ask()

          this.$store.dispatch('misc/set', {
            key: 'lastdonationask',
            value: new Date().getTime(),
          })
        }
      }
    })
  },
  methods: {
    toggleOldOffer() {
      this.showOldOffers = !this.showOldOffers
    },
    toggleOldWanted() {
      this.showOldWanteds = !this.showOldWanteds
    },
    async loadMoreOffers($state) {
      this.offersToShow++

      if (this.offersToShow > this.offers.length) {
        this.offersToShow = this.offers.length
        this.busyOffers = false
        $state.complete()
      } else {
        await this.messageStore.fetch(this.offers[this.offersToShow - 1].id)
        $state.loaded()
      }
    },
    async loadMoreWanteds($state) {
      this.wantedsToShow++

      if (this.wantedsToShow > this.wanteds.length) {
        this.wantedsToShow = this.wanteds.length
        this.busyWanteds = false
        $state.complete()
      } else {
        await this.messageStore.fetch(this.wanteds[this.wantedsToShow - 1].id)
        $state.loaded()
      }
    },
    ask(groupid) {
      this.waitForRef('askmodal', () => {
        this.$refs.askmodal.show('video')
      })
    },
    postSort(a, b) {
      // Show promised items first, then by most recently posted.
      const showOld =
        a.type === 'Offer' ? this.showOldOffers : this.showOldWanteds

      if (!showOld && a.promised && !b.promised) {
        return -1
      } else if (!showOld && b.promised && !a.promised) {
        return 1
      } else {
        const adate = a.arrival
        const bdate = b.arrival
        return new Date(bdate).getTime() - new Date(adate).getTime()
      }
    },
    forceLogin() {
      this.authStore.forceLogin = true
    },
  },
}
</script>
