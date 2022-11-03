<template>
  <ExternalLink class="font-weight-bold" :href="href" style="color: black">{{
    text
  }}</ExternalLink>
</template>
<script>
export default {
  props: {
    text: {
      type: String,
      default: 'support@ilovefreegle.org',
    },
  },
  computed: {
    href() {
      if (this.myid) {
        return (
          'mailto:support@ilovefreegle.org?body=%0D%0A%0D%0ANote to support: this freegler was logged in as user id: #' +
          this.myid +
          '.'
        )
      } else {
        return 'mailto:support@ilovefreegle.org?body=%0D%0A%0D%0ANote to support: this freegler was not logged in.'
      }
    },
  },
}
</script>
