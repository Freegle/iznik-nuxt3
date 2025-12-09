<template>
  <div v-if="hasContent" class="sidebar__wrapper">
    <ExternalDa
      v-if="adUnitPath"
      :ad-unit-path="adUnitPath"
      max-height="600px"
      :div-id="adDivId"
      class="mt-2 w-100"
      list-only
      @rendered="onAdRendered"
    />
    <CommunityEventSidebar
      v-if="me && showCommunityEvents"
      class="overflow-y-scroll border-bottom"
    />
    <VolunteerOpportunitySidebar
      v-if="me && showVolunteerOpportunities"
      class="overflow-y-scroll border-top border-bottom"
    />
    <div class="sidebar__botleft align-content-end col-lg-3 col-0">
      <BotLeftBox v-if="showBotLeft" class="social-media__wrapper" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import BotLeftBox from './BotLeftBox'
import { useMe } from '~/composables/useMe'
const CommunityEventSidebar = defineAsyncComponent(() =>
  import('~/components/CommunityEventSidebar')
)
const VolunteerOpportunitySidebar = defineAsyncComponent(() =>
  import('~/components/VolunteerOpportunitySidebar')
)

const props = defineProps({
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
})

const { me } = useMe()

const adRendered = ref(null)

function onAdRendered(rendered) {
  adRendered.value = rendered
}

const hasContent = computed(() => {
  if (props.showCommunityEvents || props.showVolunteerOpportunities) {
    return true
  }
  if (adRendered.value === null) {
    return true
  }
  return adRendered.value
})
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

  @media (min-height: $desktop-tall) {
    height: calc(
      100vh - $sticky-banner-height-desktop-tall - $navbar-height - 75px - 10px
    );
  }

  @supports (height: 100dvh) {
    height: calc(
      100dvh - $sticky-banner-height-desktop - $navbar-height - 75px - 10px
    );

    @media (min-height: $desktop-tall) {
      height: calc(
        100dvh - $sticky-banner-height-desktop-tall - $navbar-height - 75px -
          10px
      );
    }
  }

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

  @media (min-height: $desktop-tall) {
    bottom: $sticky-banner-height-desktop-tall;
  }
}
</style>
