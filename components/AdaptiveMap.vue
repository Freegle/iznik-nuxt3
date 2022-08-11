<template>
  <div>
    <h2 class="sr-only">Map of offers and wanteds</h2>
    <client-only>
      <div v-if="!loggedIn && showClosest" class="overlapnav w-100">
        <div class="d-flex justify-content-around pl-1 pr-1 w-100">
          <JoinWithConfirm
            :id="closestGroups[0].id"
            :name="closestGroups[0].namedisplay + ' for email alerts'"
            size="lg"
            variant="white"
            class="m-1"
            :class-name="'m-1 text-truncate maxwidth'"
          />
        </div>
        <client-only>
          <div v-observe-visibility="joinVisibilityChanged" />
        </client-only>
      </div>
    </client-only>
    <client-only>
      <PostMap
        v-if="postMapInitialBounds"
        :key="'postmap-' + bump"
        v-model:ready="mapready"
        v-model:bounds="bounds"
        v-model:show-groups="showGroups"
        v-model:moved="mapMoved"
        v-model:zoom="zoom"
        v-model:centre="centre"
        v-model:loading="loading"
        :initial-bounds="postMapInitialBounds"
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
      <div v-if="showClosest" class="mb-1 border p-2 bg-white">
        <h2 class="sr-only">Nearby commmunities</h2>
        <div class="d-flex flex-wrap justify-content-center">
          <div v-for="g in closestGroups.slice(0, 3)" :key="'group-' + g.id">
            <JoinWithConfirm
              :id="g.id"
              :name="g.namedisplay"
              size="md"
              variant="primary"
              class="m-1"
            />
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
            all-my
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
                placeholder="Search posts TODO"
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
import { useAuthStore } from '../stores/auth'
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '../stores/message'
import MessageList from './MessageList'
import { useMiscStore } from '~/stores/misc'
import { MAX_MAP_ZOOM } from '~/constants'
import JoinWithConfirm from '~/components/JoinWithConfirm'
import { getDistance } from '~/composables/useMap'
import GroupSelect from '~/components/GroupSelect'

const AdaptiveMapGroup = () => import('./AdaptiveMapGroup')
const ExternalLink = () => import('./ExternalLink')

export default {
  components: {
    MessageList,
    JoinWithConfirm,
    GroupSelect,
    ExternalLink,
    AdaptiveMapGroup,
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
  async setup(props) {
    const miscStore = useMiscStore()
    const authStore = useAuthStore()
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()

    const postMapInitialBounds = miscStore.get('postmaparea')
      ? miscStore.get('postmaparea')
      : props.initialBounds

    let messagesInOwnGroups = []

    if (authStore.user?.id && (props.startOnGroups || props.forceMessages)) {
      // Get the messages in our own groups for the initial view.
      messagesInOwnGroups = await messageStore.fetchMyGroups()
    }

    let bounds = null

    // We might have a preference for which type of posts we view.
    const postType = authStore.user?.settings.browsePostType
    const selectedType = ref(postType || 'All')

    const showGroups = props.startOnGroups
    const groupids = props.initialGroupIds
    const swlat = props.initialBounds[0][0]
    const swlng = props.initialBounds[0][1]
    const nelat = props.initialBounds[1][0]
    const nelng = props.initialBounds[1][1]
    const search = ref(props.initialSearch)
    const searchOn = ref(props.initialSearch)

    if (process.client) {
      const L = await import('leaflet/dist/leaflet-src.esm')

      bounds = L.latLngBounds(L.latLng(swlat, swlng), L.latLng(nelat, nelng))
    }

    return {
      miscStore,
      authStore,
      groupStore,
      messageStore,
      postMapInitialBounds,
      messagesInOwnGroups,
      postType,
      selectedType,
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
      mapVisible: true,
      postsVisible: true,
      joinVisible: false,
      mapMoved: false,
      messagesOnMap: [],
      bump: 1,
      infiniteId: 1,

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
      selectedGroup: 0,
      context: null,
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

      if (this.search) {
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
      return this.messagesForList.map((m) => parseInt(m.id))
    },
    filteredMessages() {
      let ret = []

      if (!this.search) {
        ret = this.messagesForList
      } else {
        // We are searching.  We get the messages from the store.
        const messages = this.messagesForList

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
                  group.distance = getDistance(
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
                    group.distance = getDistance(
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
    async selectedType(newVal) {
      const settings = this.me.settings
      settings.browsePostType = newVal

      await this.authStore.saveAndGet({
        settings,
      })

      this.infiniteId++
    },
    search(newval) {
      if (!newval) {
        // We've cleared the search box, so cancel the search and return the map to normal.
        this.searchOn = null
      }
    },
    messagesForList() {
      this.infiniteId++
    },
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
      }
    },
    groupsChanged(groupids) {
      this.groupids = groupids
    },
    doSearch() {
      if (this.search) {
        if (this.searchOn !== this.search) {
          // Set some values which will cause the post map to search.
          this.messagesOnMap = []
          this.searchOn = this.search
          this.messageStore.clear()
          this.infiniteId++
        }
      }
    },
    mapVisibilityChanged(visible) {
      this.mapVisible = visible
    },
    joinVisibilityChanged(visible) {
      this.joinVisible = visible
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
