<template>
  <div class="d-flex flex-column">
    <label :for="$id('what')">What is it?</label>
    <b-form-input
      :id="$id('what')"
      :value="modelValue"
      placeholder="In a single word or phrase, what is it?"
      maxlength="60"
      spellcheck="true"
      size="lg"
      @input="input"
    />
  </div>
</template>
<script>
import { uid } from '../composables/useId'

export default {
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  methods: {
    input(value) {
      this.$emit('update:modelValue', value)
    },
    $id(type) {
      return uid(type)
    },
  },
}
</script>
