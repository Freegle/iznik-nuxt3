<template>
  <div
    v-if="job"
    ref="jobElement"
    class="job-item"
    @click="clicked"
    @mouseenter="handleMouseEnter"
  >
    <ExternalLink :href="job.url" class="job-link">
      <div v-if="summary" class="job-summary">
        <div class="job-icon" :style="iconStyle">
          <img
            v-if="imageUrl"
            v-show="imageLoaded"
            :src="imageUrl"
            alt=""
            class="job-ai-image"
            loading="lazy"
            @load="imageLoaded = true"
            @error="imageLoaded = false"
          />
          <v-icon v-show="!imageUrl || !imageLoaded" icon="briefcase" />
        </div>
        <div class="job-content">
          <div class="job-title-row">
            <span class="job-title">{{ title }}</span>
          </div>
          <span v-if="job.location" class="job-location">
            <v-icon icon="map-marker-alt" class="location-icon" />
            {{ location }}
          </span>
        </div>
        <v-icon icon="chevron-right" class="job-chevron" />
      </div>
      <div
        v-else
        class="job-card"
        :class="{ 'job-card--highlight': highlight }"
      >
        <div class="job-card-image" :style="cardImageStyle">
          <div class="job-card-placeholder">
            <v-icon icon="briefcase" />
          </div>
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt=""
            class="job-card-img"
            loading="lazy"
          />
        </div>
        <div class="job-card-body">
          <div class="job-card-header">
            <span v-if="job.category" class="job-category">{{
              categoryDisplay
            }}</span>
            <span v-if="distanceText" class="job-distance">
              <v-icon icon="map-marker-alt" />{{ distanceText }}
            </span>
          </div>
          <h4 class="job-card-title">{{ title }}</h4>
          <p v-if="description" class="job-card-description">
            {{ description }}
          </p>
          <span v-if="job.location" class="job-card-location">
            {{ location }}
          </span>
        </div>
      </div>
    </ExternalLink>
  </div>
</template>
<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '~/stores/job'
import { action } from '~/composables/useClientLog'
import ExternalLink from '~/components/ExternalLink'
import { JOB_ICON_COLOURS } from '~/constants'

const imageLoaded = ref(false)
const jobElement = ref(null)
const hasBeenVisible = ref(false)
const hasBeenHovered = ref(false)
let observer = null

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  summary: {
    type: Boolean,
    required: false,
    default: false,
  },
  highlight: {
    type: Boolean,
    required: false,
    default: false,
  },
  showBody: {
    type: Boolean,
    required: false,
    default: true,
  },
  className: {
    type: String,
    required: false,
    default: '',
  },
  bgColour: {
    type: String,
    required: false,
    default: 'dark green',
  },
  position: {
    type: Number,
    required: false,
    default: null,
  },
  listLength: {
    type: Number,
    required: false,
    default: null,
  },
  context: {
    type: String,
    required: false,
    default: null,
  },
})

const router = useRouter()
const jobStore = useJobStore()

const job = computed(() => {
  return jobStore?.byId(props.id)
})

const title = computed(() => {
  if (!job.value?.title) {
    return ''
  }

  return filterNonsense(job.value.title)
})

// Use server-provided image URL if available
const imageUrl = computed(() => {
  return job.value?.image || null
})

const location = computed(() => {
  if (
    job.value &&
    job.value.location &&
    job.value.location.indexOf(', ') === 0
  ) {
    return job.value.location.substring(2)
  } else {
    return job.value.location
  }
})

const iconStyle = computed(() => {
  const bg = JOB_ICON_COLOURS[props.bgColour] || JOB_ICON_COLOURS['dark green']
  return { background: bg, color: 'rgba(255, 255, 255, 0.6)' }
})

const cardImageStyle = computed(() => {
  const bg = JOB_ICON_COLOURS[props.bgColour] || JOB_ICON_COLOURS['dark green']
  return { background: bg }
})

// Format category for display - take first category if multiple, clean up
const categoryDisplay = computed(() => {
  if (!job.value?.category) return null
  // Categories can be semicolon-separated, take first one
  const first = job.value.category.split(';')[0].trim()
  return first
})

// Format distance for display
const distanceText = computed(() => {
  if (!job.value?.dist) return null
  const km = job.value.dist
  const miles = km * 0.621371
  if (miles < 1) {
    return 'Nearby'
  } else if (miles < 10) {
    return `${miles.toFixed(1)} mi`
  } else {
    return `${Math.round(miles)} mi`
  }
})

// Truncated description
const description = computed(() => {
  if (!job.value?.body) return null
  const text = filterNonsense(job.value.body)
  if (!text || text === 'null') return null
  // Truncate to reasonable length
  const maxLen = 150
  if (text.length <= maxLen) return text
  return text.substring(0, maxLen).trim() + '...'
})

// Log ad impression when job is rendered (client-side only).
onMounted(() => {
  try {
    if (job.value) {
      action('job_ad_rendered', {
        job_id: job.value.id,
        job_reference: job.value.job_reference,
        job_category: job.value.category,
        cpc: job.value.cpc,
        position: props.position,
        list_length: props.listLength,
        context: props.context,
      })

      // Set up Intersection Observer to detect when ad becomes visible in viewport.
      if (jobElement.value && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver(
          (entries) => {
            try {
              entries.forEach((entry) => {
                // Log once when ad becomes 50% visible.
                if (entry.isIntersecting && !hasBeenVisible.value) {
                  hasBeenVisible.value = true
                  action('job_ad_visible', {
                    job_id: job.value?.id,
                    job_reference: job.value?.job_reference,
                    job_category: job.value?.category,
                    cpc: job.value?.cpc,
                    position: props.position,
                    list_length: props.listLength,
                    context: props.context,
                  })
                }
              })
            } catch (e) {
              console.log('Error in visibility observer callback', e)
            }
          },
          { threshold: 0.5 }
        )
        observer.observe(jobElement.value)
      }
    }
  } catch (e) {
    console.log('Error setting up job ad tracking', e)
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

function handleMouseEnter() {
  // Log mouseover once per ad instance.
  if (!hasBeenHovered.value && job.value) {
    hasBeenHovered.value = true
    action('job_ad_hover', {
      job_id: job.value.id,
      job_reference: job.value.job_reference,
      job_category: job.value.category,
      cpc: job.value.cpc,
      position: props.position,
      list_length: props.listLength,
      context: props.context,
    })
  }
}

function clicked() {
  // Log to server for revenue tracking.
  jobStore.log({
    id: job.value.id,
  })

  // Log click to client log for analytics.
  action('job_ad_click', {
    job_id: job.value.id,
    job_reference: job.value.job_reference,
    job_category: job.value.category,
    cpc: job.value.cpc,
    position: props.position,
    list_length: props.listLength,
    context: props.context,
    source: 'website',
  })

  // Route to jobs page to encourage viewing of more jobs.
  if (router?.currentRoute?.value?.path !== '/jobs') {
    router.push('/jobs')
  }
}

function filterNonsense(val) {
  return val
    .replace(/\\n/g, '\n')
    .replace(/<br>/g, '\n')
    .replace(/Â£/g, '£')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.job-item {
  margin-bottom: 0.5rem;
}

.job-link {
  display: block;
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: none;
  }
}

/* Summary mode - compact row */
.job-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: $white;
  border-bottom: 1px solid $gray-200;
  transition: background-color 0.15s ease;

  @include media-breakpoint-up(sm) {
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
  }

  &:hover {
    background: $gray-100;
  }

  &:active {
    background: $gray-200;
  }
}

.job-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: $gray-100;
  color: $gray-500;
  flex-shrink: 0;
  font-size: 1rem;

  @include media-breakpoint-up(sm) {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }
}

.job-ai-image {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: cover;

  @include media-breakpoint-up(sm) {
    width: 3rem;
    height: 3rem;
  }
}

.job-content {
  flex: 1;
  min-width: 0;
}

.job-title-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.job-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: $gray-800;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
  min-height: calc(2 * 1.3 * 0.75rem);

  @include media-breakpoint-up(sm) {
    font-size: 0.85rem;
    min-height: calc(2 * 1.3 * 0.85rem);
  }

  @include media-breakpoint-up(md) {
    font-size: 0.95rem;
    min-height: calc(2 * 1.3 * 0.95rem);
  }
}

.job-location {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  color: $gray-600;
  margin-top: 0.1rem;

  @include media-breakpoint-up(sm) {
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  .location-icon {
    font-size: 0.6rem;
    color: $gray-500;

    @include media-breakpoint-up(sm) {
      font-size: 0.7rem;
    }
  }
}

.job-chevron {
  display: none;
  color: $gray-400;
  flex-shrink: 0;

  @include media-breakpoint-up(sm) {
    display: block;
  }
}

/* Card mode - list display */
.job-card {
  background: $white;
  border: 1px solid $gray-200;
  overflow: hidden;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  max-height: 120px;

  @include media-breakpoint-up(md) {
    max-height: 150px;
  }

  &:hover {
    border-color: #61ae24;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &--highlight {
    border-left: 3px solid #61ae24;
  }
}

.job-card-image {
  position: relative;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  overflow: hidden;

  @include media-breakpoint-up(md) {
    width: 150px;
    height: 150px;
  }
}

.job-card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.job-card-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
  font-size: 2.5rem;
  z-index: 0;

  @include media-breakpoint-up(md) {
    font-size: 3rem;
  }
}

.job-card-body {
  padding: 0.75rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow: hidden;

  @include media-breakpoint-up(md) {
    padding: 1rem 1.25rem;
  }
}

.job-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.7rem;

  @include media-breakpoint-up(md) {
    font-size: 0.75rem;
  }
}

.job-category {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  background: #61ae24;
  color: $white;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;

  @include media-breakpoint-up(md) {
    max-width: 200px;
  }
}

.job-distance {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: $gray-600;
  white-space: nowrap;
}

.job-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: $gray-800;
  margin: 0 0 0.25rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;

  @include media-breakpoint-up(md) {
    font-size: 1rem;
  }
}

.job-card-description {
  font-size: 0.75rem;
  color: $gray-600;
  margin: 0 0 0.25rem 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @include media-breakpoint-up(md) {
    font-size: 0.8rem;
  }
}

.job-card-location {
  font-size: 0.7rem;
  color: $gray-500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: auto;

  @include media-breakpoint-up(md) {
    font-size: 0.75rem;
  }
}
</style>
