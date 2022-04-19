<template>
  <div>
    <b-row v-if="!group" class="m-0">
      <b-col cols="12" lg="6" class="p-0" offset-lg="3">
        <NoticeMessage variant="danger" class="mt-2">
          That community name is invalid - please check it.
        </NoticeMessage>
      </b-col>
    </b-row>
    <b-row v-else class="m-0">
      <b-col cols="12" lg="6" class="p-0" offset-lg="3">
        <ExploreGroup v-if="$route.params.id" :id="$route.params.id" />
      </b-col>
    </b-row>
  </div>
</template>
<script setup>
import { useGroupStore } from '~/stores/group'

const groupStore = useGroupStore()

// The first parameter needs to be a unique key.
// See https://stackoverflow.com/questions/71383166/rationale-behind-providing-a-key-in-useasyncdata-function
//
// We don't use lazy because we want the page to be rendered for SEO.
const route = useRoute()
const id = route.params.id

console.log('Load data')
const { data, refresh, pending } = await useAsyncData(
  'explore-' + route.params.id,
  async () => {
    console.log('Inside callback')
    return await groupStore.fetch(route.params.id)
    console.log('Callback end')
  },
  {
    lazy: false,
  }
)
console.log('Loaded', data, refresh, pending)
await refresh()
console.log("Refreshed")

// TODO Could we ensure all stores were available in every component?
// TODO Page loading not blocked?  Maybe works when built.
</script>

<script>
definePageMeta({
  layout: 'default',
})

export default {
  computed: {
    group() {
      return this.groupStore.get(this.id)
    },
  },
  mounted() {
    console.log('Page mounted')
  },
  // TODO Meta data
  // TODO Other versions of this page.
}
</script>
