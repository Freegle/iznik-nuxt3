<template>
  <div
    class="adDisabled sticky ourBackLight w-100 text-center d-flex flex-column justify-content-center"
  >
    <span>
      <v-icon icon="hand-holding-heart" /> We've raised enough
      <span class="d-none d-md-inline">in donations from kind freeglers </span
      >to turn ads off today. Thanks!
      <nuxt-link to="/adsoff">Learn more</nuxt-link>
    </span>
  </div>
</template>
<script setup></script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

.adDisabled {
  height: $sticky-banner-height-mobile;

  @media (min-height: $mobile-tall) {
    height: $sticky-banner-height-mobile-tall;
  }

  @include media-breakpoint-up(md) {
    height: $sticky-banner-height-desktop;

    @media (min-height: $desktop-tall) {
      height: $sticky-banner-height-desktop-tall;
    }
  }
}
</style>
