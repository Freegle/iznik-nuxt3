<template>
  <div class="mobile-page">
    <div class="mobile-page__content">
      <p class="mobile-page__tagline">Don't throw it away, give it away!</p>
      <div class="mobile-page__features">
        <p>Got stuff you don't need? We'll find someone to come and take it.</p>
        <p>
          Looking for something? We'll pair you with someone giving it away.
        </p>
        <p>All completely free. Freegle: it's like online dating for stuff.</p>
      </div>
      <p class="mobile-page__description">
        Freegling is easy on mobiles and tablets, and you get notifications of
        replies so you don't have to rely on email. Download using these links
        or search for Freegle in your app store - it's free!
      </p>
      <div class="mobile-page__badges">
        <ExternalLink
          href="https://play.google.com/store/apps/details?id=org.ilovefreegle.direct"
        >
          <img
            alt="Freegle Android app on Google Play"
            title="Freegle Android app on Google Play"
            src="/en-play-badge.png"
          />
        </ExternalLink>
        <ExternalLink
          href="https://itunes.apple.com/gb/app/freegle/id970045029?ls=1&amp;mt=8"
        >
          <img
            alt="Freegle app for iPhone, iPad, and iPod touch"
            title="Freegle app for iPhone, iPad, and iPod touch"
            src="/app-store-black-sm.png"
          />
        </ExternalLink>
      </div>
      <p class="mobile-page__support">
        We support Android 8.0/iOS 13 or later.
      </p>
      <p class="mobile-page__issues">
        Please report any issues to <SupportLink />.
      </p>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { defineAsyncComponent, useHead, useRuntimeConfig } from '#imports'
import { buildHead } from '~/composables/useBuildHead'

const ExternalLink = defineAsyncComponent(() =>
  import('~/components/ExternalLink')
)
const SupportLink = defineAsyncComponent(() =>
  import('~/components/SupportLink')
)

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Our mobile app',
    'Find out about our mobile app and how to install it.'
  )
)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.mobile-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.mobile-page__content {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.mobile-page__tagline {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-green--darker;
  margin-bottom: 1.5rem;
}

.mobile-page__features {
  margin-bottom: 1.5rem;

  p {
    font-size: 0.95rem;
    line-height: 1.6;
    color: $gray-700;
    margin-bottom: 0.5rem;
  }
}

.mobile-page__description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: $gray-700;
  margin-bottom: 1.5rem;
}

.mobile-page__badges {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;

  img {
    height: 50px;
    width: auto;
  }
}

.mobile-page__support {
  font-size: 0.875rem;
  color: $gray-600;
  margin-bottom: 0.5rem;
}

.mobile-page__issues {
  font-size: 0.875rem;
  color: $gray-600;
}
</style>
