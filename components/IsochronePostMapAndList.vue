<template>
  <div>
    <h2 class="sr-only">Map of offers and wanteds</h2>
    <client-only>
      <PostMap
        v-if="initialBounds"
        :key="'postmap-' + bump"
        v-model:ready="mapready"
        v-model:bounds="bounds"
        v-model:show-groups="showGroups"
        v-model:moved="mapMoved"
        v-model:zoom="zoom"
        v-model:centre="centre"
        v-model:loading="loading"
        show-isochrones
        :initial-bounds="initialBounds"
        :height-fraction="heightFraction"
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
        :can-hide="canHide"
        @searched="selectedGroup = 0"
        @messages="messagesChanged($event)"
        @groups="groupsChanged($event)"
      />
      <div v-observe-visibility="mapVisibilityChanged" />
    </client-only>
    <div v-if="mapready" class="rest">
      <div
        v-if="closestGroups && closestGroups.length"
        class="mb-1 border p-2 bg-white"
      >
        <h2 class="sr-only">Nearby commmunities</h2>
        <div class="d-flex flex-wrap justify-content-center">
          <div v-for="g in closestGroups" :key="'group-' + g.id">
            <!--            TODO Join-->
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
        <h2 class="sr-only">Search Filters</h2>
        <div variant="info" class="p-2 border border-info bg-white filters">
          <GroupSelect
            v-if="me"
            v-model="selectedGroup"
            label="Communities to view"
            label-sr-only
            all
            :all-my="false"
          />
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
          v-if="
            mapVisible && !postsVisible && messagesOnMap && messagesOnMap.length
          "
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
        <!--        TODO Jobs-->
        <!--        <JobsTopBar-->
        <!--          v-if="jobs"-->
        <!--          class="d-block d-lg-none"-->
        <!--          :shown-love-junk="shownLoveJunk"-->
        <!--        />-->

        <h2 class="sr-only">List of wanteds and offers</h2>
        <client-only>
          <div v-observe-visibility="messageVisibilityChanged" />
        </client-only>
        <MessageList
          v-model:visible="postsVisible"
          :selected-group="selectedGroup"
          :selected-type="selectedType"
          :messages-for-list="filteredMessages"
          :bump="infiniteId"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '../stores/message'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'

import { MAX_MAP_ZOOM } from '~/constants'

// import JoinWithConfirm from '~/components/JoinWithConfirm'
const AdaptiveMapGroup = () => import('./AdaptiveMapGroup')
const ExternalLink = () => import('./ExternalLink')
const GroupSelect = () => import('./GroupSelect')
const NoticeMessage = () => import('./NoticeMessage')
const PostMap = () => import('~/components/PostMap')
// const JobsTopBar = () => import('~/components/JobsTopBar')

export default {
  components: {
    // JoinWithConfirm,
    NoticeMessage,
    GroupSelect,
    ExternalLink,
    AdaptiveMapGroup,
    PostMap,
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
  },
  setup(props) {
    const miscStore = useMiscStore()
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()
    const authStore = useAuthStore()

    // We might have a preference for which type of posts we view.
    const selectedType = miscStore.get('postType') ?? 'All'

    return {
      miscStore,
      groupStore,
      messageStore,
      authStore,
      selectedType,
      showGroups: ref(props.startOnGroups),
      groupids: ref(props.initialGroupIds),
      swlat: ref(props.initialBounds[0][0]),
      swlng: ref(props.initialBounds[0][1]),
      nelat: props.initialBounds[1][0],
      nelng: props.initialBounds[1][1],
      search: props.initialSearch,
      searchOn: props.initialSearch,
    }
  },
  data() {
    return {
      // Map stuff
      heightFraction: 4,
      postcode: null,
      loading: false,
      lat: null,
      lng: null,
      bounds: null,
      zoom: null,
      centre: null,
      mapready: process.server,
      mapVisible: true,
      postsVisible: false,
      joinVisible: false,
      mapMoved: false,
      messagesOnMap: [],
      bump: 1,

      // Infinite message scroll
      ensureMessageVisible: null,
      maxMessageVisible: null,
      busy: false,
      infiniteId: +new Date(),
      distance: 1000,
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
      trackViews: false,
      trackedView: false,

      // LoveJunk
      shownLoveJunk: false,
    }
  },
  computed: {
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
    messagesForList() {
      let msgs = []

      msgs = this.sortedMessagesOnMap

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
      let ret = []

      if (!this.search) {
        ret = this.messagesForList
      } else {
        // We are searching.  We get the messages from the store.
        const messages = this.messageStore.list
        messages.forEach((message) => {
          if (message) {
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
              !message.deleted &&
              (!message.outcomes || message.outcomes.length === 0)
            ) {
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
              const member = this.authStore.member(group.id)

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

      return ret.slice(0, 3)
    },
  },
  watch: {
    selectedGroup(newVal) {
      if (newVal) {
        this.groupStore.fetch(newVal)
      }
    },
    selectedType(newVal) {
      this.mistStore.set({
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
    filteredMessages(newval) {
      if (this.ensureMessageVisible) {
        this.$nextTick(() => {
          let ref = this.$refs['messagewrapper-' + this.ensureMessageVisible]

          if (ref) {
            // Dynamic refs returned as array.
            ref = Array.isArray(ref) ? ref[0] : ref

            if (ref) {
              ref.scrollIntoView(false)
              this.ensureMessageVisible = null
            }
          }
        })
      }
    },
    messagesForList() {
      this.toShow = 0
      this.infiniteId++
    },
  },
  mounted() {
    // We want to track views of messages for new members.
    if (this.me) {
      this.trackViews = true

      // eslint-disable-next-line no-undef
      try {
        window.__insp.push(['tagSession', { browsepage: 'newskool' }])
      } catch (e) {
        console.log('Failed to tag inspectlet')
      }
    }

    // We might have history which tells us to go back to a particular message. This is a common case on mobile -
    // you view a message, reply, then go back and expect to be where you were in the list.
    if (history && history.state && history.state.msgid) {
      this.ensureMessageVisible = parseInt(history.state.msgid)
    }
  },
  methods: {
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

      this.$emit('update:messagesOnMapCount', this.messagesOnMap.length)
    },
    groupsChanged(groupids) {
      this.groupids = groupids
    },
    async doSearch() {
      if (this.search) {
        if (this.busy) {
          // Try later.  Otherwise we might end up with messages in store not matching our search.
          setTimeout(this.doSearch, 100)
        } else if (this.searchOn !== this.search) {
          // Set some values which will cause the post map to search.
          this.messagesOnMap = []
          this.searchOn = this.search
          await this.messageStore.clear()
          this.infiniteId++
        }
      }
    },
    messageVisibilityChanged(visible) {
      this.postsVisible = visible
    },
    mapVisibilityChanged(visible) {
      this.mapVisible = visible
    },
    wantMessage(m) {
      return (
        (this.selectedType === 'All' || this.selectedType === m.type) &&
        (!this.selectedGroup ||
          parseInt(m.groupid) === parseInt(this.selectedGroup)) &&
        // Make the item filter also work to filter out the successful posts.
        (this.selectedType === 'All' || !m.successful)
      )
    },
    recordView() {
      if (this.trackViews && !this.trackedView) {
        this.trackedView = true

        this.$api.bandit.chosen({
          uid: 'messageview',
          variant: 'isochrone',
        })
      }
    },
    messageVisible(isVisible, entry) {
      if (isVisible && entry && entry.target.id) {
        const tid = entry.target.id
        const p = tid.indexOf('-')

        if (p !== -1) {
          const id = parseInt(tid.substring(p + 1))
          const ix = this.messagesForListIds.indexOf(id)

          if (id && (!this.maxMessageVisible || ix > this.maxMessageVisible)) {
            this.maxMessageVisible = ix

            try {
              history.replaceState(
                {
                  msgid: id,
                },
                null
              )
            } catch (e) {
              // Some browsers throw exceptions if this is called too frequently.
              console.log('Ignore replaceState exception', e)
            }
          }
        }
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
</style>
