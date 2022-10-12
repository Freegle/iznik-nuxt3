<template>
  <b-container fluid>
    <h1 class="sr-only">My posts</h1>
    <b-row class="m-0">
      <b-col cols="0" lg="3" class="p-0 pr-1">
        <VisibleWhen :at="['lg', 'xl']">
          <SidebarLeft
            v-if="me && !justPosted"
            :show-community-events="true"
            :show-bot-left="true"
          />
        </VisibleWhen>
      </b-col>
      <b-col cols="12" lg="6" class="p-0">
        <ExpectedRepliesWarning
          v-if="me && me.expectedreplies"
          :count="me.expectedreplies"
          :chats="me.expectedchats"
        />
        <div v-if="justPosted && justPosted.length">
          <JustPosted
            :ids="justPosted"
            :newuser="newuser"
            :newpassword="newpassword"
          />
        </div>
        <div v-if="!me" class="d-flex justify-content-center mt-4 flex-wrap">
          <b-button variant="primary" size="lg" @click="forceLogin">
            Log in to continue <v-icon icon="angle-double-right" />
          </b-button>
        </div>
        <div v-else>
          <VisibleWhen :at="['xs', 'sm', 'md']">
            <JobsTopBar v-if="!justPosted" />
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
                  v-if="busy && offers.length === 0"
                  lazy
                  src="~/static/loader.gif"
                  alt="Loading..."
                />
                <div
                  v-if="
                    busy ||
                    activeOfferCount > 0 ||
                    (showOldOffers && offers.length > 0)
                  "
                >
                  <div
                    v-for="message in offers"
                    :key="'message-' + message.id"
                    class="p-0 text-left mt-1"
                  >
                    <MyMessage
                      :id="message.id"
                      :show-old="showOldOffers"
                      :expand="expand"
                    />
                  </div>
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
                    busy ||
                    activeWantedCount > 0 ||
                    (showOldWanteds && wanteds.length > 0)
                  "
                >
                  <div
                    v-for="message in wanteds"
                    :key="'message-' + message.id"
                    class="p-0 text-left mt-1"
                  >
                    <MyMessage
                      :id="message.id"
                      :show-old="showOldWanteds"
                      :expand="expand"
                    />
                  </div>
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
            v-if="!simple"
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
                <p v-if="searches.length > 0" class="text-muted">
                  What you've recently searched for - click to search again.
                  These are also email alerts - we'll mail you matching posts.
                </p>
                <ul
                  v-if="busy || (searches && Object.keys(searches).length > 0)"
                  class="list-group list-group-horizontal flex-wrap"
                >
                  <li
                    v-for="search in searches"
                    :key="'search-' + search.id"
                    class="text-left mt-1 list-group-item bg-white border text-nowrap mr-2"
                  >
                    <b-button
                      :to="'/browse/' + search.term"
                      variant="white d-inline"
                    >
                      <v-icon icon="search" /> {{ search.term }}
                      <span class="text-muted small">{{
                        searchAgo(search.daysago)
                      }}</span>
                    </b-button>
                    <span
                      class="ml-3 d-inline clickme"
                      @click="deleteSearch(search.id)"
                    >
                      <v-icon
                        v-if="removingSearch === search.id"
                        icon="sync"
                        class="text-success fa-spin"
                      />
                      <v-icon
                        v-else-if="removedSearch === search.id"
                        icon="check"
                        class="text-success"
                      />
                      <v-icon
                        v-else
                        icon="trash-alt"
                        title="Delete this search"
                      />
                    </span>
                  </li>
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
          <sidebar-right
            v-if="me && !justPosted"
            show-volunteer-opportunities
            show-job-opportunities
          />
        </VisibleWhen>
      </b-col>
    </b-row>
    <!--    TODO Donations-->
    <!--    <DonationAskModal ref="askmodal" :groupid="donationGroup" />-->
  </b-container>
</template>
<script>
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import pluralize from 'pluralize'
import { MESSAGE_EXPIRE_TIME, GROUP_REPOSTS } from '../constants'
import InviteContacts from '../components/InviteContacts'
import VisibleWhen from '../components/VisibleWhen'
import { useGroupStore } from '../stores/group'
import { useAuthStore } from '../stores/auth'
import { useMessageStore } from '../stores/message'
import { useMiscStore } from '../stores/misc'
import { useComposeStore } from '../stores/compose'
import { buildHead } from '~/composables/useBuildHead'
const JustPosted = () => import('~/components/JustPosted')
const JobsTopBar = () => import('~/components/JobsTopBar')
const MyMessage = () => import('~/components/MyMessage.vue')
const SidebarLeft = () => import('~/components/SidebarLeft')
const SidebarRight = () => import('~/components/SidebarRight')
// TODO Donations
// const DonationAskModal = () => import('~/components/DonationAskModal')
const ExpectedRepliesWarning = () =>
  import('~/components/ExpectedRepliesWarning')

export default {
  components: {
    VisibleWhen,
    InviteContacts,
    JustPosted,
    JobsTopBar,
    MyMessage,
    SidebarLeft,
    SidebarRight,
    // DonationAskModal,
    ExpectedRepliesWarning,
  },
  mixins: [buildHead],
  async setup() {
    const authStore = useAuthStore()
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()
    const miscStore = useMiscStore()
    const composeStore = useComposeStore()

    useHead(
      buildHead(
        'My Posts',
        "See OFFERs/WANTEDs that you've posted, and replies to them."
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
    const justPosted = route.params.justPosted
    const newuser = route.params.newuser
    const newpassword = route.params.newpassword

    const myid = authStore.user?.id
    const messages = await messageStore.fetchByUser(myid, false)

    async function hasExpired(message) {
      // Consider whether the message has expired.  It's lighter load on the server to do this here rather than
      // when querying.
      let expired = false

      const group = await groupStore.fetch(message.groupid)

      const daysago = dayjs().diff(dayjs(message.arrival), 'day')
      const maxagetoshow = group.settings.maxagetoshow
        ? group.settings.maxagetoshow
        : MESSAGE_EXPIRE_TIME
      const reposts = group.settings.reposts
        ? group.settings.reposts
        : GROUP_REPOSTS
      const repost = message.type === 'Offer' ? reposts.offer : reposts.wanted
      const maxreposts = repost * (reposts.max + 1)
      const expiretime = Math.max(maxreposts, maxagetoshow)
      expired = daysago > expiretime

      if (!expired) {
        console.log('Not expired', message, group.settings, daysago, expiretime)
      }

      return expired
    }

    for (const message of messages) {
      if (!message.hasoutcome) {
        const expired = await hasExpired(message)

        if (expired) {
          message.hasoutcome = true
        }
      }
    }

    const expand = messages.length <= 5

    return {
      authStore,
      groupStore,
      messageStore,
      miscStore,
      composeStore,
      justPosted,
      newuser,
      newpassword,
      messages,
      expand,
    }
  },
  data() {
    return {
      id: null,
      busy: true,
      context: null,
      showOldOffers: false,
      showOldWanteds: false,
      removingSearch: null,
      removedSearch: null,
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
      // TODO searches
      // Show the searches within the last 90 days, most recent first.  Anything older is less likely to be relevant
      // and it stops it growing forever, forcing them to delete things.
      // let ret = Object.values(this.$store.getters['searches/list'])
      // ret = ret.filter((a) => a.daysago <= 90)
      // ret.sort((a, b) => a.daysago - b.daysago)
      //
      // return ret
      return []
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

    // For some reason we can't capture emitted events from the outcome modal so use root as a bus.
    // TODO Donations
    // this.$root.$on('outcome', (params) => {
    //   const { groupid, outcome } = params
    //
    //   if (outcome === 'Taken' || outcome === 'Received') {
    //     // If someone has set up a regular donation, then we don't ask them to donate again.  Wouldn't be fair to
    //     // pester them.
    //     if (!this.me.donorrecurring && canask) {
    //       this.donationGroup = groupid
    //       this.ask()
    //
    //       this.$store.dispatch('misc/set', {
    //         key: 'lastdonationask',
    //         value: new Date().getTime(),
    //       })
    //     }
    //   }
    // })
  },
  methods: {
    toggleOldOffer() {
      this.showOldOffers = !this.showOldOffers
    },
    toggleOldWanted() {
      this.showOldWanteds = !this.showOldWanteds
    },
    async deleteSearch(id) {
      this.removingSearch = id

      setTimeout(() => {
        this.me.phone = null
      }, 1000)

      await this.$store.dispatch('searches/delete', {
        id,
      })

      this.removingSearch = null
      this.removedSearch = id
      setTimeout(() => {
        this.removedSearch = null
      }, 2000)
    },
    ask(groupid) {
      this.waitForRef('askmodal', () => {
        this.$refs.askmodal.show()
      })
    },
    postSort(a, b) {
      // Show promised items first, then by most recent activity.

      if (a.promised && !b.promised) {
        return -1
      } else if (b.promised && !a.promised) {
        return 1
      } else {
        let adate = null
        let bdate = null
        if (a.lastdate && b.lastdate) {
          adate = a.lastdate
          bdate = b.lastdate
        } else if (a.groups && a.groups.length && b.groups && b.groups.length) {
          adate = a.groups[0].arrival
          bdate = b.groups[0].arrival
        } else {
          adate = a.arrival
          bdate = b.arrival
        }

        return new Date(bdate).getTime() - new Date(adate).getTime()
      }
    },
    forceLogin() {
      this.authStore.forceLogin = true
    },
    searchAgo() {
      return pluralize('day', this.oldWantdCount, true) + ' ago'
    },
  },
}
</script>
