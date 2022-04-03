<template>
  <div>
    <p>
      Button here
    </p>
    <b-button variant="primary">
      Test {{ config.API }}
    </b-button>
  </div>
</template>
<script setup>
const config = useRuntimeConfig()

// TODO Can we avoid having to default the default layout on each page?  Didn't want to work.
definePageMeta({
  layout: "default",
});
</script>
<script>
export default {
  mounted() {
    console.log("Page mounted")
  }
}
</script>