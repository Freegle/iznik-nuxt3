<template>
  <div v-if="initialBounds">
    <div v-if="!mapHidden">
      <div
        ref="mapcont"
        :style="'height: ' + mapHeight + 'px'"
        class="w-100 position-relative mb-1"
      >
        <div class="mapbox">
          <l-map
            ref="map"
            v-model:bounds="bounds"
            v-model:center="center"
            v-model:zoom="zoom"
            :style="'width: 100%; height: ' + mapHeight + 'px'"
            :min-zoom="minZoom"
            :max-zoom="maxZoom"
            :options="mapOptions"
            @ready="ready"
            @update:bounds="idle"
            @zoomend="idle"
            @moveend="idle"
            @dragend="dragEnd"
          >
            <l-tile-layer :url="osmtile()" :attribution="attribution()" />
            <div v-if="showMessages">
              <ClusterMarker
                v-if="messagesForMap.length"
                :markers="messagesForMap"
                :map="mapObject"
                tag="post"
                @click="clusterClick"
              />
              <ClusterMarker
                v-if="!moved"
                :markers="secondaryMessagesForMap"
                :map="mapObject"
                tag="post"
                css-class="fadedMarker"
                @click="clusterClick"
              />
              <l-marker
                v-if="me?.settings?.mylocation && (me.lat || me.lng)"
                :lat-lng="[me.lat, me.lng]"
                @click="goHome"
              >
                <l-icon>
                  <BrowseHomeIcon />
                </l-icon>
                <l-tooltip>
                  This is where your postcode is. You can change your postcode
                  from Settings.
                </l-tooltip>
              </l-marker>
            </div>
            <div v-else-if="showGroups">
              <GroupMarker
                v-for="g in groupsInBounds"
                :key="'marker-' + g.id + '-' + zoom"
                :group="g"
                :size="largeGroupMarkers ? 'rich' : 'poor'"
              />
            </div>
            <div v-if="showIsochrones">
              <l-geo-json
                v-for="g in isochroneGEOJSONs"
                :key="'isochrone' + g.id"
                :geojson="g.json"
                :options="isochroneOptions"
              />
            </div>
          </l-map>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import cloneDeep from 'lodash.clonedeep'
import { storeToRefs } from 'pinia'
import Wkt from 'wicket'
import { LGeoJson, LTooltip } from '@vue-leaflet/vue-leaflet'
import GroupMarker from './GroupMarker'
import BrowseHomeIcon from './BrowseHomeIcon'
import ClusterMarker from './ClusterMarker'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'
import {
  calculateMapHeight,
  loadLeaflet,
  attribution,
  osmtile,
} from '~/composables/useMap'
import { useMiscStore } from '~/stores/misc'
import { useIsochroneStore } from '~/stores/isochrone'
import { useAuthorityStore } from '~/stores/authority'
import { useAuthStore } from '~/stores/auth'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import '~/assets/css/gesture-handling.css'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  showIsochrones: {
    type: Boolean,
    required: false,
    default: false,
  },
  initialBounds: {
    type: Array,
    required: true,
  },
  heightFraction: {
    type: Number,
    required: false,
    default: 3,
  },
  minZoom: {
    type: Number,
    required: false,
    default: 5,
  },
  maxZoom: {
    type: Number,
    required: false,
    default: 15,
  },
  postZoom: {
    type: Number,
    required: false,
    default: 10,
  },
  forceMessages: {
    type: Boolean,
    required: false,
    default: false,
  },
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: false,
    default: 'All',
  },
  search: {
    type: String,
    required: false,
    default: null,
  },
  showMany: {
    type: Boolean,
    required: false,
    default: true,
  },
  region: {
    type: String,
    required: false,
    default: null,
  },
  canHide: {
    type: Boolean,
    required: false,
    default: false,
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

const { myGroups, myGroupsBoundingBox, myGroupIds } = useMe()

const emit = defineEmits([
  'update:ready',
  'update:showGroups',
  'update:bounds',
  'update:zoom',
  'update:centre',
  'update:loading',
  'update:moved',
  'groups',
  'messages',
  'idle',
  'minzoom',
  'searched',
])

const miscStore = useMiscStore()
const groupStore = useGroupStore()
const messageStore = useMessageStore()
const isochroneStore = useIsochroneStore()
const authorityStore = useAuthorityStore()
const authStore = useAuthStore()
const me = authStore.user

// Data properties as refs
const messageList = ref([])
const secondaryMessageList = ref([])
const moved = ref(false)
const mapObject = ref(null)
const manyToShow = ref(20)
const shownMany = ref(false)
const lastBounds = ref(null)
const lastBoundsFetch = ref(null)
const zoom = ref(5)
const destroyed = ref(false)
const mapIdle = ref(0)
const center = ref(null)
const bounds = ref(null)
const map = ref(null)
const mapcont = ref(null)

// Get isochroneBounds from the store
const { bounds: isochroneBounds } = storeToRefs(useIsochroneStore())

// Computed properties
const mapHeight = computed(() => {
  return calculateMapHeight(props.heightFraction)
})

const mapOptions = computed(() => {
  return {
    zoomControl: true,
    dragging: process.client && window?.L?.Browser?.mobile,
    touchZoom: true,
    scrollWheelZoom: false,
    bounceAtZoomLimits: true,
    gestureHandling: true,
  }
})

const mapHidden = computed(() => {
  return props.canHide && miscStore?.get('hidepostmap')
})

const showMessages = computed(() => {
  // We're zoomed in far enough or we're forcing ourselves to show them (but not so that it's silly)
  return (
    mapIdle.value > 0 &&
    (zoom.value >= props.postZoom || (props.forceMessages && zoom.value >= 7))
  )
})

const showGroups = computed(() => {
  // Don't show until the map has been idle - there is an issue with markers not destroying properly which this
  // provokes.
  return mapIdle.value > 0 && !showMessages.value
})

const groups = computed(() => {
  const ret = []

  if (messageList.value) {
    messageList.value.forEach((m) => {
      if (!ret.includes(m.groupid)) {
        ret.push(m.groupid)
      }
    })
  }

  return ret
})

const largeGroupMarkers = computed(() => {
  // Can't get this to look sane.
  return false
})

const allGroups = computed(() => {
  return groupStore?.list
})

const groupsInBounds = computed(() => {
  const ret = []

  try {
    // Reference map idle so that we recalc.
    const groups = mapIdle.value ? allGroups.value : []
    const boundsObj = mapObject.value ? mapObject.value.getBounds() : null

    if (!process.client && boundsObj) {
      // SSR - return all for SEO.
      for (const ix in groups) {
        const group = groups[ix]

        if (
          group.onmap &&
          (!props.region ||
            group.region.trim().toLowerCase() ===
              props.region.trim().toLowerCase())
        ) {
          ret.push(group)
        }
      }
    } else if (boundsObj) {
      for (const ix in groups) {
        const group = groups[ix]

        if (group.lat || group.lng) {
          try {
            if (
              group.onmap &&
              group.publish &&
              boundsObj.contains([group.lat, group.lng]) &&
              (!props.region ||
                props.region.toLowerCase() === group.region.toLowerCase())
            ) {
              ret.push(group)
            }
          } catch (e) {
            console.log('Problem group', e)
          }
        }
      }
    }
  } catch (e) {
    console.log('Groups in bounds exception', e)
  }

  const sorted = ret.sort((a, b) => {
    return a.namedisplay
      .toLowerCase()
      .localeCompare(b.namedisplay.toLowerCase())
  })

  return sorted
})

const messagesForMap = computed(() => {
  return mapObject.value && messageList.value && messageList.value.length
    ? messageList.value
    : []
})

const isochrones = computed(() => {
  return props.isochroneOverride
    ? [props.isochroneOverride]
    : isochroneStore?.list
})

const isochroneGEOJSONs = computed(() => {
  const ret = []

  isochrones.value.forEach((i) => {
    const wkt = new Wkt.Wkt()
    try {
      wkt.read(i.polygon)
      ret.push({
        id: i.id,
        json: wkt.toJson(),
      })
    } catch (e) {
      console.log('WKT error', location, e)
    }
  })

  return ret
})

const isochroneOptions = computed(() => {
  return {
    fillColor: 'darkblue',
    fill: true,
    fillOpacity: 0.2,
    color: 'darkblue',
  }
})

const messageIds = computed(() => {
  return messageList.value.map((m) => m.id)
})

const secondaryMessagesForMap = computed(() => {
  if (secondaryMessageList.value?.length > 200) {
    // So many posts that the precise numbers no longer matter that much.  So return all the ones we have fetched
    // rather than spend CPU on filtering (which is a significant issue on slow browsers).
    return secondaryMessageList.value
  } else {
    // Return anything relevant we have fetched which is not already in the primary one.
    return secondaryMessageList.value.filter((m) => {
      return (
        !messageIds.value[m.id] &&
        (!props.groupid || m.groupid === props.groupid) &&
        (props.type === 'All' || m.type === props.type)
      )
    })
  }
})
// Watchers
watch(bounds, (newVal, oldVal) => {
  if (!showGroups.value) {
    getMessages()
  }
})

watch(showGroups, (newVal) => {
  if (!newVal && !props.authorityid) {
    getMessages()
  }
})

watch(zoom, (newVal) => {
  if (newVal < props.postZoom && !props.forceMessages) {
    emit('update:showGroups', true)
  } else {
    emit('update:showGroups', false)
  }
})

watch(isochroneBounds, (newVal) => {
  if (newVal && mapObject.value) {
    // Make the map show the isochrone view.
    try {
      mapObject.value.fitBounds(newVal)
    } catch (e) {
      // This happens when leaflet is destroyed.
      console.log('Ignore flyToBounds exception', e)
    }
  }
  getMessages()
})

watch(
  groups,
  (newval) => {
    emit('groups', newval)
  },
  { immediate: true }
)

watch(
  () => props.type,
  () => {
    lastBounds.value = null

    if (zoom.value >= props.postZoom || props.search) {
      getMessages()
    }
  }
)

watch(
  () => props.search,
  () => {
    lastBounds.value = null
    getMessages()
  }
)

watch(
  () => props.groupid,
  (groupid) => {
    lastBounds.value = null

    if (groupid) {
      // Use the bounding box for the group.
      const group = myGroup(groupid)
      console.log('Got group', group)

      if (group.bbox) {
        const wkt = new Wkt.Wkt()
        try {
          wkt.read(group.bbox)
          const obj = wkt.toObject()
          const thisbounds = obj.getBounds()
          const sw = thisbounds.getSouthWest()
          const ne = thisbounds.getNorthEast()

          const latLngBounds = new window.L.LatLngBounds([
            [sw.lat, sw.lng],
            [ne.lat, ne.lng],
          ]).pad(0.1)

          // For reasons I don't understand, leaflet throws errors if we don't make these local here.
          const swlat = latLngBounds.getSouthWest().lat
          const swlng = latLngBounds.getSouthWest().lng
          const nelat = latLngBounds.getNorthEast().lat
          const nelng = latLngBounds.getNorthEast().lng

          mapObject.value.flyToBounds([
            [swlat, swlng],
            [nelat, nelng],
          ])

          moved.value = true
        } catch (e) {
          console.log('WKT error', location, e)
        }
      }
    }
  }
)

watch(groupsInBounds, (newval) => {
  emit(
    'groups',
    groupsInBounds.value.map((g) => g.id)
  )
})
// Add missing myGroup function
function myGroup(groupId) {
  return groupStore.get(groupId) || {}
}

// Lifecycle hooks
onMounted(async () => {
  if (mapHidden.value) {
    // Say we're ready so the parent can crack on.
    emit('update:ready', true)

    // Fetch the messages.
    getMessages()
  }

  await loadLeaflet()
})

onBeforeUnmount(() => {
  destroyed.value = true
  if (markerFixInterval.value) {
    clearInterval(markerFixInterval.value)
  }
})

const markerFixInterval = ref(null)

function fixDefaultMarkers() {
  if (!mapcont.value) return

  // Find any default Leaflet marker icons and replace with our custom icon
  const defaultMarkers = mapcont.value.querySelectorAll(
    'img[src*="marker-icon"]'
  )

  defaultMarkers.forEach((img) => {
    img.src = '/mapmarker.gif'
    img.style.width = '15px'
    img.style.height = '19px'
    img.style.marginLeft = '-7px'
    img.style.marginTop = '-19px'
  })

  // Stop checking once no default markers found for a while
  if (defaultMarkers.length === 0) {
    markerFixCount.value++
    if (markerFixCount.value > 10) {
      clearInterval(markerFixInterval.value)
      markerFixInterval.value = null
    }
  } else {
    markerFixCount.value = 0
  }
}

const markerFixCount = ref(0)

function startMarkerFix() {
  if (!markerFixInterval.value) {
    markerFixCount.value = 0
    markerFixInterval.value = setInterval(fixDefaultMarkers, 500)
  }
}

// Methods
async function ready() {
  emit('update:ready', true)
  mapObject.value = map.value.leafletObject

  if (process.client && mapObject.value) {
    try {
      mapObject.value.fitBounds(props.initialBounds)

      // Start checking for and fixing default markers
      startMarkerFix()

      const runtimeConfig = useRuntimeConfig()

      const { Geocoder } = await import('leaflet-control-geocoder/src/control')
      const { Photon } = await import(
        'leaflet-control-geocoder/src/geocoders/photon'
      )

      new Geocoder({
        placeholder: 'Search for a place...',
        defaultMarkGeocode: false,
        geocoder: new Photon({
          geocodingQueryParams: {
            bbox: '-7.57216793459, 49.959999905, 1.68153079591, 58.6350001085',
          },
          nameProperties: [
            'name',
            'street',
            'suburb',
            'hamlet',
            'town',
            'city',
          ],
          serviceUrl: runtimeConfig.public.GEOCODE,
        }),
        collapsed: false,
      })
        .on('markgeocode', async function (e) {
          if (e && e.geocode && e.geocode.bbox) {
            // Empty out the query box so that the dropdown closes.  Note that "this" is the control object,
            // which is why this isn't in a separate method.
            console.log('Search for place', e)
            this.moved = true
            this.setQuery('')

            // If we don't find anything at this location we will want to zoom out.
            shownMany.value = false

            // For some reason we need to take a copy of the latlng bounds in the event before passing it to
            // flyToBounds.
            const flyTo = e.geocode.bbox
            const L = await import('leaflet/dist/leaflet-src.esm')
            const newBounds = new L.LatLngBounds(
              new L.LatLng(flyTo.getSouthWest().lat, flyTo.getSouthWest().lng),
              new L.LatLng(flyTo.getNorthEast().lat, flyTo.getNorthEast().lng)
            )
            // Move the map to the location we've found.
            map.value.leafletObject.flyToBounds(newBounds)
            emit('searched')
          }
        })
        .addTo(mapObject.value)
    } catch (e) {
      // This is usually caused by leaflet.
      console.log('Ignore leaflet exception', e)
    }
  }
}
function clusterClick() {
  moved.value = true
  idle()
}

function idle() {
  mapIdle.value++

  try {
    if (mapObject.value) {
      // We need to update the parent about our zoom level and whether we are showing the posts or groups.
      const newBounds = mapObject.value.getBounds().toBBoxString()

      if (newBounds !== lastBounds.value) {
        lastBounds.value = newBounds

        if (showMessages.value) {
          getMessages()
        }
      }

      emit('update:bounds', mapObject.value.getBounds())
      emit('update:zoom', mapObject.value.getZoom())
      emit('update:centre', mapObject.value.getCenter())
      emit('idle', mapObject.value)
    }
  } catch (e) {
    console.error('Error in map idle', e)
  }
}

async function getMessages() {
  let messages = []
  secondaryMessageList.value = []

  emit('update:loading', true)

  let bounds = new window.L.LatLngBounds(props.initialBounds)

  if (mapObject.value) {
    // Get the messages from the server which are in the bounds of the map.
    bounds = mapObject.value.getBounds()

    if (mapObject.value.getZoom() < props.minZoom) {
      // The parent may replace us with something else at this point, e.g. with a group map.  But maybe not.
      // Their call.
      emit('minzoom', mapObject.value.getZoom())
    }
  }

  const swlat = bounds.getSouthWest().lat
  const swlng = bounds.getSouthWest().lng
  const nelat = bounds.getNorthEast().lat
  const nelng = bounds.getNorthEast().lng
  let ret = null

  if (moved.value) {
    // The map has been moved.
    if (props.search) {
      // Search within the bounds of the map.
      console.log('GetMessages - moved, search within map bounds')
      ret = await messageStore.search({
        messagetype: props.type,
        search: props.search,
        swlat,
        swlng,
        nelat,
        nelng,
      })
    } else {
      // Just fetch the bounds of the map.
      console.log('GetMessages - moved, fetch within map bounds')
      ret = await messageStore.fetchInBounds(swlat, swlng, nelat, nelng)
    }
  } else if (props.groupid) {
    // We have been asked to show a specific group.
    if (props.search) {
      // So search within that group.
      console.log('GetMessages - search on specific group')
      ret = await messageStore.search({
        messagetype: props.type,
        search: props.search,
        groupids: [props.groupid],
      })
    } else {
      // Just fetch that the messages on that group.
      console.log('GetMessages - fetch on specific group')
      ret = await messageStore.fetchMyGroups(props.groupid)

      if (!mapHidden.value) {
        // Fetch all the messages in the map bounds too, so that we can show others as secondary.
        // No need to bother if the map isn't showing - they don't appear in the post list.
        secondaryMessageList.value = await messageStore.fetchInBounds(
          swlat,
          swlng,
          nelat,
          nelng
        )
      }
    }
  } else if (props.authorityid) {
    // We are trying to show posts within a specific authority
    console.log('Get messages within authority')
    ret = await authorityStore.fetchMessages(props.authorityid)

    // Don't fetch the other messages - this may return so many it's too much load on the client.
  } else if (props.showIsochrones) {
    // We are trying to show posts nearby.
    if (isochrones.value?.length) {
      // We have isochrones.
      if (props.search) {
        // We don't have a search-within-isochones call.  But we can fetch all the messages in the isochrones,
        // and also search within the map, and take the intersection.
        console.log('GetMessages - search in isochrones')
        const isoret = await isochroneStore.fetchMessages()
        const searchret = await messageStore.search({
          messagetype: props.type,
          search: props.search,
          swlat,
          swlng,
          nelat,
          nelng,
        })

        const ids = {}

        ret = searchret.filter((i) => {
          if (isoret.find((el) => el.id === i.id) && !ids[i.id]) {
            ids[i.id] = true
            return true
          } else {
            return false
          }
        })

        secondaryMessageList.value = searchret
      } else {
        // Fetch the messages in our isochrones.
        console.log('GetMessages - fetch in isochrones')
        ret = await isochroneStore.fetchMessages()

        // Fetch the messages in bounds too, so that we can show those as secondary.
        secondaryMessageList.value = await messageStore.fetchInBounds(
          swlat,
          swlng,
          nelat,
          nelng
        )
      }
    } else if (myGroups.value?.length) {
      // We don't, which will be because we don't have a location.
      // Use the bounding boxes of the groups we are in.
      const groupbounds = myGroupsBoundingBox.value

      if (props.search) {
        console.log('GetMessages - search within group bounds')
        ret = await messageStore.search({
          messagetype: props.type,
          search: props.search,
          swlat: groupbounds[0][0],
          swlng: groupbounds[0][1],
          nelat: groupbounds[1][0],
          nelng: groupbounds[1][1],
        })
      } else {
        // Just fetch the messages within those bounds.    This will show a bit more than the strict
        // "all my groups" option, but not as much as we might show using the map bounds.
        console.log(
          'GetMessages - fetch in group bounds',
          JSON.stringify(groupbounds)
        )

        if (lastBoundsFetch.value !== JSON.stringify(groupbounds)) {
          lastBoundsFetch.value = JSON.stringify(groupbounds)

          ret = await messageStore.fetchInBounds(
            groupbounds[0][0],
            groupbounds[0][1],
            groupbounds[1][0],
            groupbounds[1][1],
            props.groupid
          )
        } else {
          console.log('Already fetched that.')
        }
      }
    } else if (props.search) {
      // We have no isochrones and no groups.  Do nothing - we expect code elsewhere to prompt for a location.
      // Search within the bounds of the map.
      console.log(
        'GetMessages - no isochrones, no groups, search within map bounds'
      )
      ret = await messageStore.search({
        messagetype: props.type,
        search: props.search,
        swlat,
        swlng,
        nelat,
        nelng,
      })
    } else {
      // Just fetch the bounds of the map.
      console.log(
        'GetMessages - no isochrones, no groups, fetch within map bounds'
      )
      ret = await messageStore.fetchInBounds(swlat, swlng, nelat, nelng)
    }
  } else if (myGroups.value?.length) {
    if (props.search) {
      const groupbounds = myGroupsBoundingBox.value

      console.log(
        'GetMessages - some groups, search within group bounds',
        groupbounds,
        myGroupIds
      )
      ret = await messageStore.search({
        messagetype: props.type,
        search: props.search,
        swlat: groupbounds[0][0],
        swlng: groupbounds[0][1],
        nelat: groupbounds[1][0],
        nelng: groupbounds[1][1],
        groupids: myGroupIds,
      })
    } else {
      // We have groups, so fetch the messages in those groups.
      console.log('GetMessages - some groups, fetch groups')
      ret = await messageStore.fetchMyGroups()

      // Get the messages in the map bounds too, so that we can show others as secondary.
      secondaryMessageList.value = await messageStore.fetchInBounds(
        swlat,
        swlng,
        nelat,
        nelng
      )
    }
  } else {
    // We have no groups, so fetch the messages in the map bounds.
    console.log('GetMessages - no groups, fetch in map bounds')
    ret = await messageStore.fetchInBounds(swlat, swlng, nelat, nelng)
  }

  if (ret && !destroyed.value) {
    messages = ret
  }

  if (messages?.length) {
    if (props.groupid) {
      messages = messages.filter((m) => {
        return m.groupid === props.groupid
      })
    }

    if (props.type !== 'All') {
      messages = messages.filter((m) => {
        return m.type === props.type
      })
    }
  }

  let countInBounds = 0

  messages.forEach((m) => {
    if (swlat <= m.lat && m.lat <= nelat && swlng <= m.lng && m.lng <= nelng) {
      countInBounds++
    }
  })

  if (props.isochroneOverride) {
    // Don't want to autozoom out in this case - stay where we're put.
    shownMany.value = true
  } else if (countInBounds >= manyToShow.value) {
    // We have seen lots, so we don't need to do the auto zoom out thing now.
    shownMany.value = true
  } else if (
    !props.search &&
    props.showMany &&
    countInBounds < manyToShow.value &&
    !shownMany.value
  ) {
    // If we haven't got more than 1 message at this zoom level, zoom out.  That means we'll always show at
    // least something.  This is useful when we search for a specific place.
    const currzoom = mapObject.value.getZoom()
    if (currzoom > props.minZoom) {
      console.log(
        'Not enough showing, zoom out',
        countInBounds,
        manyToShow.value,
        currzoom,
        props.minZoom
      )
      mapObject.value.setZoom(currzoom - 1)
      moved.value = true
    } else {
      shownMany.value = true
    }
  }

  messageList.value = messages || []
  emit('messages', messageList.value)
  emit('update:loading', false)

  return cloneDeep(messages)
}

async function goHome() {
  await loadLeaflet()

  if (me.lat || me.lng) {
    mapObject.value.flyTo(new window.L.LatLng(me.lat, me.lng))
  }
}

function dragEnd(e) {
  moved.value = true
  emit('update:moved', true)
  idle()
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

/* Hide default Leaflet markers until our fix replaces them */
:deep(img[src*='marker-icon']) {
  display: none !important;
}

.mapbox {
  width: 100%;
  top: 0px;
  left: 0;
  border: 1px solid $color-gray--light;
}

:deep(.leaflet-control-geocoder) {
  right: 30px;
}

@media screen and (max-width: 360px) {
  :deep(.leaflet-control-geocoder-form input) {
    max-width: 200px;
  }
}

@include media-breakpoint-up(md) {
  :deep(.leaflet-control-geocoder-form input) {
    height: calc(1.25em + 1rem + 2px);
    padding: 0.5rem 1rem;
    font-size: 1rem !important;
    line-height: 1.25;
    border-radius: 0.3rem;
  }
}

:deep(.handle) {
  content: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH5AoLCyYQDowQNQAAAHRJREFUOMtjYBhMQJ6BgSGLgYHhP5TPzMDA4AXlG0DFuBkYGDKQ1KAAmGZ9KB+muY6BgUEYqjkaKuaAzYD/DAwM6mg212Cx2Z2QV5A1CxBjMwMWP9PXZuQwIMtmGDAj12ZkQJbNyJrJtpmBEpuRA9GBYcgBALMUJBS9QtP6AAAAAElFTkSuQmCC');
}

:deep(.top) {
  z-index: 1000 !important;
}

.pauto {
  pointer-events: auto;
}

:deep(.fadedMarker) {
  filter: grayscale(100%);
  z-index: -1 !important;

  &.icon,
  .icon {
    border: 5px solid $color-gray--light;
    opacity: 0.5;
  }
}
</style>
