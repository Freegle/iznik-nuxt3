<template>
  <div class="app-find-photos">
    <!-- Main content -->
    <div class="app-content">
      <AppPhotoUploader
        v-model="attachments"
        type="Message"
        :recognise="attachments.length === 0"
        empty-title="What should it look like?"
        empty-subtitle="Add a photo if you have one"
        @photo-processed="onPhotoProcessed"
        @skip="goNext"
      />
    </div>

    <!-- Footer with Next button -->
    <div v-if="hasPhotos" class="app-footer">
      <b-button variant="primary" size="lg" class="w-100" @click="goNext">
        Next <v-icon icon="arrow-right" />
      </b-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useComposeStore } from '~/stores/compose'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const composeStore = useComposeStore()
const authStore = useAuthStore()

// Initialize message ID synchronously so it's available for computed properties
function getOrCreateMessageId() {
  const myid = authStore.user?.id

  // Check if we have an existing message for this type in composeStore.all
  // Note: composeStore.all may return synthetic default messages, so we must
  // call setType() to ensure the message actually exists in state.messages
  const existingMessages = composeStore.all.filter(
    (m) => m.type === 'Wanted' && (!m.savedBy || m.savedBy === myid)
  )

  const id =
    existingMessages.length > 0 ? existingMessages[0].id : composeStore.add()

  // Ensure the message exists in state.messages (like PostMessage.vue does)
  composeStore.setType({
    id,
    type: 'Wanted',
  })

  return id
}

// Get or create message ID synchronously
const messageId = ref(getOrCreateMessageId())

// Get attachments for current message
const attachments = computed({
  get() {
    return composeStore.attachments(messageId.value) || []
  },
  set(newValue) {
    composeStore.setAttachmentsForMessage(messageId.value, newValue)
  },
})

// Track if we have photos (for showing Next button)
const hasPhotos = computed(() => attachments.value.length > 0)

function onPhotoProcessed() {
  // Photo was added - hasPhotos will update automatically via computed
}

function goNext() {
  router.push('/find/mobile/details')
}
</script>

<style scoped lang="scss">
@import 'assets/css/sticky-banner.scss';

.app-find-photos {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
  // Account for footer + potential ads banner
  padding-bottom: calc(80px + $sticky-banner-height-mobile);

  @media (min-height: $mobile-tall) {
    padding-bottom: calc(80px + $sticky-banner-height-mobile-tall);
  }
}

.app-content {
  flex: 1;
  overflow-y: auto;
}

.app-footer {
  position: fixed;
  // Position above the ads banner
  bottom: $sticky-banner-height-mobile;
  left: 0;
  right: 0;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: #fff;
  z-index: 100;

  @media (min-height: $mobile-tall) {
    bottom: $sticky-banner-height-mobile-tall;
  }
}
</style>
