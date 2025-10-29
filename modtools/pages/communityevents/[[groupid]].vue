<template>
  <div>
    <div
      v-for="event in events"
      :key="'eventlist-' + event.id"
      class="p-0 mt-2"
    >
      <ModCommunityEvent :event="event" />
    </div>
    <NoticeMessage v-if="!Object.keys(events).length && !busy" class="mt-2">
      There are no community events to review at the moment. This will refresh
      automatically.
    </NoticeMessage>

    <infinite-loading
      force-use-infinite-wrapper="body"
      :distance="distance"
      @infinite="loadMore"
    >
      <template #no-results />
      <template #no-more />
      <template #spinner>
        <b-img lazy src="/loader.gif" alt="Loading" />
      </template>
    </infinite-loading>
  </div>
</template>
<script>
import { useCommunityEventStore } from '~/stores/communityevent'
import { useAuthStore } from '@/stores/auth'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  setup() {
    const communityEventStore = useCommunityEventStore()
    const miscStore = useMiscStore()
    return { communityEventStore, miscStore }
  },
  data: function () {
    return {
      distance: 1000,
      busy: false,
    }
  },
  computed: {
    events() {
      return Object.values(this.communityEventStore.list).filter(
        (e) => e !== null
      )
    },
    work() {
      // Count for the type of work we're interested in.
      const authStore = useAuthStore()
      const work = authStore.work
      if (!work) return 0
      // console.log('TODO communityevents work', work.pendingevents)
      return work.pendingevents
    },
  },
  watch: {
    work(newVal, oldVal) {
      // TODO: The page is always going to be visible so why might we not be?
      console.log('TODO communityevents work changed', newVal, oldVal)
      if (newVal > oldVal) {
        // There's new stuff to do.  Reload.
        // TODO this.communityEventStore.clear()
      } else {
        /* In Nuxt 2 miscStore visible was set if we are visible
        const visible = this.miscStore.get('visible')
        if (!visible) {
          this.communityEventStore.clear()
        } */
      }
    },
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    // We don't want to pick up any approved events.
    this.communityEventStore.clear()
  },
  methods: {
    loadMore: async function ($state) {
      this.busy = true

      await this.communityEventStore.fetchMT({
        context: null,
        limit: 0,
        pending: true,
      })
      this.complete = true
      $state.complete()
      this.busy = false
    },
  },
}
</script>
<style scoped lang="scss">
//@import 'color-vars';
</style>
