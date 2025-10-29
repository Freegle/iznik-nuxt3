<template>
  <span>
    {{ formatted }}
  </span>
</template>
<script setup>
import {
  dateonly,
  datetime,
  datetimeshort,
  dateshort,
  weekdayshort,
  dateonlyNoYear,
} from '~/composables/useTimeFormat'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    required: false,
    default: 'datetime',
  },
})

const formatted = computed(() => {
  let ret = null

  switch (props.format) {
    case 'dateonly':
      ret = dateonly(props.value)
      break
    case 'dateonlyNoYear':
      ret = dateonlyNoYear(props.value)
      break
    case 'dateshort':
      ret = dateshort(props.value)
      break
    case 'datetime':
      ret = datetime(props.value)
      break
    case 'datetimeshort':
      ret = datetimeshort(props.value)
      break
    case 'weekdaytime':
      ret = weekdayshort(props.value)
      break
    default:
      ret = datetime(props.value)
      break
  }

  return ret
})
</script>
