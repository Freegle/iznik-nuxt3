<template>
  <b-card
    v-if="communityEvents.length || volunteerOpportunities.length"
    body-class="p-1 ps-0 pe-0"
  >
    <div class="small text-center">
      <span v-if="communityEvents?.length"
        >Community Events
        <span v-if="volunteerOpportunities?.length">and </span>
      </span>
      <span v-if="volunteerOpportunities?.length">Volunteer Opportunities</span>
    </div>
    <div v-if="communityEvents.length > 0" class="summlayout">
      <b-button to="/communityevents" variant="link" class="title">
        {{ eventTitle }}
      </b-button>
      <b-button
        v-if="communityEvents.length > 1"
        to="/communityevents"
        variant="link"
        class="others"
      >
        +{{ communityEvents.length - 1 }}
        <span v-if="communityEvents.length > 2"> events </span>
        <span v-else> event </span>
      </b-button>
    </div>
    <div v-if="volunteerOpportunities.length > 0" class="summlayout">
      <b-button to="/volunteering" variant="link" class="title">
        {{ volopTitle }}
      </b-button>
      <b-button
        v-if="volunteerOpportunities.length > 1"
        to="/volunteering"
        variant="link"
        class="others"
      >
        +{{ volunteerOpportunities.length - 1 }}
        <span v-if="volunteerOpportunities.length > 2"> ops </span>
        <span v-else> op </span>
      </b-button>
    </div>
  </b-card>
</template>
<script setup>
import { useCommunityEventStore } from '../stores/communityevent'
import { useVolunteeringStore } from '../stores/volunteering'

const communityEventStore = useCommunityEventStore()
const volunteeringStore = useVolunteeringStore()

const promises = []

promises.push(communityEventStore.fetchList())
promises.push(volunteeringStore.fetchList())

await Promise.all(promises)

const communityEvents = communityEventStore.forUser
const volunteerOpportunities = volunteeringStore.forUser

const eventTitle = ref(null)

if (communityEvents.length > 0) {
  communityEventStore.fetch(communityEvents[0]).then((firstEvent) => {
    if (firstEvent) {
      eventTitle.value = firstEvent.title
    }
  })
}

const volopTitle = ref(null)

if (volunteerOpportunities.length > 0) {
  volunteeringStore.fetch(volunteerOpportunities[0]).then((firstOp) => {
    if (firstOp) {
      volopTitle.value = firstOp.title
    }
  })
}
</script>
<style scoped lang="scss">
.summlayout {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: calc(100vw - 10rem) 10rem;
  justify-content: space-between;

  :deep(.title) {
    grid-column: 1 / 2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    text-align: start;
  }

  :deep(.others) {
    grid-column: 2 / 3;
    text-align: end;
  }
}
</style>
