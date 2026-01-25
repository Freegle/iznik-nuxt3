<template>
  <div
    class="photo-card"
    :class="{
      'photo-primary': primary,
      'photo-uploading': uploading,
      'photo-selected': selected,
    }"
    @click="onCardClick"
  >
    <!-- Photo image - use OurUploadedImage for server images, img for previews -->
    <OurUploadedImage
      v-if="ouruid"
      :src="ouruid"
      :modifiers="externalmods"
      class="photo-image"
      alt="Photo"
      :width="200"
    />
    <img v-else :src="imageSrc" class="photo-image" alt="Photo" />

    <!-- Upload progress overlay -->
    <div v-if="uploading" class="photo-progress-overlay">
      <div class="progress-circle">
        <svg viewBox="0 0 36 36" class="circular-chart">
          <path
            class="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            class="circle"
            :stroke-dasharray="`${progress || 0}, 100`"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span class="progress-text">{{ progress || 0 }}%</span>
      </div>
    </div>

    <!-- Controls (when selected and not uploading) -->
    <template v-if="selected && !uploading && !error">
      <!-- Rotate button -->
      <button
        v-if="showRotate"
        class="control-button control-rotate"
        title="Rotate"
        @click.stop="emit('rotate')"
      >
        <v-icon icon="redo" />
      </button>

      <!-- Delete button -->
      <button
        class="control-button control-delete"
        title="Remove photo"
        @click.stop="emit('remove')"
      >
        <v-icon icon="times" />
      </button>
    </template>

    <!-- Error overlay -->
    <div v-if="error" class="photo-error-overlay">
      <div class="error-message">Upload failed</div>
      <div class="error-actions">
        <button class="error-btn" @click.stop="emit('retry')">
          <v-icon icon="redo" /> Retry
        </button>
        <button class="error-btn" @click.stop="emit('remove')">
          <v-icon icon="times" /> Delete
        </button>
      </div>
    </div>

    <!-- Quality warning inline badge -->
    <div
      v-if="qualityWarning && !uploading && !error"
      class="quality-warning-inline"
      :class="`quality-${qualityWarning.severity}`"
      @click.stop="emit('showQuality')"
    >
      <v-icon icon="exclamation-triangle" />
      <span class="quality-text">{{ shortQualityLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import OurUploadedImage from '~/components/OurUploadedImage.vue'

const props = defineProps({
  ouruid: {
    type: String,
    default: null,
  },
  src: {
    type: String,
    default: null,
  },
  path: {
    type: String,
    default: null,
  },
  paththumb: {
    type: String,
    default: null,
  },
  preview: {
    type: String,
    default: null,
  },
  primary: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  uploading: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  error: {
    type: Boolean,
    default: false,
  },
  qualityWarning: {
    type: Object,
    default: null,
  },
  showRotate: {
    type: Boolean,
    default: true,
  },
  externalmods: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['remove', 'rotate', 'retry', 'showQuality', 'select'])

function onCardClick() {
  emit('select')
}

const imageSrc = computed(() => {
  return props.src || props.preview || props.path || props.paththumb
})

const shortQualityLabel = computed(() => {
  const msg = props.qualityWarning?.message?.toLowerCase() || ''
  if (msg.includes('blur')) return 'Blurry?'
  if (msg.includes('dark')) return 'Dark?'
  if (msg.includes('bright') || msg.includes('overexposed')) return 'Bright?'
  if (msg.includes('contrast')) return 'Contrast?'
  return 'Check?'
})
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.photo-card {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
  cursor: pointer;
}

.photo-card:active:not(.photo-selected) {
  transform: scale(0.98);
}

.photo-primary {
  border-color: $color-green-background;
  border-width: 3px;
}

.photo-selected {
  border-color: $color-green-background;
  border-width: 3px;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
}

.photo-uploading {
  opacity: 0.8;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;

  /* Handle NuxtPicture wrapper from OurUploadedImage */
  :deep(picture) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* Control buttons - shown only when selected, so can be larger */
.control-button {
  position: absolute;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  z-index: 5;
  font-size: 1rem;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  &:active {
    background: rgba(0, 0, 0, 0.9);
  }
}

.control-rotate {
  top: 8px;
  left: 8px;
}

.control-delete {
  top: 8px;
  right: 8px;
}

/* Progress overlay */
.photo-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle {
  position: relative;
  width: 50px;
  height: 50px;
}

.circular-chart {
  display: block;
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke: #fff;
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dasharray 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Error overlay */
.photo-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(220, 53, 69, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
}

.error-message {
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-actions {
  display: flex;
  gap: 0.25rem;
}

.error-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  background: #fff;
  font-size: 0.65rem;
  color: #212529;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Quality warning */
.quality-warning-inline {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6rem;
  font-weight: 500;
  cursor: pointer;
  z-index: 5;
}

.quality-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quality-critical {
  background: rgba(220, 53, 69, 0.9);
  color: #fff;
}

.quality-warning {
  background: rgba(255, 193, 7, 0.9);
  color: #000;
}
</style>
