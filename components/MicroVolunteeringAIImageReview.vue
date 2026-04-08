<template>
  <div>
    <div class="intro-text mb-3">
      <p>
        Posts with images work better, so we use AI-generated images for posts
        and jobs. We reuse the same image &mdash; we don't generate a new one
        each time. So it's important the image is a good one. Can you help?
      </p>
    </div>

    <div class="image-card mb-3">
      <div class="image-container">
        <img
          :src="aiimage.url"
          :alt="'AI image for ' + aiimage.name"
          class="review-image"
          @error="brokenImage"
        />
      </div>
      <div class="image-caption">
        <strong>{{ aiimage.name }}</strong>
      </div>
    </div>

    <div v-if="!submitted" class="questions">
      <div class="question-block mb-3">
        <p class="question-label">
          Does this image contain pictures of people?
        </p>
        <div class="d-flex gap-2">
          <b-button
            :variant="containsPeople === true ? 'primary' : 'outline-primary'"
            @click="containsPeople = true"
          >
            <v-icon icon="check" class="me-1" />
            Yes
          </b-button>
          <b-button
            :variant="containsPeople === false ? 'primary' : 'outline-primary'"
            @click="containsPeople = false"
          >
            <v-icon icon="times" class="me-1" />
            No
          </b-button>
        </div>
      </div>

      <div class="question-block mb-3">
        <p class="question-label">
          Is this a good image for &ldquo;{{ aiimage.name }}&rdquo;?
        </p>
        <div class="d-flex gap-2">
          <SpinButton
            variant="success"
            icon-name="thumbs-up"
            label="Yes, looks good"
            :disabled="containsPeople === null"
            @handle="approve"
          />
          <SpinButton
            variant="danger"
            icon-name="thumbs-down"
            label="No, not great"
            :disabled="containsPeople === null"
            @handle="reject"
          />
        </div>
        <p v-if="containsPeople === null" class="help-hint mt-2">
          Please answer the question above first
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SpinButton from './SpinButton'
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'

const props = defineProps({
  aiimage: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['next'])

const microVolunteeringStore = useMicroVolunteeringStore()

const containsPeople = ref(null)
const submitted = ref(false)

async function approve(callback) {
  await microVolunteeringStore.respond({
    aiimageid: props.aiimage.id,
    response: 'Approve',
    containspeople: containsPeople.value,
  })

  submitted.value = true
  callback()
  emit('next')
}

async function reject(callback) {
  await microVolunteeringStore.respond({
    aiimageid: props.aiimage.id,
    response: 'Reject',
    containspeople: containsPeople.value,
  })

  submitted.value = true
  callback()
  emit('next')
}

function brokenImage(event) {
  event.target.src = '/defaultprofile.png'
}
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.intro-text {
  color: $color-gray--darker;
  line-height: 1.6;
}

.image-card {
  overflow: hidden;
  box-shadow: var(--shadow-md);
  background: $color-white;
}

.image-container {
  width: 100%;
  background: $color-gray--light;
}

.review-image {
  width: 100%;
  height: auto;
  display: block;
  max-height: 400px;
  object-fit: contain;
}

.image-caption {
  padding: 0.75rem 1rem;
  background: $color-gray--lighter;
  text-align: center;
  font-size: 1.1rem;
}

.question-label {
  font-weight: 600;
  color: $color-gray--darker;
  margin-bottom: 0.5rem;
}

.help-hint {
  color: var(--color-gray-600);
  font-size: 0.85rem;
}
</style>
