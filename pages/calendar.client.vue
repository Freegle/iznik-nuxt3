<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="mt-2">
        <div v-if="error">
          <h1 class="text-danger">Error</h1>
          <p>{{ error }}</p>
        </div>
        <div v-else>
          <h1>{{ eventData.name }}</h1>
          <div v-if="eventData.description" class="mb-3">
            <p v-html="descriptionWithLinks"></p>
          </div>
          <div v-if="eventData.name">
            <add-to-calendar-button
              style-light="background-color: #61AE24; color: white; border-radius: 4px; padding: 10px 20px; border: none; font-weight: 500;"
              button-style="default"
              light-mode="bodyScheme"
            >
              {{
                JSON.stringify({
                  name: eventData.name,
                  description: eventData.description,
                  startDate: eventData.startDate,
                  startTime: eventData.startTime,
                  endTime: eventData.endTime,
                  timeZone: eventData.timeZone,
                  location: eventData.location,
                  options: ['Google', 'Apple', 'Microsoft365', 'Yahoo', 'iCal'],
                })
              }}
            </add-to-calendar-button>
          </div>
        </div>
      </b-col>
    </b-row>
  </client-only>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

// Import the component only on client-side, before any rendering
if (process.client) {
  await import('add-to-calendar-button')
}

const eventData = ref({
  name: '',
  description: '',
  startDate: '',
  startTime: '',
  endTime: '',
  timeZone: 'Europe/London',
  location: '',
})

const error = ref(null)

const descriptionWithLinks = computed(() => {
  if (!eventData.value.description) return ''
  return eventData.value.description.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  )
})

try {
  const data = route.query.data

  if (!data) {
    throw new Error('No calendar event data provided')
  }

  const decoded = atob(data)
  const parsed = JSON.parse(decoded)

  if (!parsed.name || !parsed.startDate || !parsed.startTime) {
    throw new Error('Missing required event information')
  }

  eventData.value = {
    name: parsed.name || '',
    description: parsed.description || '',
    startDate: parsed.startDate || '',
    startTime: parsed.startTime || '',
    endTime: parsed.endTime || '',
    timeZone: parsed.timeZone || 'Europe/London',
    location: parsed.location || '',
  }
} catch (e) {
  console.error('Error in calendar page setup:', e)
  error.value = 'Unable to load calendar event: ' + e.message
}

useHead({
  ...buildHead(
    route,
    runtimeConfig,
    'Add to Calendar',
    'Add this Freegle handover to your calendar'
  ),
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/add-to-calendar-button@2/assets/css/atcb.css',
    },
  ],
})
</script>
