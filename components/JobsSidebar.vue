<template>
  <aside v-if="location">
    <NoticeMessage v-if="blocked" variant="warning" class="d-none">
      <h3>Please help keep Freegle running</h3>
      <p>
        We normally show job ads here. It looks like you may have an AdBlocker
        or security software which is blocking those. We're not mad on ads
        either, but please consider donating to help us keep going:
      </p>
      <donation-button />
    </NoticeMessage>
    <div v-else>
      <b-card v-if="list.length" variant="white" no-body>
        <b-card-body class="p-0">
          <nuxt-link no-prefetch to="/jobs">
            <h2 class="header--size4 pt-1 ml-3">
              <v-icon icon="briefcase" scale="2" /> Jobs near you
            </h2>
          </nuxt-link>
          <p class="text-center small">
            Freegle gets a small amount if you are interested and click.
          </p>
          <div v-for="job in visibleJobs" :key="'job-' + job.job_reference">
            <JobOne :id="job.id" :summary="true" />
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
          <div class="d-flex justify-content-around mt-2 mb-2">
            <b-button variant="secondary" to="/jobs">
              <v-icon icon="search" /> View more jobs
            </b-button>
          </div>
        </b-card-body>
      </b-card>
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
aside {
  height: 100%;
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

:deep(a) {
  text-decoration: none;
}
</style>
