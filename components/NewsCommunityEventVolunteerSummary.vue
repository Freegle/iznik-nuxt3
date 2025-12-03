<template>
  <div
    v-if="communityEvents.length || volunteerOpportunities.length"
    class="summary-card"
  >
    <div class="summary-header">
      <v-icon icon="calendar-alt" class="header-icon" />
      <span v-if="communityEvents?.length">Community Events</span>
      <span v-if="communityEvents?.length && volunteerOpportunities?.length">
        &amp;
      </span>
      <span v-if="volunteerOpportunities?.length">Volunteer Opportunities</span>
    </div>
    <div v-if="communityEvents.length > 0" class="summary-row">
      <NuxtLink to="/communityevents" class="summary-title">
        {{ eventTitle }}
      </NuxtLink>
      <NuxtLink
        v-if="communityEvents.length > 1"
        to="/communityevents"
        class="summary-count"
      >
        +{{ communityEvents.length - 1 }} more
      </NuxtLink>
    </div>
    <div v-if="volunteerOpportunities.length > 0" class="summary-row">
      <NuxtLink to="/volunteering" class="summary-title">
        {{ volopTitle }}
      </NuxtLink>
      <NuxtLink
        v-if="volunteerOpportunities.length > 1"
        to="/volunteering"
        class="summary-count"
      >
        +{{ volunteerOpportunities.length - 1 }} more
      </NuxtLink>
    </div>
  </div>
</template>
<script setup>
import { useCommunityEventStore } from '~/stores/communityevent'
import { useVolunteeringStore } from '~/stores/volunteering'

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
@import 'assets/css/_color-vars.scss';

.summary-card {
  background: white;
  padding: 0.75rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: $color-gray--dark;
  margin-bottom: 0.5rem;
  font-weight: 500;

  .header-icon {
    color: $color-blue--base;
  }
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.summary-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: $color-blue--base;
  font-size: 0.9rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.summary-count {
  flex-shrink: 0;
  color: $colour-success;
  font-size: 0.85rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
