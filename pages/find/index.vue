<template>
  <client-only>
    <div v-if="showDesktopLayout" class="find-page">
      <!-- Compact progress stepper -->
      <div class="stepper-container">
        <WizardProgressCompact :active-stage="1" :show-options="false" />
      </div>

      <!-- Main content -->
      <div class="find-content">
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
            <PostMessageTablet :id="id" type="Wanted" />
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
                to="/find/whereami"
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
import { onMounted, computed, watch, nextTick } from '#imports'
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

// Helper function to perform the mobile redirect.
async function redirectToMobileIfNeeded() {
  if (breakpointReady.value && isMobile.value && process.client) {
    await navigateTo('/find/mobile/photos', { replace: true })
  }
}

// Use onMounted with nextTick for initial check to ensure BreakpointFettler has run.
// This prevents race conditions where the redirect happens before breakpoint is correctly detected.
onMounted(async () => {
  await nextTick()
  await redirectToMobileIfNeeded()
})

// Watch for subsequent breakpoint changes (e.g., window resize).
watch(
  () => ({ ready: breakpointReady.value, mobile: isMobile.value }),
  async ({ ready, mobile }) => {
    if (ready && mobile && process.client) {
      await navigateTo('/find/mobile/photos', { replace: true })
    }
  }
)

useHead(
  buildHead(
    route,
    runtimeConfig,
    'WANTED',
    "Ask people nearby if they have what you're looking for"
  )
)

const { me, ids, messageValid, uploadingPhoto, notblank } = await setup(
  'Wanted'
)

onMounted(() => {
  if (globalThis.$gtm?.enabled()) {
    globalThis.$gtm.trackEvent({
      event: 'Find an Item',
      label: 'QxhuCP7av7kZELy618UD',
    })
  }
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.find-page {
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

.find-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1rem;

  @include media-breakpoint-up(lg) {
    padding: 2rem;
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
