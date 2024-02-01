<template>
  <div class="sidebar__wrapper">
    <div class="sidebar__info pr-3">
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
    </div>
    <div class="sidebar__botleft align-content-end">
      <BotLeftBox v-if="showBotLeft" class="social-media__wrapper ml-2" />
    </div>
  </div>
</template>
<script>
import BotLeftBox from './BotLeftBox'
const CommunityEventSidebar = defineAsyncComponent(() =>
  import('~/components/CommunityEventSidebar')
)
const VolunteerOpportunitySidebar = defineAsyncComponent(() =>
  import('~/components/VolunteerOpportunitySidebar')
)

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
<style scoped lang="scss">
.sidebar__wrapper {
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 100%;
  height: 100vh;
}

.sidebar__info {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  display: grid;
  grid-template-rows: 1fr auto 1fr auto 70px;
  grid-template-columns: 1fr;
  grid-row-gap: 10px;
  height: calc(100vh - 100px);
}

.sidebar__botleft {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  display: grid;
  grid-template-rows: 1fr auto;
  height: calc(100vh - 68px);

  .social-media__wrapper {
    grid-row: 2 / 3;
    padding-bottom: 10px;
  }
}

.sidebar__community-event {
  grid-row: 1 / 2;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.hr1 {
  grid-row: 2 / 3;
}

.sidebar__volunteer-opportunity {
  grid-row: 3 / 4;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.hr2 {
  grid-row: 4 / 5;
}

.social-media__wrapper {
  grid-row: 5 / 6;
}
</style>
