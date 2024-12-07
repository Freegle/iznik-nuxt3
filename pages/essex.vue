<template>
  <client-only>
    <b-container fluid class="p-0 p-xl-2">
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pr-1" />
        <b-col cols="12" lg="6" class="p-0">
          <div>
            <div class="bg-white pb-2">
              <h1>
                <div class="d-flex justify-content-between">
                  <div class="ms-1 ms-md-2 flex-shrink-1">
                    Welcome to Essex Freegle!
                    <br />
                    <div class="subtitle">
                      All across Essex people are already saving pre-loved items
                      from going to landfill. Why not join them?
                    </div>
                  </div>
                  <div class="p-2 mr-2 mt-1">
                    <ExternalLink href="https://loveessex.org/">
                      <b-img
                        src="https://www.loveessex.org/themes/custom/love_essex/assets/images/logos/love-essex-logo-transparent.png"
                        alt="Love Essex logo"
                        class="bg-green"
                        width="150"
                      />
                    </ExternalLink>
                  </div>
                </div>
              </h1>
              <hr class="text-muted mt-0" />
              <p class="text-center font-weight-bold">
                Dive straight in! Give something away or ask for what you need.
                Everything on Freegle is completely free.
              </p>
              <GiveAsk />
              <p class="text-center font-weight-bold mt-1">
                Or scroll down for things other people are freegling.
              </p>
            </div>
            <client-only>
              <PostMapAndList
                v-if="initialBounds"
                :initial-bounds="initialBounds"
                class="mt-2"
                show-start-message
                :show-closest-groups="false"
                force-messages
                :isochrone-override="{
                  polygon: poly,
                }"
                :authorityid="authorityid"
                @idle="idle"
              />
            </client-only>
          </div>
        </b-col>
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pl-1" />
      </b-row>
    </b-container>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import Wkt from 'wicket'
import { buildHead } from '../../../composables/useBuildHead'
import { useAuthorityStore } from '~/stores/authority'
import { loadLeaflet } from '~/composables/useMap'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Explore Essex Freegle',
    "There are lots of lovely communities of freeglers in Essex. Shall we see what they're up to?",
    null,
    {
      class: 'overflow-y-scroll',
    }
  )
)

const authorityid = 117233

const authorityStore = useAuthorityStore()
const authority = await authorityStore.fetch(authorityid)
let poly = null
let obj = null

const initialBounds = ref(null)

onMounted(async () => {
  poly = authority.polygon

  await loadLeaflet()

  const wkt = new Wkt.Wkt()
  wkt.read(poly)
  obj = wkt.toObject()
  const bounds = obj.getBounds()

  initialBounds.value = [
    [bounds.getSouth(), bounds.getWest()],
    [bounds.getNorth(), bounds.getEast()],
  ]
})

const addedPolygon = ref(false)

function idle(map) {
  if (!addedPolygon.value) {
    obj.addTo(map)
    obj.setStyle({
      fillColor: 'blue',
      weight: 0,
      fillOpacity: 0.2,
    })

    addedPolygon.value = true
  }
}
</script>
<style scoped lang="scss">
.subtitle {
  font-size: 1rem;
  color: black;
}
</style>
