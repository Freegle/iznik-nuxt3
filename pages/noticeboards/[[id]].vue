<template>
  <div>
    <b-row class="m-0">
      <b-col cols="0" md="3" class="d-none d-md-block" />
      <b-col cols="12" md="6" class="p-0">
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
                  :max-zoom="17"
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
      <b-col cols="0" md="3" class="d-none d-md-block" />
    </b-row>
    <client-only>
      <PosterModal ref="modal" />
    </client-only>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import ExternalLink from '~/components/ExternalLink'
import { loadLeaflet, attribution, osmtile } from '~/composables/useMap'
import NoticeboardDetails from '~/components/NoticeboardDetails'
import { buildHead } from '~/composables/useBuildHead'
import { useNoticeboardStore } from '~/stores/noticeboard'
import PosterModal from '~/components/PosterModal'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const id = route.params.id ? parseInt(route.params.id) : null
const noticeboardStore = useNoticeboardStore()

await noticeboardStore.clear()

const noticeboard = computed(() => (id ? noticeboardStore.byId(id) : null))
const noticeboards = computed(() => noticeboardStore.list)

if (!id || !noticeboardStore.list?.length) {
  await noticeboardStore.fetch()

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

const mapWidth = computed(() => {
  let width = 0

  if (process.client) {
    width = Math.floor(window.innerHeight / 2)
    width = width < 200 ? 200 : width
  }

  return width
})
</script>
<script>
export default {
  data() {
    return {
      center: [53.945, -2.5209],
    }
  },
  computed: {},
  async mounted() {
    await loadLeaflet()
  },
  methods: {
    async added() {
      await this.waitForRef('modal')
      this.$refs.modal.show()
    },
    goto(id) {
      this.$router.push('/noticeboards/' + id)
    },
  },
}
</script>
