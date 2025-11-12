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
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useMobileStore } from '@/stores/mobile' // APP

dayjs.extend(utc)
dayjs.extend(timezone)

const props = defineProps({
  variant: {
    type: String,
    required: false,
    default: 'secondary',
  },
  calendarLink: {
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

  // Extract and decode the calendar data from the link
  const url = new URL(props.calendarLink)
  const encodedData = url.searchParams.get('data')
  if (!encodedData) {
    console.error('No calendar data found in link')
    return
  }

  const decodedData = atob(encodedData)
  const eventData = JSON.parse(decodedData)

  const mobileStore = useMobileStore()
  if (!mobileStore.isApp) {
    // Web version - generate ICS file from the structured data
    const startDateTime = `${eventData.startDate.replace(
      /-/g,
      ''
    )}T${eventData.startTime.replace(/:/g, '')}00`
    const endDateTime = `${eventData.startDate.replace(
      /-/g,
      ''
    )}T${eventData.endTime.replace(/:/g, '')}00`

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Freegle//NONSGML Event//EN',
      'BEGIN:VEVENT',
      `DTSTART;TZID=${eventData.timeZone}:${startDateTime}`,
      `DTEND;TZID=${eventData.timeZone}:${endDateTime}`,
      `SUMMARY:${eventData.name}`,
      `DESCRIPTION:${eventData.description}`,
      `LOCATION:${eventData.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    await saveAs(blob, 'freegle-handover.ics')
    return
  }

  // APP version - use Cordova calendar plugin with structured data
  // Parse the start date and time using dayjs with timezone support
  const startDateTime = `${eventData.startDate} ${eventData.startTime}`
  const endDateTime = `${eventData.startDate} ${eventData.endTime}`

  // Create dates in the specified timezone and convert to local device time
  const startDate = dayjs.tz(startDateTime, eventData.timeZone).toDate()
  const endDate = dayjs.tz(endDateTime, eventData.timeZone).toDate()

  const title = eventData.name
  const eventLocation = eventData.location || ''
  const notes = eventData.description
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
