<template>
  <ExternalDa
    :key="'da-' + dimension"
    :ad-unit-path="adUnitPath"
    :dimensions="dimension"
    :div-id="divId"
    :pixel="pixel"
    @rendered="rendered"
  />
</template>
<script setup>
import { ref, computed } from '#imports'

const props = defineProps({
  adUnitPath: {
    type: String,
    required: true,
  },
  dimensions: {
    type: Array,
    required: true,
  },
  divId: {
    type: String,
    required: true,
  },
  pixel: {
    type: Boolean,
    default: false,
  },
})

const dimToTry = ref(0)

const emit = defineEmits(['rendered'])
const dimension = computed(() => props.dimensions[dimToTry.value])

function rendered(rendered) {
  console.log('Rendered?', rendered, dimension.value)
  if (rendered) {
    console.log('Successfully rendered')
    emit('rendered', true, dimToTry.value, dimension.value)
  } else if (dimToTry.value < props.dimensions.length - 1) {
    dimToTry.value++
    console.log('Try ad', dimToTry.value)
  } else {
    console.log('Run out of ads')
    emit('rendered', false)
  }
}
</script>
