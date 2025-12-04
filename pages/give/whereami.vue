<template>
  <client-only>
    <div class="location-page">
      <!-- Compact progress stepper -->
      <div class="stepper-container">
        <WizardProgressCompact :active-stage="2" />
      </div>

      <!-- Main content -->
      <div class="location-content">
        <GlobalMessage />

        <div class="location-card">
          <h1 class="location-title">Where is it?</h1>
          <p class="location-subtitle">
            We'll use this to show your offer to people nearby. Don't worry, we
            won't give other people your postcode.
          </p>

          <!-- Postcode input -->
          <div class="postcode-section">
            <PostCode
              :value="initialPostcode"
              :no-store="false"
              @selected="postcodeSelect"
              @cleared="postcodeClear"
            />
          </div>

          <!-- No groups warning -->
          <NoticeMessage
            v-if="postcodeValid && noGroups"
            variant="info"
            class="mt-3"
          >
            We're really sorry, but there are no communities near there. If
            you'd like to start one, please
            <ExternalLink href="mailto:newgroups@ilovefreegle.org">
              get in touch!
            </ExternalLink>
          </NoticeMessage>

          <!-- Community selection -->
          <div v-else-if="postcodeValid && !closed" class="community-section">
            <div class="community-card">
              <div class="community-header">
                <v-icon icon="map-marker-alt" class="community-icon" />
                <span class="community-label">Your local community</span>
              </div>
              <div class="community-select-wrapper">
                <ComposeGroup />
              </div>
              <p class="community-hint">
                Tap to choose a different community nearby.
              </p>
            </div>
          </div>
        </div>

        <!-- Navigation button -->
        <div v-if="postcodeValid && !closed && !noGroups" class="next-section">
          <div class="next-container">
            <b-button
              variant="primary"
              size="lg"
              to="/give/options"
              class="next-btn"
            >
              Next: Options <v-icon icon="angle-double-right" />
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { useRoute, useHead, useRuntimeConfig } from '#imports'
import NoticeMessage from '~/components/NoticeMessage.vue'
import ExternalLink from '~/components/ExternalLink.vue'
import GlobalMessage from '~/components/GlobalMessage.vue'
import PostCode from '~/components/PostCode.vue'
import WizardProgressCompact from '~/components/WizardProgressCompact.vue'
import ComposeGroup from '~/components/ComposeGroup.vue'
import { setup, postcodeSelect, postcodeClear } from '~/composables/useCompose'
import { buildHead } from '~/composables/useBuildHead'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'OFFER',
    'OFFER something to people nearby and see who wants it'
  )
)

const { initialPostcode, postcodeValid, noGroups, closed } = await setup(
  'Offer'
)
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.location-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.stepper-container {
  background: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @include media-breakpoint-up(lg) {
    padding: 1.5rem 2rem;
  }
}

.location-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;

  @include media-breakpoint-up(lg) {
    padding: 2rem;
  }
}

.location-card {
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.location-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-green-background;
  margin-bottom: 0.5rem;
  text-align: center;
}

.location-subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 1.5rem;
}

.postcode-section {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.community-section {
  margin-top: 1.5rem;
}

.community-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 1.25rem;
  text-align: center;
}

.community-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.community-icon {
  color: $color-green-background;
  font-size: 1.25rem;
}

.community-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.community-select-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.community-hint {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-bottom: 0;
}

.next-section {
  margin-top: 2rem;
  margin-bottom: 3rem;
}

.next-container {
  display: flex;
  justify-content: center;
}

.next-btn {
  min-width: 280px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
