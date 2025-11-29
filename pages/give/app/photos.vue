<template>
  <div class="app-give-photos">
    <!-- Header with back button and progress -->
    <div class="app-header">
      <button class="back-button" @click="goBack">
        <v-icon icon="arrow-left" />
      </button>
      <div class="header-title">Give an item</div>
      <div class="header-step">1/3</div>
    </div>

    <!-- Progress dots -->
    <AppProgressDots :current-step="1" />

    <!-- Main content -->
    <div class="app-content">
      <AppPhotoUploader
        v-model="attachments"
        type="Message"
        :recognise="attachments.length === 0"
        @photo-processed="onPhotoProcessed"
      />
    </div>

    <!-- Footer with Next button -->
    <div class="app-footer">
      <b-button
        variant="primary"
        size="lg"
        class="w-100"
        :disabled="attachments.length === 0"
        @click="goNext"
      >
        Next <v-icon icon="arrow-right" />
      </b-button>
      <p v-if="attachments.length === 0" class="skip-text">
        <a href="#" @click.prevent="goNext">Skip photos for now</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useComposeStore } from '~/stores/compose'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const composeStore = useComposeStore()
const authStore = useAuthStore()

// Get or create message ID
const messageId = ref(null)

onMounted(() => {
  // Initialize compose store
  const myid = authStore.user?.id

  // Check if we have an existing message for this type
  const existingMessages = composeStore.all.filter(
    (m) => m.type === 'Offer' && (!m.savedBy || m.savedBy === myid)
  )

  if (existingMessages.length > 0) {
    messageId.value = existingMessages[0].id
  } else {
    // Create a new message
    messageId.value = composeStore.add()
    const me = authStore.user

    composeStore.setMessage(
      messageId.value,
      {
        id: messageId.value,
        item: null,
        description: null,
        type: 'Offer',
        availablenow: 1,
      },
      me
    )
  }
})

// Get attachments for current message
const attachments = computed({
  get() {
    if (!messageId.value) return []
    return composeStore.attachments(messageId.value) || []
  },
  set(newValue) {
    if (messageId.value) {
      composeStore.setAttachmentsForMessage(messageId.value, newValue)
    }
  },
})

function onPhotoProcessed(photoId) {
  console.log('Photo processed:', photoId)
}

function goBack() {
  router.back()
}

function goNext() {
  router.push('/give/app/details')
}
</script>

<style scoped lang="scss">
.app-give-photos {
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
}

.app-footer {
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: #fff;
}

.skip-text {
  text-align: center;
  margin-top: 0.75rem;
  margin-bottom: 0;
  font-size: 0.875rem;

  a {
    color: #6c757d;
  }
}
</style>
