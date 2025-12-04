<template>
  <div v-if="job" class="job-item" @click="clicked">
    <ExternalLink :href="job.url" class="job-link">
      <div v-if="summary" class="job-summary">
        <div class="job-icon">
          <v-icon icon="briefcase" />
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
        <div class="job-card-header">
          <div class="job-icon job-icon--large">
            <v-icon icon="briefcase" />
          </div>
          <div class="job-card-info">
            <h4 class="job-card-title">{{ title }}</h4>
            <span v-if="job.location" class="job-location">
              <v-icon icon="map-marker-alt" class="location-icon" />
              {{ location }}
            </span>
          </div>
        </div>
        <p v-if="body" class="job-description">{{ body }}</p>
        <div class="job-card-footer">
          <span class="job-cta"> View Job <v-icon icon="arrow-right" /> </span>
        </div>
      </div>
    </ExternalLink>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '~/stores/job'
import ExternalLink from '~/components/ExternalLink'

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

const body = computed(() => {
  if (!job.value || !job.value.body) {
    return ''
  }

  return filterNonsense(job.value.body)
})

function clicked() {
  jobStore.log({
    id: job.value.id,
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
  gap: 0.75rem;
  padding: 0.75rem;
  background: $white;
  border-bottom: 1px solid $gray-200;
  transition: background-color 0.15s ease;

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

  &--large {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
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
  font-size: 0.95rem;
  font-weight: 600;
  color: $gray-800;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @include media-breakpoint-up(md) {
    font-size: 1rem;
  }
}

.job-location {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: $gray-600;
  margin-top: 0.15rem;

  .location-icon {
    font-size: 0.7rem;
    color: $gray-500;
  }
}

.job-chevron {
  color: $gray-400;
  flex-shrink: 0;
}

/* Card mode - full display */
.job-card {
  background: $white;
  border: 1px solid $gray-200;
  padding: 1rem;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: #61ae24;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &--highlight {
    border-left: 3px solid #61ae24;
    background: linear-gradient(to right, rgba(97, 174, 36, 0.05), transparent);
  }
}

.job-card-header {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.job-card-info {
  flex: 1;
  min-width: 0;
}

.job-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: $gray-800;
  margin: 0 0 0.25rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @include media-breakpoint-up(md) {
    font-size: 1.2rem;
  }
}

.job-description {
  font-size: 0.9rem;
  color: $gray-600;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.job-card-footer {
  display: flex;
  justify-content: flex-end;
}

.job-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #61ae24;
  padding: 0.5rem 1rem;
  background: rgba(97, 174, 36, 0.1);
  transition: background-color 0.15s ease;

  &:hover {
    background: rgba(97, 174, 36, 0.2);
  }
}
</style>
