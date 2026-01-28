<template>
  <b-button variant="secondary" size="sm" @click="copy">
    <v-icon v-if="!saving" icon="copy" />
    <v-icon v-else icon="check" />
  </b-button>
</template>
<script setup>
import { ref } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
})

const saving = ref(false)

async function copy() {
  saving.value = true
  if (process.client) {
    if (process.env.IS_APP) {
      window.cordova.plugins.clipboard.copy(props.value)
    } else {
      await navigator.clipboard.writeText(props.value)
    }
  }
  setTimeout(() => (saving.value = false), 1000)
}
</script>
