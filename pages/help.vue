<template>
  <client-only>
    <div class="help-wrapper">
      <div class="help-page">
        <RateAppModal
          v-if="showRateAppModal"
          ref="rateAppModal"
          @hidden="showRateAppModal = false"
        />

        <!-- Rate app link (app only) -->
        <p v-if="isApp" class="app-review">
          <a href="#" @click.stop.prevent="showRateMe">
            <v-icon icon="star" class="me-1" />Rate this app
          </a>
        </p>

        <!-- Guided help flow -->
        <HelpChatFlow class="mb-4" />

        <!-- App debug info -->
        <div v-if="isApp" class="debug-section">
          <div class="app-info">
            <small class="text-muted">
              App v{{ mobileVersion }} ({{ appBuildDate }})
              <span v-if="deviceuserinfo"> · {{ deviceuserinfo }}</span>
            </small>
            <b-button
              variant="link"
              size="sm"
              class="p-0 ms-2 text-muted"
              @click="copydeviceuserinfo"
            >
              <v-icon icon="clipboard" class="me-1" />{{ deviceuserinfocopied }}
            </b-button>
          </div>
          <b-button
            variant="link"
            class="text-muted p-0 mt-2"
            @click="showDebugLogs = true"
          >
            <v-icon icon="bug" class="me-1" />View Debug Logs
          </b-button>
          <DebugLogsModal
            v-if="showDebugLogs"
            @hidden="showDebugLogs = false"
          />
        </div>

        <p class="version-info">Site version: {{ version }}</p>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { defineAsyncComponent } from 'vue'
import { buildHead } from '~/composables/useBuildHead'
import HelpChatFlow from '~/components/HelpChatFlow.vue'
import { ref, computed } from '#imports'
import { useMobileStore } from '@/stores/mobile'
import { useDebugStore } from '~/stores/debug'

// Async components
const DebugLogsModal = defineAsyncComponent(() =>
  import('~/components/DebugLogsModal.vue')
)
const RateAppModal = defineAsyncComponent(() =>
  import('~/components/RateAppModal.vue')
)

// Setup
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const mobileStore = useMobileStore()
const debugStore = useDebugStore()

// State
const showRateAppModal = ref(false)
const showDebugLogs = ref(false)
const deviceuserinfocopied = ref('Copy info')

// Computed properties
const isApp = ref(mobileStore.isApp)
const mobileVersion = ref(runtimeConfig.public.MOBILE_VERSION)

const deviceuserinfo = computed(() => {
  if (!mobileStore.deviceuserinfo) return null
  return mobileStore.deviceuserinfo
})

const version = computed(() => {
  const date = dayjs(runtimeConfig.public.BUILD_DATE)
  return date.format('Do MMMM, YYYY') + ' at ' + date.format('HH:mm')
})

const appBuildDate = computed(() => {
  const date = dayjs(runtimeConfig.public.BUILD_DATE)
  return date.format('D MMM YYYY')
})

// Methods
function showRateMe() {
  window.localStorage.removeItem('rateappnotagain')
  showRateAppModal.value = true
}

async function copydeviceuserinfo(e) {
  let infotocopy = 'Mobile version: ' + mobileVersion.value + '. '
  if (deviceuserinfo.value) infotocopy += deviceuserinfo.value

  // Include debug logs if in app
  if (isApp.value) {
    const debugLogs = debugStore.getLogsAsText
    if (debugLogs) {
      infotocopy += '\n\n=== Debug Logs ===\n' + debugLogs
    }
  }

  await navigator.clipboard.writeText(infotocopy)
  deviceuserinfocopied.value = 'Copied!'
  setTimeout(() => {
    deviceuserinfocopied.value = 'Copy info'
  }, 3000)
  if (e) {
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
  }
  return false
}

// Page head
useHead(
  buildHead(route, runtimeConfig, 'Help', 'Help with Freegle', null, {
    class: 'overflow-y-scroll',
  })
)
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.help-wrapper {
  min-height: 100vh;
  background: #f8f9fa;
}

.help-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.app-review {
  text-align: center;
  margin-bottom: 1rem;

  a {
    color: $color-gold;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.debug-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

.app-info {
  font-size: 0.85rem;
}

.version-info {
  text-align: center;
  font-size: 0.8rem;
  color: $color-gray--dark;
  margin-top: 1.5rem;
}
</style>
