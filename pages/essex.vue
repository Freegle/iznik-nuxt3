<template>
  <client-only>
    <b-container fluid class="p-0 p-xl-2">
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pr-1" />
        <b-col cols="12" lg="6" class="p-0">
          <div>
            <div class="bg-white pb-2">
              <div class="subtitle pl-2">
                <ExternalLink
                  href="https://loveessex.org/"
                  class="p-2 mr-2 mt-1 mb-1 float-end"
                >
                  <div class="imglayout">
                    <b-img
                      src="/essex/REUSE_Freegle.png"
                      alt="Image of freegling a pushchair"
                      class="pushchair"
                    />
                    <b-img
                      src="/essex/love-essex-logo-transparent.png"
                      alt="Love Essex logo"
                      class="logo"
                    />
                  </div>
                </ExternalLink>
                <p class="font-weight-bold">
                  <span class="d-none d-md-inline">
                    All across Essex people are already saving pre-loved items
                    from going to landfill. Why not join them?
                  </span>
                  <span class="d-inline d-md-none">
                    Across Essex people are saving pre-loved items from
                    landfill. Join in!
                  </span>
                </p>
                <p>
                  <span class="d-none d-md-inline">Dive straight in! </span>Give
                  <span class="d-none d-md-inline">something </span>away, ask
                  for what you need, or scroll down for things other people are
                  freegling.
                </p>
                <p class="font-weight-bold">
                  Everything on Freegle is completely free.
                </p>
              </div>
              <hr class="text-muted m-0 mb-1" />
              <GiveAsk />
              <client-only class="pl-2">
                <PlaceAutocomplete
                  class="mb-2"
                  labeltext="Or enter your location and we'll help you join your local
                  Freegle community."
                  labeltext-sr="Enter your location"
                  @selected="explorePlace($event)"
                />
              </client-only>
            </div>
            <client-only>
              <PostMapAndList
                v-if="initialBounds"
                :initial-bounds="initialBounds"
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
import { useRoute, useRouter } from 'vue-router'
import Wkt from 'wicket'
import { buildHead } from '~/composables/useBuildHead'
import { useAuthorityStore } from '~/stores/authority'
import { loadLeaflet } from '~/composables/useMap'
import { ref, onMounted, useHead, useRuntimeConfig } from '#imports'
import GiveAsk from '~/components/GiveAsk.vue'
import PlaceAutocomplete from '~/components/PlaceAutocomplete.vue'
import PostMapAndList from '~/components/PostMapAndList.vue'
import ExternalLink from '~/components/ExternalLink.vue'

console.log('Starting Essex page')
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Essex Freegle',
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

function explorePlace(place) {
  place.minZoom = 12
  router.push('/explore/place/' + JSON.stringify(place))
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.subtitle {
  font-size: 1rem;
  color: black;

  min-height: 200px;

  @include media-breakpoint-up(md) {
    min-height: 250px;
  }
}

.imglayout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  .logo {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    width: 70px;
    margin-left: 30px;

    @include media-breakpoint-up(md) {
      width: 100px;
      margin-left: 50px;
    }
  }

  .pushchair {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    height: 200px;

    @include media-breakpoint-up(md) {
      height: 250px;
    }
  }
}
</style>
