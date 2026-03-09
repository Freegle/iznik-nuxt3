<template>
  <client-only>
    <b-row class="m-0 mt-4">
      <b-col cols="12" lg="6" class="p-0 mt-5" offset-lg="3">
        <NoticeMessage v-if="appshown">
          <p>The job ad should have opened in your browser</p>
          <b-button to="/jobs" variant="primary" size="lg">
            View more jobs
          </b-button>
        </NoticeMessage>
        <NoticeMessage v-else-if="invalid" class="mt-5">
          <p>Sorry, that job is no longer available.</p>
          <b-button to="/jobs" variant="primary" size="lg">
            View more jobs
          </b-button>
        </NoticeMessage>
        <div v-else class="d-flex justify-content-around">
          <Spinner :size="50" />
        </div>
      </b-col>
    </b-row>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted, definePageMeta } from '#imports'
import { useJobStore } from '~/stores/job'
import { useClientLog } from '~/composables/useClientLog'
import NoticeMessage from '~/components/NoticeMessage'

definePageMeta({
  layout: 'empty',
})

const jobStore = useJobStore()
const { action } = useClientLog()
const route = useRoute()
const id = ref(parseInt(route.params.id))
const invalid = ref(false)
const appshown = ref(false)

// Read tracking params from URL (added by email links).
const source = route.query.source || 'direct'
const campaign = route.query.campaign || null
const position = route.query.position ? parseInt(route.query.position) : null
const listLength = route.query.list_length
  ? parseInt(route.query.list_length)
  : null

const job = ref(await jobStore.fetchOne(id.value))

onMounted(async () => {
  // Log the view and redirect to the job link.
  if (id.value && job.value?.id === id.value) {
    await jobStore.log({
      link: job.value.url,
    })

    // Log to Loki for analytics.
    action('job_ad_click', {
      job_id: job.value.id,
      job_reference: job.value.reference,
      job_category: job.value.category,
      cpc: job.value.cpc,
      source,
      campaign,
      position,
      list_length: listLength,
      context: 'email_redirect',
    })

    window.location = job.value.url
    appshown.value = true
  } else {
    invalid.value = true
  }
})
</script>
