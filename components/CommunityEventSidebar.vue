<template>
  <aside>
    <CommunityFeature
      :items="events"
      title="Community Events"
      link="/communityevents"
      icon-name="calendar-alt"
      add-button-label="Add community event"
      item-description="These are local events, posted by other freeglers like you."
      no-items-message="No community events to show yet.  Do you know of any you could add?"
      feature-component="CommunityEvent"
      add-modal-component="CommunityEventModal"
      item-key="event-"
    />
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

    // Delay a little bit to give the main pane a chance to load.
    await communityEventStore.fetchList()

    return {
      communityEventStore,
      groupStore,
      groupid,
    }
  },
  computed: {
    forUser() {
      return this.communityEventStore.forUser
    },
    events() {
      return this.forUser.slice(0, this.toShow)
    },
  },
}
</script>
<style scoped lang="scss">
.community__link {
  color: $colour-header;
}
</style>
