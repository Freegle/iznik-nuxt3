<template>
  <b-button variant="secondary" size="sm" @click="copy">
    <v-icon v-if="!saving" icon="copy" />
    <v-icon v-else icon="check" />
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
  data: function () {
    return {
      saving: false,
    }
  },
  methods: {
    async copy() {
      this.saving = true
      if (process.client) {
        if (process.env.IS_APP) {
          window.cordova.plugins.clipboard.copy(this.selectedText)
        } else {
          await navigator.clipboard.writeText(this.value)
        }
      }
      setTimeout(() => (this.saving = false), 1000)
    },
  },
}
</script>
