<template>
  <div
    v-if="location"
    class="jobbox bg-light overflow-hidden forcewrap"
    :style="{
      maxHeight: maxHeight,
      minHeight: minHeight,
      maxWidth: maxWidth,
      minWidth: minWidth,
      overflowY: 'scroll',
      overflowX: 'wrap',
    }"
  >
    <NoticeMessage v-if="blocked" variant="warning" class="d-none">
      <h2 class="header--size3 d-none d-md-block">
        Please help keep Freegle running
      </h2>
      <p class="d-none d-md-block">
        We normally show job ads here. It looks like you may have an AdBlocker
        or security software which is blocking those. We're not mad on ads
        either, but please consider donating to help us keep going:
      </p>
      <p class="d-block d-md-none">
        It looks like you're blocking job ads. Please consider donating:
      </p>
      <donation-button />
    </NoticeMessage>
    <div v-else-if="list.length" style="font-size: 10px">
      <h2 class="visually-hidden">Jobs</h2>
      <b-button
        v-if="minWidth === '100vw'"
        to="/jobs"
        variant="link"
        class="seemore p-0"
      >
        See more jobs <v-icon icon="angle-double-right" />
      </b-button>
      <div
        :class="{
          'card-columns': minWidth === '100vw',
        }"
        :style="{
          maxHeight: maxHeight,
          minHeight: minHeight,
          maxWidth: maxWidth,
          minWidth: minWidth,
        }"
      >
        <b-card
          v-for="job in list"
          :key="'job-' + job.job_reference"
          no-body
          class="mb-0"
          :class="{
            'w-100': minWidth !== '100vw',
          }"
        >
          <b-card-body class="p-0">
            <JobOne
              :id="job.id"
              :summary="true"
              :show-body="false"
              class-name="header--size5 mb-0"
            />
          </b-card-body>
        </b-card>
      </div>
      <b-button
        v-if="minWidth !== '100vw'"
        to="/jobs"
        variant="link"
        class="seemore p-0"
      >
        See more jobs <v-icon icon="angle-double-right" />
      </b-button>
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
@import 'bootstrap/scss/mixins/_breakpoints';

:deep(a) {
  text-decoration: none;
}

:deep(.seemore) {
  font-size: 0.6rem !important;

  @include media-breakpoint-up(md) {
    font-size: 0.8rem !important;
  }
}

:deep(.header--size5) {
  font-size: 0.8rem;

  @include media-breakpoint-up(md) {
    font-size: 1.25rem;
  }
}
</style>
