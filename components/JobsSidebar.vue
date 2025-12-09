<template>
  <aside v-if="location && list.length" class="jobs-sidebar">
    <NoticeMessage v-if="blocked" variant="warning" class="d-none">
      <p>It looks like you're blocking job ads. Please consider donating:</p>
      <donation-button />
    </NoticeMessage>
    <div v-else>
      <div class="jobs-sidebar-header">
        <nuxt-link no-prefetch to="/jobs" class="jobs-sidebar-title-link">
          <v-icon icon="briefcase" class="jobs-sidebar-icon" />
          <span class="jobs-sidebar-title">Jobs near you</span>
        </nuxt-link>
      </div>
      <p class="jobs-sidebar-info">Freegle gets a small amount if you click</p>
      <div class="jobs-sidebar-list">
        <JobOne
          v-for="job in visibleJobs"
          :id="job.id"
          :key="'job-' + job.job_reference"
          :summary="true"
          bg-colour="soft sage green"
        />
      </div>
      <infinite-loading key="infinitejobs" @infinite="loadMore">
        <template #no-results>
          <notice-message v-if="!list?.length">
            We can't find any jobs at the moment.
          </notice-message>
        </template>
        <template #no-more />
        <template #spinner />
      </infinite-loading>
      <div class="jobs-sidebar-footer">
        <nuxt-link to="/jobs" class="jobs-sidebar-more">
          View all jobs <v-icon icon="arrow-right" />
        </nuxt-link>
      </div>
    </div>
  </aside>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import JobOne from './JobOne'
import { useJobStore } from '~/stores/job'
import { useAuthStore } from '~/stores/auth'
import InfiniteLoading from '~/components/InfiniteLoading'
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)
const DonationButton = defineAsyncComponent(() =>
  import('~/components/DonationButton')
)

const jobStore = useJobStore()
const authStore = useAuthStore()

// Get list and blocked from jobStore
const { list, blocked } = storeToRefs(jobStore)

// Local state
const show = ref(0)

// Get user info
const me = authStore.user
const lat = me?.lat
const lng = me?.lng

// Location computed property
const location = computed(() => me?.settings?.mylocation?.name || null)

// Fetch data if needed
if (location.value && lat && lng) {
  await jobStore.fetch(lat, lng)
}

// Computed for visible jobs
const visibleJobs = computed(() => {
  if (process.client) {
    // We have an infinite scroll - return as many as we're currently showing.
    //
    // Don't prioritise otherwise this makes them jump around when scrolling down.
    return list.value.slice(0, show.value)
  } else {
    // SSR - return all for SEO.
    return list.value
  }
})

// Methods
function loadMore($state) {
  // We use an infinite load for the list because it's a lot of DOM to add at initial page load.  Can't step up
  // one at a time though, as we trigger an infinite loop test in the plugin.
  if (show.value < list.value?.length) {
    show.value += 3
    $state.loaded()
  } else {
    $state.complete()
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.jobs-sidebar {
  height: 100%;
  overflow-y: auto;
  scrollbar-gutter: stable;
  background: $white;
  border: 1px solid $gray-200;
}

.jobs-sidebar-header {
  background: linear-gradient(135deg, #61ae24 0%, #4a8f1c 100%);
  padding: 0.75rem 1rem;
}

.jobs-sidebar-title-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: $white;
  text-decoration: none;

  &:hover {
    color: $white;
    text-decoration: none;
  }
}

.jobs-sidebar-icon {
  font-size: 1.1rem;
}

.jobs-sidebar-title {
  font-size: 1rem;
  font-weight: 600;
}

.jobs-sidebar-info {
  font-size: 0.75rem;
  color: $gray-500;
  text-align: center;
  padding: 0.5rem 0.75rem;
  margin: 0;
  background: $gray-100;
  border-bottom: 1px solid $gray-200;
}

.jobs-sidebar-list {
  display: flex;
  flex-direction: column;

  :deep(.job-item) {
    margin-bottom: 0;
    flex: 1;
  }

  :deep(.job-summary) {
    padding: 0.5rem 0.6rem;
    min-height: 3.5rem;
  }

  :deep(.job-icon) {
    width: 2.5rem;
    height: 2.5rem;
  }

  :deep(.job-ai-image) {
    width: 2.5rem;
    height: 2.5rem;
  }

  :deep(.job-title) {
    font-size: 0.85rem;
    -webkit-line-clamp: 1;
  }

  :deep(.job-location) {
    font-size: 0.7rem;
  }
}

.jobs-sidebar-footer {
  padding: 0.75rem;
  text-align: center;
  border-top: 1px solid $gray-200;
}

.jobs-sidebar-more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #61ae24;
  text-decoration: none;
  padding: 0.5rem 1rem;
  background: rgba(97, 174, 36, 0.1);
  transition: background-color 0.15s ease;

  &:hover {
    background: rgba(97, 174, 36, 0.2);
    text-decoration: none;
    color: #61ae24;
  }
}
</style>
