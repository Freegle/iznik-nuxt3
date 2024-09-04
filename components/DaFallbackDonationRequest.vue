<template>
  <div
    class="adFallback ourBackLight w-100 text-center d-flex flex-column justify-content-center"
  >
    <nuxt-link
      to="/donate"
      class="nodecor text-primary-emphasis font-weight-bold"
    >
      <span v-if="me?.donated">
        Thank you for donating to help keep Freegle running.
      </span>
      <span v-else> Help keep Freegle running. Click to donate. </span>
    </nuxt-link>
  </div>
</template>
<script setup></script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

.adFallback {
  height: calc($sticky-banner-height-mobile - $ads-cta);

  @include media-breakpoint-up(md) {
    height: calc($sticky-banner-height-desktop - $ads-cta);
  }
}
</style>
