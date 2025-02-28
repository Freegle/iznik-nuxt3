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
            <l-tile-layer :url="osmtile" :attribution="attribution" />
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
              <l-geojson
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
<script>
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import cloneDeep from 'lodash.clonedeep'
import { mapState } from 'pinia'
import Wkt from 'wicket'
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '../stores/message'
import { calculateMapHeight, loadLeaflet } from '../composables/useMap'
import GroupMarker from './GroupMarker'
import BrowseHomeIcon from './BrowseHomeIcon'
import ClusterMarker from './ClusterMarker'
import { useMiscStore } from '~/stores/misc'
import { useIsochroneStore } from '~/stores/isochrone'
import { attribution, osmtile } from '~/composables/useMap'
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import { useAuthorityStore } from '~/stores/authority'

export default {
  components: {
    BrowseHomeIcon,
    ClusterMarker,
    GroupMarker,
  },
  props: {
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
  },
  setup() {
    const miscStore = useMiscStore()
    const groupStore = useGroupStore()
    const messageStore = useMessageStore()
    const isochroneStore = useIsochroneStore()
    const authorityStore = useAuthorityStore()

    return {
      miscStore,
      groupStore,
      messageStore,
      isochroneStore,
      authorityStore,
      Wkt,
      osmtile: osmtile(),
      attribution: attribution(),
    }
  },
  data() {
    return {
      context: null,
      messageList: [],
      secondaryMessageList: [],
      moved: false,
      mapObject: null,
      manyToShow: 20,
      shownMany: false,
      lastBounds: null,
      lastBoundsFetch: null,
      zoom: 5,
      destroyed: false,
      mapIdle: 0,
      center: null,
      bounds: null,
      everFetched: false,
    }
  },
  computed: {
    ...mapState(useIsochroneStore, { isochroneBounds: 'bounds' }),
    mapHeight() {
      return calculateMapHeight(this.heightFraction)
    },
    mapOptions() {
      return {
        zoomControl: true,
        dragging: process.client && window?.L?.Browser?.mobile,
        touchZoom: true,
        scrollWheelZoom: false,
        bounceAtZoomLimits: true,
        gestureHandling: true,
      }
    },
    mapHidden() {
      return this.canHide && this.miscStore?.get('hidepostmap')
    },
    showMessages() {
      // We're zoomed in far enough or we're forcing ourselves to show them (but not so that it's silly)
      return (
        this.mapIdle > 0 &&
        (this.zoom >= this.postZoom || (this.forceMessages && this.zoom >= 7))
      )
    },
    showGroups() {
      // Don't show until the map has been idle - there is an issue with markers not destroying properly which this
      // provokes.
      return this.mapIdle > 0 && !this.showMessages
    },
    groups() {
      const ret = []

      if (this.messageList) {
        this.messageList.forEach((m) => {
          if (!ret.includes(m.groupid)) {
            ret.push(m.groupid)
          }
        })
      }

      return ret
    },
    largeGroupMarkers() {
      // Can't get this to look sane.
      return false
    },
    allGroups() {
      return this.groupStore?.list
    },
    groupsInBounds() {
      const ret = []

      try {
        // Reference map idle so that we recalc.
        const groups = this.mapIdle ? this.allGroups : []
        const bounds = this.mapObject ? this.mapObject.getBounds() : null

        if (!process.client && bounds) {
          // SSR - return all for SEO.
          for (const ix in groups) {
            const group = groups[ix]

            if (
              group.onmap &&
              (!this.region ||
                group.region.trim().toLowerCase() ===
                  this.region.trim().toLowerCase())
            ) {
              ret.push(group)
            }
          }
        } else if (bounds) {
          for (const ix in groups) {
            const group = groups[ix]

            if (group.lat || group.lng) {
              try {
                if (
                  group.onmap &&
                  group.publish &&
                  bounds.contains([group.lat, group.lng]) &&
                  (!this.region ||
                    this.region.toLowerCase() === group.region.toLowerCase())
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
    },
    messagesForMap() {
      return this.mapObject && this.messageList && this.messageList.length
        ? this.messageList
        : []
    },
    isochrones() {
      return this.isochroneOverride
        ? [this.isochroneOverride]
        : this.isochroneStore?.list
    },
    isochroneGEOJSONs() {
      const ret = []

      this.isochrones.forEach((i) => {
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
    },
    isochroneOptions() {
      return {
        fillColor: 'darkblue',
        fill: true,
        fillOpacity: 0.2,
        color: 'darkblue',
      }
    },
    messageIds() {
      return this.messageList.map((m) => m.id)
    },
    secondaryMessagesForMap() {
      if (this.secondaryMessageList?.length > 200) {
        // So many posts that the precise numbers no longer matter that much.  So return all the ones we have fetched
        // rather than spend CPU on filtering (which is a significant issue on slow browsers).
        return this.secondaryMessageList
      } else {
        // Return anything relevant we have fetched which is not already in the primary one.
        return this.secondaryMessageList.filter((m) => {
          return (
            !this.messageIds[m.id] &&
            (!this.groupid || m.groupid === this.groupid) &&
            (this.type === 'All' || m.type === this.type)
          )
        })
      }
    },
  },
  watch: {
    bounds(newVal, oldVal) {
      if (!this.showGroups) {
        this.getMessages()
      }
    },
    showGroups(newVal) {
      if (!newVal && !this.authorityid) {
        this.getMessages()
      }
    },
    zoom(newVal) {
      if (newVal < this.postZoom && !this.forceMessages) {
        this.$emit('update:showGroups', true)
      } else {
        this.$emit('update:showGroups', false)
      }
    },
    isochroneBounds(newVal) {
      if (newVal && this.mapObject) {
        // Make the map show the isochrone view.
        try {
          this.mapObject.fitBounds(newVal)
        } catch (e) {
          // This happens when leaflet is destroyed.
          console.log('Ignore flyToBounds exception', e)
        }
      }
      this.getMessages()
    },
    groups: {
      immediate: true,
      handler(newval) {
        this.$emit('groups', newval)
      },
    },
    type() {
      this.lastBounds = null

      if (this.zoom >= this.postZoom || this.search) {
        this.getMessages()
      }
    },
    search() {
      this.lastBounds = null
      this.getMessages()
    },
    groupid(groupid) {
      this.lastBounds = null

      if (groupid) {
        // Use the bounding box for the group.
        const group = this.myGroup(groupid)
        console.log('Got group', group)

        if (group.bbox) {
          const wkt = new Wkt.Wkt()
          try {
            wkt.read(group.bbox)
            const obj = wkt.toObject()
            const thisbounds = obj.getBounds()
            const sw = thisbounds.getSouthWest()
            const ne = thisbounds.getNorthEast()

            const bounds = new window.L.LatLngBounds([
              [sw.lat, sw.lng],
              [ne.lat, ne.lng],
            ]).pad(0.1)

            // For reasons I don't understand, leaflet throws errors if we don't make these local here.
            const swlat = bounds.getSouthWest().lat
            const swlng = bounds.getSouthWest().lng
            const nelat = bounds.getNorthEast().lat
            const nelng = bounds.getNorthEast().lng

            this.mapObject.flyToBounds([
              [swlat, swlng],
              [nelat, nelng],
            ])

            this.moved = true
          } catch (e) {
            console.log('WKT error', location, e)
          }
        }
      }
    },
    groupsInBounds(newval) {
      this.$emit(
        'groups',
        this.groupsInBounds.map((g) => g.id)
      )
    },
  },
  async mounted() {
    if (this.mapHidden) {
      // Say we're ready so the parent can crack on.
      this.$emit('update:ready', true)

      // Fetch the messages.
      this.getMessages()
    }

    await loadLeaflet()
  },
  beforeUnmount() {
    this.destroyed = true
  },
  methods: {
    async ready() {
      const self = this

      this.$emit('update:ready', true)
      this.mapObject = this.$refs.map.leafletObject

      if (process.client && this.mapObject) {
        try {
          this.mapObject.fitBounds(this.initialBounds)
          const runtimeConfig = useRuntimeConfig()

          const { Geocoder } = await import(
            'leaflet-control-geocoder/src/control'
          )
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
                self.shownMany = false

                // For some reason we need to take a copy of the latlng bounds in the event before passing it to
                // flyToBounds.
                const flyTo = e.geocode.bbox
                const L = await import('leaflet/dist/leaflet-src.esm')
                const newBounds = new L.LatLngBounds(
                  new L.LatLng(
                    flyTo.getSouthWest().lat,
                    flyTo.getSouthWest().lng
                  ),
                  new L.LatLng(
                    flyTo.getNorthEast().lat,
                    flyTo.getNorthEast().lng
                  )
                )
                // Move the map to the location we've found.
                self.$refs.map.leafletObject.flyToBounds(newBounds)
                self.$emit('searched')
              }
            })
            .addTo(this.mapObject)
        } catch (e) {
          // This is usually caused by leaflet.
          console.log('Ignore leaflet exception', e)
        }
      }
    },
    clusterClick() {
      this.moved = true
      this.idle()
    },
    idle() {
      this.mapIdle++

      try {
        if (this.mapObject) {
          // We need to update the parent about our zoom level and whether we are showing the posts or groups.
          const bounds = this.mapObject.getBounds().toBBoxString()

          if (bounds !== this.lastBounds) {
            this.lastBounds = bounds

            if (this.showMessages) {
              this.getMessages()
            }
          }

          this.$emit('update:bounds', this.mapObject.getBounds())
          this.$emit('update:zoom', this.mapObject.getZoom())
          this.$emit('update:centre', this.mapObject.getCenter())
          this.$emit('idle', this.mapObject)
        }
      } catch (e) {
        console.error('Error in map idle', e)
      }
    },
    async getMessages() {
      let messages = []
      this.secondaryMessageList = []

      this.$emit('update:loading', true)

      let bounds = new window.L.LatLngBounds(this.initialBounds)

      if (this.mapObject) {
        // Get the messages from the server which are in the bounds of the map.
        bounds = this.mapObject.getBounds()

        if (this.mapObject.getZoom() < this.minZoom) {
          // The parent may  replace us with something else at this point, e.g. with a group map.  But maybe not.
          // Their call.
          this.$emit('minzoom', this.mapObject.getZoom())
        }
      }

      const swlat = bounds.getSouthWest().lat
      const swlng = bounds.getSouthWest().lng
      const nelat = bounds.getNorthEast().lat
      const nelng = bounds.getNorthEast().lng
      let ret = null

      if (this.moved) {
        // The map has been moved.
        if (this.search) {
          // Search within the bounds of the map.
          console.log('GetMessages - moved, search within map bounds')
          ret = await this.messageStore.search({
            messagetype: this.type,
            search: this.search,
            swlat,
            swlng,
            nelat,
            nelng,
          })
        } else {
          // Just fetch the bounds of the map.
          console.log('GetMessages - moved, fetch within map bounds')
          ret = await this.messageStore.fetchInBounds(
            swlat,
            swlng,
            nelat,
            nelng
          )
        }
      } else if (this.groupid) {
        // We have been asked to show a specific group.
        if (this.search) {
          // So search within that group.
          console.log('GetMessages - search on specific group')
          ret = await this.messageStore.search({
            messagetype: this.type,
            search: this.search,
            groupids: [this.groupid],
          })
        } else {
          // Just fetch that the messages on that group.
          console.log('GetMessages - fetch on specific group')
          ret = await this.messageStore.fetchMyGroups(this.groupid)

          if (!this.mapHidden) {
            // Fetch all the messages in the map bounds too, so that we can show others as secondary.
            // No need to bother if the map isn't showing - they don't appear in the post list.
            this.secondaryMessageList = await this.messageStore.fetchInBounds(
              swlat,
              swlng,
              nelat,
              nelng
            )
          }
        }
      } else if (this.authorityid) {
        // We are trying to show posts within a specific authority
        console.log('Get messages within authority')
        ret = await this.authorityStore.fetchMessages(this.authorityid)

        // Don't fetch the other messages - this may return so many it's too much load on the client.
      } else if (this.showIsochrones) {
        // We are trying to show posts nearby.
        if (this.isochrones?.length) {
          // We have isochrones.
          if (this.search) {
            // We don't have a search-within-isochones call.  But we can fetch all the messages in the isochrones,
            // and also search within the map, and take the intersection.
            console.log('GetMessages - search in isochrones')
            const isoret = await this.isochroneStore.fetchMessages()
            const searchret = await this.messageStore.search({
              messagetype: this.type,
              search: this.search,
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

            this.secondaryMessageList = searchret
          } else {
            // Fetch the messages in our isochrones.
            console.log('GetMessages - fetch in isochrones')
            ret = await this.isochroneStore.fetchMessages()

            // Fetch the messages in bounds too, so that we can show those as secondary.
            this.secondaryMessageList = await this.messageStore.fetchInBounds(
              swlat,
              swlng,
              nelat,
              nelng
            )
          }
        } else if (this.myGroups?.length) {
          // We don't, which will be because we don't have a location.
          // Use the bounding boxes of the groups we are in.
          const groupbounds = this.myGroupsBoundingBox

          if (this.search) {
            console.log('GetMessages - search within group bounds')
            ret = await this.messageStore.search({
              messagetype: this.type,
              search: this.search,
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

            if (this.lastBoundsFetch !== JSON.stringify(groupbounds)) {
              this.lastBoundsFetch = JSON.stringify(groupbounds)

              ret = await this.messageStore.fetchInBounds(
                groupbounds[0][0],
                groupbounds[0][1],
                groupbounds[1][0],
                groupbounds[1][1],
                this.groupid
              )
            } else {
              console.log('Already fetched that.')
            }
          }
        } else if (this.search) {
          // We have no isochrones and no groups.  Do nothing - we expect code elsewhere to prompt for a location.
          // Search within the bounds of the map.
          console.log(
            'GetMessages - no isochrones, no groups, search within map bounds'
          )
          ret = await this.messageStore.search({
            messagetype: this.type,
            search: this.search,
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
          ret = await this.messageStore.fetchInBounds(
            swlat,
            swlng,
            nelat,
            nelng
          )
        }
      } else if (this.myGroups?.length) {
        if (this.search) {
          const groupbounds = this.myGroupsBoundingBox

          console.log(
            'GetMessages - some groups, search within group bounds',
            groupbounds,
            this.myGroupIds
          )
          ret = await this.messageStore.search({
            messagetype: this.type,
            search: this.search,
            swlat: groupbounds[0][0],
            swlng: groupbounds[0][1],
            nelat: groupbounds[1][0],
            nelng: groupbounds[1][1],
            groupids: this.myGroupIds,
          })
        } else {
          // We have groups, so fetch the messages in those groups.
          console.log('GetMessages - some groups, fetch groups')
          ret = await this.messageStore.fetchMyGroups()

          // Get the messages in the map bounds too, so that we can show others as secondary.
          this.secondaryMessageList = await this.messageStore.fetchInBounds(
            swlat,
            swlng,
            nelat,
            nelng
          )
        }
      } else {
        // We have no groups, so fetch the messages in the map bounds.
        console.log('GetMessages - no groups, fetch in map bounds')
        ret = await this.messageStore.fetchInBounds(swlat, swlng, nelat, nelng)
      }

      if (ret && !this.destroyed) {
        messages = ret
      }

      if (messages?.length) {
        if (this.groupid) {
          messages = messages.filter((m) => {
            return m.groupid === this.groupid
          })
        }

        if (this.type !== 'All') {
          messages = messages.filter((m) => {
            return m.type === this.type
          })
        }
      }

      let countInBounds = 0

      messages.forEach((m) => {
        if (
          swlat <= m.lat &&
          m.lat <= nelat &&
          swlng <= m.lng &&
          m.lng <= nelng
        ) {
          countInBounds++
        }
      })

      if (this.isochroneOverride) {
        // Don't want to autozoom out in this case - stay where we're put.
        this.shownMany = true
      } else if (countInBounds >= this.manyToShow) {
        // We have seen lots, so we don't need to do the auto zoom out thing now.
        this.shownMany = true
      } else if (
        !this.search &&
        this.showMany &&
        countInBounds < this.manyToShow &&
        !this.shownMany
      ) {
        // If we haven't got more than 1 message at this zoom level, zoom out.  That means we'll always show at
        // least something.  This is useful when we search for a specific place.
        const currzoom = this.mapObject.getZoom()
        if (currzoom > this.minZoom) {
          console.log(
            'Not enough showing, zoom out',
            countInBounds,
            this.manyToShow,
            currzoom,
            this.minZoom
          )
          this.mapObject.setZoom(currzoom - 1)
          this.moved = true
        } else {
          this.shownMany = true
        }
      }

      this.messageList = messages || []
      this.$emit('messages', this.messageList)
      this.$emit('update:loading', false)

      return cloneDeep(messages)
    },
    onResize(x, y, width, height) {
      if (this.mapObject) {
        this.resizedHeight = height

        this.$nextTick(() => {
          this.mapObject.invalidateSize()

          // For some reason this doesn't always work immediately, so use a fallback too.
          setTimeout(() => {
            this.mapObject.invalidateSize()
          }, 1000)
        })
      }
    },
    async goHome() {
      await loadLeaflet()

      if (this.me.lat || this.me.lng) {
        this.mapObject.flyTo(new this.L.LatLng(this.me.lat, this.me.lng))
      }
    },
    toJSON(bounds) {
      return [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ]
    },
    dragEnd(e) {
      this.moved = true
      this.$emit('update:moved', true)
      this.idle()
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

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
