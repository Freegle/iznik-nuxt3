<template>
  <client-only>
    <div class="jobs-page">
      <div class="jobs-page-content">
        <p class="jobs-page-intro">
          Freegle gets a small amount if you click, helping keep us running.
        </p>
        <div class="jobs-filters">
          <PlaceAutocomplete
            :value="location"
            class="jobs-location-input"
            labeltext="Location (postcode or town)"
            @selected="search($event)"
          />
          <b-form-select
            v-model="category"
            :options="categories"
            class="jobs-category-select"
          />
        </div>

        <div v-if="busy" class="jobs-loading">
          <b-img lazy src="/loader.gif" alt="Loading" width="60px" />
          <span>Finding jobs...</span>
        </div>

        <div v-else class="jobs-results">
          <div v-if="list?.length" class="jobs-grid">
            <JobOne
              v-for="(job, index) in list"
              :id="job.id"
              :key="'job-' + job.job_reference"
              :position="index"
              :list-length="list.length"
              context="jobspage"
            />
          </div>
          <NoticeMessage v-else-if="blocked" variant="warning">
            It looks like you may have an AdBlocker or security software which
            is blocking these job ads.
          </NoticeMessage>
          <div v-else-if="location" class="jobs-empty">
            <v-icon icon="search" class="jobs-empty-icon" />
            <p>No jobs found in this area</p>
            <span>Try searching a different location</span>
          </div>
        </div>

        <p class="jobs-disclaimer">
          Some jobs may ask you to sign up - this is not under our control.
        </p>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { useJobStore } from '~/stores/job'
import { useMe } from '~/composables/useMe'
import { buildHead } from '~/composables/useBuildHead'
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  useHead,
  useRuntimeConfig,
} from '#imports'
import PlaceAutocomplete from '~/components/PlaceAutocomplete'
import NoticeMessage from '~/components/NoticeMessage'
import JobOne from '~/components/JobOne'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'Jobs',
    'Freegle gets a little bit to help keep us going if you click on them.',
    null,
    {
      class: 'overflow-y-scroll',
    }
  )
)

const jobStore = useJobStore()

// Use me computed property from useMe composable for consistency
const { me } = useMe()
const lat = ref(me.value?.lat)
const lng = ref(me.value?.lng)
const location = ref(me.value?.settings?.mylocation?.name || null)
const category = ref(null)
const busy = ref(false)

const list = computed(() => jobStore.list)
const blocked = computed(() => jobStore.blocked)

const categories = computed(() => {
  const ret = [
    {
      value: null,
      text: 'All job categories',
    },
  ]
  ;[
    'Accounting/Financial/Insurance',
    'Administration',
    'Agriculture',
    'Arts/Graphic Design',
    'Automotive/Aerospace',
    'Car',
    'Catering',
    'Charity',
    'Construction',
    'Consulting',
    'Customer Services',
    'Distribution',
    'Electronics',
    'Hospitality/Hotel',
    'IT',
    'Legal',
    'Leisure/Tourism',
    'Management',
    'Manufacturing/Surveying',
    'Marketing',
    'Media',
    'Medical/Pharmaceutical/Scientific',
    'Military/Emergency/Government',
    'Other',
    'Personnel/Recruitment',
    'Property Services',
    'Public Sector',
    'Retail/Purchasing',
    'Sales',
    'Social Care',
    'Telecoms',
  ].forEach((c) => {
    ret.push({ value: c, text: c })
  })

  return ret
})

watch(category, () => {
  nextTick(doSearch)
})

function search(e) {
  console.log('Got place', e.lat, e.lng)
  if (e && (e.lat || e.lng)) {
    lat.value = e.lat
    lng.value = e.lng
    doSearch()
  }
}

async function doSearch() {
  busy.value = true
  await jobStore.fetch(lat.value, lng.value, category.value, true)
  busy.value = false
}

onMounted(async () => {
  if (location.value && lat.value && lng.value) {
    await jobStore.fetch(lat.value, lng.value)
  }
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.jobs-page {
  min-height: 100vh;
  background: $gray-100;
}

.jobs-page-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.jobs-page-intro {
  font-size: 0.9rem;
  color: $gray-600;
  text-align: center;
  margin-bottom: 1rem;
}

.jobs-filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  background: $white;
  padding: 1rem;
  border: 1px solid $gray-200;

  @include media-breakpoint-up(md) {
    flex-direction: row;
  }
}

.jobs-location-input {
  flex: 1;
}

.jobs-category-select {
  @include media-breakpoint-up(md) {
    max-width: 250px;
  }
}

.jobs-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: $gray-600;
}

.jobs-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.jobs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
  background: $white;
  border: 1px solid $gray-200;

  p {
    font-size: 1.1rem;
    font-weight: 600;
    color: $gray-700;
    margin: 0.5rem 0 0.25rem 0;
  }

  span {
    color: $gray-500;
    font-size: 0.9rem;
  }
}

.jobs-empty-icon {
  font-size: 2.5rem;
  color: $gray-400;
}

.jobs-disclaimer {
  font-size: 0.8rem;
  color: $gray-500;
  text-align: center;
  margin-top: 1.5rem;
}
</style>
