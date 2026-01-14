<template>
  <div v-if="adsEnabled" class="da-disable-cta">
    <span class="cta-text">
      <strong>Hate ads?</strong> Us too. Donate and we'll turn them off.
    </span>
    <nuxt-link to="/adsoff" class="cta-link">Learn more</nuxt-link>
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
@import 'assets/css/_color-vars.scss';

.da-disable-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.25rem 1rem;
  height: 23px;
  background: linear-gradient(to bottom, $color-gray--lighter, white);
  border-top: 1px solid $color-gray--light;
  font-size: 0.65rem;

  @include media-breakpoint-up(md) {
    font-size: 0.75rem;
  }
}

.cta-text {
  color: $color-gray--dark;

  strong {
    color: $color-gray--darker;
  }
}

.cta-link {
  color: $colour-success;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
