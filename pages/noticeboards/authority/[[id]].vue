<template>
  <div>
    <b-row class="m-0">
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
      <b-col cols="12" lg="6" class="p-0">
        <div>
          <h1>Noticeboards in {{ authority.name }}</h1>
          <p>
            Here's where people have put up posters within
            {{ authority.name }}.
            <strong>Knowing where these are really helps us</strong>, because we
            can ask other freeglers to keep them up to date.
          </p>
          <div ref="mapcont" class="mt-4">
            <client-only>
              <l-map
                ref="map"
                :zoom="5"
                :style="'width: ' + mapWidth + '; height: ' + mapWidth + 'px'"
                :min-zoom="5"
                :max-zoom="maxZoom"
                :bounds="bounds"
                @ready="setBounds"
              >
                <l-tile-layer :url="osmtile()" :attribution="attribution()" />
                <l-marker
                  v-for="n in noticeboards"
                  :key="'marker-' + n.id"
                  :lat-lng="[n.lat, n.lng]"
                  :interactive="false"
                  :title="n.name"
                  @click="goto(n.id)"
                >
                  <l-icon icon-url="/mapmarker.gif" :icon-size="[15, 19]" />
                  <l-geojson
                    :geojson="authorityArea"
                    :options="{
                      style: {
                        color: 'blue',
                        weight: 2,
                        fillColor: 'transparent',
                      },
                    }"
                  />
                </l-marker>
                <l-marker
                  v-for="n in members"
                  :key="'member-' + n.id"
                  :lat-lng="[n.lat, n.lng]"
                  :interactive="false"
                >
                  <l-icon icon-url="/blurmarker.png" :icon-size="[15, 15]" />
                </l-marker>
              </l-map>
            </client-only>
          </div>
        </div>
      </b-col>
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
    </b-row>
  </div>
</template>
<script setup>
import Wkt from 'wicket'
import { onMounted, useRouter, useRoute } from '#imports'
import { loadLeaflet, attribution, osmtile } from '~/composables/useMap'
import { buildHead } from '~/composables/useBuildHead'
import { useNoticeboardStore } from '~/stores/noticeboard'
import { useAuthorityStore } from '~/stores/authority'
import { MAX_MAP_ZOOM } from '~/constants'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const id = route.params.id ? parseInt(route.params.id) : null
const noticeboardStore = useNoticeboardStore()
const authorityStore = useAuthorityStore()

await noticeboardStore.clear()

const authority = await authorityStore.fetch(id)

const noticeboards = computed(() => noticeboardStore.list)
const members = computed(() => noticeboardStore.members)

await noticeboardStore.fetchAuthority(id)

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Noticeboards in ' + authority.name,
    "We're building a map of noticeboards across the UK and putting Freegle posters on them.  Help us!"
  )
)

const mapWidth = computed(() => {
  let width = 0

  if (process.client) {
    width = Math.floor(window.innerHeight / 2)
    width = width < 200 ? 200 : width
  }

  return width
})

const wkt = new Wkt.Wkt()
wkt.read(authority.polygon)
const authorityArea = wkt.toJson()

const L = await import('leaflet/dist/leaflet-src.esm')

const map = ref(null)
const bounds = ref(null)

onMounted(async () => {
  await loadLeaflet()
})

const setBounds = () => {
  // eslint-disable-next-line new-cap
  bounds.value = new L.geoJSON(authorityArea).getBounds().pad(0.1)
}

function goto(id) {
  const router = useRouter()
  router.push('/noticeboards/' + id)
}

const maxZoom = MAX_MAP_ZOOM
</script>
