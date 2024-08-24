<template>
  <div class="sidebar__wrapper">
    <ExternalDa
      v-if="adUnitPath"
      :ad-unit-path="adUnitPath"
      max-width="300px"
      max-height="600px"
      :div-id="adDivId"
      class="da"
    />
    <JobsSidebar v-if="showJobOpportunities" class="jobs border-bottom" />
  </div>
</template>
<script>
import JobsSidebar from './JobsSidebar'
import ExternalDa from '~/components/ExternalDa.vue'

export default {
  components: {
    ExternalDa,
    JobsSidebar,
  },
  props: {
    showJobOpportunities: {
      type: Boolean,
      required: false,
      default: false,
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
  height: calc(100vh - $sticky-banner-height-desktop - $navbar-height - 10px);
  display: grid;
  grid-template-rows: max-content minmax(0, 1fr);
  grid-row-gap: 10px;
  grid-template-columns: minmax(0, 1fr);
  overflow-y: hidden;

  .da {
    grid-row: 1 / 2;
  }

  .jobs {
    grid-row: 2 / 3;
  }
}
</style>
