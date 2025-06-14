<template>
  <client-only>
    <div v-if="!unloading" class="d-flex justify-content-around">
      <NoticeMessage
        v-if="showError"
        variant="danger"
        class="posit text-center"
        show
      >
        <div v-if="offline">
          <p>
            It looks like you're offline. Please reload when your network is
            back.
          </p>
          <b-button
            variant="primary"
            class="mt-2"
            @click="window.location.reload()"
          >
            Reload
          </b-button>
        </div>
        <div v-else>
          <p>Sorry, something went wrong.</p>
          <p>
            That might be a bug, or perhaps your network connection broke.
            Please try again - if you continue to have problems then please take
            a screenshot and contact <SupportLink />
          </p>

          <div v-if="errorDetails" class="mt-3">
            <p class="mb-2">
              <strong>Error:</strong> {{ errorDetails.message }}
            </p>

            <div v-if="errorDetails.stack">
              <b-button
                v-if="!showStackTrace"
                variant="outline-secondary"
                size="sm"
                @click="showStackTrace = true"
              >
                Show technical details
              </b-button>

              <div v-if="showStackTrace" class="mt-2">
                <p class="mb-1"><strong>Stack trace:</strong></p>
                <pre class="error-stack">{{ errorDetails.stack }}</pre>
                <b-button
                  variant="outline-secondary"
                  size="sm"
                  class="mt-2"
                  @click="showStackTrace = false"
                >
                  Hide technical details
                </b-button>
              </div>
            </div>

            <p v-if="errorDetails.timestamp" class="text-muted small mt-2">
              Time: {{ formatTimestamp(errorDetails.timestamp) }}
            </p>
          </div>
        </div>
      </NoticeMessage>
      <NoticeMessage
        v-else-if="showReload && !snoozeReload"
        variant="info"
        class="posit text-center"
        show
      >
        <p>
          The website has been updated with fixes and improvements. Please
          reload this page to pick up the latest version.
        </p>
        <div class="d-flex justify-content-around">
          <b-button variant="white" @click="snooze">Not just now </b-button>
          <b-button variant="primary" @click="reload"> Reload now </b-button>
        </div>
      </NoticeMessage>
    </div>
  </client-only>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import NoticeMessage from './NoticeMessage'
import { ref, watch, onBeforeUnmount } from '#imports'
import { useMiscStore } from '~/stores/misc'
import SupportLink from '~/components/SupportLink'

const showError = ref(false)
const showReload = ref(false)
const snoozeReload = ref(false)
const snoozeTimer = ref(null)

const miscStore = useMiscStore()
const { somethingWentWrong, needToReload, offline, unloading, errorDetails } =
  storeToRefs(miscStore)

const showStackTrace = ref(false)

watch(somethingWentWrong, (newVal) => {
  if (newVal) {
    showError.value = true
    showStackTrace.value = false // Reset stack trace visibility
    setTimeout(() => {
      showError.value = false
      miscStore.clearError() // Clear error details when hiding
    }, 10000)
  }
})

watch(needToReload, (newVal) => {
  if (newVal) {
    showReload.value = true
  }
})

function reload() {
  window.location.reload()
}

function snooze() {
  snoozeReload.value = true

  snoozeTimer.value = setTimeout(() => {
    snoozeReload.value = false
  }, 120000)
}

function formatTimestamp(timestamp) {
  try {
    return new Date(timestamp).toLocaleString()
  } catch (e) {
    return timestamp
  }
}

onBeforeUnmount(() => {
  if (snoozeTimer.value) {
    clearTimeout(snoozeTimer.value)
  }
})
</script>
<style scoped lang="scss">
.posit {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10000;
}

.error-stack {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  color: #dc3545;
}
</style>
