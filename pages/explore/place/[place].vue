<template>
  <client-only>
    <b-container fluid>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pr-1" />
        <b-col cols="12" lg="6" class="p-0">
          <div v-if="place">
            <h1 class="sr-only">Freegling map near {{ place.name }}</h1>
            <AdaptiveMap
              v-if="initialBounds"
              :initial-bounds="initialBounds"
              class="mt-2"
              show-start-message
            />
          </div>
          <b-alert v-else show variant="danger">
            Something went wrong. Please contact us to let us know what you were
            trying to do at <SupportLink />
          </b-alert>
        </b-col>
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pl-1" />
      </b-row>
    </b-container>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import SupportLink from '../../../components/SupportLink'
import { buildHead } from '../../../composables/useBuildHead'
import { useGroupStore } from '~/stores/group'
const AdaptiveMap = () => import('../../../components/AdaptiveMap')

export default {
  components: {
    SupportLink,
    AdaptiveMap,
  },
  async setup() {
    const route = useRoute()

    useHead(
      buildHead(
        route,
        'Explore Freegle',
        "There are lots of lovely communities of freeglers across the UK. Shall we see what they're up to?",
        null,
        {
          class: 'overflow-y-scroll',
        }
      )
    )

    const groupStore = useGroupStore()
    const place = route.params.place ? JSON.parse(route.params.place) : null
    const initialBounds = place && place.bbox ? place.bbox : null

    await groupStore.fetch()

    return { groupStore, place, initialBounds }
  },
}
</script>
