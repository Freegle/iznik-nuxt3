<template>
  <div>
    <div
      v-if="!highlighted || highlighted.id !== changed.id"
      class="small clickme"
      @click="emit('click')"
    >
      {{ changed.name }}: {{ changed.oldname }} => {{ changed.newname }}
    </div>
    <div v-else class="text-danger font-weight-bold">
      {{ changed.name }}: {{ changed.oldname }} => {{ changed.newname }}
    </div>
  </div>
</template>
<script setup>
defineProps({
  changed: {
    type: Object,
    required: true,
  },
  highlighted: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['click'])
</script>
