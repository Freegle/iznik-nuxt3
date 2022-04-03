<template>
  <div>
    <p>
      Button here to show Bootstrap customisation + env var access.
    </p>
    <b-button variant="primary">
      Test {{ config.API }}
    </b-button>
    <p>
      Time now to show store access and reactivity: {{ misc.time }}
    </p>
  </div>
</template>
<script setup>
import { useMiscStore } from '../stores/misc'

const config = useRuntimeConfig()

// TODO Can we avoid having to default the default layout on each page?  Didn't want to work.
definePageMeta({
  layout: "default",
});

const misc = useMiscStore()

</script>
<script>
export default {
  mounted() {
    console.log("Page mounted")
  }
}
</script>