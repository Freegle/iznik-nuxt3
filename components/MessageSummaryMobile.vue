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
    <!-- Photo area with overlay -->
    <div class="photo-area">
      <!-- Status overlay images -->
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

      <!-- Blurred sample image from similar posts -->
      <div v-else-if="sampleImage" class="photo-container">
        <ProxyImage
          class-name="photo-image blurred-sample"
          alt="Similar item"
          :src="sampleImage.path"
          :width="400"
          :height="400"
          fit="cover"
          :preload="preload"
        />
        <div class="sample-badge">Photo of similar item</div>
      </div>

      <!-- No photo placeholder -->
      <div v-else class="no-photo-placeholder" :class="placeholderClass">
        <div class="placeholder-pattern"></div>
        <div class="icon-circle">
          <v-icon :icon="categoryIcon" class="placeholder-icon" />
        </div>
      </div>

      <!-- Title/info overlay at bottom of photo -->
      <div class="title-overlay">
        <div class="title-row">
          <MessageTag :id="id" :inline="true" class="title-tag ps-1 pe-1" />
          <span class="title-subject">{{ strippedSubject }}</span>
        </div>
        <div class="info-row">
          <span class="location">
            <v-icon icon="map-marker-alt" class="me-1" />{{ locationText }}
          </span>
          <span class="time">{{ timeAgo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useMessageDisplay } from '~/composables/useMessageDisplay'
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
  sampleImage,
  attachmentCount,
  timeAgo,
  distanceText,
  isOffer,
  isWanted,
  successfulText,
  placeholderClass,
  categoryIcon,
} = useMessageDisplay(idRef)

const locationText = computed(() => {
  // Show area name if available, otherwise distance
  if (message.value?.area) {
    return message.value.area
  }
  return distanceText.value
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  background: $color-white;
  height: auto;
  min-height: 0;
  max-height: none;

  &.freegled,
  &.promisedfade {
    filter: contrast(50%);
  }
}

.photo-area {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 115%;
  background: $color-gray--light;
  overflow: hidden;
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

.blurred-sample {
  filter: blur(4px) saturate(0.85);
  transform: scale(1.03);
}

.sample-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(128, 128, 128, 0.7);
  color: rgba(255, 255, 255, 0.95);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 500;
  z-index: 5;
  height: auto;
}

.photo-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
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
    background: linear-gradient(145deg, #4caf50 0%, #2e7d32 100%);
  }

  &.wanted-gradient {
    background: linear-gradient(145deg, #2196f3 0%, #1565c0 100%);
  }
}

.placeholder-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.08;
  background-image: radial-gradient(
      circle at 20% 30%,
      white 1px,
      transparent 1px
    ),
    radial-gradient(circle at 80% 70%, white 1px, transparent 1px),
    radial-gradient(circle at 50% 50%, white 2px, transparent 2px);
  background-size: 30px 30px, 25px 25px, 40px 40px;
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
  z-index: 10;
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
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  color: white;
  z-index: 3;
}

.title-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
  height: auto;
}

.title-tag {
  flex-shrink: 0;
  font-size: 0.65rem;
  height: auto;
  align-self: flex-start;
  margin-top: 0.15rem;
}

:deep(.title-tag .tagbadge) {
  position: relative;
  left: auto;
  top: auto;
  font-size: 0.65rem;
}

.title-subject {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: auto;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.7rem;
  opacity: 0.9;
  height: auto;
}

.location {
  display: flex;
  align-items: center;
  height: auto;
}

.time {
  text-align: right;
  height: auto;
}
</style>
