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
</script>
<script>
export default {
}
</script>