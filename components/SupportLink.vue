<template>
  <client-only>
    <ExternalLink class="font-weight-bold" :href="href" style="color: black">{{
      text
    }}</ExternalLink>
  </client-only>
</template>
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
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
})

const authStore = useAuthStore()
const myid = authStore.user?.id

const href = computed(() => {
  const infostr = props.info ? '%0D%0A%0D%0A' + props.info : ''
  if (myid) {
    return (
      'mailto:' +
      props.email +
      '?body=' +
      infostr +
      '%0D%0A%0D%0ANote to support: this freegler was logged in as user id: #' +
      myid +
      '.'
    )
  } else {
    return (
      'mailto:' +
      props.email +
      '?body=' +
      infostr +
      '%0D%0A%0D%0ANote to support: this freegler was not logged in when contacting Support to send this mail.'
    )
  }
})
</script>
