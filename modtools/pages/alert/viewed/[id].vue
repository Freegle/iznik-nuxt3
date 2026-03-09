<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="bg-white pt-2">
        <h2>Thanks for letting us know</h2>
        <p>
          Email doesn't always get through, or sometimes lands in spam, so it's
          really helpful to know that you received this.
        </p>
        <p>You can close this page now.</p>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </client-only>
</template>
<script setup>
import { useRoute } from '#imports'
import { useAlertStore } from '~/stores/alert'

const route = useRoute()
const alertStore = useAlertStore()

const id = parseInt(route.params.id) || null

onMounted(async () => {
  if (id) {
    try {
      await alertStore.record({ id })
    } catch (e) {
      console.log('Alert record failed', e)
    }
  }
})
</script>
