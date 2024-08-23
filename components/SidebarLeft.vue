<template>
  <div class="sidebar__wrapper">
    <ExternalDa
      v-if="adUnitPath"
      :ad-unit-path="adUnitPath"
      max-width="300px"
      max-height="600px"
      :div-id="adDivId"
      class="mt-2"
      @rendered="adRendered"
    />
    <CommunityEventSidebar
      v-if="showCommunityEvents"
      class="overflow-y-scroll border-bottom"
    />
    <VolunteerOpportunitySidebar
      v-if="showVolunteerOpportunities"
      class="overflow-y-scroll border-top border-bottom"
    />
  </div>
  <div class="sidebar__botleft align-content-end">
    <BotLeftBox v-if="showBotLeft" class="social-media__wrapper ml-2" />
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
    adUnitPath: {
      type: String,
      required: false,
      default: null,
    },
    adDivId: {
      type: String,
      required: false,
      default: null,
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';
@import 'assets/css/navbar.scss';

.sidebar__wrapper {
  height: calc(
    100vh - $sticky-banner-height-desktop - $navbar-height - 75px - 10px
  );
  display: grid;
  grid-auto-rows: minmax(0, 1fr);
  grid-row-gap: 10px;
  grid-template-columns: minmax(0, 1fr);
  overflow-y: hidden;

  div {
    border-bottom: 1px lightgrey;
  }
}

.sidebar__botleft {
  position: fixed;
  bottom: $sticky-banner-height-desktop;
}
</style>
