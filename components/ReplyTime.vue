<template>
  <div>
    <p v-if="replytime">
      <v-icon icon="clock" class="fa-fw" />&nbsp;
      <span> Typically replies in {{ replytime }}. </span>
    </p>
    <p v-else>
      <v-icon icon="clock" class="fa-fw" />&nbsp;
      <span> We don't know how long they typically take to reply. </span>
    </p>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const userStore = useUserStore()

const user = computed(() => {
  return props.id ? userStore?.byId(props.id) : null
})

const replytime = computed(() => {
  if (user.value && user.value.info && user.value.info.replytime) {
    let ret
    const secs = user.value.info.replytime

    if (secs < 60) {
      ret = Math.round(secs) + ' second'
    } else if (secs < 60 * 60) {
      ret = Math.round(secs / 60) + ' minute'
    } else if (secs < 24 * 60 * 60) {
      ret = Math.round(secs / 60 / 60) + ' hour'
    } else {
      ret = Math.round(secs / 60 / 60 / 24) + ' day'
    }

    if (ret.indexOf('1 ') !== 0) {
      ret += 's'
    }

    return ret
  }

  return null
})
</script>
