<template>
  <b-form-select v-model="type">
    <option value="0">All members</option>
    <option value="3">Bouncing</option>
    <option value="2">Moderation Team</option>
    <option value="1">With notes</option>
    <option value="5">Banned</option>
  </b-form-select>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      required: false,
    },
  },
  computed: {
    type: {
      // Seems to work when called with v-model="xxx"
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val + '')
      },
    },
  },
}
</script>
<style scoped>
select {
  max-width: 200px;
}
</style>
