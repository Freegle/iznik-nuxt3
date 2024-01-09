<template>
  <div>
    <NewsPreview
      v-for="preview in previews"
      :key="preview.id"
      :preview="preview"
      :size="size"
    />
  </div>
</template>
<script setup>
defineProps({
  previews: {
    type: Array,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
})
</script>
