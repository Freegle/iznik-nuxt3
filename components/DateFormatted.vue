<template>
  <span>
    {{ formatted }}
  </span>
</template>
<script>
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  dateonly,
  datetime,
  datetimeshort,
  dateshort,
  weekdayshort,
} from '../composables/useTimeFormat'

dayjs.extend(advancedFormat)
dayjs.extend(relativeTime)

export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: false,
      default: 'datetime',
    },
  },
  computed: {
    formatted() {
      let ret = null

      switch (this.format) {
        case 'dateonly':
          ret = dateonly(this.value)
          break
        case 'dateshort':
          ret = dateshort(this.value)
          break
        case 'datetime':
          ret = datetime(this.value)
          break
        case 'datetimeshort':
          ret = datetimeshort(this.value)
          break
        case 'weekdaytime':
          ret = weekdayshort(this.value)
          break
        default:
          ret = datetime(this.value)
          break
      }

      return ret
    },
  },
}
</script>
