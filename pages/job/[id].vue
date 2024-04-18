<template>
  <client-only>
    <div>
      <b-row class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <NoticeMessage v-if="appshown">
            <p>The job ad should have opened in your browser</p>
            <b-button to="/jobs" variant="primary" size="lg">
              View more jobs
            </b-button>
          </NoticeMessage>
          <NoticeMessage v-else-if="invalid">
            <p>Sorry, that job is no longer available.</p>
            <b-button to="/jobs" variant="primary" size="lg">
              View more jobs
            </b-button>
          </NoticeMessage>
          <div v-else class="d-flex justify-content-around">
            <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
          </div>
        </b-col>
      </b-row>
    </div>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import { useJobStore } from '../../stores/job'
import NoticeMessage from '~/components/NoticeMessage'

export default {
  components: { NoticeMessage },
  async setup(s) {
    const jobStore = useJobStore()
    const route = useRoute()
    const id = parseInt(route.params.id)

    const job = await jobStore.fetchOne(id)

    return {
      jobStore,
      id,
      job,
    }
  },
  data() {
    return {
      appshown: false,
      invalid: false,
    }
  },
  created() {
    this.id = parseInt(this.$route.params.id) || null
  },
  async mounted() {
    // Log the view and redirect to the job link.
    if (this.id && this.job?.id === this.id) {
      await this.jobStore.log({
        link: this.job.url,
      })

      window.location = this.job.url
      this.appshown = true
    } else {
      this.invalid = true
    }
  },
}
</script>
