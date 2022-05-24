<template>
  <b-container fluid>
    <b-row class="m-0">
      <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pr-1" />
      <b-col cols="12" lg="6" class="p-0">
        <div v-if="place">
          <h1 class="sr-only">Freegling map near {{ place.name }}</h1>
          <client-only>
            <AdaptiveMap
              v-if="initialBounds"
              :initial-bounds="initialBounds"
              class="mt-2"
              show-start-message
            />
          </client-only>
        </div>
        <b-alert v-else show variant="danger">
          Something went wrong. Please contact us to let us know what you were
          trying to do.
          <ExternalLink href="mailto:support@ilovefreegle.org">
            support@ilovefreegle.org
          </ExternalLink>
        </b-alert>
      </b-col>
      <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pl-1" />
    </b-row>
  </b-container>
</template>
<script>
import ExternalLink from '../../../components/ExternalLink'
import { useGroupStore } from '~/stores/group'
const AdaptiveMap = () => import('../../../components/AdaptiveMap')
// TODO
// import buildHead from '@/mixins/buildHead.js'
// import loginOptional from '@/mixins/loginOptional.js'

export default {
  components: {
    ExternalLink,
    AdaptiveMap,
  },
  // mixins: [loginOptional, buildHead],
  async setup() {
    const groupStore = useGroupStore()
    const route = useRoute()
    const place = route.params.place ? JSON.parse(route.params.place) : null

    await groupStore.fetch()

    return { groupStore, place }
  },
  data() {
    return {
      initialBounds: null,
    }
  },
  // TODO
  // head() {
  //   return this.buildHead(
  //     'Explore Freegle',
  //     "There are lots of lovely communities of freeglers across the UK. Shall we see what they're up to?",
  //     null
  //   )
  // },
  mounted() {
    this.initialBounds = this.place ? this.place.bbox : null
  },
}
</script>
