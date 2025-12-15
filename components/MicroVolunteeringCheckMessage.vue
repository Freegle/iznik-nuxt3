<template>
  <div>
    <div v-if="!found">
      <NoticeMessage variant="warning"
        >Sorry, we couldn't find that message. It may have been deleted by the
        volunteers. But thanks for looking!
      </NoticeMessage>
    </div>
    <div v-else>
      <p class="instruction-text">
        This is someone else's post. Does it look ok to you?
      </p>

      <!-- Modern card-style message preview -->
      <div v-if="message" class="message-card" :class="messageTypeClass">
        <!-- Photo area with overlay -->
        <div class="photo-area" @click="showPhotosModal">
          <div v-if="gotAttachments" class="photo-container">
            <OurUploadedImage
              v-if="message.attachments[0]?.ouruid"
              :src="message.attachments[0].ouruid"
              :modifiers="message.attachments[0].externalmods"
              alt="Item Photo"
              class="photo-image"
              :width="640"
              :height="480"
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
            />
            <ProxyImage
              v-else-if="message.attachments[0]?.path"
              class-name="photo-image"
              alt="Item picture"
              :src="message.attachments[0].path"
              :width="640"
              :height="480"
              fit="cover"
            />
            <!-- Multi-photo indicator -->
            <div v-if="attachmentCount > 1" class="photo-count">
              {{ attachmentCount }} <v-icon icon="camera" />
            </div>
            <!-- Zoom hint -->
            <div class="zoom-hint">
              <v-icon icon="magnifying-glass-plus" /> Tap to zoom
            </div>
          </div>
          <!-- No photo placeholder -->
          <div v-else class="photo-container no-photo">
            <v-icon :icon="categoryIcon" class="placeholder-icon" />
            <span class="no-photo-text">No photo</span>
          </div>

          <!-- Title overlay at bottom of photo -->
          <div class="title-overlay">
            <div class="info-row">
              <MessageTag :id="message.id" :inline="true" class="title-tag" />
              <div class="info-icons">
                <span v-if="message.area" class="location">
                  <v-icon icon="map-marker-alt" />{{ message.area }}
                </span>
                <span class="time">
                  <v-icon icon="clock" />{{ timeAgo || '...' }}
                </span>
              </div>
            </div>
            <div class="title-row">
              <span class="title-subject">{{ strippedSubject }}</span>
            </div>
          </div>
        </div>

        <!-- Description section below photo -->
        <div v-if="message.textbody" class="description-section">
          <div class="description-text">{{ message.textbody }}</div>
        </div>
      </div>

      <MessagePhotosModal
        v-if="showMessagePhotosModal && message?.attachments?.length"
        :id="message.id"
        @hidden="showMessagePhotosModal = false"
      />
      <div
        v-if="!showComments"
        class="d-flex justify-content-between flex-wrap w-100 mt-3"
      >
        <SpinButton
          variant="primary"
          class="mb-1"
          icon-name="check"
          label="Yes, that looks ok"
          size="lg"
          @handle="approve"
        />
        <SpinButton
          variant="secondary"
          class="mb-1"
          icon-name="times"
          label="No, something's not right"
          size="lg"
          @handle="notRight"
        />
      </div>
      <div v-if="showComments" class="mt-3 feedback-section">
        <div class="feedback-step" :class="{ completed: msgcategory }">
          <div class="step-header">
            <span class="step-number">1</span>
            <span class="step-label">What's wrong?</span>
            <v-icon v-if="msgcategory" icon="check" class="step-check" />
          </div>
          <div class="step-content">
            <div class="category-options">
              <button
                type="button"
                class="category-btn"
                :class="{ active: msgcategory === 'CouldBeBetter' }"
                @click="msgcategory = 'CouldBeBetter'"
              >
                <v-icon icon="edit" class="me-2" />
                This could be better
              </button>
              <button
                type="button"
                class="category-btn"
                :class="{ active: msgcategory === 'ShouldntBeHere' }"
                @click="msgcategory = 'ShouldntBeHere'"
              >
                <v-icon icon="ban" class="me-2" />
                This shouldn't be on Freegle
              </button>
            </div>
          </div>
        </div>

        <div
          class="feedback-step"
          :class="{ completed: comments, disabled: !msgcategory }"
        >
          <div class="step-header">
            <span class="step-number">2</span>
            <span class="step-label">Tell us more</span>
            <v-icon v-if="comments" icon="check" class="step-check" />
          </div>
          <div class="step-content">
            <b-form-textarea
              id="comments"
              v-model="comments"
              rows="2"
              :disabled="!msgcategory"
              :placeholder="
                msgcategory
                  ? 'Please explain what\'s not right...'
                  : 'Select an option above first'
              "
              class="comments-input"
            />
          </div>
        </div>

        <div class="submit-section">
          <SpinButton
            variant="primary"
            icon-name="paper-plane"
            label="Send feedback"
            size="lg"
            :disabled="!msgcategory || !comments"
            @handle="sendComments"
          />
          <p v-if="!msgcategory" class="help-hint">
            <v-icon icon="arrow-up" class="me-1" />
            Please select what's wrong first
          </p>
          <p v-else-if="!comments" class="help-hint">
            <v-icon icon="arrow-up" class="me-1" />
            Please add a brief explanation
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useTimeAgo } from '@vueuse/core'
import SpinButton from './SpinButton'
import MessagePhotosModal from './MessagePhotosModal'
import NoticeMessage from './NoticeMessage'
import MessageTag from './MessageTag'
import OurUploadedImage from './OurUploadedImage'
import ProxyImage from './ProxyImage'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'
import { useMessageStore } from '~/stores/message'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['next'])

const microVolunteeringStore = useMicroVolunteeringStore()
const messageStore = useMessageStore()

// State
const showComments = ref(false)
const comments = ref(null)
const msgcategory = ref(null)
const showMessagePhotosModal = ref(false)
const found = ref(false)

// Initialize
await messageStore.fetch(props.id, true)
found.value = !!messageStore.byId(props.id)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

// Computed properties for display
const strippedSubject = computed(() => {
  if (!message.value?.subject) return ''
  return message.value.subject
    .replace(/^\s*(OFFER|WANTED|TAKEN|RECEIVED):?\s*/i, '')
    .trim()
})

const timeAgo = computed(() => {
  if (!message.value?.date) return null
  return useTimeAgo(new Date(message.value.date)).value
})

const gotAttachments = computed(() => {
  return message.value?.attachments?.length > 0
})

const attachmentCount = computed(() => {
  return message.value?.attachments?.length || 0
})

const messageTypeClass = computed(() => {
  const type = message.value?.type?.toLowerCase()
  if (type === 'offer') return 'offer'
  if (type === 'wanted') return 'wanted'
  return ''
})

const categoryIcon = computed(() => {
  // Return appropriate icon based on message type
  const type = message.value?.type?.toLowerCase()
  if (type === 'wanted') return 'search'
  return 'gift'
})

function showPhotosModal() {
  if (gotAttachments.value) {
    showMessagePhotosModal.value = true
  }
}

function notRight(callback) {
  // Don't record the result yet - people who don't give comments seem to have less good judgement.
  showComments.value = true
  callback()
}

async function sendComments(callback) {
  // Record the result with comments.
  await microVolunteeringStore.respond({
    msgid: props.id,
    response: 'Reject',
    comments: comments.value,
    msgcategory: msgcategory.value,
  })
  callback()

  emit('next')
}

async function approve(callback) {
  // Approved - that's it.
  await microVolunteeringStore.respond({
    msgid: props.id,
    response: 'Approve',
  })
  callback()

  emit('next')
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.instruction-text {
  text-align: center;
  color: $color-gray--darker;
  margin-bottom: 1rem;
}

/* Modern message card styling */
.message-card {
  overflow: hidden;
  box-shadow: 0 2px 8px $color-black-opacity-12;
  background: $color-white;
  margin-bottom: 1rem;
}

.photo-area {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  background: $color-gray--light;
  overflow: hidden;
  cursor: pointer;
}

.photo-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-gray--light;

  &.no-photo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: default;
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

.placeholder-icon {
  font-size: 3rem;
  color: $color-gray--dark;
  opacity: 0.5;
}

.no-photo-text {
  color: $color-gray--dark;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.photo-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: $color-black-opacity-60;
  color: $color-white;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  z-index: 5;
}

.zoom-hint {
  position: absolute;
  top: 8px;
  left: 8px;
  background: $color-black-opacity-60;
  color: $color-white;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  z-index: 5;
}

.title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  padding: 2rem 0.75rem 0.5rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 40%,
    rgba(0, 0, 0, 0.3) 70%,
    rgba(0, 0, 0, 0) 100%
  );
  color: white;
  z-index: 3;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.title-tag {
  flex-shrink: 0;
  font-size: 0.85rem;
}

:deep(.title-tag .tagbadge) {
  position: relative;
  left: auto;
  top: auto;
  font-size: 0.85rem;
}

.info-icons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  opacity: 0.9;
}

.location,
.time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.title-row {
  width: 100%;
}

.title-subject {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
}

/* Description section below photo */
.description-section {
  padding: 1rem;
  background: $color-white;
  border-top: 1px solid $color-gray--lighter;
}

.description-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: $color-gray--darker;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Feedback section styling */
.feedback-section {
  background: $color-gray--lighter;
  padding: 1rem;
}

.feedback-step {
  background: $color-white;
  margin-bottom: 1rem;
  border-left: 3px solid $color-gray-3;
  transition: border-color 0.2s;

  &.completed {
    border-left-color: $colour-success;
  }

  &.disabled {
    opacity: 0.6;
  }
}

.step-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: $color-gray--lighter;
  font-weight: 600;
}

.step-number {
  width: 24px;
  height: 24px;
  background: $colour-success;
  color: $color-white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.step-label {
  flex: 1;
  color: $color-gray--darker;
}

.step-check {
  color: $colour-success;
}

.step-content {
  padding: 1rem;
}

.category-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-btn {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: $color-white;
  border: 2px solid $color-gray-3;
  color: $color-gray--darker;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;

  &:hover {
    border-color: $colour-success;
    background: lighten($colour-success, 45%);
  }

  &.active {
    border-color: $colour-success;
    background: lighten($colour-success, 40%);
    color: darken($colour-success, 15%);
    font-weight: 600;
  }
}

.comments-input {
  border: 2px solid $color-gray-3;

  &:focus {
    border-color: $colour-success;
    box-shadow: none;
  }

  &:disabled {
    background: $color-gray--lighter;
    cursor: not-allowed;
  }
}

.submit-section {
  text-align: center;
  padding-top: 0.5rem;
}

.help-hint {
  color: $color-gray--dark;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
}
</style>
