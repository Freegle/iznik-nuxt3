<template>
  <aside v-if="location">
    <client-only>
      <AdTest square />
    </client-only>
    <NoticeMessage v-if="blocked" variant="warning" class="d-none">
      <h3>Please help keep Freegle running</h3>
      <p>
        We normally show job ads here. It looks like you may have an AdBlocker
        or security software which is blocking those. We're not mad on ads
        either, but please consider donating to help us keep going:
      </p>
      <donation-button />
    </NoticeMessage>
    <b-card v-else-if="list.length" variant="white" no-body>
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
  </aside>
</template>
<script>
import { mapState } from 'pinia'
import { useJobStore } from '../stores/job'
import { useAuthStore } from '../stores/auth'
import JobOne from './JobOne'
import AdTest from './AdTest'
import InfiniteLoading from '~/components/InfiniteLoading'
const NoticeMessage = () => import('~/components/NoticeMessage')
const DonationButton = () => import('~/components/DonationButton')

export default {
  components: {
    AdTest,
    JobOne,
    NoticeMessage,
    InfiniteLoading,
    DonationButton,
  },
  async setup() {
    const jobStore = useJobStore()
    const authStore = useAuthStore()

    const me = authStore.user
    const lat = me?.lat
    const lng = me?.lng

    const location = computed(() => me?.settings?.mylocation?.name || null)

    if (location.value && lat && lng) {
      await jobStore.fetch(lat, lng)
    }

    return {
      jobStore,
      location,
    }
  },
  data() {
    return {
      show: 0,
    }
  },
  computed: {
    ...mapState(useJobStore, ['list', 'blocked']),
    visibleJobs() {
      if (process.client) {
        // We have an infinite scroll - return as many as we're currently showing.
        //
        // Don't prioritise otherwise this makes them jump around when scrolling down.
        return this.list.slice(0, this.show)
      } else {
        // SSR - return all for SEO.
        return this.job
      }
    },
  },
  methods: {
    loadMore($state) {
      // We use an infinite load for the list because it's a lot of DOM to add at initial page load.  Can't step up
      // one at a time though, as we trigger an infinite loop test in the plugin.
      if (this.show < this.list?.length) {
        this.show += 3
        $state.loaded()
      } else {
        $state.complete()
      }
    },
  },
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
