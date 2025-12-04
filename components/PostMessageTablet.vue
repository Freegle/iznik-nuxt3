<template>
  <div class="post-tablet">
    <!-- Two-column layout -->
    <div class="post-layout">
      <!-- Left: Photo section -->
      <div class="photo-section">
        <PhotoUploader
          v-model="currentAtts"
          type="Message"
          :recognise="type === 'Offer'"
          empty-title="Add photos"
          empty-subtitle="Photos get more replies"
        />
      </div>

      <!-- Right: Details section -->
      <div class="details-section">
        <!-- Item name - conversational style -->
        <div class="detail-card">
          <label class="detail-label">
            {{
              type === 'Offer'
                ? 'What are you giving away?'
                : 'What are you looking for?'
            }}
          </label>
          <PostItem :id="id" ref="item" :type="type" class="detail-input" />
        </div>

        <!-- Description - grows to fill available space -->
        <div class="detail-card detail-card-grow">
          <label :for="$id('description')" class="detail-label">
            {{
              type === 'Offer'
                ? 'Any details that might help?'
                : 'Why do you need it?'
            }}
          </label>
          <b-form-textarea
            :id="$id('description')"
            v-model="description"
            :placeholder="placeholder"
            class="detail-textarea"
            rows="4"
          />
        </div>

        <!-- Quantity - only for offers -->
        <div v-if="type === 'Offer'" class="detail-card quantity-card">
          <label class="detail-label">How many?</label>
          <NumberIncrementDecrement
            v-model="availablenow"
            :min="1"
            :max="99"
            size="normal"
            class="quantity-control"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NumberIncrementDecrement from './NumberIncrementDecrement'
import PhotoUploader from './PhotoUploader.vue'
import { uid } from '~/composables/useId'
import { useComposeStore } from '~/stores/compose'
import { ref, watch, computed } from '#imports'

const PostItem = defineAsyncComponent(() => import('~/components/PostItem'))

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: true,
  },
})

const composeStore = useComposeStore()

composeStore.setType({
  id: props.id,
  type: props.type,
})

const ret = composeStore.attachments(props.id).filter((a) => 'id' in a)
const currentAtts = ref([])

watch(
  currentAtts,
  (newVal) => {
    try {
      composeStore.setAttachmentsForMessage(props.id, newVal)
    } catch (e) {
      console.error('Watch error', e)
    }
  },
  { deep: true }
)

currentAtts.value = JSON.parse(JSON.stringify(ret || []))

const availablenow = computed({
  get() {
    const msg = composeStore?.message(props.id)
    return msg &&
      'availablenow' in msg &&
      typeof msg.availablenow !== 'undefined'
      ? msg.availablenow
      : 1
  },
  set(newValue) {
    composeStore.setAvailableNow(props.id, newValue)
  },
})

const description = computed({
  get() {
    const msg = composeStore?.message(props.id)
    return msg?.description
  },
  set(newValue) {
    composeStore.setDescription({
      id: props.id,
      description: newValue,
    })
  },
})

const placeholder = computed(() => {
  return props.type === 'Offer'
    ? "e.g. colour, condition, size, whether it's working..."
    : "Explain what you're looking for, and why you'd like it..."
})

function $id(type) {
  return uid(type)
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.post-tablet {
  background: #f8f9fa;
  min-height: 100%;
}

.post-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    grid-template-columns: 45% 55%;
    gap: 1.5rem;
    padding: 1.5rem;
    align-items: stretch;
  }

  @include media-breakpoint-up(lg) {
    grid-template-columns: 40% 60%;
    gap: 2rem;
    padding: 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }
}

/* Photo section */
.photo-section {
  background: white;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

/* Details section - grows to match photo section height */
.details-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-card {
  background: white;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.detail-card-grow {
  flex: 1;
  display: flex;
  flex-direction: column;

  .detail-textarea {
    flex: 1;
    min-height: 120px;
  }
}

.detail-label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.75rem;
}

.detail-input {
  :deep(input) {
    font-size: 1.1rem;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    transition: border-color 0.2s;

    &:focus {
      border-color: $color-green-background;
      box-shadow: 0 0 0 3px rgba($color-green-background, 0.1);
    }
  }

  :deep(label) {
    display: none;
  }
}

.detail-textarea {
  font-size: 1rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;

  &:focus {
    border-color: $color-green-background;
    box-shadow: 0 0 0 3px rgba($color-green-background, 0.1);
  }
}

.quantity-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  .detail-label {
    margin-bottom: 0;
  }
}

.ghost {
  opacity: 0.4;
}
</style>
