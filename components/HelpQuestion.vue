<template>
  <div v-show="matches.includes(id)" :id="id">
    <h3 class="text-black" @click="expand">
      <slot name="title"></slot>
    </h3>
    <slot v-if="expanded || matches.length <= 3" name="default"> </slot>
    <div v-else>
      <b-button variant="white" @click="expand">
        Click to show answer
      </b-button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'

defineProps({
  id: {
    type: String,
    required: true,
  },
  matches: {
    type: Array,
    required: true,
  },
})

const expanded = ref(false)

function expand() {
  expanded.value = !expanded.value
}
</script>
