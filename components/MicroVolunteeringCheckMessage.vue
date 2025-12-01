<template>
  <div>
    <div v-if="!found">
      <NoticeMessage variant="warning"
        >Sorry, we couldn't find that message. It may have been deleted by the
        volunteers. But thanks for looking!
      </NoticeMessage>
    </div>
    <div v-else>
      <p>This is someone else's post. Does it look ok to you?</p>
      <MessageExpanded
        v-if="message"
        :id="message.id"
        :key="'task-' + message.id"
        :message-override="message"
        :replyable="false"
        :actions="false"
        :record-view="false"
        :show-map="false"
        @zoom="showPhotosModal"
      />
      <MessagePhotosModal
        v-if="showMessagePhotosModal && message.attachments?.length"
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
import { defineAsyncComponent, ref, computed } from 'vue'
import SpinButton from './SpinButton'
import MessagePhotosModal from './MessagePhotosModal'
import NoticeMessage from './NoticeMessage'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'
import { useMessageStore } from '~/stores/message'

const MessageExpanded = defineAsyncComponent(() =>
  import('~/components/MessageExpanded')
)

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

function showPhotosModal() {
  showMessagePhotosModal.value = true
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
