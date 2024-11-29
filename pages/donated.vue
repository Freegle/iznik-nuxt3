<template>
  <b-row class="m-0">
    <b-col cols="0" md="3" />
    <b-col cols="12" md="6" class="mt-2">
      <b-card no-body>
        <b-card-header bg-variant="primary">
          <h1 class="text-white">Thank you!</h1>
        </b-card-header>
        <b-card-text class="p-2">
          <DonationThank />
        </b-card-text>
      </b-card>
    </b-col>
  </b-row>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import DonationThank from '~/components/DonationThank.vue'

export default {
  components: {
    DonationThank,
  },
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Donate to Freegle',
        "We're free to use, but not free to run.  Can you help us keep going?"
      )
    )
  },
}
</script>
