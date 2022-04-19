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

const { data, refresh, pending } = await useAsyncData('explore-' + route.params.id, () => groupStore.fetch(route.params.id))

// Awaiting on refresh() seems to be necessary to make sure we wait until we've loaded the data before setup()
// completes.  That is necessary otherwise we won't render the page when generating.
await refresh()

// TODO Could we ensure all stores were available in every component?
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
  // TODO Meta data
  // TODO Other versions of this page.
}
</script>
