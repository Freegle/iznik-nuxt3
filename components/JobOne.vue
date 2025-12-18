<template>
  <div v-if="job" class="job-item" @click="clicked">
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
          <img
            v-if="imageUrl"
            v-show="imageLoaded"
            :src="imageUrl"
            alt=""
            class="job-card-img"
            loading="lazy"
            @load="imageLoaded = true"
            @error="imageLoaded = false"
          />
          <div v-show="!imageUrl || !imageLoaded" class="job-card-placeholder">
            <v-icon icon="briefcase" />
          </div>
        </div>
        <div class="job-card-body">
          <h4 class="job-card-title">{{ title }}</h4>
          <span v-if="job.location" class="job-location">
            <v-icon icon="map-marker-alt" class="location-icon" />
            {{ location }}
          </span>
        </div>
      </div>
    </ExternalLink>
  </div>
</template>
<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '~/stores/job'
import { action } from '~/composables/useClientLog'
import ExternalLink from '~/components/ExternalLink'
import { JOB_ICON_COLOURS } from '~/constants'

const imageLoaded = ref(false)

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

// Log ad impression when job is rendered (client-side only).
onMounted(() => {
  if (job.value) {
    action('ad_impression', {
      job_id: job.value.id,
      job_reference: job.value.job_reference,
      job_category: job.value.category,
      cpc: job.value.cpc,
    })
  }
})

function clicked() {
  // Log to server for revenue tracking.
  jobStore.log({
    id: job.value.id,
  })

  // Log click to client log for analytics.
  action('ad_click', {
    job_id: job.value.id,
    job_reference: job.value.job_reference,
    job_category: job.value.category,
    cpc: job.value.cpc,
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

/* Card mode - mosaic display */
.job-card {
  background: $white;
  border: 1px solid $gray-200;
  overflow: hidden;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: #61ae24;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &--highlight {
    border-left: 3px solid #61ae24;
  }
}

.job-card-image {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.job-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.job-card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
  font-size: 3rem;
}

.job-card-body {
  padding: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.job-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: $gray-800;
  margin: 0 0 0.25rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}
</style>
