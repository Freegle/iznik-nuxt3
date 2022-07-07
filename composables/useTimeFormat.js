// Vue v3 doesn't support filters, so we have a global mixin which defines methods to achieve the same goal.
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'

dayjs.extend(isToday)

export function timeago(val) {
  // dayjs pluralises wrongly in some cases - we've seen 1 hours ago.
  const dePlural = /^1 (.*)s/

  let f = dayjs(val).fromNow()
  f = f.replace(dePlural, '1 $1')

  return f
}

export function timeadapt(val) {
  const t = dayjs(val)

  if (t.isToday()) {
    // For today, just show the time.
    return t.format('HH:mm')
  } else {
    return t.format('DD MMM YYYY HH:mm')
  }
}

export function dateonly(val) {
  return dayjs(val).format('Do MMMM, YYYY')
}

export function datetime(val) {
  return dayjs(val).format('Do MMMM, YYYY HH:mm:ss')
}

export function datetimeshort(val) {
  return dayjs(val).format('Do MMM, YYYY HH:mm')
}

export function dateshort(val) {
  return dayjs(val).format('MMM DD, YYYY')
}
