<template>
  <div>
    <div v-for="item in itemsToShow" :key="item[keyfield]">
      <slot name="item" :item="item"> Item {{ item[keyfield] }} </slot>
    </div>
    <b-button
      v-if="items.length > limit && !expanded"
      variant="link"
      @click="expanded = true"
    >
      Show more...
    </b-button>
  </div>
</template>
<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  limit: {
    type: Number,
    required: false,
    default: 10,
  },
  keyfield: {
    type: String,
    required: false,
    default: 'id',
  },
})

const expanded = ref(false)

const itemsToShow = computed(() => {
  if (expanded.value || props.items.length < props.limit) {
    return props.items
  } else {
    return props.items.slice(0, props.limit)
  }
})
</script>
