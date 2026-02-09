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
      <ModStoryReview :story="story" />
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { useStoryStore } from '@/stores/stories'

const storyStore = useStoryStore()

const stories = computed(() => {
  const storyList = storyStore.list

  if (storyList) {
    return Object.values(storyList)
  }

  return []
})

onMounted(async () => {
  // V2: fetch unreviewed stories for moderation
  await storyStore.fetchMT({
    reviewed: 0,
  })
})
</script>
