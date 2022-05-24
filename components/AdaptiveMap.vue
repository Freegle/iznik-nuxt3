<template>
  <div>
    <h2 class="sr-only">Map of offers and wanteds</h2>
    <client-only>
      <!--      TODO-->
      <!--      <div v-if="!loggedIn && showClosest" class="overlapnav w-100">-->
      <!--        <div class="d-flex justify-content-around pl-1 pr-1 w-100">-->
      <!--          <JoinWithConfirm-->
      <!--            :id="closestGroups[0].id"-->
      <!--            :name="closestGroups[0].namedisplay + ' for email alerts'"-->
      <!--            size="lg"-->
      <!--            variant="white"-->
      <!--            class="m-1"-->
      <!--            :class-name="'m-1 text-truncate maxwidth'"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </div>-->
    </client-only>
    <client-only>
      <PostMap
        v-if="postMapInitialBounds"
        :key="'postmap-' + bump"
        :initial-bounds="postMapInitialBounds"
        :height-fraction="heightFraction"
        :bounds.sync="bounds"
        :min-zoom="minZoom"
        :max-zoom="maxZoom"
        :post-zoom="10"
        :force-messages="forceMessages"
        :type="selectedType"
        :search="searchOn"
        :search-on-groups="!mapMoved"
        :show-many="showMany"
        :groupid="selectedGroup"
        :region="region"
        :show-groups.sync="showGroups"
        :moved.sync="mapMoved"
        :zoom.sync="zoom"
        :centre.sync="centre"
        :ready.sync="mapready"
        :loading.sync="loading"
        :can-hide="canHide"
        @searched="selectedGroup = null"
        @messages="messagesChanged($event)"
        @groups="groupsChanged($event)"
      />
    </client-only>
    <div v-if="mapready" class="rest">
      <div v-if="showClosest" class="mb-1 border p-2 bg-white">
        <h2 class="sr-only">Nearby commmunities</h2>
        <div class="d-flex flex-wrap justify-content-center">
          <div v-for="g in closestGroups.slice(0, 3)" :key="'group-' + g.id">
            <!--            TODO-->
            <!--            <JoinWithConfirm-->
            <!--              :id="g.id"-->
            <!--              :name="g.namedisplay"-->
            <!--              size="md"-->
            <!--              variant="primary"-->
            <!--              class="m-1"-->
            <!--            />-->
          </div>
        </div>
      </div>
      <div v-if="showGroups" class="bg-white pt-3">
        <div v-if="showRegions">
          <div class="d-flex flex-wrap justify-content-center pb-4">
            <div v-for="r in regions" :key="r" class="p-0 mt-2 ml-2 mr-2">
              <b-button variant="secondary" :to="'/explore/region/' + r">
                {{ r }}
              </b-button>
            </div>
          </div>
        </div>
        <div v-if="showGroupList">
          <h2 class="sr-only">List of communities</h2>
          <AdaptiveMapGroup
            v-for="groupid in groupids"
            :id="groupid"
            :key="'adaptivegroup-' + groupid"
          />
        </div>
        <p
          class="text-center mt-2 header--size5 text--medium-large-highlight community__text"
        >
          <!-- eslint-disable-next-line -->
          Need help?  Go <nuxt-link to="/help">here</nuxt-link>.
        </p>
        <p
          v-if="showStartMessage"
          class="text-center mt-2 header--size5 text--medium-large-highlight community__text"
        >
          <!-- eslint-disable-next-line -->
          If there's no community for your area, would you like to start one? <ExternalLink href="mailto:newgroups@ilovefreegle.org">Get in touch!</ExternalLink>
        </p>
      </div>
      <div v-else>
        <h2 v-if="group" class="sr-only">Community Information</h2>
        <h2 class="sr-only">Search Filters</h2>
        <div variant="info" class="p-2 border border-info bg-white filters">
          <!--          <GroupSelect-->
          <!--            v-if="me"-->
          <!--            v-model="selectedGroup"-->
          <!--            label="Communities to view"-->
          <!--            label-sr-only-->
          <!--            all-->
          <!--            :all-my="false"-->
          <!--          />-->
          <div v-if="me" />
          <div>
            <label for="typeOptions" class="sr-only"
              >Type of posts to view</label
            >
            <b-form-select
              id="typeOptions"
              v-model="selectedType"
              :options="typeOptions"
              class="shrink"
            />
          </div>
          <div v-if="!me" />
          <div v-if="!me" />
          <div />
          <div role="search" class="search">
            <b-input-group class="shrink mt-1 mt-sm-0">
              <b-form-input
                v-model="search"
                type="text"
                placeholder="Search posts"
                autocomplete="off"
                @keyup.enter.exact="doSearch"
              />
              <b-input-group-append>
                <b-button variant="secondary" title="Search" @click="doSearch">
                  <v-icon icon="search" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
        </div>
        <div
          v-if="messagesOnMap && messagesOnMap.length"
          class="d-flex justify-content-center mt-1 mb-1"
        >
          <NoticeMessage variant="info">
            <v-icon icon="angle-double-down" class="pulsate" />
            Scroll down to see
            <span v-if="searchOn"
              >results for "<strong>{{ searchOn }}</strong
              >"</span
            ><span v-else>the posts</span>.
            <v-icon icon="angle-double-down" class="pulsate" />
          </NoticeMessage>
        </div>
        <GroupHeader v-if="group" :group="group" show-join />
        <!--        TODO Jobs-->
        <!--        <JobsTopBar v-if="jobs" class="d-block d-lg-none" />-->

        <h2 class="sr-only">List of wanteds and offers</h2>
        <div v-if="filteredMessages && filteredMessages.length">
          <div
            v-for="message in filteredMessages"
            :key="'messagelist-' + message.id"
            class="p-0"
          >
            <OurMessage
              :id="message.id"
              record-view
              class="mb-2 mb-sm-3"
              @view="recordView"
            />
          </div>
        </div>
        <client-only>
          <infinite-loading
            v-if="initialBounds"
            :identifier="infiniteId"
            force-use-infinite-wrapper="body"
            :distance="distance"
            @infinite="loadMore"
          >
            <span slot="no-results" />
            <span slot="no-more" />
            <span slot="spinner">
              <b-img-lazy src="~/static/loader.gif" alt="Loading" />
            </span>
          </infinite-loading>
          <NoticeMessage
            v-if="!busy && !loading && searchOn && !filteredMessages.length"
          >
            <p>
              Sorry, we didn't find anything. Things come and go quickly,
              though, so you could try later. Or you could:
            </p>
            <div class="d-flex justify-content-start flex-wrap">
              <b-button to="/give" variant="primary" class="topbutton m-1">
                <v-icon icon="gift" />&nbsp;Post an OFFER
              </b-button>
              <b-button to="/find" variant="primary" class="topbutton m-1">
                <v-icon icon="shopping-cart" />&nbsp;Post a WANTED
              </b-button>
            </div>
          </NoticeMessage>
        </client-only>
      </div>
    </div>
  </div>
</template>
<script>
import { useMiscStore } from '../stores/misc'
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '../stores/message'
import { MAX_MAP_ZOOM } from '~/constants'
// import JoinWithConfirm from '~/components/JoinWithConfirm'
const AdaptiveMapGroup = () => import('./AdaptiveMapGroup')
const ExternalLink = () => import('./ExternalLink')
// const GroupSelect = () => import('./GroupSelect')
const NoticeMessage = () => import('./NoticeMessage')
const OurMessage = () => import('~/components/OurMessage.vue')
const GroupHeader = () => import('~/components/GroupHeader.vue')
// const JobsTopBar = () => import('~/components/JobsTopBar')

export default {
  components: {
    // JoinWithConfirm,
    NoticeMessage,
    GroupHeader,
    // GroupSelect,
    ExternalLink,
    AdaptiveMapGroup,
    OurMessage,
    // JobsTopBar,
  },
  props: {
    initialBounds: {
      type: Array,
      required: true,
    },
    startOnGroups: {
      type: Boolean,
      required: false,
      default: false,
    },
    forceMessages: {
      type: Boolean,
      required: false,
      default: false,
    },
    initialGroupIds: {
      type: Array,
      required: false,
      default() {
        return []
      },
    },
    region: {
      type: String,
      required: false,
      default: null,
    },
    showStartMessage: {
      type: Boolean,
      required: false,
      default: false,
    },
    filterGroup: {
      type: Boolean,
      required: false,
      default: false,
    },
    groupInfo: {
      type: Boolean,
      required: false,
      default: false,
    },
    jobs: {
      type: Boolean,
      required: false,
      default: false,
    },
    minZoom: {
      type: Number,
      required: false,
      default: 5,
    },
    maxZoom: {
      type: Number,
      required: false,
      default: MAX_MAP_ZOOM,
    },
    showMany: {
      type: Boolean,
      required: false,
      default: true,
    },
    canHide: {
      type: Boolean,
      required: false,
      default: false,
    },
    initialSearch: {
      type: String,
      required: false,
      default: null,
    },
    track: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  async setup(props) {
    const miscStore = useMiscStore()
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()

    const postMapInitialBounds = miscStore.get('postmaparea')
      ? miscStore.get('postmaparea')
      : props.initialBounds
    // this.postMapInitialBounds = this.initialBounds

    // if (this.myGroups && this.myGroups.length === 1) {
    //   // TODO We will be showing the single group.
    //   groupStore.fetch(myGroups[0].id)
    // }

    if (props.startOnGroups) {
      // Get the messages in our own groups for the initial view.
      // TODO
    }

    let bounds = null

    // We might have a preference for which type of posts we view.
    const postType = miscStore.get('postType')
    const selectedType = postType || 'All'

    // We want to track views of messages for new members.
    // TODO
    let trackViews = false

    if (props.track) {
      // TODO && this.me
      trackViews = true

      // eslint-disable-next-line no-undef
      try {
        window.__insp.push(['tagSession', { browsepage: 'oldskool' }])
      } catch (e) {
        console.log('Failed to tag inspectlet')
      }
    }

    const showGroups = props.startOnGroups
    const groupids = props.initialGroupIds
    const swlat = props.initialBounds[0][0]
    const swlng = props.initialBounds[0][1]
    const nelat = props.initialBounds[1][0]
    const nelng = props.initialBounds[1][1]
    const search = props.initialSearch
    const searchOn = props.initialSearch

    if (process.client) {
      const L = await import('leaflet/dist/leaflet-src.esm')

      bounds = L.latLngBounds(L.latLng(swlat, swlng), L.latLng(nelat, nelng))
    }

    return {
      miscStore,
      groupStore,
      messageStore,
      postMapInitialBounds,
      postType,
      selectedType,
      trackViews,
      bounds,
      showGroups,
      groupids,
      swlat,
      swlng,
      nelat,
      nelng,
      search,
      searchOn,
    }
  },
  data() {
    return {
      // TODO
      me: null,

      // Map stuff
      L: null,
      heightFraction: 3,
      postcode: null,
      loading: false,
      lat: null,
      lng: null,
      zoom: null,
      centre: null,
      mapready: process.server,
      mapMoved: false,
      messagesOnMap: [],
      bump: 1,

      // Infinite message scroll
      busy: false,
      infiniteId: +new Date(),
      distance: 1000,
      messagesInOwnGroups: [],
      toShow: 0,

      // Filters
      typeOptions: [
        {
          value: 'All',
          text: 'All posts',
          selected: true,
        },
        {
          value: 'Offer',
          text: 'Just OFFERs',
        },
        {
          value: 'Wanted',
          text: 'Just WANTEDs',
        },
      ],
      selectedGroup: null,
      context: null,
      trackedView: false,
    }
  },
  computed: {
    showClosest() {
      return (
        this.closestGroups &&
        this.closestGroups.length &&
        this.closestGroups.length < 20
      )
    },
    group() {
      let ret = null

      if (this.selectedGroup) {
        ret = this.groupStore.get(this.selectedGroup)
      } else if (this.myGroups && this.myGroups.length === 1) {
        ret = this.groupStore.get(this.myGroups[0].id)
      }

      return ret
    },
    regions() {
      const regions = []

      try {
        const allGroups = this.groupStore.list

        for (const ix in allGroups) {
          const group = allGroups[ix]

          if (group.region && !regions.includes(group.region)) {
            regions.push(group.region)
          }
        }

        regions.sort()
      } catch (e) {
        console.error('Exception', e)
      }

      return regions
    },
    messageCount() {
      const count = this.messages ? this.messages.length : 0
      return count
    },
    locked() {
      return this.miscStore && this.miscStore.get('postmaparea')
    },
    messagesForList() {
      let msgs = []

      if (this.locked) {
        // If the post map is locked to an area, then we always show the posts in that area.
        msgs = this.sortedMessagesOnMap
      } else if (this.search) {
        // Whether or not the map has moved, the messages are returned through the map.
        msgs = this.sortedMessagesOnMap
      } else if (!this.mapMoved && this.me) {
        // Until the map moves we show posts from the member's groups.  This is to handle people who don't engage
        // with the map at all and just want to see the posts from their groups (which is perfectly reasonable).
        msgs = this.messagesInOwnGroups
      } else {
        // Once the map has moved we show posts from within the map area.
        msgs = this.sortedMessagesOnMap
      }

      if (this.selectedGroup) {
        msgs = msgs.filter((m) => m.groupid === this.selectedGroup)
      }

      return msgs
    },
    messagesForListIds() {
      // Remember that Vue2 doesn't support reactivity on Map() so we can't use that.
      return this.messagesForList.map((m) => parseInt(m.id))
    },
    filteredMessages() {
      const ret = []
      const dups = []

      if (!this.search) {
        // We want to filter by:
        // - Possibly a message type
        // - Possibly a group id
        // - Don't show deleted posts.  Remember the map may lag a bit as it's only updated on cron, so we
        //   may be returned some.
        // - Do show completed posts - makes us look good.  But not too many.
        //
        // Filter out dups by subject (for crossposting).
        for (
          let i = 0;
          i < this.messagesForList.length && i < this.toShow;
          i++
        ) {
          const m = this.messagesForList[i]

          if (this.wantMessage(m)) {
            const message = this.messageStore.get(m.id)

            if (message) {
              const key = message.fromuser + '|' + message.subject
              const already =
                key in dups && message.groups[0].groupid !== dups[key]

              if (!already && !message.deleted) {
                // Pass whether the message has been freegled or promised, which is returned in the summary call.
                message.successful = !!m.successful
                message.promised = !!m.promised

                let addIt = true

                if (message.successful) {
                  if (this.myid === message.fromuser) {
                    // Always show your own messages.  We have at least one freegler for whom this is emotionally
                    // important.
                    addIt = true
                  } else if (this.selectedType !== 'All') {
                    // Don't show freegled posts if you're already filtering.
                    addIt = false
                  } else if (message.daysago > 7) {
                    addIt = false
                  } else {
                    const lastfour = ret.slice(-4)
                    let gotSuccessful = false

                    lastfour.forEach((m) => {
                      gotSuccessful |= m.successful
                    })

                    if (gotSuccessful) {
                      addIt = false
                    }
                  }
                }

                if (addIt) {
                  dups[key] = message.groups[0].groupid
                  ret.push(message)
                }
              }
            }
          }
        }
      } else {
        // We are searching.  We get the messages from the store.
        const messages = this.$store.getters['messages/getAll']
        messages.forEach((message) => {
          if (message) {
            const key = message.fromuser + '|' + message.subject
            const already = key in dups

            // Pass whether the message has been freegled, which in this case is returned as the outcomes in the
            // message.
            let successful = false

            if (message.outcomes && message.outcomes.length) {
              for (const outcome of message.outcomes) {
                if (
                  outcome.outcome === 'Taken' ||
                  outcome.outcome === 'Received'
                ) {
                  successful = true
                }
              }
            }

            message.successful = successful

            if (
              !already &&
              !message.deleted &&
              (!message.outcomes || message.outcomes.length === 0)
            ) {
              dups[key] = true
              ret.push(message)
            }
          }
        })
      }

      return ret
    },
    sortedMessagesOnMap() {
      return this.messagesOnMap.slice().sort((a, b) => {
        return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
      })
    },
    showRegions() {
      // We want to show the regions if we're zoomed out, or for SSR = SEO.
      return process.server || this.zoom < 7
    },
    showGroupList() {
      // We want to show the list of groups for SSR = SEO, or if we are not showing the regions (because we're
      // zoomed out)
      return process.server || !this.showRegions
    },
    closestGroups() {
      const ret = []

      if (this.centre) {
        const allGroups = this.groupStore.list

        for (const ix in allGroups) {
          const group = allGroups[ix]

          if (group) {
            // See if the group is showing in the map area.
            if (
              this.bounds.contains([group.lat, group.lng]) ||
              ((group.altlat || group.altlng) &&
                this.bounds.contains([group.altlat, group.altlng]))
            ) {
              // Are we already a member?
              // TODO
              // const member = this.$store.getters['auth/member'](group.id)
              const member = false

              if (!member) {
                // Visible group?
                if (group.onmap && group.publish) {
                  // How far away?
                  group.distance = this.getDistance(
                    [this.centre.lat, this.centre.lng],
                    [group.lat, group.lng]
                  )

                  // Allowed to show?
                  if (
                    !group.showjoin ||
                    group.distance <= group.showjoin * 1609.34
                  ) {
                    ret.push(group)
                  } else if (group.altlat || group.altlng) {
                    // A few groups have two centres because they are large.
                    group.distance = this.getDistance(
                      [this.centre.lat, this.centre.lng],
                      [group.altlat, group.altlng]
                    )

                    if (group.distance <= group.showjoin * 1609.34) {
                      ret.push(group)
                    }
                  }
                }
              }
            }
          }
        }

        ret.sort((a, b) => {
          return a.distance - b.distance
        })
      }

      return ret
    },
  },
  watch: {
    selectedGroup(newVal) {
      if (newVal) {
        this.groupStore.fetch(newVal)
      }
    },
    selectedType(newVal) {
      this.miscStore.set({
        key: 'postType',
        value: newVal,
      })

      this.infiniteId++
    },
    search(newval) {
      if (!newval) {
        // We've cleared the search box, so cancel the search and return the map to normal.
        this.searchOn = null
      }
    },
    locked() {
      // When the post map is locked/unlocked we need to reset the infinite scroll so that we see the appropriate
      // messages.
      this.infiniteId++

      if (this.locked) {
        this.postMapInitialBounds = this.locked
      } else {
        this.postMapInitialBounds = this.initialBounds
      }

      this.bump++
    },
    messagesForList() {
      this.toShow = 0
      this.infiniteId++
    },
  },
  methods: {
    // Simple throttle.  When we get more than a certain number of outstanding fetches, wait until they are all
    // finished.  This stops the infinite scroll going beserk.
    // TODO
    loadMore($state) {
      // await this.throttleFetches()

      do {
        this.toShow++
      } while (
        this.toShow < this.messagesForList.length &&
        !this.wantMessage(this.messagesForList[this.toShow])
      )

      if (this.toShow > this.messagesForList.length) {
        // We're showing all the messages
        $state.complete()
      } else {
        // We need another message.
        const m = this.messagesForList[this.toShow - 1]

        // We always want to trigger a fetch to the store, because the store will decide whether a cached message
        // needs refreshing.
        this.messageStore.fetch(m.id)

        $state.loaded()
      }
    },
    messagesChanged(messages) {
      let changed = false
      if (!messages || !this.messagesOnMap) {
        changed = true
      } else {
        const oldids = this.messagesOnMap.map((m) => m.id)
        const newids = messages.map((m) => m.id)

        if (JSON.stringify(oldids) !== JSON.stringify(newids)) {
          changed = true
        }
      }

      if (changed) {
        this.messagesOnMap = messages
        this.infiniteId++
      }
    },
    groupsChanged(groupids) {
      this.groupids = groupids
    },
    doSearch() {
      if (this.search) {
        if (this.busy) {
          // Try later.  Otherwise we might end up with messages in store not matching our search.
          setTimeout(this.doSearch, 100)
        } else if (this.searchOn !== this.search) {
          // Set some values which will cause the post map to search.
          this.messagesOnMap = []
          this.searchOn = this.search
          this.messageStore.clear()
          this.infiniteId++
        }
      }
    },
    wantMessage(m) {
      return (
        (this.selectedType === 'All' || this.selectedType === m.type) &&
        (!this.selectedGroup ||
          parseInt(m.groupid) === parseInt(this.selectedGroup))
      )
    },
    recordView() {
      if (this.trackViews && !this.trackedView) {
        this.trackedView = true

        this.$api.bandit.chosen({
          uid: 'messageview',
          variant: 'community',
        })
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.postcode {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 20000;
}

.community__text {
  /* Need to override the h2 as it has higher specificity */
  color: #212529 !important;
}

.shrink {
  width: unset;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
  grid-template-rows: 1fr 0px;

  @include media-breakpoint-down(sm) {
    grid-template-columns: 2fr 10px 1fr 0px;
    grid-template-rows: 1fr 1fr;
  }

  .search {
    @include media-breakpoint-down(sm) {
      grid-row: 2 / 3;
      grid-column: 1 / 6;
    }
  }
}

.dense {
  .btn {
    max-width: 300px;
    text-overflow: ellipsis;
  }
}

.overlapnav {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 1039;
}

:deep(.maxwidth) {
  max-width: 100vw;
}
</style>
