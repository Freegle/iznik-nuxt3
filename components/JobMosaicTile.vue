<template>
  <div v-if="job" class="mosaic-tile" @click="clicked">
    <ExternalLink :href="job.url" class="mosaic-link">
      <div class="mosaic-title">{{ title }}</div>
      <div v-if="location" class="mosaic-location">
        <v-icon icon="map-marker-alt" class="location-icon" />
        {{ location }}
      </div>
      <div class="mosaic-image" :style="imageStyle">
        <img
          v-if="imageUrl"
          v-show="imageLoaded"
          :src="imageUrl"
          alt=""
          class="mosaic-img"
          loading="lazy"
          @load="imageLoaded = true"
          @error="imageLoaded = false"
        />
        <div v-show="!imageUrl || !imageLoaded" class="mosaic-placeholder">
          <v-icon icon="briefcase" />
        </div>
      </div>
    </ExternalLink>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '~/stores/job'
import ExternalLink from '~/components/ExternalLink'
import { JOB_ICON_COLOURS } from '~/constants'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  bgColour: {
    type: String,
    required: false,
    default: 'dark green',
  },
})

const router = useRouter()
const jobStore = useJobStore()
const imageLoaded = ref(false)

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
  if (job.value?.location?.indexOf(', ') === 0) {
    return job.value.location.substring(2)
  }
  return job.value?.location || ''
})

// Use server-provided image URL if available
const imageUrl = computed(() => {
  return job.value?.image || null
})

const imageStyle = computed(() => {
  const bg = JOB_ICON_COLOURS[props.bgColour] || JOB_ICON_COLOURS['dark green']
  return { background: bg }
})

function clicked() {
  jobStore.log({
    id: job.value.id,
  })

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

.mosaic-tile {
  flex-shrink: 0;
  width: 120px;
}

.mosaic-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: none;

    .mosaic-title {
      color: #61ae24;
    }
  }
}

.mosaic-image {
  width: 120px;
  height: 120px;
  overflow: hidden;
}

.mosaic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mosaic-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
  font-size: 2rem;
}

.mosaic-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: $gray-700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  min-height: calc(2 * 1.2 * 0.75rem);
  text-align: center;
  transition: color 0.15s ease;
}

.mosaic-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  font-size: 0.65rem;
  color: $gray-500;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  .location-icon {
    font-size: 0.55rem;
    flex-shrink: 0;
  }
}
</style>
