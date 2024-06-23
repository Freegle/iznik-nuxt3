<template>
  <ExternalLink v-if="trustpilotLink" :href="trustpilotLink">
    <b-button variant="primary" size="lg"> Rate us on TrustPilot </b-button>
  </ExternalLink>
</template>
<script setup>
const runtimeConfig = useRuntimeConfig()
console.log(runtimeConfig.public)
const trustpilotLink = ref(runtimeConfig.public.TRUSTPILOT_LINK)
</script>
