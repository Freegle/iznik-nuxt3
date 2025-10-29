<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <div class="bg-white p-4">
            <h1>Stories from Freeglers</h1>
            <p>This page lets you search through stories.</p>
          </div>
          <client-only>
            <div class="gcse-search"></div>
          </client-only>
          <ul class="list-unstyled">
            <li v-for="story in stories" :key="'story-' + story" class="mt-2">
              <nuxt-link :to="'/story/' + story">{{ story }}</nuxt-link>
            </li>
          </ul>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
    </div>
  </client-only>
</template>
<script setup>
import { useStoryStore } from '~/stores/stories'
import { buildHead } from '~/composables/useBuildHead'
import { useRoute } from '#imports'

const LIMIT = 10000

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const storyStore = useStoryStore()

await storyStore.fetchRecent(LIMIT)

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Story summary page',
    'Real stories from real freeglers.'
  )
)

const stories = computed(() => {
  return storyStore.recent
})

onMounted(() => {
  if (process.client) {
    const scr = document.createElement('script')
    scr.setAttribute(
      'src',
      'https://cse.google.com/cse.js?cx=424a23761185040ff'
    )
    window.document.head.appendChild(scr)
  }
})
</script>
