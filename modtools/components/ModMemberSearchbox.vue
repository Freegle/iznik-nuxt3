<template>
  <b-input-group class="flex max">
    <b-form-input
      v-model="term"
      type="text"
      placeholder="Search email/name/id"
      autocapitalize="none"
      @keyup.enter="dosearch"
    />
    <slot name="append">
      <b-button variant="primary" @click="dosearch">
        <v-icon icon="search" />
      </b-button>
    </slot>
  </b-input-group>
</template>
<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  search: {
    type: String,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['search'])

const term = ref(null)

onMounted(() => {
  term.value = props.search
})

function dosearch() {
  emit('search', term.value)
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
