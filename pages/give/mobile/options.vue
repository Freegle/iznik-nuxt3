<template>
  <div class="app-give-options" :class="{ 'has-sticky-ad': stickyAdRendered }">
    <!-- Main content -->
    <div class="app-content">
      <!-- Delivery option -->
      <div class="form-section">
        <label class="form-label">Could you deliver?</label>
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
      <div class="form-section">
        <label class="form-label">Is there a deadline?</label>
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
          />
        </div>
      </div>
    </div>

    <!-- Footer with Next button -->
    <div class="app-footer" :class="{ 'has-sticky-ad': stickyAdRendered }">
      <b-button variant="primary" size="lg" class="w-100" @click="goNext">
        Next <v-icon icon="arrow-right" />
      </b-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useComposeStore } from '~/stores/compose'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { MESSAGE_EXPIRE_TIME } from '~/constants'

const router = useRouter()
const composeStore = useComposeStore()
const authStore = useAuthStore()
const miscStore = useMiscStore()

// Check if sticky ad is rendered
const stickyAdRendered = computed(() => miscStore.stickyAdRendered)

const messageId = ref(null)
const deliveryPossible = ref(false)
const hasDeadline = ref(false)
const deadline = ref('')
const deadlineInput = ref(null)

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
    // No message found, go back to photos
    router.replace('/give/mobile/photos')
  }
})

function setDeadlineAndShowPicker() {
  if (hasDeadline.value) {
    // Already showing, just trigger picker
    const input = deadlineInput.value?.element
    if (input) {
      input.focus()
      input.click()
    }
  } else {
    hasDeadline.value = true
    // Use setTimeout to allow DOM to update, then click
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
  // Save delivery and deadline to compose store before navigating
  // Note: messageId can be 0 which is falsy but valid, so check for null explicitly
  if (messageId.value !== null) {
    composeStore.setDeliveryPossible(messageId.value, deliveryPossible.value)
    if (hasDeadline.value && deadline.value) {
      composeStore.setDeadline(messageId.value, deadline.value)
    } else {
      composeStore.setDeadline(messageId.value, null)
    }
  }

  // Continue to app whereami flow for location
  router.push('/give/mobile/whereami')
}
</script>

<style scoped lang="scss">
@import 'assets/css/sticky-banner.scss';

.app-give-options {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  padding-bottom: 80px;

  &.has-sticky-ad {
    padding-bottom: calc(80px + $sticky-banner-height-mobile);

    @media (min-height: $mobile-tall) {
      padding-bottom: calc(80px + $sticky-banner-height-mobile-tall);
    }

    @media (min-height: $desktop-tall) {
      padding-bottom: calc(80px + $sticky-banner-height-desktop-tall);
    }
  }
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
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
  border-radius: 12px;
  font-size: 1rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    border-color: #28a745;
    background: #d4edda;
    color: #155724;
    font-weight: 500;
  }

  &:not(.active):active {
    background: #f8f9fa;
  }
}

.deadline-picker {
  margin-top: 0.75rem;
}

.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: #fff;
  z-index: 100;

  &.has-sticky-ad {
    bottom: $sticky-banner-height-mobile;

    @media (min-height: $mobile-tall) {
      bottom: $sticky-banner-height-mobile-tall;
    }

    @media (min-height: $desktop-tall) {
      bottom: $sticky-banner-height-desktop-tall;
    }
  }
}
</style>
