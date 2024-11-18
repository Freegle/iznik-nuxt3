<template>
  <div>
    <ScrollToTop />
    <NoticeMessage v-if="!stories || !stories.length" variant="info" class="mt-2">
      There are no stories to review at the moment.
    </NoticeMessage>
    <div v-for="story in stories" :key="'story-' + story.id" class="mt-2">
      <ModStoryReview :story="story" newsletter />
    </div>
  </div>
</template>
<script>

export default {
  components: {
  },
  computed: {
    stories() {
      /*const stories = this.$store.getters['stories/list']

      if (stories) {
        return Object.values(stories)
      }*/

      return []
    }
  },
  async fetch() {
    /*await this.$store.dispatch('stories/fetch', {
      newsletter: true
    })*/
  },

  methods: {}
}
</script>
