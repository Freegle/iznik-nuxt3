<template>
  <div>
    <b-input-group>
      <b-form-input v-model="term" placeholder="Message id/subject" @keyup.native.enter="search" />
      <b-input-group-append>
        <SpinButton variant="primary" icon-name="search" label="Search" spinclass="text-white" @handle="search" :disabled="!term" />
      </b-input-group-append>
    </b-input-group>
  </div>
</template>

<script setup>
const term = ref(null)

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null
  }
})

const emit = defineEmits(['searched'])

const search = async (callback) => {
  const theterm = term.value.trim()
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
