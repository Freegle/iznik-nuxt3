<template>
  <div v-if="location" class="mb-2 jobbox bg-light overflow-hidden forcewrap">
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
    <div v-else-if="list.length">
      <h2 class="visually-hidden">Jobs</h2>
      <div class="mb-1 text-center small text-muted">
        Jobs near you. Freegle gets a
        <span class="d-none d-md-inline"
          >small amount if you are interested and click</span
        ><span class="d-inline d-md-none">little if you click</span
        ><span class="d-none d-md-inline">, which helps keep us going</span>.
        <!-- eslint-disable-next-line -->
        <nuxt-link no-prefetch to="/jobs">See more<span class="d-none d-md-inline"> jobs</span></nuxt-link>.
      </div>
      <ul class="list-unstyled">
        <li v-for="(job, index) in list" :key="'job-' + job.job_reference">
          <JobOne
            :id="job.id"
            :summary="true"
            :class="index > 1 ? 'd-none d-md-block' : ''"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { mapState } from 'pinia'
import { useJobStore } from '../stores/job'
import { useAuthStore } from '../stores/auth'
import { useMiscStore } from '../stores/misc'
const JobOne = defineAsyncComponent(() => import('./JobOne'))
const NoticeMessage = defineAsyncComponent(() => import('./NoticeMessage'))
const DonationButton = defineAsyncComponent(() => import('./DonationButton'))

export default {
  components: {
    NoticeMessage,
    JobOne,
    DonationButton,
  },
  async setup() {
    const jobStore = useJobStore()
    const authStore = useAuthStore()
    const miscStore = useMiscStore()

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
      miscStore,
    }
  },
  computed: {
    ...mapState(useJobStore, ['blocked']),
    list() {
      return this.jobStore.list.slice(0, 3)
    },
  },
}
</script>
<style scoped lang="scss">
:deep(a) {
  text-decoration: none;
}
</style>
