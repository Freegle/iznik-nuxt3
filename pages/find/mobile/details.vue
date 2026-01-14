<template>
  <div class="app-find-details" :class="{ 'has-sticky-ad': stickyAdRendered }">
    <!-- Main content -->
    <div class="app-content">
      <!-- Photo thumbnails (summary of what they added) -->
      <div v-if="attachments.length > 0" class="photo-summary">
        <div
          v-for="(photo, index) in attachments.slice(0, 4)"
          :key="photo.id || index"
          class="photo-thumb"
          :class="{
            'photo-thumb-primary': index === 0,
            'photo-thumb-ai': photo.externalmods && photo.externalmods.ai,
          }"
        >
          <OurUploadedImage
            v-if="photo.ouruid"
            :src="photo.ouruid"
            :modifiers="photo.externalmods"
            alt=""
            :width="50"
            :height="50"
          />
          <img
            v-else
            :src="photo.path || photo.preview || photo.paththumb"
            alt=""
          />
        </div>
        <div v-if="attachments.length > 4" class="photo-more">
          +{{ attachments.length - 4 }}
        </div>
        <!-- Show delete for AI illustration, edit for real photos -->
        <button
          v-if="hasOnlyAiIllustration"
          class="delete-ai-btn"
          @click="removeAiIllustration"
        >
          <v-icon icon="times" />
        </button>
        <button v-else class="edit-photos-btn" @click="editPhotos">
          <v-icon icon="pencil" />
        </button>
      </div>

      <!-- Item name -->
      <div class="form-section">
        <label for="item-name" class="form-label">
          What are you looking for?
        </label>
        <b-form-input
          id="item-name"
          v-model="item"
          placeholder="e.g. Kids bike for 8 year old"
          maxlength="60"
          size="lg"
          :state="itemState"
          @blur="onItemBlur"
        />
      </div>

      <!-- Description -->
      <div class="form-section">
        <label for="description" class="form-label">
          Tell us more about what you need:
        </label>
        <b-form-textarea
          id="description"
          v-model="description"
          placeholder="Size, colour, any specific requirements..."
          rows="4"
          :state="descriptionState"
        />
        <div v-if="descriptionState === false" class="invalid-feedback d-block">
          Please add a description to help people understand what you need.
        </div>
      </div>
    </div>

    <!-- Footer with Next button -->
    <div class="app-footer" :class="{ 'has-sticky-ad': stickyAdRendered }">
      <b-button
        variant="primary"
        size="lg"
        class="w-100"
        @click="validateAndNext"
      >
        Next <v-icon icon="arrow-right" />
      </b-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { useComposeStore } from '~/stores/compose'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import OurUploadedImage from '~/components/OurUploadedImage'
import api from '~/api'

const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const $api = api(runtimeConfig)
const composeStore = useComposeStore()
const authStore = useAuthStore()
const miscStore = useMiscStore()

// Check if sticky ad is rendered
const stickyAdRendered = computed(() => miscStore.stickyAdRendered)

// Initialize message ID synchronously so it's available for computed properties
function getMessageId() {
  const myid = authStore.user?.id
  const existingMessages = composeStore.all.filter(
    (m) => m.type === 'Wanted' && (!m.savedBy || m.savedBy === myid)
  )

  if (existingMessages.length > 0) {
    const id = existingMessages[0].id
    // Ensure message exists in state.messages (like PostMessage.vue does)
    composeStore.setType({ id, type: 'Wanted' })
    return id
  }
  return null
}

const messageId = ref(getMessageId())
const showItemError = ref(false)
const showDescriptionError = ref(false)

// Redirect if no message found
onMounted(() => {
  if (messageId.value === null) {
    router.replace('/find/mobile/photos')
  }
})

// Item validation state - null initially, false if error, true if valid
const itemState = computed(() => {
  if (showItemError.value && (!item.value || !item.value.trim())) {
    return false
  }
  return item.value ? true : null
})

// Description validation state
const descriptionState = computed(() => {
  if (
    showDescriptionError.value &&
    (!description.value || !description.value.trim())
  ) {
    return false
  }
  return null
})

// Get attachments
const attachments = computed(() => {
  if (messageId.value === null) return []
  return composeStore.attachments(messageId.value) || []
})

// Check if we only have AI illustrations (no real photos)
const hasOnlyAiIllustration = computed(() => {
  const atts = attachments.value
  if (atts.length === 0) return false

  const realPhotos = atts.filter(
    (a) => !a.externalmods || a.externalmods.ai !== true
  )
  return realPhotos.length === 0 && atts.length > 0
})

// Remove AI illustration
function removeAiIllustration() {
  const filteredAtts = attachments.value.filter(
    (a) => !a.externalmods || a.externalmods.ai !== true
  )
  composeStore.setAttachmentsForMessage(messageId.value, filteredAtts)
}

// Item name
const item = computed({
  get() {
    const msg = composeStore.message(messageId.value)
    return msg?.item || ''
  },
  set(newValue) {
    composeStore.setItem({
      id: messageId.value,
      item: newValue,
    })
  },
})

// Description
const description = computed({
  get() {
    const msg = composeStore.message(messageId.value)
    return msg?.description || ''
  },
  set(newValue) {
    composeStore.setDescription({
      id: messageId.value,
      description: newValue,
    })
  },
})

function editPhotos() {
  router.push('/find/mobile/photos')
}

// AI Illustration support
const fetchingIllustration = ref(false)
const lastFetchedItem = ref(null)

async function fetchAiIllustration(itemName) {
  if (!itemName || !itemName.trim()) return

  const trimmedItem = itemName.trim()

  const realPhotos = attachments.value.filter(
    (a) => !a.externalmods || a.externalmods.ai !== true
  )

  if (
    realPhotos.length > 0 ||
    fetchingIllustration.value ||
    lastFetchedItem.value === trimmedItem
  ) {
    return
  }

  fetchingIllustration.value = true
  lastFetchedItem.value = trimmedItem

  try {
    const illustration = await $api.message.getIllustration(trimmedItem)

    if (illustration && illustration.externaluid) {
      const currentRealPhotos = attachments.value.filter(
        (a) => !a.externalmods || a.externalmods.ai !== true
      )

      if (currentRealPhotos.length === 0) {
        const filteredAtts = attachments.value.filter(
          (a) => !a.externalmods || a.externalmods.ai !== true
        )

        composeStore.setAttachmentsForMessage(messageId.value, [
          ...filteredAtts,
          {
            id: 'ai-' + Date.now(),
            path: illustration.url,
            paththumb: illustration.url,
            ouruid: illustration.externaluid,
            externalmods: { ai: true },
            isAiIllustration: true,
          },
        ])
      }
    }
  } catch (e) {
    console.log('Failed to fetch AI illustration:', e.message)
  } finally {
    fetchingIllustration.value = false
  }
}

watch(
  () => composeStore.attachments(messageId.value),
  (newVal, oldVal) => {
    if (!oldVal || !Array.isArray(oldVal)) return

    const hadAi = oldVal.some(
      (a) => a.externalmods && a.externalmods.ai === true
    )
    const hasAi = newVal.some(
      (a) => a.externalmods && a.externalmods.ai === true
    )

    if (hadAi && !hasAi) {
      composeStore.setAiDeclined(messageId.value, true)
    }
  },
  { deep: true }
)

function onItemBlur() {
  if (item.value && item.value.trim()) {
    fetchAiIllustration(item.value)
  }
}

function validateAndNext() {
  if (!item.value || !item.value.trim()) {
    showItemError.value = true
    nextTick(() => {
      const input = document.getElementById('item-name')
      if (input) {
        input.focus()
      }
    })
    return
  }

  // Check that we have either a description or a photo.
  const hasDescription = description.value && description.value.trim()
  const hasPhotos = attachments.value && attachments.value.length > 0

  if (!hasDescription && !hasPhotos) {
    showDescriptionError.value = true
    nextTick(() => {
      const textarea = document.getElementById('description')
      if (textarea) {
        textarea.focus()
      }
    })
    return
  }

  // Continue to app whereami flow for location.
  router.push('/find/mobile/whereami')
}
</script>

<style scoped lang="scss">
@import 'assets/css/sticky-banner.scss';

.app-find-details {
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
  border: 2px solid #e9ecef;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.photo-thumb-primary {
  border-color: #28a745;
  border-width: 3px;
}

.photo-thumb-ai {
  border-color: #6c757d;
  border-style: dashed;
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

.delete-ai-btn {
  margin-left: auto;
  width: 36px;
  height: 36px;
  border: none;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc3545;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-ai-btn:active {
  background: #f8d7da;
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
