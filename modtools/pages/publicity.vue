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
<script>
import { usePublicityStore } from '@/stores/publicity'

export default {
  setup() {
    const publicityStore = usePublicityStore()
    return { publicityStore }
  },
  computed: {
    items() {
      const items = this.publicityStore.list

      if (items) {
        return Object.values(items).sort(function (a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
      }

      return []
    },
    popularPosts() {
      const items = this.publicityStore.popularposts

      if (items) {
        return Object.values(items).sort(function (a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
      }

      return []
    },
  },
  async mounted() {
    await this.publicityStore.clear()
    await this.publicityStore.fetch({ reviewed: 0 })
    console.log('Fetched publicity')
  },
}
</script>
