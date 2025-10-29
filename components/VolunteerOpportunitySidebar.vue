<template>
  <aside>
    <CommunityFeature
      :items="opportunities"
      title="Volunteer Opportunities"
      link="/volunteerings"
      icon-name="hands-helping"
      add-button-label="Add volunteer opportunity"
      item-description="Are you a charity or good cause that needs volunteers?"
      no-items-message="Charity or good cause?  Add your volunteer opportunities here!"
      feature-component="VolunteerOpportunity"
      add-modal-component="VolunteerOpportunityModal"
      item-key="volunteering-"
    />
    <infinite-loading :distance="200" @infinite="loadMore" />
  </aside>
</template>
<script setup>
import { ref, computed } from 'vue'
import CommunityFeature from './CommunityFeature'
import { useVolunteeringStore } from '~/stores/volunteering'

// Store instances
const volunteeringStore = useVolunteeringStore()

// Route parameters

// Reactive state
const toShow = ref(1)

// Fetch data
await volunteeringStore.fetchList()

// Computed properties
const forUser = computed(() => {
  return volunteeringStore?.forUser
})

const opportunities = computed(() => {
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
.volunteer__link {
  color: $colour-header;
}
</style>
