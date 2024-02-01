<template>
  <b-card body-class="p-1">
    <div class="small text-center">
      <span v-if="communityEvents?.length"
        >Community Events
        <span v-if="volunteerOpportunities?.length">and </span>
      </span>
      <span v-if="volunteerOpportunities?.length">Volunteer Opportunities</span>
    </div>
    <div class="d-flex justify-content-between">
      <b-button
        v-if="communityEvents?.length"
        to="/communityevents"
        variant="link"
      >
        {{ communityEvents.length }} {{ eventStr }}
      </b-button>
      <b-button
        v-if="volunteerOpportunities?.length"
        to="/volunteering"
        variant="link"
      >
        {{ volunteerOpportunities.length }} {{ opportunityStr }}
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

const eventStr = communityEvents.length === 1 ? 'event' : 'events'
const opportunityStr =
  volunteerOpportunities.length === 1 ? 'opportunity' : 'opportunities'
</script>
