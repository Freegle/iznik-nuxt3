<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <div class="bg-white p-4">
            <h1>
              Stories from Freeglers<span v-if="authorityname">
                on {{ authorityname }}</span
              >
            </h1>
            <p>
              We love to hear why you freegle and what your experiences have
              been - and it helps show new freeglers what it's all about.
            </p>
            <p>So please tell us your story!</p>
            <b-button variant="primary" class="mt-2" @click="showAddModal">
              <v-icon icon="book-open" /> Tell us your story!
            </b-button>
          </div>
          <div
            v-for="story in sortedStories"
            :key="'story-' + story.id"
            class="mt-2"
          >
            <StoryOne :id="story.id" />
          </div>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
      <StoryAddModal ref="addmodal" />
    </div>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import { useStoryStore } from '../../../stores/stories'
import { buildHead } from '../../../composables/useBuildHead'
import { useAuthorityStore } from '../../../stores/authority'

const StoryAddModal = () => import('~/components/StoryAddModal')
const StoryOne = () => import('~/components/StoryOne')

const LIMIT = 20

export default {
  components: {
    StoryAddModal,
    StoryOne,
  },
  async setup(props) {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()
    const storyStore = useStoryStore()
    const authorityStore = useAuthorityStore()

    const authorityid = route.params.id ? parseInt(route.params.id) : null
    const limit = parseInt(route.query.limit) || LIMIT

    storyStore.list = {}
    await storyStore.fetchByAuthority(authorityid, limit)
    const authority = await authorityStore.fetch(authorityid)

    useHead(
      buildHead(
        route,
        runtimeConfig,
        authority?.authorityname
          ? 'Stories for ' + authority?.authorityname
          : 'Stories from freeglers',
        'Real stories from real freeglers.'
      )
    )

    return {
      storyStore,
      authorityStore,
      authorityid,
      authority,
      authorityname: authority?.authorityname,
    }
  },
  computed: {
    sortedStories() {
      if (this.stories?.length) {
        const stories = this.stories
        return stories.sort(function (a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
      }

      return []
    },
  },
  methods: {
    showAddModal() {
      this.$refs.addmodal.show()
    },
  },
}
</script>
