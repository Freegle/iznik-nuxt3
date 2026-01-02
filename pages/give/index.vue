<template>
  <client-only>
    <div v-if="showDesktopLayout" class="give-page">
      <!-- Compact progress stepper -->
      <div class="stepper-container">
        <WizardProgressCompact :active-stage="1" />
      </div>

      <!-- Main content -->
      <div class="give-content">
        <NoticeMessage v-if="me?.deleted" variant="danger">
          You can't post until you've decided whether to restore your account.
        </NoticeMessage>
        <template v-else>
          <!-- Post items -->
          <div
            v-for="id in ids"
            :key="'post-' + id"
            class="post-item-container"
          >
            <PostMessageTablet :id="id" type="Offer" />
          </div>

          <!-- Clear form - subtle link, shown only when there's content -->
          <div v-if="notblank" class="clear-form-section">
            <a href="#" class="clear-link" @click.prevent="deleteItem(ids[0])">
              <v-icon icon="times" /> Clear and start over
            </a>
          </div>

          <!-- Next button / Validation hint -->
          <div class="next-section">
            <div v-if="messageValid" class="next-container">
              <b-button
                variant="primary"
                size="lg"
                :disabled="uploadingPhoto"
                to="/give/whereami"
                class="next-btn"
              >
                Next: Where are you? <v-icon icon="angle-double-right" />
              </b-button>
            </div>
            <div v-else class="validation-hint">
              <v-icon icon="info-circle" class="hint-icon" />
              <span
                >Add an item name and either a photo or description to
                continue.</span
              >
            </div>
          </div>
        </template>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import NoticeMessage from '~/components/NoticeMessage'
import WizardProgressCompact from '~/components/WizardProgressCompact'
import { setup, deleteItem } from '~/composables/useCompose'
import { onMounted, computed, watch } from '#imports'
import { useMiscStore } from '~/stores/misc'

const PostMessageTablet = defineAsyncComponent(() =>
  import('~/components/PostMessageTablet')
)

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const miscStore = useMiscStore()

const breakpointReady = computed(() => miscStore.breakpoint !== null)

const isMobile = computed(
  () =>
    miscStore.breakpoint === 'xs' ||
    miscStore.breakpoint === 'sm' ||
    miscStore.breakpoint === 'md'
)

const showDesktopLayout = computed(
  () => breakpointReady.value && !isMobile.value
)

// Watch for breakpoint changes and redirect to mobile layout when appropriate.
// Use navigateTo with replace for proper Nuxt navigation that works during client-side routing.
// The { immediate: true } ensures this fires once the breakpoint is detected on initial load.
watch(
  () => ({ ready: breakpointReady.value, mobile: isMobile.value }),
  async ({ ready, mobile }) => {
    if (ready && mobile && process.client) {
      await navigateTo('/give/mobile/photos', { replace: true })
    }
  },
  { immediate: true }
)

useHead(
  buildHead(
    route,
    runtimeConfig,
    'OFFER',
    'OFFER something to people nearby and see who wants it'
  )
)

const { me, ids, messageValid, uploadingPhoto, notblank } = await setup('Offer')

onMounted(() => {
  if (globalThis.$gtm?.enabled()) {
    globalThis.$gtm.trackEvent({
      event: 'Give an Item',
      label: 'YqHzCIHbv7kZELy618UD',
    })
  }
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.give-page {
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

.give-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;

  @include media-breakpoint-up(lg) {
    padding: 2rem;
  }
}

.give-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-green-background;
  margin-bottom: 1.5rem;
  text-align: center;

  @include media-breakpoint-up(lg) {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
}

.post-item-container {
  margin-bottom: 1.5rem;
}

.clear-form-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.clear-link {
  color: #9ca3af;
  font-size: 0.85rem;
  text-decoration: none;

  &:hover {
    color: #6b7280;
    text-decoration: underline;
  }
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

.validation-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #6b7280;
  font-size: 0.95rem;

  .hint-icon {
    color: #9ca3af;
  }
}
</style>
