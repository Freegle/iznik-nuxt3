<template>
  <div
    v-if="adsEnabled"
    class="d-flex justify-content-around small w-100 bg-white border border-top"
  >
    <div class="text-small">
      &pound;{{ adsOffTarget }}
      donations to stop ads today
      <nuxt-link to="/adsoff">Learn more</nuxt-link>
    </div>
  </div>
</template>
<script setup>
import { useConfigStore } from '~/stores/config'

const configStore = useConfigStore()
const p1 = await configStore.fetch('ads_off_target')
const p2 = await configStore.fetch('ads_enabled')
await Promise.all([p1, p2])
const adsEnabled = p2?.length && parseInt(p2[0].value)
const adsOffTarget =
  p1?.length && parseInt(p1[0].value) ? parseInt(p1[0].value) : null
</script>
