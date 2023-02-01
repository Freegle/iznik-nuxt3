<template>
  <client-only>
    <div>
      <b-row v-if="invalid" class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <NoticeMessage variant="danger" class="mt-2">
            Sorry, that story isn't around any more.
          </NoticeMessage>
        </b-col>
      </b-row>
      <b-row v-else class="m-0">
        <b-col cols="0" md="3" class="d-none d-md-block" />
        <b-col cols="12" md="6" class="p-0">
          <div class="bg-white p-4">
            <p>
              We love to hear why you freegle and what your experiences have
              been - and it helps show new freeglers what it's all about.
            </p>
            <p>So please tell us your story!</p>
            <b-button variant="primary" @click="showAddModal">
              <v-icon icon="book-open" /> Tell us your story!
            </b-button>
          </div>
          <StoryOne :id="story.id" class="mt-2" />
          <b-button variant="secondary" to="/stories" class="mt-2">
            View more stories
          </b-button>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
      <StoryAddModal ref="addmodal" />
    </div>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import NoticeMessage from '../../components/NoticeMessage'
import { buildHead } from '../../composables/useBuildHead'
import { useStoryStore } from '../../stores/stories'
import StoryOne from '~/components/StoryOne'
const StoryAddModal = () => import('~/components/StoryAddModal')

export default {
  components: {
    NoticeMessage,
    StoryAddModal,
    StoryOne,
  },
  async setup(props) {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()
    const storyStore = useStoryStore()

    const id = parseInt(route.params.id)

    let invalid = false
    let story = null

    try {
      story = await storyStore.fetch(id)
    } catch (e) {
      invalid = true
    }

    if (invalid) {
      useHead(buildHead(route, useRuntimeConfig(), 'Story #' + id))
    } else {
      useHead(
        buildHead(
          route,
          runtimeConfig,

          story ? 'Freegle Story: ' + story.headline : 'Freegle Stories',
          story.story,
          story.photo
        )
      )
    }

    return {
      id,
      story,
      storyStore,
      invalid,
    }
  },
  methods: {
    showAddModal() {
      this.$refs.addmodal.show()
    },
  },
}
</script>
