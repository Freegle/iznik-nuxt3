<template>
  <div>
    <b-input-group>
      <b-form-input v-model="term" placeholder="Email/name/id" @keyup.native.enter="search" />
      <b-input-group-append>
        <SpinButton variant="primary" icon-name="search" label="Search" spinclass="text-white" :handler="search" :disabled="!term" />
      </b-input-group-append>
    </b-input-group>
  </div>
</template>

<script setup>
import { useMessageStore } from '~/stores/message'
const messageStore = useMessageStore()

const term = ref(null)
const busy = ref(false)

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null
  }
})

const search = async () => {
  busy.value = true
  const term = term.value.trim()
  this.$emit('searched', term)

  await messageStore.clear()

  await messageStore.searchMember(term, props.groupid)

  busy.value = false
}
</script>

<style scoped>
input {
  max-width: 320px;
}
</style>
