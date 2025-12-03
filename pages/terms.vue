<template>
  <div class="terms-page">
    <div class="terms-page__content">
      <client-only>
        <TermsOfUse />
        <div class="terms-page__footer">
          <h3>Got questions?</h3>
          <p>
            If you have questions, please
            <nuxt-link no-prefetch to="/help">contact us</nuxt-link>.
          </p>
        </div>
      </client-only>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import TermsOfUse from '~/components/TermsOfUse'

// Setup page head
const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Terms of Use',
    "Our Terms of Use. They're pleasingly short."
  )
)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.terms-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.terms-page__content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.terms-page__footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid $gray-200;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-700;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: $gray-600;
  }
}
</style>
