<template>
  <div>
    <DiffPart
      v-for="part in diff"
      :key="'diff-' + JSON.stringify(part)"
      :part="part"
    />
  </div>
</template>
<script>
import { diffChars } from 'diff'

export default {
  props: {
    old: {
      type: String,
      required: false,
      default: '',
    },
    new: {
      type: String,
      required: false,
      default: '',
    },
  },
  computed: {
    diff() {
      if (!this.old || !this.new) {
        return null
      }

      const ret = diffChars(this.old, this.new)
      return ret
    },
  },
}
</script>
