<template>
  <client-only>
    <b-row class="m-0 mt-4">
      <b-col cols="12" lg="6" class="p-0 mt-4" offset-lg="3">
        <NoticeMessage v-if="invalid" class="mt-4">
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
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted, definePageMeta } from '#imports'
import { useJobStore } from '~/stores/job'
import NoticeMessage from '~/components/NoticeMessage'

definePageMeta({
  layout: 'empty',
})

const jobStore = useJobStore()
const route = useRoute()
const id = ref(parseInt(route.params.id))
const invalid = ref(false)

const job = ref(await jobStore.fetchOne(id.value))

onMounted(async () => {
  // Log the view and redirect to the job link.
  if (id.value && job.value?.id === id.value) {
    await jobStore.log({
      link: job.value.url,
    })

    window.location = job.value.url
  } else {
    invalid.value = true
  }
})
</script>
