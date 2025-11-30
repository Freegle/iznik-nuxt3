// Vue v3 doesn't support filters, so we have a composable which defines methods to achieve the same goal.
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(advancedFormat)
dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export function earliestDate(dates, ofall) {
  // Find the earliest date which is in the future.
  const now = Date.now()
  let earliest = null
  let earliestDate = null

  for (let i = 0; i < dates?.length; i++) {
    const atime = new Date(dates[i].start).getTime()
    if ((ofall || atime >= now) && (!earliest || atime < earliest)) {
      earliest = atime
      earliestDate = dates[i]
    }
  }

  return earliestDate
}

export function addStrings(item, times) {
  // Add human readable versions of each date range.
  if (item) {
    for (let i = 0; i < item?.dates?.length; i++) {
      const date = item.dates[i]
      const startm = dayjs(date.start)
      let endm = dayjs(date.end)

      if (times) {
        endm = endm.isSame(startm, 'day')
          ? endm.format('HH:mm')
          : endm.format('ddd, Do MMM HH:mm')

        item.dates[i].string = {
          start: startm.format('ddd, Do MMM HH:mm'),
          end: endm,
          past: Date.now() > new Date(date.start),
        }
      } else {
        endm = endm.format('ddd, Do MMM')

        item.dates[i].string = {
          start: startm.format('ddd, Do MMM'),
          end: endm,
          past: Date.now() > new Date(date.start),
        }
      }
    }
  }

  return item
}

export function timeago(val, past) {
  // console.log('TIMEAGO',val)
  let f = null

  // dayjs pluralises wrongly in some cases - we've seen 1 hours ago.
  const dePlural = /^1 (.*)s/

  const v = dayjs(val)
  f = v.fromNow()
  f = f.replace(dePlural, '1 $1')

  if (past && f === 'in a few seconds') {
    f = 'just now'
  }

  return f
}

export function timeagoShort(val) {
  // Compact time format: "25d", "3h", "5m", "now"
  const now = dayjs()
  const then = dayjs(val)
  const diffMinutes = now.diff(then, 'minute')
  const diffHours = now.diff(then, 'hour')
  const diffDays = now.diff(then, 'day')
  const diffWeeks = now.diff(then, 'week')
  const diffMonths = now.diff(then, 'month')

  if (diffMinutes < 1) {
    return 'now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m`
  } else if (diffHours < 24) {
    return `${diffHours}h`
  } else if (diffDays < 7) {
    return `${diffDays}d`
  } else if (diffWeeks < 5) {
    return `${diffWeeks}w`
  } else {
    return `${diffMonths}mo`
  }
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

export function timeadaptChat(val) {
  // Compact chat timestamp: time only for today, day+time for this week, date+time otherwise
  const t = dayjs(val)
  const now = dayjs()

  if (t.isToday()) {
    return t.format('HH:mm')
  } else if (now.diff(t, 'day') < 7) {
    // Within last week, show day and time
    return t.format('ddd HH:mm')
  } else if (t.year() === now.year()) {
    // This year, no need to show year
    return t.format('D MMM HH:mm')
  } else {
    return t.format('D MMM YYYY HH:mm')
  }
}

export function datelocale(val) {
  return dayjs(val).toLocaleString()
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

export function dateonlyNoYear(val) {
  return dayjs(val).format('Do MMMM')
}

export function weekdayshort(val) {
  return dayjs(val).format('dddd Do HH:mm a')
}
