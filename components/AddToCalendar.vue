<template>
  <div>
    <b-button
      :variant="variant"
      :size="size"
      :class="btnClass"
      @click="download"
    >
      <v-icon icon="calendar-alt" />
      Add to Calendar
    </b-button>
    {{ message }}
  </div>
</template>
<script setup>
import saveAs from 'save-file'
import { useMobileStore } from '@/stores/mobile' // APP

const props = defineProps({
  variant: {
    type: String,
    required: false,
    default: 'secondary',
  },
  ics: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
  btnClass: {
    type: String,
    required: false,
    default: '',
  },
})

const message = ref(null) // TODO Seems unused

async function download(e) {
  e.preventDefault()
  e.stopPropagation()
  const mobileStore = useMobileStore()
  if (!mobileStore.isApp) {
    // APP
    const blob = new Blob([props.ics], { type: 'text/calendar;charset=utf-8' })
    await saveAs(blob, 'freegle-handover.ics')
    return
  }
  // APP..
  // webcal://localhost/myCalendar.ics
  // https://www.npmjs.com/package/cordova-plugin-calendar
  // https://github.com/uzurv/Calendar-PhoneGap-Plugin-ios-17-support

  function getCalProp(lines, name) {
    name += ':'
    const namelen = name.length
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.length >= namelen) {
        if (line.substring(0, namelen) === name) {
          let rv = line.substring(namelen)
          while (++i < lines.length) {
            const nextline = lines[i]
            if (nextline.substring(0, 1) !== ' ') break
            rv += nextline.substring(1)
          }
          return rv
        }
      }
    }
    return ''
  }
  const lines = props.ics.split('\r\n')
  const dtstart = getCalProp(lines, 'DTSTART;TZID=Europe/London') // 20210109T110000
  const year = parseInt(dtstart.substring(0, 4))
  const month = parseInt(dtstart.substring(4, 6)) - 1
  const dom = parseInt(dtstart.substring(6, 8))
  const hour = parseInt(dtstart.substring(9, 11))
  const mins = parseInt(dtstart.substring(11, 13))
  const secs = parseInt(dtstart.substring(13, 15))
  const startDate = new Date(year, month, dom, hour, mins, secs)
  const endDate = new Date(startDate.getTime() + 5 * 60 * 1000)
  const title = getCalProp(lines, 'SUMMARY')
  const eventLocation = ''
  const notes = getCalProp(lines, 'DESCRIPTION')
  // console.log('window.plugins',window.plugins)

  // Call hasWritePermission
  // Then requestWritePermission if necessary
  // Then createEventInteractively if possible
  const success = function (message) {
    console.log('Add calendar success', JSON.stringify(message))
  }
  const error = function (message) {
    console.log('Add calendar error: ' + message)
  } // TODO
  const error1 = function (message) {
    console.log('hasWritePermission error: ' + message)
  }
  const errorw = function () {
    console.log('requestWritePermission error')
  }
  const successw = function () {
    console.log('requestWritePermission success')
    window.plugins.calendar.createEventInteractively(
      title,
      eventLocation,
      notes,
      startDate,
      endDate,
      success,
      error
    )
  }
  const success1 = function (message) {
    console.log('hasWritePermission success', JSON.stringify(message))
    if (message || !mobileStore.isiOS) {
      window.plugins.calendar.createEventInteractively(
        title,
        eventLocation,
        notes,
        startDate,
        endDate,
        success,
        error
      )
    } else {
      window.plugins.calendar.requestWritePermission(successw, errorw) // Android: successw not called
    }
  }

  window.plugins.calendar.hasWritePermission(success1, error1) // Always success: message: self.eventStore != nil
}
</script>
