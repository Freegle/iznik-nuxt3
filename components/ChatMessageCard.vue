<template>
  <div
    v-if="message"
    class="chat-message-card"
    :class="{
      offer: isOffer,
      wanted: isWanted,
      freegled: message.successful,
      promised: message.promised && !message.successful,
    }"
    @click="goToMessage"
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
        v-else-if="message.promised"
        lazy
        src="/promised.jpg"
        class="status-overlay-image"
        alt="Promised"
      />

      <!-- Actual photo -->
      <div v-if="gotAttachments" class="photo-container">
        <OurUploadedImage
          v-if="message.attachments[0]?.ouruid"
          :src="message.attachments[0].ouruid"
          :modifiers="message.attachments[0].externalmods"
          alt="Item Photo"
          class="photo-image"
          :width="300"
          :height="300"
        />
        <NuxtPicture
          v-else-if="message.attachments[0]?.externaluid"
          format="webp"
          provider="uploadcare"
          :src="message.attachments[0].externaluid"
          :modifiers="message.attachments[0].externalmods"
          alt="Item Photo"
          class="photo-image"
          :width="300"
          :height="300"
        />
        <ProxyImage
          v-else-if="message.attachments[0]?.path"
          class-name="photo-image"
          alt="Item picture"
          :src="message.attachments[0].path"
          :width="300"
          :height="300"
          fit="cover"
        />
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
          <MessageTag :id="id" :inline="true" class="title-tag" />
          <span class="title-subject">{{ strippedSubject }}</span>
        </div>
        <div class="info-row">
          <span v-if="showLocation && locationText" class="location">
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
import { useRouter } from '#imports'
import { useMessageDisplay } from '~/composables/useMessageDisplay'
import { useAuthStore } from '~/stores/auth'
import MessageTag from '~/components/MessageTag'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  showLocation: {
    type: Boolean,
    default: true,
  },
})

const router = useRouter()
const authStore = useAuthStore()
const myid = authStore.user?.id

// Use shared composable
const idRef = toRef(props, 'id')
const {
  message,
  strippedSubject,
  gotAttachments,
  timeAgo,
  distanceText,
  isOffer,
  isWanted,
  successfulText,
  placeholderClass,
  categoryIcon,
} = useMessageDisplay(idRef)

const locationText = computed(() => {
  if (message.value?.area) {
    return message.value.area
  }
  return distanceText.value
})

function goToMessage() {
  if (myid && message.value?.fromuser === myid) {
    router.push('/mypost/' + props.id)
  } else {
    router.push('/message/' + props.id)
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'assets/css/_color-vars.scss';

.chat-message-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  background: $color-white;

  &.freegled {
    filter: contrast(70%);
  }
}

.photo-area {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 50%; // Half height for chat cards
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
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M20 25h20v2H20zM25 20h10v2H25zM22 27h16v8H22zM28 35h4v5H28z' fill='white' fill-opacity='0.15'/%3E%3C/svg%3E");
      background-size: 60px 60px;
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
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.placeholder-icon {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.status-overlay-image {
  position: absolute;
  z-index: 10;
  transform: rotate(15deg);
  top: 50%;
  left: 50%;
  width: 50%;
  max-width: 80px;
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
  padding: 1.5rem 0.5rem 0.4rem;
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
  gap: 0.25rem;
  margin-bottom: 0.15rem;
  height: auto;
}

.title-tag {
  flex-shrink: 0;
  font-size: 0.55rem;
  height: auto;
  align-self: flex-start;
  margin-top: 0.1rem;
}

:deep(.title-tag .tagbadge) {
  position: relative;
  left: auto;
  top: auto;
  font-size: 0.55rem;
}

.title-subject {
  font-size: 0.75rem;
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
  font-size: 0.6rem;
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
