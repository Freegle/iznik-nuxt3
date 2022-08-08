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
  // timeago(val) {
  //   // dayjs pluralises wrongly in some cases - we've seen 1 hours ago.
  //   const dePlural = new RegExp(/^1 (.*)s/)
  //
  //   let f = dayjs(val).fromNow()
  //   f = f.replace(dePlural, '1 $1')
  //
  //   return f
  // },
  // timeadapt(val) {
  //   const t = dayjs(val)
  //
  //   if (t.isToday()) {
  //     // For today, just show the time.
  //     return t.format('HH:mm')
  //   } else {
  //     return t.format('DD MMM YYYY HH:mm')
  //   }
  // },
}
</script>
