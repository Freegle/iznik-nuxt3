<template>
  <div class="bg-white">
    <!-- Run Selector -->
    <div v-if="!selectedRunId">
      <div class="p-3">
        <div class="intro-text mb-3">
          <p>
            This is a simulation of how we could use an "isochrone" (travel-time boundary) approach to
            show posts to gradually increasing numbers of people to generate replies.  It uses historical
            data about posts, replies and active members.
          </p>
        </div>
        <div class="form-group">
          <label for="groupSelect"><strong>Choose a group:</strong></label>
          <ModGroupSelect id="groupSelect" v-model="groupid" systemwide listall />
        </div>
        <div v-if="groupid" class="mt-3">
          <div v-if="loadingRuns" class="text-center p-4">
            <b-spinner variant="primary" />
            <p class="mt-3">Loading simulation runs...</p>
          </div>
          <div v-else-if="runsError" class="alert alert-danger">
            {{ runsError }}
          </div>
          <div v-else-if="filteredRuns.length === 0" class="alert alert-info">
            No completed simulation runs found for this group. Please run a simulation first using
            the CLI script.
          </div>
          <div v-else>
            <div class="form-group">
              <label for="runSelect"><strong>Choose a simulation run:</strong></label>
              <select
                  id="runSelect"
                  v-model="selectedRunId"
                  class="form-control"
              >
                <option :value="null">-- Select a simulation run --</option>
                <option
                    v-for="run in filteredRuns"
                    :key="run.id"
                    :value="run.id"
                >
                  {{ run.name }} ({{ run.message_count }} messages) -
                  {{ formatDate(run.created) }}
                </option>
              </select>
            </div>

            <!-- Show details of selected run -->
            <div v-if="selectedRun" class="run-details">
              <h4>Run Details</h4>
              <p><strong>Description:</strong> {{ selectedRun.description || 'N/A' }}</p>
              <p>
                <strong>Created:</strong> {{ formatDate(selectedRun.created) }}
              </p>
              <p>
                <strong>Completed:</strong> {{ formatDate(selectedRun.completed) }}
              </p>
              <p><strong>Messages:</strong> {{ selectedRun.message_count }}</p>

              <h5>Parameters</h5>
              <pre class="params-display">{{ JSON.stringify(selectedRun.parameters, null, 2) }}</pre>

              <h5>Filters</h5>
              <pre class="params-display">{{ JSON.stringify(selectedRun.filters, null, 2) }}</pre>

              <h5>Metrics</h5>
              <pre class="params-display">{{ JSON.stringify(selectedRun.metrics, null, 2) }}</pre>

              <button class="btn btn-primary mt-3" @click="viewSimulation">
                View Simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simulation Viewer -->
    <div v-else>
      <div class="p-3 bg-light">
        <div class="d-flex flex-wrap align-items-center mb-3">
          <ModGroupSelect v-model="groupid" systemwide listall class="mr-3" />
          <button class="btn btn-secondary btn-sm" @click="backToSelector">
            ← Back to Run Selection
          </button>
        </div>

        <div class="intro-text mb-3">
          <p class="mb-2">
            This simulation visualises how messages spread across a Freegle group over time.
            Using historical data, it shows how an "isochrone" (travel-time boundary) expands
            outward from the message location to reach more members.
          </p>
          <div v-if="selectedRun && selectedRun.parameters" class="parameters-display">
            <strong>Experiment Parameters:</strong>
            Initial isochrone: {{ selectedRun.parameters.initialMinutes }}min,
            Max size: {{ selectedRun.parameters.maxMinutes }}min,
            Expansion increment: {{ selectedRun.parameters.increment }}min,
            Time between expansions: {{ selectedRun.parameters.timeSinceLastExpand }}min,
            Transport: {{ selectedRun.parameters.transport }}
          </div>
        </div>
      </div>
      <div v-if="loading" class="text-center p-5">
        <b-spinner variant="primary" />
        <p class="mt-3">Loading simulation data...</p>
      </div>
      <div v-else-if="error" class="alert alert-danger m-3">
        {{ error }}
      </div>
      <div v-else class="simulation-viewer">
        <div class="map-container">
          <client-only>
            <l-map
                ref="map"
                v-model:zoom="zoom"
                v-model:center="center"
                :options="{ zoomControl: true, scrollWheelZoom: true }"
                :use-global-leaflet="true"
                class="simulation-map"
                :min-zoom="8"
                :max-zoom="15"
                @ready="onMapReady"
                @moveend="onMapMoveEnd"
            >
              <l-tile-layer :url="mapTile" :attribution="mapAttribution" />

              <!-- Group CGA polygon (grey, semi-transparent) -->
              <l-geo-json
                  v-if="groupCGA"
                  :geojson="groupCGA"
                  :options="groupCGAStyle"
              />

              <!-- Message location marker -->
              <l-marker
                  v-if="messageLocation"
                  :lat-lng="messageLocation"
                  :icon="customIcon"
                  :options="{ keyboard: false }"
              />

              <!-- Active freeglers (tiny semi-transparent green dots) -->
              <l-circle-marker
                  v-for="user in nonRepliers"
                  :key="'user-' + user.properties.user_hash"
                  :lat-lng="[
              user.geometry.coordinates[1],
              user.geometry.coordinates[0],
            ]"
                  :radius="1"
                  :color="'#28a745'"
                  :fill-color="'#28a745'"
                  :fill-opacity="0.3"
              />

              <!-- Repliers (bright red small dots) -->
              <l-circle-marker
                  v-for="user in nonSuccessfulRepliers"
                  :key="'replier-' + user.properties.user_hash"
                  :lat-lng="[
              user.geometry.coordinates[1],
              user.geometry.coordinates[0],
            ]"
                  :radius="3"
                  :color="'#ff0000'"
                  :fill-color="'#ff0000'"
                  :fill-opacity="1.0"
              />

              <!-- Successful replier (bright pink pin) -->
              <l-marker
                  v-if="successfulReplier"
                  :lat-lng="[
              successfulReplier.geometry.coordinates[1],
              successfulReplier.geometry.coordinates[0],
            ]"
                  :icon="pinkIcon"
              />

              <!-- Isochrone expansion polygons (colored by sequence, excluding previous areas) -->
              <template v-if="currentExpansionIndex >= 0 && expansions.length > 0">
                <l-geo-json
                    v-for="(exp, idx) in visibleExpansions"
                    :key="'exp-' + idx"
                    :geojson="exp.geometry"
                    :options="getIsochroneStyle(idx)"
                />
              </template>
            </l-map>
          </client-only>
        </div>

        <!-- Statistics overlay -->
        <div class="stats-overlay">
          <h5>{{ message.subject }}</h5>

          <!-- Overall progress bar (2 days) -->
          <div class="progress-section">
            <div class="progress-label">Overall Progress (2 days max)</div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill overall" :style="{ width: overallProgressPercent + '%' }"></div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <strong>Successful:</strong> <span :class="successfulReplier ? 'text-success' : 'text-danger'">{{ successfulReplier ? 'Yes' : 'No' }}</span>
            </div>

            <!-- Isochrone expansion with its progress bar -->
            <div class="stat-item-group">
              <div class="stat-item">
                <strong>Isochrone Expansion:</strong> {{ currentExpansionIndex + 1 }} /
                {{ expansions.length }}
              </div>
              <div class="progress-bar-container small">
                <div class="progress-bar-fill expansion" :style="{ width: progressPercent + '%' }"></div>
              </div>
            </div>

            <div class="stat-item">
              <strong>Elapsed time:</strong> {{ animatedElapsedTime }}
            </div>
            <div class="stat-item">
              <strong>Active users covered:</strong> {{ usersReached }}
            </div>
            <div class="stat-item">
              <strong>Actual repliers:</strong> {{ repliersCovered }} / {{ message.total_replies_actual }}
            </div>
          </div>
        </div>

        <!-- Map Legend -->
        <div class="legend-overlay">
          <h6>Map Key</h6>
          <div class="legend-item">
            <div class="legend-symbol legend-polygon"></div>
            <span>Group coverage area</span>
          </div>
          <div class="legend-item">
            <div class="legend-symbol legend-freegle-marker"></div>
            <span>Message location</span>
          </div>
          <div class="legend-item">
            <div class="legend-symbol legend-active"></div>
            <span>Active users</span>
          </div>
          <div class="legend-item">
            <div class="legend-symbol legend-replier"></div>
            <span>Repliers</span>
          </div>
          <div class="legend-item">
            <div class="legend-symbol legend-successful"></div>
            <span>Successful replier</span>
          </div>
        </div>

        <!-- Navigation controls -->
        <div class="controls-overlay">
          <div class="btn-group">
            <button
                class="btn btn-secondary"
                :disabled="!navigation.has_prev"
                @click="previousMessage"
            >
              ◀◀ Prev Message ({{ navigation.current_index }}/{{ navigation.total_messages }})
            </button>
            <button
                class="btn btn-secondary"
                :disabled="currentExpansionIndex === 0"
                @click="previousExpansion"
            >
              ◀ Back
            </button>
            <button class="btn btn-primary" @click="togglePlayPause">
              {{ isPlaying ? '⏸ Pause' : '▶ Play' }}
            </button>
            <button
                class="btn btn-secondary"
                :disabled="currentExpansionIndex >= expansions.length - 1"
                @click="nextExpansion"
            >
              Next ▶
            </button>
            <button
                class="btn btn-secondary"
                :disabled="!navigation.has_next"
                @click="nextMessage"
            >
              Next Message ({{ navigation.current_index + 2 }}/{{ navigation.total_messages }}) ▶▶
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  ssr: false
})

import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from '#imports'
import 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  LMap,
  LTileLayer,
  LMarker,
  LGeoJson,
  LCircleMarker,
} from '@vue-leaflet/vue-leaflet'
import { attribution, osmtile } from '~/composables/useMap'

const mapTile = osmtile()
const mapAttribution = attribution()

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

// Custom marker icon for message location
const customIcon = computed(() => {
  if (!window.L) return null
  return window.L.icon({
    iconUrl: '/mapmarker.gif',
    iconSize: [25, 25],
    iconAnchor: [12.5, 25],
    className: 'no-animation'
  })
})

// Pink marker icon for successful replier
const pinkIcon = computed(() => {
  if (!window.L) return null
  return window.L.divIcon({
    html: '<div style="background: #ff1493; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: 'pink-marker-icon'
  })
})

// Use modGroupStore
const { useModGroupStore } = await import('~/stores/modgroup')
const modGroupStore = useModGroupStore()

// Group selection
const groupid = ref(null)

// Run selection state
const runs = ref([])
const loadingRuns = ref(true)
const runsError = ref(null)
const selectedRunId = ref(null)

// Simulation viewer state
const loading = ref(true)
const error = ref(null)
const currentMessageIndex = ref(0)
const map = ref(null)
const zoom = ref(12)
const center = ref([51.505, -0.09])
const mapReady = ref(false)
const waitingForMapMove = ref(false)
const pendingAutoplayStart = ref(false)

// Data from API
const message = ref({})
const groupCGA = ref(null)
const expansions = ref([])
const users = ref({ features: [] })
const navigation = ref({})

// Playback state
const currentExpansionIndex = ref(0)
const isPlaying = ref(false)
const playTimer = ref(null)
const progressPercent = ref(0)
const progressInterval = ref(null)
const animatedElapsedMinutes = ref(0)

const groupCGAStyle = {
  style: {
    color: '#666666',
    weight: 2,
    fillColor: '#cccccc',
    fillOpacity: 0.3,
  },
}

const isochroneColors = [
  '#00ff00', // Green
  '#ffff00', // Yellow
  '#ff9900', // Orange
  '#ff0000', // Red
  '#ff00ff', // Magenta
  '#0000ff', // Blue
  '#00ffff', // Cyan
]

function getIsochroneStyle(index) {
  return {
    style: {
      color: isochroneColors[index % isochroneColors.length],
      weight: 2,
      fillColor: isochroneColors[index % isochroneColors.length],
      fillOpacity: 0.5,
    },
  }
}

const messageLocation = computed(() => {
  if (message.value?.location) {
    return [message.value.location.lat, message.value.location.lng]
  }
  return null
})

const visibleExpansions = computed(() => {
  // Only show current and previous expansion to avoid map clutter
  const startIndex = Math.max(0, currentExpansionIndex.value - 1)
  return expansions.value.slice(startIndex, currentExpansionIndex.value + 1)
})

const repliers = computed(() => {
  return users.value.features.filter((u) => u.properties.replied)
})

const successfulReplier = computed(() => {
  return users.value.features.find((u) => u.properties.successful)
})

const nonSuccessfulRepliers = computed(() => {
  return users.value.features.filter((u) => u.properties.replied && !u.properties.successful)
})

const nonRepliers = computed(() => {
  return users.value.features.filter((u) => !u.properties.replied)
})

const elapsedTime = computed(() => {
  if (currentExpansionIndex.value >= 0 && expansions.value.length > 0) {
    const minutes = expansions.value[currentExpansionIndex.value].minutes_after_arrival
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${minutes}m`
  }
  return '0m'
})

const animatedElapsedTime = computed(() => {
  const minutes = Math.floor(animatedElapsedMinutes.value)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${minutes}m`
})

const usersReached = computed(() => {
  if (currentExpansionIndex.value >= 0 && expansions.value.length > 0) {
    return expansions.value[currentExpansionIndex.value].users_in_isochrone
  }
  return 0
})

const repliersCovered = computed(() => {
  if (currentExpansionIndex.value >= 0 && expansions.value.length > 0) {
    return expansions.value[currentExpansionIndex.value].replies_in_isochrone
  }
  return 0
})

const captureRate = computed(() => {
  if (message.value.total_replies_actual > 0) {
    return Math.round(
        (repliersCovered.value / message.value.total_replies_actual) * 100
    )
  }
  return 0
})

const overallProgressPercent = computed(() => {
  const maxMinutes = 2880 // 48 hours
  const currentMinutes = animatedElapsedMinutes.value
  return Math.min(100, (currentMinutes / maxMinutes) * 100)
})

const filteredRuns = computed(() => {
  if (!groupid.value || !runs.value.length) return []

  // If systemwide (-2) is selected, show all runs
  if (groupid.value === -2) {
    return runs.value
  }

  // Filter runs by group - check if filters contain the groupid
  return runs.value.filter((run) => {
    if (!run.filters) return false

    // Runs with null groupId are systemwide and available to all groups
    if (run.filters.groupId === null || run.filters.groupid === null) {
      return true
    }

    // Check for specific group matches
    if (run.filters.groupid && parseInt(run.filters.groupid) === groupid.value) {
      return true
    }
    if (run.filters.groupId && parseInt(run.filters.groupId) === groupid.value) {
      return true
    }
    if (run.filters.groupids && Array.isArray(run.filters.groupids)) {
      return run.filters.groupids.includes(groupid.value)
    }

    return false
  })
})

const selectedRun = computed(() => {
  if (!selectedRunId.value) return null
  return runs.value.find((r) => r.id === selectedRunId.value)
})

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

async function loadRuns() {
  try {
    loadingRuns.value = true
    runsError.value = null

    const res = await $api.simulation.listRuns()
    if (res.ret !== 0) {
      runsError.value = `Failed to load runs: ${res.status}`
      return
    }

    runs.value = res.runs
  } catch (e) {
    runsError.value = `Error loading runs: ${e.message}`
  } finally {
    loadingRuns.value = false
  }
}

function backToSelector() {
  selectedRunId.value = null
  error.value = null
  currentMessageIndex.value = 0
  router.push('/simulation')
}

async function viewSimulation() {
  if (!selectedRunId.value) return

  // Update URL
  router.push(`/simulation?runid=${selectedRunId.value}`)

  // Wait for Vue to render the map component
  await nextTick()

  // Load the simulation
  await loadSimulation()
}

async function loadSimulation() {
  if (!selectedRunId.value) {
    console.error('loadSimulation called without selectedRunId')
    return
  }

  try {
    loading.value = true
    error.value = null

    console.log('Loading simulation for runid:', selectedRunId.value)

    // Get run info to find total message count
    const selectedRun = runs.value.find(r => r.id === selectedRunId.value)
    const messageCount = selectedRun?.message_count || 1

    // Start at a random message
    currentMessageIndex.value = Math.floor(Math.random() * messageCount)

    // Ensure we have all groups with CGAs loaded
    await modGroupStore.listMT({
      grouptype: 'Freegle',
    })

    // Wait for map to render
    await nextTick()

    console.log('Map rendered, loading message')

    // Set playing to true for initial load (auto-start)
    isPlaying.value = true

    // Load first message (index 0)
    await loadCurrentMessage()
  } catch (e) {
    console.error('Error in loadSimulation:', e)
    error.value = `Error loading simulation: ${e.message}`
    loading.value = false
  }
}

async function loadCurrentMessage() {
  try {
    console.log('Loading message at index:', currentMessageIndex.value, 'for runid:', selectedRunId.value)

    const res = await $api.simulation.getMessage(selectedRunId.value, currentMessageIndex.value)

    console.log('Message response:', res)

    if (res.ret !== 0) {
      error.value = `Failed to load message: ${res.status}`
      loading.value = false
      return
    }

    message.value = res.message
    groupCGA.value = res.group_cga

    // Filter expansions to only show up to 2 days (2880 minutes)
    const maxMinutes = 2880 // 48 hours
    expansions.value = res.expansions.filter(exp => exp.minutes_after_arrival <= maxMinutes)

    // Skip messages with no valid expansions
    if (expansions.value.length === 0) {
      console.log('Message has no expansions within 2 days, loading next message')
      await nextMessage()
      return
    }

    users.value = res.users
    navigation.value = res.navigation

    // Reset to first expansion
    currentExpansionIndex.value = 0

    // Initialize animated elapsed time
    if (expansions.value.length > 0) {
      animatedElapsedMinutes.value = expansions.value[0].minutes_after_arrival
      console.log('[loadCurrentMessage] Initialized animated time:', {
        animatedElapsedMinutes: animatedElapsedMinutes.value,
        firstExpansionMinutes: expansions.value[0].minutes_after_arrival,
        totalExpansions: expansions.value.length
      })
    } else {
      console.warn('[loadCurrentMessage] No expansions to initialize time from')
    }

    loading.value = false

    console.log('Message loaded successfully, waiting for map to be ready')

    // Wait for map to be fully ready with Leaflet object
    let attempts = 0
    while (!map.value?.leafletObject && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    if (!map.value?.leafletObject) {
      console.warn('Map not ready after 5 seconds, checking if should start autoplay')
      // Only start autoplay if currently playing
      if (isPlaying.value) {
        console.log('Map not ready but was playing - starting autoplay')
        startAutoPlay()
      }
    } else {
      console.log('Map ready, fitting to CGA')

      // Set flag to start autoplay after map movement completes only if currently playing
      if (isPlaying.value) {
        pendingAutoplayStart.value = true
        waitingForMapMove.value = true
      }

      // Trigger the map move
      fitMapToGroupCGA()
    }
  } catch (e) {
    console.error('Error in loadCurrentMessage:', e)
    error.value = `Error loading message: ${e.message}`
    loading.value = false
  }
}

async function nextMessage() {
  if (!navigation.value.has_next) return

  console.log('[nextMessage] Moving to next message, isPlaying:', isPlaying.value)

  // Stop current autoplay intervals
  stopAutoPlay()

  currentMessageIndex.value++
  await loadCurrentMessage()

  // loadCurrentMessage() will handle restarting autoplay if isPlaying is true
}

async function previousMessage() {
  if (!navigation.value.has_prev) return

  console.log('[previousMessage] Moving to previous message, isPlaying:', isPlaying.value)

  // Stop current autoplay intervals
  stopAutoPlay()

  currentMessageIndex.value--
  await loadCurrentMessage()

  // loadCurrentMessage() will handle restarting autoplay if isPlaying is true
}

function nextExpansion() {
  console.log('[nextExpansion] Called:', {
    currentIndex: currentExpansionIndex.value,
    maxIndex: expansions.value.length - 1,
    isPlaying: isPlaying.value
  })

  if (currentExpansionIndex.value < expansions.value.length - 1) {
    currentExpansionIndex.value++
    console.log('[nextExpansion] Incremented to:', currentExpansionIndex.value)

    // Update animated time to match new expansion
    if (expansions.value[currentExpansionIndex.value]) {
      animatedElapsedMinutes.value = expansions.value[currentExpansionIndex.value].minutes_after_arrival
      console.log('[nextExpansion] Updated animated time to:', animatedElapsedMinutes.value)
    }
  } else {
    console.log('[nextExpansion] At last expansion')
    // Auto-advance to next message if playing
    if (isPlaying.value && navigation.value.has_next) {
      console.log('[nextExpansion] Auto-advancing to next message')
      nextMessage()
    }
  }
}

function previousExpansion() {
  if (currentExpansionIndex.value > 0) {
    currentExpansionIndex.value--
    // Update animated time to match new expansion
    if (expansions.value[currentExpansionIndex.value]) {
      animatedElapsedMinutes.value = expansions.value[currentExpansionIndex.value].minutes_after_arrival
    }
  }
}

function togglePlayPause() {
  console.log('[togglePlayPause] Toggling play state from', isPlaying.value, 'to', !isPlaying.value)
  isPlaying.value = !isPlaying.value

  if (isPlaying.value) {
    console.log('[togglePlayPause] Starting autoplay')
    startAutoPlay()
  } else {
    console.log('[togglePlayPause] Stopping autoplay')
    stopAutoPlay()
  }
}

function startAutoPlay() {
  // Always stop any existing autoplay first to prevent interval leaks
  stopAutoPlay()

  // Calculate interval to display entire message over 30 seconds
  const totalExpansions = expansions.value.length
  const intervalMs = totalExpansions > 0 ? 30000 / totalExpansions : 30000

  console.log('[startAutoPlay] Starting autoplay:', {
    totalExpansions,
    intervalMs,
    currentExpansionIndex: currentExpansionIndex.value
  })

  // Reset progress
  progressPercent.value = 0

  // Set initial animated time
  if (currentExpansionIndex.value >= 0 && expansions.value.length > 0) {
    animatedElapsedMinutes.value = expansions.value[currentExpansionIndex.value].minutes_after_arrival
    console.log('[startAutoPlay] Set initial animated time:', animatedElapsedMinutes.value)
  } else {
    console.warn('[startAutoPlay] Cannot set initial time - invalid index or no expansions')
  }

  // Update progress bar and time every 50ms
  const progressUpdateMs = 50
  progressInterval.value = setInterval(() => {
    progressPercent.value += (progressUpdateMs / intervalMs) * 100
    if (progressPercent.value >= 100) {
      progressPercent.value = 0
    }

    // Animate elapsed time
    if (currentExpansionIndex.value >= 0 && expansions.value.length > 0) {
      const currentMinutes = expansions.value[currentExpansionIndex.value].minutes_after_arrival
      const nextIndex = currentExpansionIndex.value + 1

      console.log('[progressInterval] Tick:', {
        currentExpansionIndex: currentExpansionIndex.value,
        expansionsLength: expansions.value.length,
        currentMinutes,
        nextIndex,
        animatedElapsedMinutesBefore: animatedElapsedMinutes.value,
        progressPercent: progressPercent.value
      })

      let increment
      if (nextIndex < expansions.value.length) {
        // Animate from current to next expansion time
        const nextMinutes = expansions.value[nextIndex].minutes_after_arrival
        const minutesDiff = nextMinutes - currentMinutes
        increment = (minutesDiff * progressUpdateMs) / intervalMs

        console.log('[progressInterval] Animating to next expansion:', {
          nextMinutes,
          minutesDiff,
          increment,
          intervalMs
        })
      } else {
        // On last expansion - keep ticking up at a steady rate
        // Use the same increment as the previous expansion (or default to 5 min over the interval)
        const prevIndex = currentExpansionIndex.value - 1
        if (prevIndex >= 0) {
          const prevMinutes = expansions.value[prevIndex].minutes_after_arrival
          const minutesDiff = currentMinutes - prevMinutes
          increment = (minutesDiff * progressUpdateMs) / intervalMs
        } else {
          // First and only expansion - use 5 minutes over the interval
          increment = (5 * progressUpdateMs) / intervalMs
        }

        console.log('[progressInterval] Last expansion - continuing to tick:', {
          increment
        })
      }

      animatedElapsedMinutes.value += increment
      console.log('[progressInterval] After increment:', animatedElapsedMinutes.value)
    } else {
      console.warn('[progressInterval] Cannot animate - invalid state:', {
        currentExpansionIndex: currentExpansionIndex.value,
        expansionsLength: expansions.value.length
      })
    }
  }, progressUpdateMs)

  playTimer.value = setInterval(() => {
    console.log('[playTimer] Moving to next expansion')
    progressPercent.value = 0
    nextExpansion()
  }, intervalMs)
}

function stopAutoPlay() {
  console.log('[stopAutoPlay] Stopping autoplay, clearing intervals:', {
    hasPlayTimer: !!playTimer.value,
    hasProgressInterval: !!progressInterval.value
  })

  if (playTimer.value) {
    clearInterval(playTimer.value)
    playTimer.value = null
  }
  if (progressInterval.value) {
    clearInterval(progressInterval.value)
    progressInterval.value = null
  }
  progressPercent.value = 0

  console.log('[stopAutoPlay] Autoplay stopped')
}

function fitMapToGroupCGA() {
  if (!groupCGA.value || !window.L || !map.value?.leafletObject) {
    console.warn('Cannot fit map - missing groupCGA, Leaflet, or map object')
    return
  }

  try {
    // Create GeoJSON layer to calculate bounds
    const geoJsonLayer = window.L.geoJSON(groupCGA.value)
    const bounds = geoJsonLayer.getBounds()

    // Validate bounds
    if (!bounds || !bounds.isValid()) {
      console.warn('Invalid bounds')
      return
    }

    // Check for reasonable bounds (not infinite)
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()

    console.log('Bounds:', { sw, ne })

    if (!isFinite(sw.lat) || !isFinite(sw.lng) || !isFinite(ne.lat) || !isFinite(ne.lng)) {
      console.warn('Infinite bounds detected', { sw, ne })
      return
    }

    // Check if bounds are reasonable (not too small or too large)
    const latSpan = Math.abs(ne.lat - sw.lat)
    const lngSpan = Math.abs(ne.lng - sw.lng)

    console.log('Bounds spans:', { latSpan, lngSpan })

    if (latSpan < 0.0001 || lngSpan < 0.0001) {
      console.warn('Bounds too small')
      return
    }

    if (latSpan > 180 || lngSpan > 360) {
      console.warn('Bounds too large')
      return
    }

    console.log('Flying map to bounds')

    // Use flyToBounds with duration 0 to disable animation
    map.value.leafletObject.flyToBounds(bounds, { duration: 0 })

    console.log('Map flown to bounds')
  } catch (e) {
    console.error('Error flying map to bounds:', e)
  }
}

function onMapReady() {
  console.log('Map ready!')
  mapReady.value = true
}

function onMapMoveEnd() {
  console.log('[onMapMoveEnd] Map move ended, pendingAutoplayStart:', pendingAutoplayStart.value)

  if (pendingAutoplayStart.value) {
    console.log('[onMapMoveEnd] Starting autoplay after map move')
    pendingAutoplayStart.value = false
    isPlaying.value = true
    console.log('[onMapMoveEnd] About to call startAutoPlay, current state:', {
      currentExpansionIndex: currentExpansionIndex.value,
      expansionsLength: expansions.value.length,
      animatedElapsedMinutes: animatedElapsedMinutes.value
    })
    startAutoPlay()
  }

  waitingForMapMove.value = false
}

// Watch for group changes
watch(groupid, async (newGroupId, oldGroupId) => {
  if (newGroupId && !route.query.runid && newGroupId !== oldGroupId) {
    selectedRunId.value = null
    await loadRuns()
    // Don't auto-select - let user choose from the dropdown
  }
})

onMounted(async () => {
  // Load all groups with CGAs first - this is critical
  console.log('Loading all groups with CGAs')
  await modGroupStore.listMT({
    grouptype: 'Freegle',
  })
  console.log('Groups loaded')

  // Check if runid is in query
  const runIdFromQuery = route.query.runid ? parseInt(route.query.runid) : null

  if (runIdFromQuery) {
    // Load specific run from URL
    selectedRunId.value = runIdFromQuery
    await loadSimulation()
  } else {
    // Load runs to populate selector
    await loadRuns()

    // Auto-select systemwide group to see all runs
    if (runs.value.length > 0) {
      // Set groupid to -2 (systemwide) to show all runs
      groupid.value = -2

      // Wait for next tick so filteredRuns computes
      await nextTick()

      // Auto-select the most recent run and load it
      if (filteredRuns.value.length > 0) {
        // filteredRuns are already ordered by created DESC, so [0] is most recent
        selectedRunId.value = filteredRuns.value[0].id
        // Auto-load the simulation viewer
        await viewSimulation()
      }
    }
  }
})

onBeforeUnmount(() => {
  stopAutoPlay()
})
</script>

<style scoped lang="scss">
.intro-text {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #28a745;

  p {
    margin: 0;
    color: #555;
    line-height: 1.6;
  }

  .parameters-display {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #dee2e6;
    color: #666;
    font-size: 13px;

    strong {
      color: #28a745;
    }
  }
}

.run-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;

  h4,
  h5 {
    color: #333;
    margin-top: 15px;
    margin-bottom: 10px;
  }

  p {
    margin: 8px 0;
    color: #555;
  }

  .params-display {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
    font-size: 12px;
    max-height: 200px;
    overflow-y: auto;
  }
}

.simulation-viewer {
  position: relative;
  width: 100%;
  height: 75vh;
}

.map-container {
  width: 100%;
  height: 100%;
}

.simulation-map {
  width: 100%;
  height: 100%;
}

.stats-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: calc(33.33% - 40px);
  z-index: 1000;

  h5 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: bold;
  }

  .progress-section {
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e0e0e0;
  }

  .progress-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }

  .progress-bar-container {
    height: 8px;
    background-color: rgba(200, 200, 200, 0.3);
    border-radius: 4px;
    overflow: hidden;

    &.small {
      height: 6px;
      margin-top: 4px;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    font-size: 14px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;

    strong {
      margin-right: 10px;
    }

    .text-success {
      color: #28a745;
      font-weight: bold;
    }

    .text-danger {
      color: #dc3545;
      font-weight: bold;
    }
  }

  .stat-item-group {
    background: #f8f9fa;
    padding: 8px;
    border-radius: 4px;
    border-left: 3px solid #28a745;
  }
}

.legend-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  font-size: 13px;

  h6 {
    margin: 0 0 8px 0;
    font-weight: bold;
    font-size: 14px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .legend-symbol {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .legend-polygon {
    background: #cccccc;
    border: 2px solid #666666;
    opacity: 0.5;
  }

  .legend-freegle-marker {
    background-image: url('/mapmarker.gif');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 20px;
    height: 20px;
  }

  .legend-active {
    background: #28a745;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    opacity: 0.3;
  }

  .legend-replier {
    background: #ff0000;
    border-radius: 50%;
    width: 8px;
    height: 8px;
  }

  .legend-successful {
    background: #ff1493;
    border: 2px solid white;
    border-radius: 50%;
    width: 12px;
    height: 12px;
    box-shadow: 0 0 3px rgba(0,0,0,0.3);
  }
}

.controls-overlay {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;

  .btn-group {
    display: flex;
    gap: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .btn {
    white-space: nowrap;
  }
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.05s linear;
  border-radius: 4px;

  &.overall {
    background: linear-gradient(90deg, #007bff 0%, #0056b3 100%);
  }

  &.expansion {
    background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  }
}

// Disable marker animation
:deep(.no-animation) {
  transition: none !important;
}

:deep(.leaflet-zoom-animated) {
  transition: none !important;
}
</style>
