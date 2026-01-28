<template>
  <b-form-select v-model="type">
    <option value="0">All members</option>
    <option value="3">Bouncing</option>
    <option value="2">Moderation Team</option>
    <option value="1">With notes</option>
    <option value="5">Banned</option>
  </b-form-select>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: false,
    default: '0',
  },
})

const emit = defineEmits(['update:modelValue'])

const type = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val + '')
  },
})
</script>
<style scoped>
select {
  max-width: 200px;
}
</style>
