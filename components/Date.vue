<template>
  {{ formatted }}
</template>
<script>
import dayjs from 'dayjs'

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
      let format

      switch (this.format) {
        case 'dateonly':
          format = 'Do MMMM, YYYY'
          break
        case 'datetime':
          format = 'Do MMMM, YYYY HH:mm:ss'
          break
        case 'datetimeshort':
          format = 'Do MMM, YYYY HH:mm'
          break
        default:
          format = 'Do MMMM, YYYY HH:mm:ss'
          break
      }

      return dayjs(this.value).format(format)
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
