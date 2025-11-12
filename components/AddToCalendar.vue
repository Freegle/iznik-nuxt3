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
  console.log('AddToCalendar button clicked!')
  e.preventDefault()
  e.stopPropagation()

  // Extract and decode the calendar data from the link
  console.log('calendarLink:', props.calendarLink)
  const url = new URL(props.calendarLink)
  const encodedData = url.searchParams.get('data')
  if (!encodedData) {
    console.error('No calendar data found in link')
    return
  }

  console.log('Decoding calendar data...')
  const decodedData = atob(encodedData)
  const eventData = JSON.parse(decodedData)
  console.log('Event data:', eventData)

  const mobileStore = useMobileStore()
  console.log('Is app?', mobileStore.isApp)
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
  let startDate, endDate

  try {
    // Try to use timezone-aware parsing
    const startDateTime = `${eventData.startDate} ${eventData.startTime}`
    const endDateTime = `${eventData.startDate} ${eventData.endTime}`

    startDate = dayjs.tz(startDateTime, eventData.timeZone).toDate()
    endDate = dayjs.tz(endDateTime, eventData.timeZone).toDate()

    // Validate the dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new TypeError('Invalid dates from timezone parsing')
    }
    console.log('Using timezone-aware dates:', startDate, endDate)
  } catch (err) {
    // Fallback to simple local time parsing if timezone parsing fails
    console.log('Timezone parsing failed, using fallback:', err)
    const [year, month, day] = eventData.startDate.split('-').map(Number)
    const [startHour, startMin] = eventData.startTime.split(':').map(Number)
    const [endHour, endMin] = eventData.endTime.split(':').map(Number)

    startDate = new Date(year, month - 1, day, startHour, startMin, 0)
    endDate = new Date(year, month - 1, day, endHour, endMin, 0)
    console.log('Using fallback dates:', startDate, endDate)
  }

  const title = eventData.name
  const eventLocation = eventData.location || ''
  const notes = eventData.description

  // Check if calendar plugin is available
  console.log('Checking for calendar plugin...')
  console.log('window.plugins:', window.plugins)
  console.log('window.plugins.calendar:', window.plugins?.calendar)

  if (!window.plugins || !window.plugins.calendar) {
    console.error('Calendar plugin not available')
    return
  }

  console.log('Calendar plugin is available!')
  console.log('Creating calendar event:', {
    title,
    location: eventLocation,
    notes,
    startDate,
    endDate,
  })

  // Call hasWritePermission
  // Then requestWritePermission if necessary
  // Then createEventInteractively if possible
  const success = function (message) {
    console.log('Add calendar success', JSON.stringify(message))
  }
  const error = function (message) {
    console.error('Add calendar error:', message)
  }
  const error1 = function (message) {
    console.error('hasWritePermission error:', message)
  }
  const errorw = function (message) {
    console.error('requestWritePermission error:', message)
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
    console.log('hasWritePermission success:', JSON.stringify(message))
    if (message || !mobileStore.isiOS) {
      console.log('Calling createEventInteractively directly')
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
      console.log('Requesting write permission first')
      window.plugins.calendar.requestWritePermission(successw, errorw)
    }
  }

  window.plugins.calendar.hasWritePermission(success1, error1)
}
</script>
