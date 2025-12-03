<template>
  <div v-if="location && list.length" class="jobs-topbar">
    <NoticeMessage v-if="blocked" variant="warning" class="d-none">
      <p>It looks like you're blocking job ads. Please consider donating:</p>
      <donation-button />
    </NoticeMessage>
    <div v-else>
      <div class="jobs-header">
        <div class="jobs-header-title">
          <v-icon icon="briefcase" class="jobs-header-icon" />
          <span>Jobs near you</span>
        </div>
        <nuxt-link no-prefetch to="/jobs" class="jobs-see-more">
          See all <v-icon icon="chevron-right" />
        </nuxt-link>
      </div>
      <div class="jobs-list">
        <JobOne
          v-for="(job, index) in list"
          :id="job.id"
          :key="'job-' + job.job_reference"
          :summary="true"
          :class="{ 'd-none d-md-block': index > 1 }"
        />
      </div>
      <p class="jobs-info">
        Freegle gets a small amount if you click, helping keep us running.
      </p>
    </div>
  </div>
</template>
<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobStore } from '~/stores/job'
import { useAuthStore } from '~/stores/auth'
const JobOne = defineAsyncComponent(() => import('./JobOne'))
const NoticeMessage = defineAsyncComponent(() => import('./NoticeMessage'))
const DonationButton = defineAsyncComponent(() => import('./DonationButton'))

const jobStore = useJobStore()
const authStore = useAuthStore()

// Get blocked from jobStore
const { blocked } = storeToRefs(jobStore)

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

// Computed for list
const list = computed(() => {
  return jobStore.list.slice(0, 3)
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.jobs-topbar {
  background: $white;
  border: 1px solid $gray-200;
  margin-bottom: 1rem;
  overflow: hidden;
}

.jobs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #61ae24 0%, #4a8f1c 100%);
  color: $white;
}

.jobs-header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
}

.jobs-header-icon {
  font-size: 1rem;
}

.jobs-see-more {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: $white;
  font-size: 0.85rem;
  text-decoration: none;
  opacity: 0.9;

  &:hover {
    opacity: 1;
    text-decoration: none;
    color: $white;
  }
}

.jobs-list {
  :deep(.job-item) {
    margin-bottom: 0;
  }

  :deep(.job-summary) {
    padding: 0.6rem 0.75rem;
  }
}

.jobs-info {
  font-size: 0.75rem;
  color: $gray-500;
  text-align: center;
  padding: 0.5rem 0.75rem;
  margin: 0;
  background: $gray-100;
  border-top: 1px solid $gray-200;
}
</style>
