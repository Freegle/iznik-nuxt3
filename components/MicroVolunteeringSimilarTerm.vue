<template>
  <div>
    <b-button
      v-if="similar"
      class="selected font-weight-bold"
      variant="white"
      size="lg"
      @click="emit('not')"
    >
      {{ term.term }}
    </b-button>
    <b-button
      v-else
      class="unselected font-weight-bold"
      variant="white"
      size="lg"
      @click="emit('similar')"
    >
      {{ term.term }}
    </b-button>
  </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  term: {
    type: Object,
    required: true,
  },
  similarTerms: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['similar', 'not'])

const similar = computed(() => {
  return props.similarTerms.find((t) => t.id === props.term.id)
})
</script>
<style scoped lang="scss">
.selected {
  background-color: $colour-secondary !important;
  border-color: $color-blue--2 !important;
  color: $color-white !important;
}

.unselected {
  background-color: $color-white !important;
  border-color: $color-green--dark !important;
  color: $color-black !important;
}
</style>
