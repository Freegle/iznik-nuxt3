<template>
  <div>
    <b-input-group>
      <b-form-input
        v-model="term"
        placeholder="Message id/subject"
        @keyup.enter="search"
      />
      <slot name="append">
        <SpinButton
          variant="primary"
          icon-name="search"
          label="Search"
          spinclass="text-white"
          @handle="search"
        />
      </slot>
    </b-input-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  messageTerm: {
    type: String,
    required: false,
    default: null,
  },
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['searched', 'changed'])

const term = computed({
  get() {
    return props.messageTerm
  },
  set(newterm) {
    emit('changed', newterm)
  },
})

const search = (callback) => {
  const theterm = term.value?.trim()
  emit('searched', theterm)
  if (typeof callback === 'function') {
    callback()
  }
}
</script>
<style scoped>
input {
  max-width: 320px;
}
</style>
