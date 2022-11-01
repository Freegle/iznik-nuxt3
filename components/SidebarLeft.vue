<template>
  <div class="d-flex justify-content-between">
    <div class="sidebar__wrapper pt-3">
      <CommunityEventSidebar
        v-if="showCommunityEvents"
        class="flex-grow-1 sidebar__community-event"
      />
      <hr
        v-if="showCommunityEvents && showVolunteerOpportunities"
        class="m-0 hr1"
      />
      <VolunteerOpportunitySidebar
        v-if="showVolunteerOpportunities"
        class="flex-grow-1 sidebar__volunteer-opportunity"
      />
      <hr
        v-if="showCommunityEvents && showVolunteerOpportunities"
        class="mt-0 hr2"
      />
      <BotLeftBox v-if="showBotLeft" class="social-media__wrapper ml-2" />
    </div>
  </div>
</template>
<script>
import BotLeftBox from './BotLeftBox'
const CommunityEventSidebar = () => import('~/components/CommunityEventSidebar')
const VolunteerOpportunitySidebar = () =>
  import('~/components/VolunteerOpportunitySidebar')

export default {
  components: {
    BotLeftBox,
    CommunityEventSidebar,
    VolunteerOpportunitySidebar,
  },
  props: {
    showCommunityEvents: {
      type: Boolean,
      required: false,
      default: false,
    },
    showVolunteerOpportunities: {
      type: Boolean,
      required: false,
      default: false,
    },
    showBotLeft: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
}
</script>
<style scoped>
.sidebar__wrapper {
  display: grid;
  grid-template-rows: 1fr auto 1fr auto 70px;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  max-height: 100vh;
}

.sidebar__community-event {
  grid-row: 1 / 2;
  overflow-y: auto;
}

.hr1 {
  grid-row: 2 / 3;
}

.sidebar__volunteer-opportunity {
  grid-row: 3 / 4;
  overflow-y: auto;
}

.hr2 {
  grid-row: 4 / 5;
}

.social-media__wrapper {
  grid-row: 5 / 6;
}
</style>
