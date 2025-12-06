<template>
  <div
    v-if="location && list.length"
    class="jobs-slot"
    :style="{
      maxHeight: maxHeight,
      minHeight: minHeight,
      maxWidth: maxWidth,
      minWidth: minWidth,
    }"
  >
    <NoticeMessage v-if="blocked" variant="warning" class="d-none">
      <p>It looks like you're blocking job ads. Please consider donating:</p>
      <donation-button />
    </NoticeMessage>
    <div v-else>
      <div v-if="!hideHeader" class="jobs-slot-header">
        <v-icon icon="briefcase" class="jobs-slot-icon" />
        <span>Jobs near you</span>
        <nuxt-link to="/jobs" class="jobs-slot-more">
          See all <v-icon icon="chevron-right" />
        </nuxt-link>
      </div>
      <div class="jobs-slot-list">
        <JobOne
          v-for="job in list"
          :id="job.id"
          :key="'job-' + job.job_reference"
          :summary="true"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { useJobStore } from '~/stores/job'
import { useAuthStore } from '~/stores/auth'
const JobOne = defineAsyncComponent(() => import('./JobOne'))
const NoticeMessage = defineAsyncComponent(() => import('./NoticeMessage'))
const DonationButton = defineAsyncComponent(() => import('./DonationButton'))

defineProps({
  minWidth: {
    type: String,
    required: false,
    default: null,
  },
  maxWidth: {
    type: String,
    required: false,
    default: null,
  },
  minHeight: {
    type: String,
    required: false,
    default: null,
  },
  maxHeight: {
    type: String,
    required: false,
    default: null,
  },
  hideHeader: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['rendered', 'borednow'])

const jobStore = useJobStore()
const authStore = useAuthStore()

const me = authStore.user
const lat = me?.lat
const lng = me?.lng

const location = computed(() => me?.settings?.mylocation?.name || null)

if (location.value && lat && lng) {
  try {
    await jobStore.fetch(lat, lng)
  } catch (e) {
    console.log('Jobs fetch failed', e)
  }
}

let refreshTimer = null
const AD_REFRESH_TIMEOUT = 31000

onMounted(() => {
  emit('rendered', true)
  refreshTimer = setTimeout(() => {
    // We only show the jobs for a while.  If people don't engage with them on initial page load they're not likely
    // to, so we might as well shift to showing other ads so that we get some revenue.
    emit('borednow')
  }, AD_REFRESH_TIMEOUT)
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }
})

const blocked = computed(() => {
  return jobStore.blocked
})

const list = computed(() => {
  // Return the list in a random order - we might have multiple ad slots per page.  By taking the top 20 we've
  // already selected a set which is a balance between close and well-paid.
  const list = jobStore?.list.slice(0, 20)
  for (let i = list.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = list[i]
    list[i] = list[j]
    list[j] = temp
  }

  return list
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';

.jobs-slot {
  width: 100%;
  background: $white;
  border: 1px solid $gray-200;
  overflow-y: auto;
}

.jobs-slot-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: $gray-100;
  color: $gray-700;
  font-weight: 600;
  font-size: 0.85rem;
  border-bottom: 1px solid $gray-200;
}

.jobs-slot-icon {
  font-size: 0.9rem;
  color: #6c757d;
}

.jobs-slot-more {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-left: auto;
  color: $gray-600;
  font-size: 0.75rem;
  font-weight: 400;
  text-decoration: none;

  &:hover {
    color: $gray-800;
    text-decoration: none;
  }
}

.jobs-slot-list {
  :deep(.job-item) {
    margin-bottom: 0;
  }

  :deep(.job-summary) {
    padding: 0.5rem 0.6rem;
  }

  :deep(.job-icon) {
    width: 2rem;
    height: 2rem;
  }

  :deep(.job-title) {
    font-size: 0.85rem;
  }

  :deep(.job-location) {
    font-size: 0.7rem;
  }
}
</style>
