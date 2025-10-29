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
<script setup>
import { ref, computed } from 'vue'
import CommunityFeature from './CommunityFeature'
import { useCommunityEventStore } from '~/stores/communityevent'

// Initialize stores
const communityEventStore = useCommunityEventStore()

// Fetch events
await communityEventStore.fetchList()

// State
const toShow = ref(1)

// Computed properties
const forUser = computed(() => {
  return communityEventStore?.forUser
})

const events = computed(() => {
  return forUser.value?.slice(0, toShow.value)
})

// Methods
function loadMore($state) {
  if (toShow.value < forUser.value?.length) {
    toShow.value++
    $state.loaded()
  } else {
    $state.complete()
  }
}
</script>
<style scoped lang="scss">
.community__link {
  color: $colour-header;
}
</style>
