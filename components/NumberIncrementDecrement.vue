<template>
  <div class="d-flex flex-column text-center width position-relative">
    <label
      :for="$id('spinbutton')"
      :class="{
        'visually-hidden': labelSROnly,
      }"
      >{{ label }}</label
    >
    <vue-number-input
      :model-value="modelValue"
      controls
      inline
      center
      :step="1"
      :min="min"
      :max="max"
      :size="size"
      :class="'inputsize-' + size"
      @update:model-value="update"
    />
    <div v-if="appendText" class="available text-muted small">
      {{ appendText.trim() }}
    </div>
  </div>
</template>
<script setup>
import VueNumberInput from '@chenfengyuan/vue-number-input'
import { uid } from '~/composables/useId'

defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    required: false,
    default: 1,
  },
  max: {
    type: Number,
    required: false,
    default: 999,
  },
  label: {
    type: String,
    required: false,
    default: '',
  },
  labelSROnly: {
    type: Boolean,
    required: false,
    default: false,
  },
  appendText: {
    type: String,
    required: false,
    default: '',
  },
  size: {
    type: String,
    required: false,
    default: 'lg',
  },
})

const emit = defineEmits(['update:modelValue'])

const $id = (type) => {
  return uid(type)
}

const update = (newVal, oldVal) => {
  emit('update:modelValue', newVal, oldVal)
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.border {
  border: 1px solid black;
}

:deep(input) {
  border-bottom-left-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  font-size: 1.6rem !important;
  line-height: 2rem !important;
  padding-top: 0.2rem !important;
  padding-bottom: 0.7rem !important;
  padding-left: 1rem;
  padding-right: 1rem;
}

:deep(.inputsize-small input) {
  font-size: 1rem !important;
  line-height: 1.5rem !important;
  padding-top: 0.2rem !important;
  padding-bottom: 0.5rem !important;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.available {
  //position: absolute;
  translate: 0 -14px;
  font-size: 0.6rem;
}
</style>
