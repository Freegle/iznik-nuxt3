<template>
  <div class="sidebar__wrapper">
    <ExternalDa
      v-if="adUnitPath"
      :ad-unit-path="adUnitPath"
      max-width="100%"
      max-height="100%"
      :div-id="adDivId"
      class="da"
      :jobs="showJobOpportunities"
    />
  </div>
</template>
<script setup>
import ExternalDa from '~/components/ExternalDa.vue'

defineProps({
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

  display: flex;
  flex-direction: column;
  overflow-y: hidden;

  .da {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    :deep(.jobs-slot) {
      flex: 1;
      height: 100%;
    }
  }
}
</style>
