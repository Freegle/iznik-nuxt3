<template>
  <div>
    <ScrollToTop />
    <NoticeMessage
      v-if="!stories || !stories.length"
      variant="info"
      class="mt-2"
    >
      There are no stories to review at the moment.
    </NoticeMessage>
    <div v-for="story in stories" :key="'story-' + story.id" class="mt-2">
      <ModStoryReview :story="story" newsletter />
    </div>
  </div>
</template>
<script>
import { useStoryStore } from '~/stores/stories'
export default {
  setup() {
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
    },
  },
  async mounted() {
    console.log('newsletter mounted')
    await this.storyStore.fetchMT({
      newsletter: true,
      dontzapfalsey: true, // Stop BaseAPI from removing above zero value
    })
  },
  methods: {},
}
</script>
