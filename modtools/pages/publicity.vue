<template>
  <div>
    <ModHelpPublicity />
    <ModMissingFacebook />
    <NoticeMessage
      v-if="
        (!items || !items.length) && (!popularPosts || !popularPosts.length)
      "
      variant="info"
      class="mt-2"
    >
      There are no publicity items to review at the moment.
    </NoticeMessage>
    <div v-for="item in items" :key="'item-' + item.id" class="mt-2">
      <ModSocialAction :item="item" />
    </div>
    <div v-for="item in popularPosts" :key="'item-' + item.id" class="mt-2">
      <ModPopularPost :item="item" />
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { usePublicityStore } from '@/stores/publicity'

const publicityStore = usePublicityStore()

const items = computed(() => {
  const itemList = publicityStore.list

  if (itemList) {
    return Object.values(itemList).sort(function (a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }

  return []
})

const popularPosts = computed(() => {
  const itemList = publicityStore.popularposts

  if (itemList) {
    return Object.values(itemList).sort(function (a, b) {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }

  return []
})

onMounted(async () => {
  await publicityStore.clear()
  await publicityStore.fetch({ reviewed: 0 })
  console.log('Fetched publicity')
})
</script>
