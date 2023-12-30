<template>
  <div>
    <h2 class="visually-hidden">Map of offers and wanteds</h2>
    <PostMap
      v-if="initialBounds"
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
      :search="search"
      :search-on-groups="!mapMoved"
      :show-many="showMany"
      :groupid="selectedGroup"
      :region="region"
      :can-hide="canHide"
      @searched="searched"
      @messages="messagesChanged($event)"
      @groups="groupsChanged($event)"
    />
    <div v-observe-visibility="mapVisibilityChanged" />
    <div class="rest">
      <div
        v-if="closestGroups?.length && !mapHidden"
        class="mb-1 border p-2 bg-white"
      >
        <h2 class="visually-hidden">Nearby commmunities</h2>
        <div class="d-flex flex-wrap justify-content-center">
          <div v-for="g in closestGroups" :key="'group-' + g.id">
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
          <h2 class="visually-hidden">List of communities</h2>
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
          Need help?  Go <nuxt-link no-prefetch to="/help">here</nuxt-link>.
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
        <NoticeMessage v-if="noneFound">
          <p>
            Sorry, we didn't find anything. Things come and go quickly, though,
            so you could try later. Or you could:
          </p>
          <GiveAsk class="bg-info" />
        </NoticeMessage>
        <div
          v-else-if="!postsVisible && messagesOnMap?.length"
          class="d-flex justify-content-center mt-1 mb-1"
        >
          <NoticeMessage variant="info">
            <v-icon icon="angle-double-down" class="pulsate" />
            Scroll down to see
            <span v-if="search"
              >results for "<strong>{{ search }}</strong
              >"</span
            ><span v-else>the posts</span>.
            <v-icon icon="angle-double-down" class="pulsate" />
          </NoticeMessage>
        </div>
        <h2 class="visually-hidden">List of wanteds and offers</h2>
        <MessageList
          v-if="updatedMessagesOnMap || messagesOnMap.length"
          v-model:visible="postsVisible"
          v-model:none="noneFound"
          :selected-group="selectedGroup"
          :selected-type="selectedType"
          :messages-for-list="filteredMessages"
          :bump="infiniteId"
          :loading="loading"
          :jobs="jobs"
        />
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'pinia'
import { defineAsyncComponent } from 'vue'
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '../stores/message'
import { calculateMapHeight } from '../composables/useMap'
import { ref } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { getDistance } from '~/composables/useMap'
import { MAX_MAP_ZOOM } from '~/constants'
import { useIsochroneStore } from '~/stores/isochrone'

import JoinWithConfirm from '~/components/JoinWithConfirm'
import MessageList from '~/components/MessageList'
const AdaptiveMapGroup = () => import('./AdaptiveMapGroup')
const ExternalLink = () => import('./ExternalLink')
const NoticeMessage = () => import('./NoticeMessage')
const GiveAsk = () => import('./GiveAsk')

export default {
  components: {
    GiveAsk,
    MessageList,
    JoinWithConfirm,
    NoticeMessage,
    ExternalLink,
    AdaptiveMapGroup,
    PostMap: defineAsyncComponent(() => import('~/components/PostMap')),
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
    search: {
      type: String,
      required: false,
      default: null,
    },
    selectedType: {
      type: String,
      required: false,
      default: 'All',
    },
    selectedGroup: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  setup(props) {
    const miscStore = useMiscStore()
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()
    const authStore = useAuthStore()
    const isochroneStore = useIsochroneStore()

    return {
      miscStore,
      groupStore,
      messageStore,
      authStore,
      isochroneStore,
      showGroups: ref(props.startOnGroups),
      groupids: ref(props.initialGroupIds),
      swlat: ref(props.initialBounds[0][0]),
      swlng: ref(props.initialBounds[0][1]),
      nelat: props.initialBounds[1][0],
      nelng: props.initialBounds[1][1],
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
      postsVisible: true,
      joinVisible: false,
      mapMoved: false,
      updatedMessagesOnMap: null,

      infiniteId: +new Date(),

      context: null,
      noneFound: false,
    }
  },
  computed: {
    ...mapState(useIsochroneStore, { isochroneBounds: 'bounds' }),
    mapHeight() {
      return calculateMapHeight(this.heightFraction)
    },
    mapHidden() {
      return this.miscStore?.get('hidepostmap')
    },
    messagesOnMap: {
      get() {
        if (this.updatedMessagesOnMap !== null) {
          // We have been told by the map to show a specific set of messages.
          return this.updatedMessagesOnMap
        } else {
          // See if we have some from the isochrone, which we will have fetched in browse/index.
          return this.isochroneStore?.messageList ?? []
        }
      },
      set(newVal) {
        this.updatedMessagesOnMap = newVal
      },
    },
    regions() {
      const regions = []

      try {
        const allGroups = this.groupStore?.list

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
      return this.messagesForList.map((m) => parseInt(m.id))
    },
    filteredMessages() {
      let ret = []

      if (!this.search) {
        ret = this.messagesForList
      } else {
        // We are searching.
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
      if (this.messagesOnMap) {
        return this.messagesOnMap.slice().sort((a, b) => {
          return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
        })
      } else {
        return []
      }
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
      const distances = {}

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
                  distances[group.id] = getDistance(
                    [this.centre.lat, this.centre.lng],
                    [group.lat, group.lng]
                  )

                  // Allowed to show?
                  if (
                    !group.showjoin ||
                    distances[group.id] <= group.showjoin * 1609.34
                  ) {
                    ret.push(group)
                  } else if (group.altlat || group.altlng) {
                    // A few groups have two centres because they are large.
                    distances[group.id] = getDistance(
                      [this.centre.lat, this.centre.lng],
                      [group.altlat, group.altlng]
                    )

                    if (distances[group.id] <= group.showjoin * 1609.34) {
                      ret.push(group)
                    }
                  }
                }
              }
            }
          }
        }

        ret.sort((a, b) => {
          return distances[a.id] - distances[b.id]
        })
      }

      return ret.slice(0, 3)
    },
  },
  watch: {
    messagesForList() {
      this.infiniteId++
    },
    filteredMessages() {
      this.infiniteId++
    },
    isochroneBounds() {
      this.infiniteId++
    },
  },
  methods: {
    messagesChanged(messages) {
      if (messages) {
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
      }
    },
    groupsChanged(groupids) {
      this.groupids = groupids
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
    searched() {
      // When we've searched on a place, we want to reset the selected group otherwise we won't show anything.
      this.$emit('updated:selectedGroup', 0)
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

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

.dense {
  .btn {
    max-width: 300px;
    text-overflow: ellipsis;
  }
}
</style>
