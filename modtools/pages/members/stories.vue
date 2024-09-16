<template>
  <div>
    <ScrollToTop />
    <NoticeMessage v-if="!stories || !stories.length" variant="info" class="mt-2">
      There are no stories to review at the moment.
    </NoticeMessage>
    <div v-for="story in stories" :key="'story-' + story.id" class="mt-2">
      <ModStoryReview :story="story" />
    </div>
  </div>
</template>
<script>
import { useStoryStore } from '@/stores/stories'

export default {
  async setup() {
    const storyStore = useStoryStore()
    return {
      storyStore,
    }
  },
  computed: {
    stories() {
      const stories = this.storyStore.list

      if (stories) {
        return Object.values(stories)
      }

      return []
    }
  },
  async mounted() {
    console.log('TODO stories.vue this.storyStore.fetchMT reviewed: 0 NOT GETTING THROUGH')
    await this.storyStore.fetchMT({
      reviewed: 0 // TODO Fix as removed by BaseAPI remving falsey values
    })
  },

  methods: {}
}
</script>
