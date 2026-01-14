<template>
  <client-only>
    <div class="options-page">
      <!-- Compact progress stepper -->
      <div class="stepper-container">
        <WizardProgressCompact :active-stage="3" />
      </div>

      <!-- Main content -->
      <div class="options-content">
        <div class="options-card">
          <h1 class="options-title">A couple more details</h1>

          <!-- Delivery option -->
          <div class="option-section">
            <label class="option-label">Could you deliver?</label>
            <div class="toggle-options">
              <button
                class="toggle-btn"
                :class="{ active: deliveryPossible }"
                @click="deliveryPossible = true"
              >
                Maybe
              </button>
              <button
                class="toggle-btn"
                :class="{ active: !deliveryPossible }"
                @click="deliveryPossible = false"
              >
                Collection only
              </button>
            </div>
          </div>

          <!-- Deadline option -->
          <div class="option-section">
            <label class="option-label">Is there a deadline?</label>
            <div class="toggle-options">
              <button
                class="toggle-btn"
                :class="{ active: !hasDeadline }"
                @click="hasDeadline = false"
              >
                No deadline
              </button>
              <button
                class="toggle-btn"
                :class="{ active: hasDeadline }"
                @click="setDeadlineAndShowPicker"
              >
                Set deadline
              </button>
            </div>
            <div v-if="hasDeadline" class="deadline-picker">
              <b-form-input
                ref="deadlineInput"
                v-model="deadline"
                type="date"
                size="lg"
                :min="today"
                :max="maxDeadline"
                :class="{ 'is-invalid': deadlineError }"
                @input="deadlineError = false"
              />
              <div v-if="deadlineError" class="text-danger small mt-1">
                The deadline must be today or in the future.
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation button -->
        <div class="next-section">
          <div class="next-container">
            <b-button
              variant="primary"
              size="lg"
              class="next-btn"
              @click="goNext"
            >
              Next: Your details <v-icon icon="angle-double-right" />
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, useHead, useRuntimeConfig } from '#imports'
import WizardProgressCompact from '~/components/WizardProgressCompact.vue'
import { useComposeStore } from '~/stores/compose'
import { useAuthStore } from '~/stores/auth'
import { buildHead } from '~/composables/useBuildHead'
import { MESSAGE_EXPIRE_TIME } from '~/constants'

const router = useRouter()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const composeStore = useComposeStore()
const authStore = useAuthStore()

useHead(
  buildHead(
    route,
    runtimeConfig,
    'OFFER',
    'OFFER something to people nearby and see who wants it'
  )
)

const messageId = ref(null)
const deliveryPossible = ref(false)
const hasDeadline = ref(false)
const deadline = ref('')
const deadlineInput = ref(null)
const deadlineError = ref(false)

// Calculate date limits
const today = computed(() => {
  return new Date().toISOString().substring(0, 10)
})

const maxDeadline = computed(() => {
  return new Date(Date.now() + MESSAGE_EXPIRE_TIME * 24 * 60 * 60 * 1000)
    .toISOString()
    .substring(0, 10)
})

onMounted(() => {
  // Set default deadline to max
  deadline.value = maxDeadline.value

  // Get existing message
  const myid = authStore.user?.id
  const existingMessages = composeStore.all.filter(
    (m) => m.type === 'Offer' && (!m.savedBy || m.savedBy === myid)
  )

  if (existingMessages.length > 0) {
    messageId.value = existingMessages[0].id
  } else {
    // No message found, go back to start
    router.replace('/give')
  }
})

function setDeadlineAndShowPicker() {
  if (hasDeadline.value) {
    const input = deadlineInput.value?.element
    if (input) {
      input.focus()
      input.click()
    }
  } else {
    hasDeadline.value = true
    setTimeout(() => {
      const input = deadlineInput.value?.element
      if (input) {
        input.focus()
        input.click()
      }
    }, 50)
  }
}

function goNext() {
  // Validate deadline is not in the past
  if (hasDeadline.value && deadline.value && deadline.value < today.value) {
    deadlineError.value = true
    const input = deadlineInput.value?.element
    if (input) {
      input.focus()
    }
    return
  }

  // Save delivery and deadline to compose store before navigating
  if (messageId.value !== null) {
    composeStore.setDeliveryPossible(messageId.value, deliveryPossible.value)
    if (hasDeadline.value && deadline.value) {
      composeStore.setDeadline(messageId.value, deadline.value)
    } else {
      composeStore.setDeadline(messageId.value, null)
    }
  }

  // Continue to whoami for email
  router.push('/give/whoami')
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.options-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.stepper-container {
  background: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @include media-breakpoint-up(lg) {
    padding: 1.5rem 2rem;
  }
}

.options-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;

  @include media-breakpoint-up(lg) {
    padding: 2rem;
  }
}

.options-card {
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.options-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-green-background;
  margin-bottom: 1.5rem;
  text-align: center;
}

.option-section {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.option-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #212529;
}

.toggle-options {
  display: flex;
  gap: 0.5rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #dee2e6;
  background: #fff;
  font-size: 1rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    border-color: $color-green-background;
    background: rgba($color-green-background, 0.1);
    color: darken($color-green-background, 10%);
    font-weight: 500;
  }

  &:not(.active):hover {
    background: #f8f9fa;
  }
}

.deadline-picker {
  margin-top: 0.75rem;
}

.next-section {
  margin-top: 2rem;
  margin-bottom: 3rem;
}

.next-container {
  display: flex;
  justify-content: center;
}

.next-btn {
  min-width: 280px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
