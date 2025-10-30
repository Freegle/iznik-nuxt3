<template>
  <div>
    <NewsUserIntro v-if="userid" :userid="userid" :newsfeed="newsfeed" />
    <!-- eslint-disable-next-line-->
    <p>

    </p>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useNewsfeedStore } from '~/stores/newsfeed'
import NewsUserIntro from '~/components/NewsUserIntro'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const newsfeedStore = useNewsfeedStore()

const newsfeed = computed(() => {
  return newsfeedStore.byId(props.id)
})

const userid = computed(() => {
  return newsfeed.value?.userid
})
</script>
