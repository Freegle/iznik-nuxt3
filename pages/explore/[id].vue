<template>
  <div>
    <b-row v-if="!group" class="m-0">
      <b-col cols="12" lg="6" class="p-0" offset-lg="3">
        <NoticeMessage variant="danger" class="mt-2">
          Sorry, we don't recognise that community name.
        </NoticeMessage>
      </b-col>
    </b-row>
    <b-row v-else class="m-0">
      <b-col cols="12" lg="6" class="p-0" offset-lg="3">
        <ExploreGroup v-if="id" :id="id" />
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { useGroupStore } from '~/stores/group'

definePageMeta({
  layout: 'default',
})

export default {
  async setup() {
    const groupStore = useGroupStore()

    // The first parameter needs to be a unique key.
    // See https://stackoverflow.com/questions/71383166/rationale-behind-providing-a-key-in-useasyncdata-function
    //
    // We don't use lazy because we want the page to be rendered for SEO.
    const route = useRoute()
    const id = route.params.id

    await groupStore.fetch(route.params.id)

    return { id, groupStore }
  },
  computed: {
    group() {
      return this.groupStore.get(this.id)
    },
  },
  // TODO Meta data
  // TODO Other versions of this page.
}
</script>
