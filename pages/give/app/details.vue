<template>
  <div class="app-give-details">
    <!-- Header with back button and progress -->
    <div class="app-header">
      <button class="back-button" @click="goBack">
        <v-icon icon="arrow-left" />
      </button>
      <div class="header-title">Tell us about your item</div>
      <div class="header-step">2/3</div>
    </div>

    <!-- Progress dots -->
    <AppProgressDots :current-step="2" />

    <!-- Main content -->
    <div class="app-content">
      <!-- Photo thumbnails (summary of what they added) -->
      <div v-if="attachments.length > 0" class="photo-summary">
        <div
          v-for="(photo, index) in attachments.slice(0, 4)"
          :key="photo.id || index"
          class="photo-thumb"
        >
          <img :src="photo.path || photo.preview || photo.paththumb" alt="" />
          <div v-if="index === 0" class="thumb-primary">
            <v-icon icon="star" />
          </div>
        </div>
        <div v-if="attachments.length > 4" class="photo-more">
          +{{ attachments.length - 4 }}
        </div>
        <button class="edit-photos-btn" @click="editPhotos">
          <v-icon icon="pencil" />
        </button>
      </div>

      <!-- Item name -->
      <div class="form-section">
        <label for="item-name" class="form-label">
          What are you giving away? *
        </label>
        <b-form-input
          id="item-name"
          v-model="item"
          placeholder="e.g. Blue IKEA bookshelf"
          size="lg"
          class="form-input"
          :state="item ? true : null"
        />
      </div>

      <!-- Description -->
      <div class="form-section">
        <label for="description" class="form-label">
          Tell us more about it
        </label>
        <b-form-textarea
          id="description"
          v-model="description"
          placeholder="Condition, size, why you're giving it away..."
          rows="4"
          class="form-input"
        />
      </div>

      <!-- Quantity -->
      <div class="form-section">
        <label class="form-label">How many are you giving away?</label>
        <div class="quantity-control">
          <button
            class="quantity-btn"
            :disabled="availablenow <= 1"
            @click="decrementQuantity"
          >
            <v-icon icon="minus" />
          </button>
          <span class="quantity-value">{{ availablenow }}</span>
          <button
            class="quantity-btn"
            :disabled="availablenow >= 99"
            @click="incrementQuantity"
          >
            <v-icon icon="plus" />
          </button>
        </div>
      </div>
    </div>

    <!-- Footer with Next button -->
    <div class="app-footer">
      <b-button
        variant="primary"
        size="lg"
        class="w-100"
        :disabled="!item || !item.trim()"
        @click="goNext"
      >
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

const router = useRouter()
const composeStore = useComposeStore()
const authStore = useAuthStore()

const messageId = ref(null)

onMounted(() => {
  // Get existing message
  const myid = authStore.user?.id
  const existingMessages = composeStore.all.filter(
    (m) => m.type === 'Offer' && (!m.savedBy || m.savedBy === myid)
  )

  if (existingMessages.length > 0) {
    messageId.value = existingMessages[0].id
  } else {
    // No message found, go back to photos
    router.replace('/give/app/photos')
  }
})

// Get attachments
const attachments = computed(() => {
  if (!messageId.value) return []
  return composeStore.attachments(messageId.value) || []
})

// Item name
const item = computed({
  get() {
    if (!messageId.value) return ''
    const msg = composeStore.message(messageId.value)
    return msg?.item || ''
  },
  set(newValue) {
    if (messageId.value) {
      composeStore.setItem({
        id: messageId.value,
        item: newValue,
      })
    }
  },
})

// Description
const description = computed({
  get() {
    if (!messageId.value) return ''
    const msg = composeStore.message(messageId.value)
    return msg?.description || ''
  },
  set(newValue) {
    if (messageId.value) {
      composeStore.setDescription({
        id: messageId.value,
        description: newValue,
      })
    }
  },
})

// Quantity
const availablenow = computed({
  get() {
    if (!messageId.value) return 1
    const msg = composeStore.message(messageId.value)
    return msg?.availablenow || 1
  },
  set(newValue) {
    if (messageId.value) {
      composeStore.setAvailableNow(messageId.value, newValue)
    }
  },
})

function decrementQuantity() {
  if (availablenow.value > 1) {
    availablenow.value--
  }
}

function incrementQuantity() {
  if (availablenow.value < 99) {
    availablenow.value++
  }
}

function editPhotos() {
  router.push('/give/app/photos')
}

function goBack() {
  router.back()
}

function goNext() {
  // Continue to existing whereami flow for location
  router.push('/give/whereami')
}
</script>

<style scoped lang="scss">
.app-give-details {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
}

.app-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
}

.back-button {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #212529;
  cursor: pointer;
  transition: background 0.2s;
}

.back-button:active {
  background: #f8f9fa;
}

.header-title {
  flex: 1;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.header-step {
  width: 40px;
  text-align: right;
  color: #6c757d;
  font-size: 0.875rem;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.photo-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.photo-thumb {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.thumb-primary {
  position: absolute;
  bottom: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #ffc107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  color: #000;
}

.photo-more {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
}

.edit-photos-btn {
  margin-left: auto;
  width: 36px;
  height: 36px;
  border: none;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007bff;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-photos-btn:active {
  background: #e9ecef;
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

.form-input {
  border-radius: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity-btn {
  width: 44px;
  height: 44px;
  border: 2px solid #dee2e6;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #212529;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    background: #f8f9fa;
    border-color: #007bff;
  }
}

.quantity-value {
  font-size: 1.5rem;
  font-weight: 600;
  min-width: 3rem;
  text-align: center;
}

.app-footer {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: #fff;
}
</style>
