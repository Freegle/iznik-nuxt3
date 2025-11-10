<template>
  <b-button variant="secondary" size="sm" @click="copy">
    <v-icon icon="copy" />
  </b-button>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  methods: {
    async copy() {
      if (process.client) {
        if (process.env.IS_APP) {
          window.cordova.plugins.clipboard.copy(this.selectedText)
        } else {
          await navigator.clipboard.writeText(this.value)
        }
      }
    },
  },
}
</script>
