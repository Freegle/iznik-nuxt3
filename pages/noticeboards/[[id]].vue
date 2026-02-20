<template>
  <div>
    <b-row class="m-0">
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
      <b-col cols="12" lg="6" class="p-0">
        <div>
          <div v-if="id" class="bg-white">
            <NoticeboardDetails :id="id" />
          </div>
          <div v-else>
            <h1>Noticeboards</h1>
            <p>
              Here's where people have put up posters.
              <strong>Knowing where these are really helps us</strong>, because
              we can ask other freeglers to keep them up to date.
            </p>
            <p>
              So please put up posters - and let us know where you put them.
            </p>
            <div class="d-flex justify-content-between">
              <ExternalLink href="https://freegle.in/A4Poster">
                <b-button variant="primary" size="lg">
                  Download poster
                </b-button>
              </ExternalLink>
              <b-button variant="secondary" size="lg" @click="added">
                I put up a poster!
              </b-button>
            </div>
            <div ref="mapcont" class="mt-4">
              <client-only>
                <l-map
                  ref="map"
                  :zoom="5"
                  :center="center"
                  :style="'width: ' + mapWidth + '; height: ' + mapWidth + 'px'"
                  :min-zoom="5"
                  :max-zoom="maxZoom"
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
                  </l-marker>
                </l-map>
              </client-only>
            </div>
          </div>
        </div>
      </b-col>
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
    </b-row>
    <client-only>
      <PosterModal v-if="showPosterModal" @hidden="showPosterModal = false" />
    </client-only>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExternalLink from '~/components/ExternalLink'
import { loadLeaflet, attribution, osmtile } from '~/composables/useMap'
import NoticeboardDetails from '~/components/NoticeboardDetails'
import { buildHead } from '~/composables/useBuildHead'
import { useNoticeboardStore } from '~/stores/noticeboard'
import { MAX_MAP_ZOOM } from '~/constants'

const PosterModal = defineAsyncComponent(() =>
  import('~/components/PosterModal')
)

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const id = route.params.id ? parseInt(route.params.id) : null
const noticeboardStore = useNoticeboardStore()

// State
const center = ref([53.945, -2.5209])
const showPosterModal = ref(false)

// Computed
const noticeboard = computed(() => (id ? noticeboardStore.byId(id) : null))
const noticeboards = computed(() => noticeboardStore.list)
const maxZoom = MAX_MAP_ZOOM

const mapWidth = computed(() => {
  let width = 0

  if (process.client) {
    width = Math.floor(window.innerHeight / 2)
    width = width < 200 ? 200 : width
  }

  return width
})

// Methods
const added = () => {
  showPosterModal.value = true
}

const goto = (noteboardId) => {
  router.push('/noticeboards/' + noteboardId)
}

// Setup
await noticeboardStore.clear()

if (!id || !noticeboardStore.list?.length) {
  await noticeboardStore.fetchList()

  useHead(
    buildHead(
      route,
      runtimeConfig,
      'Noticeboards',
      "We're building a map of noticeboards across the UK and putting Freegle posters on them.  Help us!"
    )
  )
} else {
  useHead(
    buildHead(
      route,
      runtimeConfig,
      'Noticeboard: ' + noticeboard?.value?.name,
      noticeboard?.value?.description
    )
  )
}

onMounted(async () => {
  await loadLeaflet()
})
</script>
