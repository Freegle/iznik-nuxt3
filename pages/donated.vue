<template>
  <b-row class="m-0">
    <b-col cols="0" md="3" />
    <b-col cols="12" md="6" class="mt-2">
      <b-card no-body variant="success">
        <b-card-header>
          <h1>Thank you!</h1>
        </b-card-header>
        <b-card-text class="p-2">
          <p>
            Thanks very much for donating to us. We'll use your money wisely.
          </p>
          <p>
            You can also support us by putting up posters, inviting people, and
            more. See <nuxt-link no-prefetch to="/promote">here</nuxt-link>.
          </p>
          <p>Happy freegling!</p>
        </b-card-text>
      </b-card>
    </b-col>
  </b-row>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'

export default {
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
