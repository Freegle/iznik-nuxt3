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
      <l-tile-layer :url="mapTile" :attribution="mapAttribution" />
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
<script setup>
import VisualiseSpeech from './VisualiseSpeech'
import VisualiseUser from './VisualiseUser'
import VisualiseMessage from './VisualiseMessage'
import { ref, computed, onBeforeUnmount, useRuntimeConfig } from '#imports'
import api from '~/api'
import { attribution, osmtile, getDistance } from '~/composables/useMap'

// We can only render this on the client. Pre-render fails, and vue-leaflet doesn't seem to render the map in
// any case. See https://github.com/vue-leaflet/vue-leaflet/discussions/208.
if (process.client) {
  await import('leaflet/dist/leaflet-src.esm')
}

const mapTile = osmtile()
const mapAttribution = attribution()

const mapcont = ref(null)
const map = ref(null)
const fromuser = ref(null)
const touser = ref(null)
const message = ref(null)

const timer = ref(null)
const center = ref([53.945, -2.5209])
const zoom = ref(8)
const context = ref(null)
const running = ref(true)
const list = ref([])
const state = ref(0)

const delayBeforePost = 1000
const delayBeforeReply = 500
const delayBeforeCollect = 2000
const delayBeforeReturn = 2000
const delayBeforeThanks = 1000
const delayBeforeNext = 2000

const showFrom = ref(false)
const showMessage = ref(false)
const showReplies = ref(false)
const showTo = ref(false)
const showOthers = ref(false)
const showThanks = ref(true)

const thanksText = [
  'Thanks!',
  'Cheers!',
  'Lovely!',
  'So kind!',
  'Ta very much!',
  'Nice one!',
  'Brilliant!',
]

const replyText = [
  'Yes please!',
  "I'd love that!",
  'Oooh, lovely!',
  'May I collect?',
  'Me please!',
  'Perfect!',
]

const item = computed(() => {
  return list.value?.length ? list.value[0] : null
})

const text = computed(() => {
  if (!item.value) return ''

  return thanksText[
    // Reference item.id so that we generate a different message each time.
    Math.floor(Math.random() * thanksText.length) +
      item.value.id -
      item.value.id
  ]
})

function idle(mapObj) {
  if (running.value && list.value.length === 0) {
    doNext()
  }
}

function moveend() {
  switch (state.value) {
    case 0: {
      // We have flown to the from location. Show the posting user.
      showFrom.value = true
      timer.value = setTimeout(() => {
        showMessage.value = true
        timer.value = setTimeout(() => {
          // Show all the repliers
          showTo.value = true
          showOthers.value = true
          timer.value = setTimeout(() => {
            // Show the reply text.
            showReplies.value = true
            timer.value = setTimeout(() => {
              // Collect - move the touser to the fromuser's location, stop showing the other replies.
              showOthers.value = false
              showReplies.value = false
              if (touser.value) {
                touser.value.setLatLng(item.value.fromlat, item.value.fromlng)
                timer.value = setTimeout(() => {
                  if (touser.value && item.value && message.value) {
                    touser.value.setLatLng(item.value.tolat, item.value.tolng)
                    message.value.setLatLng(item.value.tolat, item.value.tolng)
                    timer.value = setTimeout(() => {
                      showMessage.value = false
                      showThanks.value = true
                      timer.value = setTimeout(() => {
                        list.value.shift()
                        doNext()
                      }, delayBeforeNext)
                    }, delayBeforeThanks + 2000)
                  }
                }, delayBeforeReturn)
              }
            }, delayBeforeCollect)
          }, delayBeforeReply)
        }, delayBeforeReply)
      }, delayBeforePost)
      break
    }
  }
}

function flyToFromUser() {
  state.value = 0

  if (list.value.length) {
    if (map.value) {
      map.value.leafletObject.flyToBounds(itemBounds(list.value[0]), 14)
    }
  }
}

function itemBounds(item) {
  // Calculate the bounds which show all the people who replied.
  const lats = []
  const lngs = []

  lats.push(item.fromlat)
  lats.push(item.tolat)
  lngs.push(item.fromlng)
  lngs.push(item.tolng)

  item.others.forEach((o) => {
    // Get distance from the poster. Sometimes we get replies from far away which makes the map look silly, so
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
}

async function doNext() {
  showFrom.value = false
  showMessage.value = false
  showTo.value = false
  showOthers.value = false
  showThanks.value = false
  showReplies.value = false

  if (map.value?.leafletObject) {
    const mapBounds = map.value.leafletObject.getBounds()

    if (list.value.length === 0) {
      // Get some more.
      const runtimeConfig = useRuntimeConfig()
      const ret = await api(runtimeConfig).visualise.fetch({
        swlat: mapBounds.getSouthWest().lat,
        swlng: mapBounds.getSouthWest().lng,
        nelat: mapBounds.getNorthEast().lat,
        nelng: mapBounds.getNorthEast().lng,
        context: context.value,
      })

      if (ret.ret === 0) {
        context.value = ret.context
        list.value = ret.list
      } else {
        running.value = false
      }
    }

    flyToFromUser()
  }
}

function reply(id) {
  if (!item.value) return ''

  // Reference id so that we generate a different message each time.
  return replyText[(id % replyText.length) + item.value.id - item.value.id]
}

onBeforeUnmount(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
})
</script>
<style scoped lang="scss">
.ourpopup {
  color: $colour-success;
  font-weight: bold;
}
</style>
