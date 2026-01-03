<template>
  <b-modal
    :id="'messageReportModal-' + message?.id"
    ref="modal"
    scrollable
    title="Report this post"
    size="md"
    @hidden="$emit('hidden')"
  >
    <template #default>
      <div v-if="!submitted" class="report-content">
        <div class="report-item-preview">
          <div class="preview-type">
            {{ message?.type === 'Offer' ? 'OFFER' : 'WANTED' }}
          </div>
          <div class="preview-subject">{{ message?.subject }}</div>
        </div>

        <p class="report-explanation">
          If something's wrong with this post, please let us know. Your report
          will be sent to local volunteers who will review it and take
          appropriate action.
        </p>

        <div class="report-reasons">
          <label class="form-label">What's wrong with this post?</label>
          <div class="reason-options">
            <b-form-radio
              v-model="selectedReason"
              name="report-reason"
              value="inappropriate"
            >
              Inappropriate content
            </b-form-radio>
            <b-form-radio
              v-model="selectedReason"
              name="report-reason"
              value="spam"
            >
              Spam or advertising
            </b-form-radio>
            <b-form-radio
              v-model="selectedReason"
              name="report-reason"
              value="scam"
            >
              Possible scam
            </b-form-radio>
            <b-form-radio
              v-model="selectedReason"
              name="report-reason"
              value="other"
            >
              Other issue
            </b-form-radio>
          </div>
        </div>

        <div class="report-details">
          <label class="form-label">Additional details (optional)</label>
          <b-form-textarea
            v-model="additionalDetails"
            rows="3"
            placeholder="Please provide any additional information that might help our volunteers."
          />
        </div>
      </div>

      <div v-else class="report-success">
        <v-icon icon="check-circle" class="success-icon" />
        <h5>Report submitted</h5>
        <p>
          Thank you for helping keep Freegle safe. Our volunteers will review
          this post and take appropriate action.
        </p>
      </div>
    </template>

    <template #footer>
      <div v-if="!submitted" class="d-flex gap-2 w-100 justify-content-end">
        <b-button variant="secondary" @click="hide">Cancel</b-button>
        <b-button
          variant="warning"
          :disabled="!canSubmit || submitting"
          @click="report"
        >
          <span v-if="submitting">
            <b-spinner small class="me-1" />Submitting...
          </span>
          <span v-else>Submit Report</span>
        </b-button>
      </div>
      <div v-else class="w-100 text-end">
        <b-button variant="primary" @click="hide">Close</b-button>
      </div>
    </template>
  </b-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'
import { useMessageStore } from '~/stores/message'
import { useChatStore } from '~/stores/chat'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

defineEmits(['hidden'])

const messageStore = useMessageStore()
const chatStore = useChatStore()
const { modal, hide } = useOurModal()

const selectedReason = ref(null)
const additionalDetails = ref('')
const submitting = ref(false)
const submitted = ref(false)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const canSubmit = computed(() => {
  return selectedReason.value !== null
})

const reasonLabels = {
  inappropriate: 'Inappropriate content',
  spam: 'Spam or advertising',
  scam: 'Possible scam',
  other: 'Other issue',
}

async function report() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    const chatid = await chatStore.openChatToMods(
      message.value.groups[0].groupid
    )

    const runtimeConfig = useRuntimeConfig()
    const reasonText =
      reasonLabels[selectedReason.value] || selectedReason.value
    let reportMessage =
      "I'm reporting this post as inappropriate:\n" +
      runtimeConfig.public.USER_SITE +
      '/message/' +
      message.value.id +
      '\n\nReason: ' +
      reasonText

    if (additionalDetails.value?.trim()) {
      reportMessage +=
        '\n\nAdditional details: "' + additionalDetails.value.trim() + '"'
    }

    await chatStore.send(chatid, reportMessage, null, null, props.id)

    submitted.value = true
  } catch (error) {
    console.error('Failed to submit report:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.report-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-item-preview {
  background: $color-gray-3;
  padding: 0.75rem 1rem;
  border-left: 3px solid $colour-success;
}

.preview-type {
  font-size: 0.7rem;
  font-weight: 600;
  color: $colour-success;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-subject {
  font-weight: 600;
  color: $color-gray--darker;
}

.report-explanation {
  color: $color-gray--dark;
  font-size: 0.9rem;
  margin: 0;
}

.report-reasons {
  .form-label {
    font-weight: 600;
    color: $color-gray--darker;
    margin-bottom: 0.5rem;
  }
}

.reason-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  :deep(.form-check-input) {
    border: 2px solid $color-gray--base;
    background-color: $color-white;

    &:checked {
      background-color: $colour-success;
      border-color: $colour-success;
    }
  }
}

.report-details {
  .form-label {
    font-weight: 600;
    color: $color-gray--darker;
    margin-bottom: 0.5rem;
  }
}

.report-success {
  text-align: center;
  padding: 1.5rem;

  .success-icon {
    font-size: 3rem;
    color: $color-green--darker;
    margin-bottom: 1rem;
  }

  h5 {
    color: $color-gray--darker;
    margin-bottom: 0.5rem;
  }

  p {
    color: $color-gray--dark;
    margin: 0;
  }
}
</style>
