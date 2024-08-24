<template>
  <div
    v-if="adsEnabled"
    class="d-flex justify-content-around small w-100 bg-white border border-top"
  >
    <div class="text-small text-danger font-weight-bold">
      Hate ads? Us too. Donate, and we'll turn them off for a month.
      <nuxt-link to="/adsoff">Learn more</nuxt-link>
    </div>
  </div>
</template>
<script setup>
import { useConfigStore } from '~/stores/config'

const configStore = useConfigStore()
const p2 = await configStore.fetch('ads_enabled')
const adsEnabled = p2?.length && parseInt(p2[0].value)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.text-small {
  font-size: 0.5rem;

  @include media-breakpoint-up(sm) {
    font-size: 0.65rem;
  }

  @include media-breakpoint-up(md) {
    font-size: 0.8rem;
  }
}
</style>
