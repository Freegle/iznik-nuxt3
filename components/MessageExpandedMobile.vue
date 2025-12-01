<template>
  <div
    v-if="message"
    ref="containerRef"
    class="message-expanded-mobile"
    :class="{ stickyAdRendered }"
    @scroll="onScroll"
  >
    <!-- Hide the default navbar by teleporting an empty replacement -->
    <Teleport to="#navbar-mobile">
      <div class="hidden-navbar" />
    </Teleport>

    <!-- Photo Area with Ken Burns animation -->
    <div
      class="photo-area"
      :style="{ height: `${photoHeight}px` }"
      @click="showPhotosModal"
    >
      <!-- Back button on photo -->
      <button class="back-button" @click.stop="goBack">
        <v-icon icon="arrow-left" />
      </button>

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
      <!-- Thumbnail carousel for multiple photos -->
      <div
        v-if="attachmentCount > 1"
        ref="thumbnailsRef"
        class="thumbnail-carousel"
        @touchstart="onThumbnailTouchStart"
        @touchmove="onThumbnailTouchMove"
        @touchend="onThumbnailTouchEnd"
      >
        <div
          v-for="(attachment, index) in message.attachments"
          :key="attachment.id || index"
          class="thumbnail-item"
          :class="{ active: index === currentPhotoIndex }"
          @click.stop="handleThumbnailClick(index)"
        >
          <OurUploadedImage
            v-if="attachment.ouruid"
            :src="attachment.ouruid"
            :modifiers="attachment.externalmods"
            alt="Thumbnail"
            class="thumbnail-image"
            :width="80"
            :height="80"
          />
          <NuxtPicture
            v-else-if="attachment.externaluid"
            format="webp"
            provider="uploadcare"
            :src="attachment.externaluid"
            :modifiers="attachment.externalmods"
            alt="Thumbnail"
            class="thumbnail-image"
            :width="80"
            :height="80"
          />
          <ProxyImage
            v-else-if="attachment.path"
            class-name="thumbnail-image"
            alt="Thumbnail"
            :src="attachment.path"
            :width="80"
            :height="80"
            fit="cover"
          />
        </div>
      </div>

      <!-- Actual photo or placeholder -->
      <div
        v-if="gotAttachments"
        class="photo-container"
        :class="{ 'ken-burns': !prefersReducedMotion }"
      >
        <OurUploadedImage
          v-if="currentAttachment?.ouruid"
          :src="currentAttachment.ouruid"
          :modifiers="currentAttachment.externalmods"
          alt="Item Photo"
          class="photo-image"
          :width="640"
          :height="480"
        />
        <NuxtPicture
          v-else-if="currentAttachment?.externaluid"
          format="webp"
          provider="uploadcare"
          :src="currentAttachment.externaluid"
          :modifiers="currentAttachment.externalmods"
          alt="Item Photo"
          class="photo-image"
          :width="640"
          :height="480"
        />
        <ProxyImage
          v-else-if="currentAttachment?.path"
          class-name="photo-image"
          alt="Item picture"
          :src="currentAttachment.path"
          :width="640"
          :height="480"
          fit="cover"
        />
      </div>

      <!-- Blurred sample image from similar posts (no own photos) -->
      <div
        v-else-if="sampleImage"
        class="photo-container sample-image-container"
      >
        <ProxyImage
          class-name="photo-image blurred-sample"
          alt="Similar item"
          :src="sampleImage.path"
          :width="640"
          :height="480"
          fit="cover"
        />
        <div class="sample-badge">Photo of similar item</div>
      </div>

      <!-- No photo placeholder (no attachments and no sample image) -->
      <div v-else class="no-photo-placeholder" :class="placeholderClass">
        <div class="placeholder-pattern"></div>
        <div class="icon-circle">
          <v-icon :icon="categoryIcon" class="placeholder-icon" />
        </div>
      </div>

      <!-- Poster overlay on photo (shown on shorter screens) -->
      <NuxtLink
        v-if="poster"
        :to="posterProfileUrl"
        class="poster-overlay"
        :class="{ 'poster-overlay--below-carousel': attachmentCount > 1 }"
        @click.stop
      >
        {{ poster.displayname }}
        <span v-if="distanceText" class="poster-overlay-distance"
          >· {{ distanceText }}</span
        >
      </NuxtLink>

      <!-- Title overlay at bottom of photo -->
      <div class="title-overlay">
        <div class="title-row">
          <MessageTag :id="id" :inline="true" class="title-tag ps-1 pe-1" />
          <span class="title-subject">{{ strippedSubject }}</span>
        </div>
        <!-- Stats pills below subject -->
        <div class="stats-pills">
          <div class="pills-left">
            <span
              v-b-tooltip.click.blur="distanceTooltip"
              class="stat-pill clickable"
              @click.stop="showMapModal = true"
            >
              <v-icon icon="map-marker-alt" /> {{ distanceText }}
            </span>
          </div>
          <div class="pills-right">
            <span
              v-b-tooltip.click.blur="'Time since this was last posted'"
              class="stat-pill clickable pill-time"
              @click.stop
            >
              <v-icon icon="clock" /> {{ timeAgo }}
            </span>
            <span
              v-b-tooltip.click.blur="
                'Number of freeglers who have recently replied'
              "
              class="stat-pill clickable pill-replies"
              @click.stop
            >
              <v-icon icon="comments" /> {{ replyCount }}
            </span>
            <template v-if="message.deliverypossible && isOffer">
              <span
                v-b-tooltip.click.blur="
                  'They may be able to deliver - no guarantees, but you can ask'
                "
                class="stat-pill clickable pill-delivery"
                @click.stop
              >
                <v-icon icon="truck" /><span class="delivery-maybe">?</span>
              </span>
            </template>
            <template v-if="message.deadline">
              <span
                v-b-tooltip.click.blur="deadlineTooltip"
                class="stat-pill clickable pill-deadline"
                @click.stop
              >
                <v-icon icon="calendar" /> {{ formattedDeadline }}
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="info-section">
      <!-- Posted by section (shown on taller screens) -->
      <NuxtLink
        v-if="poster"
        :to="posterProfileUrl"
        class="poster-section"
        @click.stop
      >
        <div class="poster-avatar">
          <b-img
            v-if="poster.profile?.paththumb"
            :src="poster.profile.paththumb"
            alt="Profile"
            class="poster-avatar-img"
            rounded="circle"
          />
          <div v-else class="poster-avatar-placeholder">
            <v-icon icon="user" />
          </div>
        </div>
        <div class="poster-details">
          <span class="poster-name">{{ poster.displayname }}</span>
          <div class="poster-stats">
            <span class="poster-distance">
              <v-icon icon="map-marker-alt" />{{ distanceText }}
            </span>
            <span v-if="poster.info?.offers" class="poster-stat">
              <v-icon icon="gift" />{{ poster.info.offers }}
            </span>
            <span v-if="poster.info?.wanteds" class="poster-stat">
              <v-icon icon="search" />{{ poster.info.wanteds }}
            </span>
          </div>
        </div>
        <v-icon icon="chevron-right" class="poster-chevron" />
      </NuxtLink>

      <!-- Description -->
      <div class="description-section">
        <div class="description-label">DESCRIPTION</div>
        <div class="description-content">
          <MessageTextBody :id="id" />
        </div>
      </div>
    </div>

    <!-- Fixed footer with Reply button -->
    <div
      class="app-footer"
      :class="{ expanded: replyExpanded, stickyAdRendered }"
    >
      <div v-if="!replyExpanded" class="w-100">
        <!-- Promised notice -->
        <div
          v-if="message.promised && !message.successful && replyable && !fromme"
          class="promised-notice mb-2"
        >
          <v-icon icon="handshake" />
          {{ message.promisedtome ? 'Promised to you' : 'Already promised' }}
        </div>
        <b-button
          v-if="replyable && !replied && !fromme && !message.successful"
          variant="primary"
          size="lg"
          block
          class="reply-button"
          @click="expandReply"
        >
          Reply
        </b-button>
        <b-alert
          v-else-if="replied"
          variant="info"
          :model-value="true"
          class="mb-0"
        >
          Message sent! Check your <nuxt-link to="/chats">Chats</nuxt-link>.
        </b-alert>
      </div>

      <!-- Expanded reply section -->
      <div v-else class="reply-expanded-section">
        <NoticeMessage
          v-if="message.promised && !message.promisedtome"
          variant="warning"
          class="mb-2"
        >
          Already promised - you might not get it.
        </NoticeMessage>
        <client-only>
          <MessageReplySection
            :id="id"
            @close="replyExpanded = false"
            @sent="sent"
          />
        </client-only>
      </div>
    </div>

    <!-- Map Modal - Full Screen -->
    <Teleport v-if="showMapModal" to="body">
      <div class="fullscreen-map-viewer">
        <button class="map-back-button" @click="showMapModal = false">
          <v-icon icon="arrow-left" />
        </button>
        <client-only>
          <MessageMap
            v-if="validPosition"
            :home="home"
            :position="{ lat: message.lat, lng: message.lng }"
            class="fullscreen-map"
          />
        </client-only>
        <div class="map-hint">
          <v-icon icon="info-circle" /> Approximate location shown
        </div>
      </div>
    </Teleport>

    <!-- Photos Modal -->
    <MessagePhotosModalMobile
      v-if="showMessagePhotosModal && attachmentCount"
      :id="message.id"
      @hidden="showMessagePhotosModal = false"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
} from 'vue'
import { useRouter } from 'vue-router'
import { useMiscStore } from '~/stores/misc'
import { useMe } from '~/composables/useMe'
import { useMessageDisplay } from '~/composables/useMessageDisplay'
import MessageTextBody from '~/components/MessageTextBody'
import MessageTag from '~/components/MessageTag'
import NoticeMessage from '~/components/NoticeMessage'
import MessageReplySection from '~/components/MessageReplySection'

const MessageMap = defineAsyncComponent(() => import('~/components/MessageMap'))
const MessagePhotosModalMobile = defineAsyncComponent(() =>
  import('~/components/MessagePhotosModalMobile')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  replyable: {
    type: Boolean,
    default: true,
  },
  hideClose: {
    type: Boolean,
    default: false,
  },
  actions: {
    type: Boolean,
    default: true,
  },
  isModal: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['zoom', 'close'])

const router = useRouter()
const miscStore = useMiscStore()
const { me } = useMe()

// Use shared composable for common message display logic
const {
  message,
  strippedSubject,
  fromme,
  gotAttachments,
  sampleImage,
  attachmentCount,
  timeAgo,
  distanceText,
  replyCount,
  isOffer,
  formattedDeadline,
  deadlineTooltip,
  successfulText,
  placeholderClass,
  categoryIcon,
  poster,
  posterProfileUrl,
} = useMessageDisplay(props.id)

const stickyAdRendered = computed(() => miscStore.stickyAdRendered)

// State
const replied = ref(false)
const replyExpanded = ref(false)
const showMapModal = ref(false)
const showMessagePhotosModal = ref(false)
const currentPhotoIndex = ref(0)
const containerRef = ref(null)
const thumbnailsRef = ref(null)
const thumbnailTouchStartX = ref(0)
const thumbnailScrollStart = ref(0)
let thumbnailScrollInterval = null

// Photo height animation on scroll
const MAX_PHOTO_HEIGHT = 400
const MIN_PHOTO_HEIGHT = 150
const SCROLL_RANGE = 150 // Pixels of scroll to complete transition
const photoHeight = ref(MAX_PHOTO_HEIGHT)

// Computed (additional to composable)
const currentAttachment = computed(() => {
  return message.value?.attachments?.[currentPhotoIndex.value]
})

const validPosition = computed(() => {
  return message.value?.lat || message.value?.lng
})

const home = computed(() => {
  if (me.value?.lat || me.value?.lng) {
    return { lat: me.value.lat, lng: me.value.lng }
  }
  return null
})

const distanceTooltip = computed(() => {
  return 'Approximate distance - click for map'
})

const prefersReducedMotion = computed(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

// Methods
function goBack() {
  if (props.isModal) {
    // When used as a modal overlay, emit close to parent
    emit('close')
  } else {
    // When used as a standalone page, navigate back
    router.back()
  }
}

function showPhotosModal() {
  if (gotAttachments.value) {
    showMessagePhotosModal.value = true
    emit('zoom')
  }
}

function selectPhoto(index) {
  currentPhotoIndex.value = index
}

function handleThumbnailClick(index) {
  if (index === currentPhotoIndex.value) {
    // Clicking the already selected thumbnail opens the photo viewer
    showPhotosModal()
  } else {
    selectPhoto(index)
  }
}

function onThumbnailTouchStart(e) {
  thumbnailTouchStartX.value = e.touches[0].clientX
  thumbnailScrollStart.value = thumbnailsRef.value?.scrollLeft || 0
}

function onThumbnailTouchMove(e) {
  if (!thumbnailsRef.value) return
  const deltaX = thumbnailTouchStartX.value - e.touches[0].clientX
  thumbnailsRef.value.scrollLeft = thumbnailScrollStart.value + deltaX
}

function onThumbnailTouchEnd() {
  // Swipe complete, scroll position is already set
}

function startThumbnailAutoScroll() {
  if (!thumbnailsRef.value || attachmentCount.value <= 1) return

  // Wait a moment then scroll right slowly, then back
  setTimeout(() => {
    if (!thumbnailsRef.value) return
    const maxScroll =
      thumbnailsRef.value.scrollWidth - thumbnailsRef.value.clientWidth
    if (maxScroll <= 0) return

    // Animate scroll manually for smoother control
    const duration = 2000 // 2 seconds to scroll
    const startTime = performance.now()
    const startPos = 0

    function animateScroll(currentTime) {
      if (!thumbnailsRef.value) return
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease in-out
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2
      thumbnailsRef.value.scrollLeft = startPos + maxScroll * eased

      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      } else {
        // Pause then scroll back
        setTimeout(() => {
          if (!thumbnailsRef.value) return
          const backStartTime = performance.now()
          function animateBack(currentTime) {
            if (!thumbnailsRef.value) return
            const elapsed = currentTime - backStartTime
            const progress = Math.min(elapsed / duration, 1)
            const eased =
              progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2
            thumbnailsRef.value.scrollLeft = maxScroll - maxScroll * eased
            if (progress < 1) {
              requestAnimationFrame(animateBack)
            }
          }
          requestAnimationFrame(animateBack)
        }, 1000)
      }
    }
    requestAnimationFrame(animateScroll)
  }, 1000)
}

function stopThumbnailAutoScroll() {
  if (thumbnailScrollInterval) {
    clearInterval(thumbnailScrollInterval)
    thumbnailScrollInterval = null
  }
}

function expandReply() {
  console.log(
    'DEBUG expandReply called, replyable:',
    props.replyable,
    'replied:',
    replied.value,
    'fromme:',
    fromme.value
  )
  replyExpanded.value = true
}

function sent() {
  replyExpanded.value = false
  replied.value = true
  // When used as modal, close after a brief delay so user sees confirmation
  if (props.isModal) {
    setTimeout(() => {
      emit('close')
    }, 1500)
  }
}

// Scroll handler to shrink photo
function onScroll(e) {
  const scrollTop = e.target.scrollTop

  // Only animate photo height within the scroll range
  if (scrollTop <= SCROLL_RANGE) {
    const progress = scrollTop / SCROLL_RANGE
    const newHeight =
      MAX_PHOTO_HEIGHT - progress * (MAX_PHOTO_HEIGHT - MIN_PHOTO_HEIGHT)
    photoHeight.value = newHeight
  } else if (photoHeight.value !== MIN_PHOTO_HEIGHT) {
    // Ensure it's at minimum when scrolled past range
    photoHeight.value = MIN_PHOTO_HEIGHT
  }
}

// Debug check on mount
onMounted(() => {
  console.log('DEBUG MessageExpandedMobile mounted')
  console.log('DEBUG containerRef:', containerRef.value)
  console.log(
    'DEBUG container scrollHeight:',
    containerRef.value?.scrollHeight,
    'clientHeight:',
    containerRef.value?.clientHeight
  )
  console.log(
    'DEBUG container overflow:',
    containerRef.value?.style?.overflow,
    'computedStyle:',
    containerRef.value
      ? window.getComputedStyle(containerRef.value).overflow
      : 'N/A'
  )
  // Debug reply button conditions
  console.log('DEBUG Reply button conditions:')
  console.log('  - props.replyable:', props.replyable)
  console.log('  - replied.value:', replied.value)
  console.log('  - fromme.value:', fromme.value)
  console.log(
    '  - Button should show:',
    props.replyable && !replied.value && !fromme.value
  )

  // Start auto-scroll hint for thumbnail carousel
  startThumbnailAutoScroll()
})

onUnmounted(() => {
  stopThumbnailAutoScroll()
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';
@import 'assets/css/_color-vars.scss';

.message-expanded-mobile {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding-bottom: 80px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  z-index: 1000;

  &.stickyAdRendered {
    padding-bottom: calc(80px + $sticky-banner-height-mobile);

    @media (min-height: $mobile-tall) {
      padding-bottom: calc(80px + $sticky-banner-height-mobile-tall);
    }
  }
}

// Photo Area
.photo-area {
  position: relative;
  width: 100%;
  flex-shrink: 0;
  overflow: hidden;
  background: #f0f0f0;
  cursor: pointer;
  transition: height 0.05s linear;
}

// Photo container - positioned to fill photo-area
.photo-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

// All image elements fill container
.photo-container :deep(picture),
.photo-container :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

// Ken Burns animation is in unscoped style block at end of file

// Stats pills inside title overlay
.stats-pills {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 0.5rem;
}

.pills-left {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.pills-right {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  padding: 0.15rem 0.4rem;
  border-radius: 1rem;
  font-size: 0.7rem;

  &.clickable {
    cursor: pointer;
    background: $color-blue--bright;
  }
}

.delivery-maybe {
  font-weight: bold;
  font-size: 0.8rem;
  margin-left: -0.1rem;
}

// Status overlay image (promised/freegled)
.status-overlay-image {
  position: absolute;
  z-index: 10;
  transform: rotate(15deg);
  top: 50%;
  left: 50%;
  width: 50%;
  max-width: 200px;
  margin-left: -25%;
  margin-top: -15%;
  pointer-events: none;
}

// Thumbnail carousel at top of photo area
.thumbnail-carousel {
  position: absolute;
  top: 1rem; // Same as back button
  transform: translateY(
    calc((40px - 50px) / 2)
  ); // Center 50px thumbnails with 40px button
  left: 50px; // Closer to back button, fade handles overlap
  right: 1rem;
  z-index: 11;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 4px;
  padding-left: 15px;
  mask-image: linear-gradient(to right, transparent 0%, black 15px);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 15px);

  &::-webkit-scrollbar {
    display: none;
  }
}

.thumbnail-item {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;

  &.active {
    border-color: #fff;
    transform: scale(1.1);
  }

  &:not(.active):hover {
    border-color: rgba(255, 255, 255, 0.8);
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

// Back button on photo
.back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 12;
  font-size: 1.2rem;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
}

// Title overlay at bottom - more eye-catching
.title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  color: #fff;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-tag {
  font-size: 0.94rem !important;
  white-space: nowrap !important;
  flex-shrink: 0;
}

.title-subject {
  font-size: clamp(1rem, 4vw, 1.25rem);
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.photo-counter {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 0.25rem 0.6rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  z-index: 11;
}

// No photo placeholder
.no-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.offer-gradient {
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
  color: #fff;

  .placeholder-pattern {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M20 25h20v2H20zM25 20h10v2H25zM22 27h16v8H22zM28 35h4v5H28z' fill='white' fill-opacity='0.15'/%3E%3C/svg%3E");
    background-size: 60px 60px;
  }
}

.wanted-gradient {
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
  color: #fff;

  .placeholder-pattern {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Ctext x='35' y='52' font-family='Arial,sans-serif' font-size='50' font-weight='bold' fill='white' fill-opacity='0.12' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E");
    background-size: 70px 70px;
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
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.placeholder-icon {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.9);
}

// Blurred sample image (from similar posts)
.sample-image-container {
  position: relative;
}

.blurred-sample {
  filter: blur(4px) saturate(0.85);
  transform: scale(1.03); // Prevent blur edge artifacts
}

.sample-badge {
  position: absolute;
  top: 4rem;
  right: 0.75rem;
  background: rgba(128, 128, 128, 0.6);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.6rem;
  font-weight: 400;
  z-index: 11;
}

// Info Section - remove nested scroll so parent handles it
.info-section {
  flex: 1 0 auto;
  padding: 1rem;
}

// Poster overlay on photo (shown on shorter screens)
.poster-overlay {
  display: none; // Hidden by default, shown on short screens
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: $color-black-opacity-60;
  color: $color-white;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 11;
  text-decoration: none;
  max-width: 50%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: $color-black-opacity-70;
    color: $color-white;
    text-decoration: none;
  }

  &--below-carousel {
    top: 75px; // Below the thumbnail carousel
  }

  // Show on short screens (less than 700px height)
  @media (max-height: 700px) {
    display: block;
  }
}

.poster-overlay-distance {
  opacity: 0.85;
}

// Poster section in info area (shown on taller screens)
.poster-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid $color-gray-3;
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: none;
    color: inherit;
  }

  // Hide on short screens where overlay is shown
  @media (max-height: 700px) {
    display: none;
  }
}

.poster-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
}

.poster-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: $color-gray--light;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-gray--dark;
  font-size: 1.25rem;
}

.poster-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.poster-name {
  font-size: 1rem;
  font-weight: 600;
  color: $color-gray--darker;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poster-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: $color-gray--dark;
}

.poster-distance,
.poster-stat {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.poster-chevron {
  flex-shrink: 0;
  color: $color-gray--dark;
  font-size: 1rem;
}

// Description
.description-section {
  margin-bottom: 1rem;
}

.description-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #999;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.description-content {
  background: #f8f9fa;
  border-left: 3px solid $color-green--darker;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #444;
}

// Fixed footer (matches give/mobile pattern)
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  border-top: 1px solid #e9ecef;
  background: #fff;
  z-index: 1100; // Above the fixed container

  &.stickyAdRendered {
    bottom: $sticky-banner-height-mobile;

    @media (min-height: $mobile-tall) {
      bottom: $sticky-banner-height-mobile-tall;
    }
  }

  // Force reply button to be full width
  .reply-button,
  :deep(.reply-button),
  :deep(.btn),
  :deep(button) {
    width: 100% !important;
    display: block !important;
    max-width: none !important;
    box-sizing: border-box !important;
  }
}

.reply-expanded-section {
  max-height: 70vh;
  overflow-y: auto;
}

.promised-notice {
  text-align: center;
  color: $color-orange--dark;
  font-size: 0.85rem;
  font-weight: 500;
}

// Fullscreen map viewer
.fullscreen-map-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f0f0f0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}

.map-back-button {
  position: absolute;
  top: env(safe-area-inset-top, 0);
  left: 0;
  margin: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10001;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:active {
    background: #fff;
  }
}

.fullscreen-map {
  flex: 1;
  width: 100%;
  height: 100% !important;

  :deep(.leaflet-container) {
    height: 100% !important;
  }
}

.map-hint {
  position: absolute;
  bottom: env(safe-area-inset-bottom, 0);
  left: 0;
  right: 0;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  font-size: 0.85rem;
  text-align: center;
  margin-left: 1rem;
  margin-right: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

<!-- Unscoped styles for Ken Burns - scoped :deep() doesn't penetrate NuxtPicture -->
<style lang="scss">
// Ken Burns effect - slow pan and zoom
@keyframes kenburns {
  0% {
    transform: scale(1.15) translate(0%, 3%);
  }
  25% {
    transform: scale(1.15) translate(-3%, 0%);
  }
  50% {
    transform: scale(1.15) translate(0%, -3%);
  }
  75% {
    transform: scale(1.15) translate(3%, 0%);
  }
  100% {
    transform: scale(1.15) translate(0%, 3%);
  }
}

.photo-container.ken-burns img {
  animation: kenburns 20s ease-in-out infinite;
  will-change: transform;
  transform-origin: center center;
}

@media (prefers-reduced-motion: reduce) {
  .photo-container.ken-burns img {
    animation: none !important;
  }
}
</style>
