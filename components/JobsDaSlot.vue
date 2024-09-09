<template>
  <div
    v-if="location"
    class="mb-2 jobbox bg-light overflow-hidden forcewrap"
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
    <div v-else-if="list.length">
      <h2 class="visually-hidden">Jobs</h2>
      <div class="d-flex">
        <ul class="list-unstyled">
          <li v-for="job in list" :key="'job-' + job.job_reference">
            <JobOne
              :id="job.id"
              :summary="true"
              :show-body="false"
              class-name="header--size5 mb-0"
            />
          </li>
        </ul>
        <div>
          <b-button to="/jobs" variant="primary" class="mt-1 mb-1 mr-1">
            <span class="d-inline d-md-none"
              >Jobs&nbsp;<v-icon icon="angle-double-right"
            /></span>
            <span class="d-none d-md-inline"
              >More&nbsp;jobs&nbsp;<v-icon icon="angle-double-right"
            /></span>
          </b-button>
        </div>
      </div>
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
  props: {
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
      try {
        await jobStore.fetch(lat, lng)
      } catch (e) {
        console.log('Jobs fetch failed', e)
      }
    }

    return {
      jobStore,
      location,
      miscStore,
    }
  },
  mounted() {
    this.$emit('rendered', true)
  },
  computed: {
    ...mapState(useJobStore, ['blocked']),
    list() {
      // Return the list in a random order - we might have multiple ad slots per page.
      const list = this.jobStore?.list.slice(0, 10)
      for (let i = list.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = list[i]
        list[i] = list[j]
        list[j] = temp
      }

      return list
    },
  },
}
</script>
<style scoped lang="scss">
:deep(a) {
  text-decoration: none;
}
</style>
