<template>
  <client-only>
    <ExternalLink class="font-weight-bold" :href="href" style="color: black">{{
      text
    }}</ExternalLink>
  </client-only>
</template>
<script>
export default {
  props: {
    text: {
      type: String,
      default: 'support@ilovefreegle.org',
    },
    email: {
      type: String,
      default: 'support@ilovefreegle.org',
    },
    info: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    href() {
      const infostr = this.info ? '%0D%0A%0D%0A' + this.info : ''
      if (this.myid) {
        return (
          'mailto:' +
          this.email +
          '?body=' +
          infostr +
          '%0D%0A%0D%0ANote to support: this freegler was logged in as user id: #' +
          this.myid +
          '.'
        )
      } else {
        return (
          'mailto:' +
          this.email +
          '?body=' +
          infostr +
          '%0D%0A%0D%0ANote to support: this freegler was not logged in when contacting Support to send this mail.'
        )
      }
    },
  },
}
</script>
