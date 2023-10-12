<template>
  <div ref="mapcont" class="d-flex">
    <l-map
      ref="map"
      v-model:zoom="zoom"
      v-model:center="center"
      :options="{
        zoomControl: false,
        scrollWheelZoom: false,
        bounceAtZoomLimits: true,
      }"
      :min-zoom="8"
      :max-zoom="15"
      class="flex-grow-1"
      @moveend="moveend"
      @ready="idle"
    >
      <l-tile-layer :url="osmtile" :attribution="attribution" />
      <div v-if="item">
        <VisualiseUser
          v-if="showFrom && item"
          :id="item.from.id"
          ref="fromuser"
          :lat="item.fromlat"
          :lng="item.fromlng"
          :icon="item.from.icon"
        />
        <VisualiseSpeech
          v-if="showReplies && item"
          :lat-lng="[item.tolat, item.tolng]"
          :text="reply(item.to.id)"
          class-name="clear"
          :popup-anchor="[-50, -50]"
          :z-index-offset="1000"
        />
        <VisualiseUser
          v-if="showTo && item"
          :id="item.to.id"
          ref="touser"
          :lat="item.tolat"
          :lng="item.tolng"
          :icon="item.to.icon"
          :z-index-offset="1000"
        />
        <div v-if="showOthers">
          <VisualiseUser
            v-for="other in item.others"
            :id="other.id"
            :key="'other-' + other.id"
            :lat="other.lat"
            :lng="other.lng"
            :icon="other.icon"
          />
        </div>
        <div v-if="showReplies">
          <VisualiseSpeech
            v-for="other in item.others"
            :key="'otherreply-' + other.id"
            :lat-lng="[other.lat, other.lng]"
            :text="reply(other.id)"
            class-name="clear"
            :popup-anchor="[-50, -50]"
            :z-index-offset="1000"
          />
        </div>
        <VisualiseMessage
          v-if="showMessage"
          :id="item.msgid"
          ref="message"
          :icon="item.attachment.thumb"
          :lat="item.fromlat"
          :lng="item.fromlng"
        />
        <VisualiseSpeech
          v-if="item && showThanks"
          :lat-lng="[item.tolat, item.tolng]"
          :text="text"
          class-name="clear"
          :popup-anchor="[-50, -50]"
        />
      </div>
    </l-map>
  </div>
</template>
<script>
import VisualiseSpeech from './VisualiseSpeech'
import api from '~/api'

import { attribution, osmtile, getDistance } from '~/composables/useMap'

export default {
  components: {
    VisualiseSpeech,
  },
  async setup() {
    let L = null

    // We can only render this on the client.  Pre-render fails, and vue-leaflet doesn't seem to render the map in
    // any case.  See https://github.com/vue-leaflet/vue-leaflet/discussions/208.
    if (process.client) {
      L = await import('leaflet/dist/leaflet-src.esm')
    }

    return {
      L,
      osmtile: osmtile(),
      attribution: attribution(),
    }
  },
  data() {
    return {
      center: [53.945, -2.5209],
      zoom: 8,
      bounds: null,
      context: null,
      running: true,
      index: 0,
      list: [],
      delayBeforePost: 1000,
      delayBeforeReply: 500,
      delayBeforeCollect: 2000,
      delayBeforeReturn: 2000,
      delayBeforeThanks: 1000,
      delayBeforeNext: 2000,
      showFrom: false,
      showMessage: false,
      showReplies: false,
      showTo: false,
      showOthers: false,
      showThanks: true,
      thanksText: [
        'Thanks!',
        'Cheers!',
        'Lovely!',
        'So kind!',
        'Ta very much!',
        'Nice one!',
        'Brilliant!',
      ],
      replyText: [
        'Yes please!',
        "I'd love that!",
        'Oooh, lovely!',
        'May I collect?',
        'Me please!',
        'Perfect!',
      ],
    }
  },
  computed: {
    item() {
      return this.list?.length ? this.list[0] : null
    },
    text() {
      return this.thanksText[
        // Reference item.id so that we generate a different message each time.
        Math.floor(Math.random() * this.thanksText.length) +
          this.item.id -
          this.item.id
      ]
    },
  },
  methods: {
    idle(map) {
      if (this.running && this.list.length === 0) {
        this.doNext()
      }
    },
    moveend() {
      switch (this.state) {
        case 0: {
          // We have flown to the from location.  Show the posting user.
          this.showFrom = true
          setTimeout(() => {
            this.showMessage = true
            setTimeout(() => {
              // Show all the repliers
              this.showTo = true
              this.showOthers = true
              setTimeout(() => {
                // Show the reply text.
                this.showReplies = true
                setTimeout(() => {
                  // Collect - move the touser to the fromuser's location, stop showing the other replies.
                  this.showOthers = false
                  this.showReplies = false
                  this.$refs.touser.setLatLng(
                    this.item.fromlat,
                    this.item.fromlng
                  )
                  setTimeout(() => {
                    if (this.$refs.touser && this.item) {
                      this.$refs.touser.setLatLng(
                        this.item.tolat,
                        this.item.tolng
                      )
                      this.$refs.message.setLatLng(
                        this.item.tolat,
                        this.item.tolng
                      )
                      setTimeout(() => {
                        this.showMessage = false
                        this.showThanks = true
                        setTimeout(() => {
                          this.list.shift()
                          this.doNext()
                        }, this.delayBeforeNext)
                      }, this.delayBeforeThanks + 2000)
                    }
                  }, this.delayBeforeReturn)
                }, this.delayBeforeCollect)
              }, this.delayBeforeReply)
            }, this.delayBeforeReply)
          }, this.delayBeforePost)
          break
        }
      }
    },
    flyToFromUser() {
      this.state = 0

      if (this.list.length) {
        if (this.$refs.map) {
          this.$refs.map.leafletObject.flyToBounds(
            this.itemBounds(this.list[0]),
            14
          )
        }
      }
    },
    itemBounds(item) {
      // Calculate the bounds which show all the people who replied.
      const lats = []
      const lngs = []

      lats.push(item.fromlat)
      lats.push(item.tolat)
      lngs.push(item.fromlng)
      lngs.push(item.tolng)

      item.others.forEach((o) => {
        // Get distance from the poster.  Sometimes we get replies from far away which makes the map look silly, so
        // exclude those.
        const dist = getDistance([item.fromlat, item.fromlng], [o.lat, o.lng])

        if (dist < 20000) {
          lats.push(o.lat)
          lngs.push(o.lng)
        }
      })

      const minlat = Math.min.apply(null, lats) - 0.01
      const maxlat = Math.max.apply(null, lats) + 0.01
      const minlng = Math.min.apply(null, lngs) - 0.01
      const maxlng = Math.max.apply(null, lngs) + 0.01

      return [
        [minlat, minlng],
        [maxlat, maxlng],
      ]
    },
    async doNext() {
      this.showFrom = false
      this.showMessage = false
      this.showTo = false
      this.showOthers = false
      this.showThanks = false
      this.showReplies = false

      if (this.$refs?.map?.leafletObject) {
        const bounds = this.$refs.map.leafletObject.getBounds()

        if (this.list.length === 0) {
          // Get some more.
          const runtimeConfig = useRuntimeConfig()
          const ret = await api(runtimeConfig).visualise.fetch({
            swlat: bounds.getSouthWest().lat,
            swlng: bounds.getSouthWest().lng,
            nelat: bounds.getNorthEast().lat,
            nelng: bounds.getNorthEast().lng,
            context: this.context,
          })

          if (ret.ret === 0) {
            this.context = ret.context
            this.list = ret.list
          } else {
            this.running = false
          }
        }

        this.flyToFromUser()
      }
    },
    reply(id) {
      // Reference id so that we generate a different message each time.
      return this.replyText[
        (id % this.replyText.length) + this.item.id - this.item.id
      ]
    },
  },
}
</script>
<style scoped lang="scss">
.ourpopup {
  color: $colour-success;
  font-weight: bold;
}
</style>
