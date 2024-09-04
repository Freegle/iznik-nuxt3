<template>
  <aside>
    <CommunityFeature
      :items="events"
      title="Community Events"
      link="/communityevents"
      icon-name="calendar-alt"
      add-button-label="Add community event"
      item-description="These are local events, posted by other freeglers like you."
      no-items-message="Village fete, jumble sale, interesting local event?  Add it here!"
      feature-component="CommunityEvent"
      add-modal-component="CommunityEventModal"
      item-key="event-"
    />
    <infinite-loading :distance="200" @infinite="loadMore" />
  </aside>
</template>
<script>
import { useRoute } from 'vue-router'
import { useCommunityEventStore } from '../stores/communityevent'
import { useGroupStore } from '../stores/group'
import CommunityFeature from './CommunityFeature'

export default {
  components: {
    CommunityFeature,
  },
  async setup() {
    const communityEventStore = useCommunityEventStore()
    const groupStore = useGroupStore()

    const route = useRoute()
    const groupid = parseInt(route.params.groupid)

    await communityEventStore.fetchList()

    return {
      communityEventStore,
      groupStore,
      groupid,
    }
  },
  data() {
    return {
      toShow: 1,
    }
  },
  computed: {
    forUser() {
      return this.communityEventStore?.forUser
    },
    events() {
      return this.forUser?.slice(0, this.toShow)
    },
  },
  methods: {
    loadMore($state) {
      if (this.toShow < this.forUser?.length) {
        this.toShow++
        $state.loaded()
      } else {
        $state.complete()
      }
    },
  },
}
</script>
<style scoped lang="scss">
.community__link {
  color: $colour-header;
}
</style>
