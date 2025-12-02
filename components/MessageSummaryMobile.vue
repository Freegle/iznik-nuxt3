<template>
  <div
    v-if="message"
    :id="'msg-' + id"
    class="message-summary-mobile"
    :class="{
      offer: isOffer,
      wanted: isWanted,
      freegled: message.successful && showFreegled,
      promisedfade: showPromised && message.promised && !message.promisedtome,
    }"
    @click="expand"
  >
    <!-- Status overlay images - outside photo-area to stack above everything -->
    <b-img
      v-if="message.successful"
      lazy
      src="/freegled.jpg"
      class="status-overlay-image"
      :alt="successfulText"
    />
    <b-img
      v-else-if="message.promised && showPromised"
      lazy
      src="/promised.jpg"
      class="status-overlay-image"
      alt="Promised"
    />

    <!-- Photo area with overlay -->
    <div class="photo-area">
      <!-- Actual photo -->
      <div v-if="gotAttachments" class="photo-container">
        <!-- Use 640x480 to match expanded view size for faster modal loading -->
        <OurUploadedImage
          v-if="message.attachments[0]?.ouruid"
          :src="message.attachments[0].ouruid"
          :modifiers="message.attachments[0].externalmods"
          alt="Item Photo"
          class="photo-image"
          :width="640"
          :height="480"
          :preload="preload"
        />
        <NuxtPicture
          v-else-if="message.attachments[0]?.externaluid"
          format="webp"
          provider="uploadcare"
          :src="message.attachments[0].externaluid"
          :modifiers="message.attachments[0].externalmods"
          alt="Item Photo"
          class="photo-image"
          :width="640"
          :height="480"
          :preload="preload"
        />
        <ProxyImage
          v-else-if="message.attachments[0]?.path"
          class-name="photo-image"
          alt="Item picture"
          :src="message.attachments[0].path"
          :width="640"
          :height="480"
          fit="cover"
          :preload="preload"
        />
        <!-- Multi-photo indicator -->
        <div v-if="attachmentCount > 1" class="photo-count">
          {{ attachmentCount }} <v-icon icon="camera" />
        </div>
      </div>

      <!-- AI-generated image when no photo -->
      <div v-else-if="aiImageUrl" class="photo-container">
        <img
          :src="aiImageUrl"
          alt="AI generated item"
          class="photo-image sample-image"
          loading="lazy"
        />
        <div class="sample-badge">AI illustration</div>
      </div>

      <!-- No photo placeholder (fallback if AI URL not generated) -->
      <div v-else class="no-photo-placeholder" :class="placeholderClass">
        <div class="placeholder-pattern"></div>
        <div class="icon-circle">
          <v-icon :icon="categoryIcon" class="placeholder-icon" />
        </div>
      </div>

      <!-- Title/info overlay at bottom of photo -->
      <div class="title-overlay">
        <div class="info-row">
          <MessageTag :id="id" :inline="true" class="title-tag ps-1 pe-1" />
          <div class="info-icons">
            <span v-if="hasLocation" class="location">
              <v-icon icon="map-marker-alt" />{{ locationText }}
            </span>
            <span class="time"
              ><v-icon icon="clock" />{{ timeAgo || '...' }}</span
            >
          </div>
        </div>
        <div class="title-row">
          <span class="title-subject">{{ strippedSubject }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useMessageDisplay } from '~/composables/useMessageDisplay'
import { useAiSampleImage } from '~/composables/useAiSampleImage'
import MessageTag from '~/components/MessageTag'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  showFreegled: {
    type: Boolean,
    default: true,
  },
  showPromised: {
    type: Boolean,
    default: true,
  },
  preload: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['expand'])

// Use shared composable
const idRef = toRef(props, 'id')
const {
  message,
  strippedSubject,
  gotAttachments,
  attachmentCount,
  timeAgo,
  distanceText,
  isOffer,
  isWanted,
  successfulText,
  placeholderClass,
  categoryIcon,
} = useMessageDisplay(idRef)

// AI-generated image when no photo attached
const subjectRef = computed(() => message.value?.subject)
const { aiImageUrl } = useAiSampleImage(subjectRef)

const locationText = computed(() => {
  // Show area name if available, otherwise distance
  if (message.value?.area) {
    return message.value.area
  }
  return distanceText.value
})

const hasLocation = computed(() => {
  const loc = locationText.value
  // Hide if empty, unknown, or just whitespace
  if (!loc) return false
  const lower = loc.toLowerCase().trim()
  if (!lower) return false
  if (lower === 'unknown' || lower === 'unknown location') return false
  return true
})

function expand(e) {
  if (!message.value?.successful) {
    emit('expand')

    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'assets/css/_color-vars.scss';

// Use very specific selectors to override MessageList.vue's deep selectors
.message-summary-mobile {
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px $color-black-opacity-12;
  cursor: pointer;
  background: $color-white;
  height: auto;
  min-height: 0;
  max-height: none;
}

.photo-area {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 115%;
  background: $color-gray--light;
  overflow: hidden;

  .freegled &,
  .promisedfade & {
    filter: contrast(50%);
  }
}

.photo-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    $color-gray--light 0%,
    lighten($color-gray--light, 5%) 50%,
    $color-gray--light 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

:deep(.photo-image),
:deep(picture),
:deep(picture img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.sample-image {
  filter: grayscale(100%);
}

.sample-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: $color-black-opacity-60;
  color: $color-white;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 5;
  height: auto;
  text-align: center;
  white-space: nowrap;
}

.photo-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: $color-black-opacity-60;
  color: $color-white;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  z-index: 5;
  height: auto;
}

.no-photo-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &.offer-gradient {
    background: radial-gradient(
        ellipse at 30% 20%,
        rgba(129, 199, 132, 0.9) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 70% 80%,
        rgba(56, 142, 60, 0.8) 0%,
        transparent 50%
      ),
      linear-gradient(160deg, #66bb6a 0%, #43a047 50%, #2e7d32 100%);

    .placeholder-pattern {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Ctext x='35' y='52' font-family='Arial,sans-serif' font-size='50' font-weight='bold' fill='white' fill-opacity='0.12' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E");
      background-size: 70px 70px;
    }
  }

  &.wanted-gradient {
    background: radial-gradient(
        ellipse at 25% 25%,
        rgba(144, 202, 249, 0.9) 0%,
        transparent 45%
      ),
      radial-gradient(
        ellipse at 75% 75%,
        rgba(66, 165, 245, 0.7) 0%,
        transparent 45%
      ),
      linear-gradient(160deg, #64b5f6 0%, #42a5f5 50%, #1e88e5 100%);

    .placeholder-pattern {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Ctext x='35' y='52' font-family='Arial,sans-serif' font-size='50' font-weight='bold' fill='white' fill-opacity='0.12' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E");
      background-size: 70px 70px;
    }
  }
}

.placeholder-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.icon-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.placeholder-icon {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.status-overlay-image {
  position: absolute;
  z-index: 20;
  transform: rotate(15deg);
  top: 50%;
  left: 50%;
  width: 50%;
  max-width: 100px;
  margin-left: -25%;
  margin-top: -15%;
  pointer-events: none;
  height: auto;
}

.title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: auto;
  padding: 2rem 0.5rem 0.5rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.88) 8%,
    rgba(0, 0, 0, 0.84) 16%,
    rgba(0, 0, 0, 0.78) 24%,
    rgba(0, 0, 0, 0.68) 32%,
    rgba(0, 0, 0, 0.55) 42%,
    rgba(0, 0, 0, 0.4) 52%,
    rgba(0, 0, 0, 0.26) 62%,
    rgba(0, 0, 0, 0.15) 72%,
    rgba(0, 0, 0, 0.08) 82%,
    rgba(0, 0, 0, 0.03) 92%,
    rgba(0, 0, 0, 0) 100%
  );
  color: white;
  z-index: 3;
  overflow: hidden;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  height: auto;
}

.title-tag {
  flex-shrink: 0;
  font-size: 0.8rem;
  height: auto;
}

:deep(.title-tag .tagbadge) {
  position: relative;
  left: auto;
  top: auto;
  font-size: 0.8rem;
}

.info-icons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  opacity: 0.9;
}

.location {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  height: auto;
}

.time {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  height: auto;
}

.title-row {
  height: auto;
  width: 100%;
  min-width: 0;
}

.title-subject {
  display: block;
  width: 100%;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: auto;
}
</style>
