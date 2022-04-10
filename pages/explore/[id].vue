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
<script>
import { useGroupStore } from '~/stores/group'
import { useMiscStore } from '~/stores/misc'
import NoticeMessage from '~/components/NoticeMessage'
import ExploreGroup from '~/components/ExploreGroup'

definePageMeta({
  layout: 'default',
})

export default {
  components: {
    NoticeMessage,
    ExploreGroup,
  },
  setup() {
    // The first parameter needs to be a unique key.
    // See https://stackoverflow.com/questions/71383166/rationale-behind-providing-a-key-in-useasyncdata-function
    //
    // We don't use lazy because we want the page to be rendered for SEO.
    const route = useRoute()
    useAsyncData('explore-' + route.params.id, () =>
      groupStore.fetch(route.params.id)
    )

    // useLazyAsyncData('isochrone', () => isochroneStore.fetch())

    // TODO Could we ensure all stores were available in every component?
    // TODO Page loading not blocked.
    const groupStore = useGroupStore()
    const miscStore = useMiscStore()

    return { miscStore, groupStore }
  },
  computed: {
    group() {
      const route = useRoute()
      return this.groupStore.get(route.params.id)
    },
  },
  // TODO Meta data
  // TODO Other versions of this page.
}
</script>
