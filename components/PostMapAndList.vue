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
      :show-isochrones="showIsochrones"
      :initial-bounds="initialBounds"
      :height-fraction="heightFraction"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :post-zoom="10"
      :force-messages="forceMessages"
      :type="selectedType"
      :search="search"
      :show-many="showMany"
      :groupid="selectedGroup"
      :region="region"
      :can-hide="canHide"
      :isochrone-override="isochroneOverride"
      :authorityid="authorityid"
      @searched="searched"
      @messages="messagesChanged($event)"
      @groups="groupsChanged($event)"
      @idle="$emit('idle', $event)"
    />
    <div v-observe-visibility="mapVisibilityChanged" />
    <div class="rest">
      <div
        v-if="showClosestGroups && closestGroups?.length && !mapHidden"
        class="mb-1 border p-2 bg-white"
      >
        <h2 class="visually-hidden">Nearby communities</h2>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <JoinWithConfirm
            v-for="g in closestGroups"
            :id="g.id"
            :key="'group-' + g.id"
            :name="g.namedisplay"
            size="sm"
            variant="primary"
          />
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
          :key="'messagelist-' + infiniteId"
          v-model:visible="postsVisible"
          v-model:none="noneFound"
          :search="search"
          show-counts-unseen
          :selected-group="selectedGroup"
          :selected-type="selectedType"
          :selected-sort="selectedSort"
          :messages-for-list="filteredMessages"
          :loading="loading"
          :jobs="jobs"
          :first-seen-message="firstSeenMessage"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { getDistance } from '~/composables/useMap'
import { MAX_MAP_ZOOM } from '~/constants'
import { useIsochroneStore } from '~/stores/isochrone'

import JoinWithConfirm from '~/components/JoinWithConfirm'
import MessageList from '~/components/MessageList'
const AdaptiveMapGroup = defineAsyncComponent(() => import('./MapGroup'))
const ExternalLink = defineAsyncComponent(() => import('./ExternalLink'))
const NoticeMessage = defineAsyncComponent(() => import('./NoticeMessage'))
const GiveAsk = defineAsyncComponent(() => import('./GiveAsk'))
const PostMap = defineAsyncComponent(() => import('~/components/PostMap'))

const props = defineProps({
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
  selectedSort: {
    type: String,
    required: false,
    default: 'Unseen',
  },
  showClosestGroups: {
    type: Boolean,
    required: false,
    default: true,
  },
  isochroneOverride: {
    type: Object,
    required: false,
    default: null,
  },
  authorityid: {
    type: Number,
    required: false,
    default: null,
  },
})

const emit = defineEmits([
  'update:selectedGroup',
  'update:messagesOnMapCount',
  'idle',
])

// Store instances
const miscStore = useMiscStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()
const isochroneStore = useIsochroneStore()
const me = computed(() => authStore.user)

// Refs from setup
const showGroups = ref(props.startOnGroups)
const groupids = ref(props.initialGroupIds)

// Data properties
const heightFraction = ref(4)
const loading = ref(false)
const bounds = ref(null)
const zoom = ref(null)
const centre = ref(null)
const mapready = ref(process.server)
const mapVisible = ref(true)
const postsVisible = ref(true)
const mapMoved = ref(false)
const updatedMessagesOnMap = ref(null)
const firstSeenMessage = ref(null)
const infiniteId = ref(+new Date())
const noneFound = ref(false)

// Computed properties
const showIsochrones = computed(() => {
  if (props.isochroneOverride) {
    return true
  } else {
    return browseView.value === 'nearby'
  }
})

const mapHidden = computed(() => {
  return miscStore?.get('hidepostmap')
})

const browseView = computed(() => {
  return me.value?.settings?.browseView
    ? me.value.settings.browseView
    : 'nearby'
})

const messagesOnMap = computed({
  get() {
    if (updatedMessagesOnMap.value !== null) {
      // We have been told by the map to show a specific set of messages.
      return updatedMessagesOnMap.value
    } else {
      // See if we have some from the isochrone, which we will have fetched in browse/index.
      return isochroneStore?.messageList ?? []
    }
  },
  set(newVal) {
    updatedMessagesOnMap.value = newVal
  },
})

const regions = computed(() => {
  const regions = []

  try {
    const allGroups = groupStore?.list

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
})

const messagesForList = computed(() => {
  let msgs = []

  msgs = sortedMessagesOnMap.value

  if (props.selectedGroup) {
    msgs = msgs.filter((m) => m.groupid === props.selectedGroup)
  }

  return msgs
})

const filteredMessages = computed(() => {
  let ret = []

  if (!props.search) {
    ret = messagesForList.value
  } else {
    // We are searching.
    const messages = messagesForList.value

    messages.forEach((message) => {
      if (message) {
        // Pass whether the message has been freegled, which in this case is returned as the outcomes in the
        // message.
        let successful = false

        if (message.outcomes && message.outcomes.length) {
          for (const outcome of message.outcomes) {
            if (outcome.outcome === 'Taken' || outcome.outcome === 'Received') {
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
})

const sortedMessagesOnMap = computed(() => {
  if (!messagesOnMap.value) {
    return []
  }

  return messagesOnMap.value.slice().sort((a, b) => {
    if (props.selectedSort === 'Unseen') {
      // Unseen messages first, then by descending date/time.  But we don't want to treat successful posts as
      // unseen otherwise they bob up to the top.
      const aunseen = a.unseen && !a.successful
      const bunseen = b.unseen && !b.successful

      if (aunseen && !bunseen) {
        return -1
      } else if (!aunseen && bunseen) {
        return 1
      } else {
        return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
      }
    } else {
      // Descending date/time.
      return new Date(b.arrival).getTime() - new Date(a.arrival).getTime()
    }
  })
})

const showRegions = computed(() => {
  // We want to show the regions if we're zoomed out, or for SSR = SEO.
  return process.server || zoom.value < 7
})

const showGroupList = computed(() => {
  // We want to show the list of groups for SSR = SEO, or if we are not showing the regions (because we're
  // zoomed out)
  return process.server || !showRegions.value
})

const closestGroups = computed(() => {
  const ret = []
  const distances = {}

  if (centre.value) {
    const allGroups = groupStore.list

    for (const ix in allGroups) {
      const group = allGroups[ix]

      if (group) {
        // See if the group is showing in the map area.
        if (
          bounds.value.contains([group.lat, group.lng]) ||
          ((group.altlat || group.altlng) &&
            bounds.value.contains([group.altlat, group.altlng]))
        ) {
          // Are we already a member?
          const member = authStore.member(group.id)

          if (!member) {
            // Visible group?
            if (group.onmap && group.publish) {
              // How far away?
              distances[group.id] = getDistance(
                [centre.value.lat, centre.value.lng],
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
                  [centre.value.lat, centre.value.lng],
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
})

// Watchers
watch(
  () => isochroneStore.messageList,
  (newList) => {
    if (updatedMessagesOnMap.value && newList?.length) {
      const unseenMap = new Map(newList.map((m) => [m.id, m.unseen]))
      let changed = false

      updatedMessagesOnMap.value.forEach((m) => {
        const newUnseen = unseenMap.get(m.id)
        if (newUnseen !== undefined && m.unseen !== newUnseen) {
          m.unseen = newUnseen
          changed = true
        }
      })

      if (changed) {
        updatedMessagesOnMap.value = [...updatedMessagesOnMap.value]
      }
    }
  },
  { deep: true }
)

watch(
  filteredMessages,
  (newVal) => {
    // We want to save the first message we have seen so that we show a message when we have scrolled down to it.
    // We want that message to stay there until the page is reloaded, even as we read the messages and the seen
    // state of the messages changes.
    if (firstSeenMessage.value === null) {
      for (const message of newVal) {
        if (!message.unseen) {
          firstSeenMessage.value = message.id
          break
        }
      }
    }

    infiniteId.value++
  },
  { immediate: true }
)

// Methods
function messagesChanged(messages) {
  if (messages) {
    let changed = false

    if (!messages || !messagesOnMap.value) {
      changed = true
    } else {
      const oldids = messagesOnMap.value.map((m) => m.id)
      const newids = messages.map((m) => m.id)

      if (JSON.stringify(oldids) !== JSON.stringify(newids)) {
        changed = true
      }
    }

    if (changed) {
      messagesOnMap.value = messages
      infiniteId.value++
    }

    emit('update:messagesOnMapCount', messagesOnMap.value.length)
  }
}

function groupsChanged(groupidsParam) {
  groupids.value = groupidsParam
}

function mapVisibilityChanged(visible) {
  mapVisible.value = visible
}

function searched() {
  // When we've searched on a place, we want to reset the selected group otherwise we won't show anything.
  emit('update:selectedGroup', 0)
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
