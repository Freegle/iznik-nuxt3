<template>
  <client-only>
    <b-container fluid class="p-0 p-xl-2">
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pr-1" />
        <b-col cols="12" lg="6" class="p-0">
          <div v-if="place">
            <h1 class="visually-hidden">Freegling map near {{ place.name }}</h1>
            <PostMapAndList
              v-if="initialBounds"
              :initial-bounds="initialBounds"
              class="mt-2"
              show-start-message
              :min-zoom="minZoom"
            />
          </div>
          <b-alert v-else :model-value="true" variant="danger">
            Something went wrong. Please contact us to let us know what you were
            trying to do at <SupportLink />
          </b-alert>
        </b-col>
        <b-col cols="0" lg="3" class="d-none d-lg-block p-0 pl-1" />
      </b-row>
    </b-container>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { defineAsyncComponent, useHead, useRuntimeConfig } from '#imports'
import SupportLink from '~/components/SupportLink'
import { useGroupStore } from '~/stores/group'

const PostMapAndList = defineAsyncComponent(() =>
  import('~/components/PostMapAndList')
)

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
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
const minZoom = place?.minZoom

await groupStore.fetch()
</script>
