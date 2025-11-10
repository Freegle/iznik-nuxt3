<template>
  <div>
    <b-input-group>
      <b-form-input
        v-model="term"
        placeholder="Email/name/id"
        @keyup.native.enter="search"
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
const term = ref('')

const emit = defineEmits(['searched'])

const search = async (callback) => {
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
