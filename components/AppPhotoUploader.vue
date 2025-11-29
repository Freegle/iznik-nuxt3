<template>
  <div class="app-photo-uploader">
    <!-- Photo Grid -->
    <div class="photo-grid">
      <draggable
        v-model="photos"
        class="photo-grid-inner"
        :item-key="(el) => `photo-${el.id || el.tempId}`"
        :animation="150"
        ghost-class="ghost"
        @start="dragging = true"
        @end="dragging = false"
      >
        <template #item="{ element, index }">
          <div
            class="photo-card"
            :class="{
              'photo-primary': index === 0,
              'photo-uploading': element.uploading,
            }"
          >
            <!-- Photo preview -->
            <img
              :src="element.preview || element.path || element.paththumb"
              class="photo-image"
              alt="Photo"
            />

            <!-- Upload progress overlay -->
            <div v-if="element.uploading" class="photo-progress-overlay">
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
                    :stroke-dasharray="`${element.progress || 0}, 100`"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span class="progress-text">{{ element.progress || 0 }}%</span>
              </div>
            </div>

            <!-- Quality warning badge -->
            <div
              v-if="element.qualityWarning && !element.uploading"
              class="quality-badge"
              :class="`quality-${element.qualityWarning.severity}`"
              @click.stop="showQualityWarning(element)"
            >
              <v-icon icon="exclamation-triangle" />
            </div>

            <!-- Primary badge -->
            <div v-if="index === 0 && !element.uploading" class="primary-badge">
              <v-icon icon="star" /> Main
            </div>

            <!-- Delete button -->
            <button
              v-if="!element.uploading"
              class="delete-button"
              @click.stop="removePhoto(element)"
            >
              <v-icon icon="times" />
            </button>
          </div>
        </template>
      </draggable>

      <!-- Add more button -->
      <div
        v-if="photos.length > 0 && photos.length < maxPhotos"
        class="photo-card photo-add"
        @click="openPhotoOptions"
      >
        <v-icon icon="plus" class="add-icon" />
        <span class="add-text">Add more</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="photos.length === 0" class="empty-state">
      <div class="empty-icon">
        <v-icon icon="camera" size="4x" />
      </div>
      <h2 class="empty-title">Add photos of your item</h2>
      <p class="empty-subtitle">Items with photos get 3x more responses!</p>
      <b-button
        variant="primary"
        size="lg"
        class="add-photos-button"
        @click="openPhotoOptions"
      >
        <v-icon icon="camera" /> Add Photos
      </b-button>
    </div>

    <!-- Add photos button (when photos exist) -->
    <div
      v-if="photos.length > 0 && photos.length < maxPhotos"
      class="add-more-section"
    >
      <b-button
        variant="outline-primary"
        size="lg"
        class="w-100"
        @click="openPhotoOptions"
      >
        <v-icon icon="plus" /> Add More Photos
      </b-button>
    </div>

    <!-- Photo source selection modal -->
    <b-modal
      v-model="showSourceModal"
      title="Add Photo"
      hide-footer
      centered
      body-class="p-0"
    >
      <div class="source-options">
        <button class="source-option" @click="takePhoto">
          <v-icon icon="camera" size="2x" />
          <span>Take Photo</span>
        </button>
        <button class="source-option" @click="chooseFromGallery">
          <v-icon icon="images" size="2x" />
          <span>Choose from Gallery</span>
        </button>
      </div>
    </b-modal>

    <!-- Quality warning modal -->
    <b-modal
      v-model="showQualityModal"
      :title="qualityModalTitle"
      centered
      @ok="continueWithPhoto"
      @cancel="retakePhoto"
    >
      <p>{{ qualityModalMessage }}</p>
      <p class="text-muted small">
        Better photos help people see what you're offering and get more
        responses.
      </p>
      <template #footer>
        <b-button variant="outline-secondary" @click="retakePhoto">
          Retake Photo
        </b-button>
        <b-button variant="primary" @click="continueWithPhoto">
          Use This Photo
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script setup>
import { ref, watch, defineAsyncComponent } from 'vue'
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera'
import * as tus from 'tus-js-client'
import { useRuntimeConfig } from '#app'
import { useImageStore } from '~/stores/image'
import {
  analyzePhotoQuality,
  getQualityMessage,
} from '~/composables/usePhotoQuality'

const draggable = defineAsyncComponent(() => import('vuedraggable'))

const props = defineProps({
  modelValue: {
    type: Array,
    required: false,
    default: () => [],
  },
  type: {
    type: String,
    required: false,
    default: 'Message',
  },
  maxPhotos: {
    type: Number,
    required: false,
    default: 10,
  },
  recognise: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'photoProcessed'])

const runtimeConfig = useRuntimeConfig()
const imageStore = useImageStore()

// Local state
const photos = ref([...props.modelValue])
const dragging = ref(false)
const showSourceModal = ref(false)
const showQualityModal = ref(false)
const qualityModalTitle = ref('')
const qualityModalMessage = ref('')
const pendingPhoto = ref(null)
let uploadInstance = null
let tempIdCounter = 0

// Sync with parent
watch(
  () => props.modelValue,
  (newVal) => {
    // Only update if different to avoid loops
    if (JSON.stringify(newVal) !== JSON.stringify(photos.value)) {
      photos.value = [...newVal]
    }
  },
  { deep: true }
)

watch(
  photos,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

// Open photo source selection
function openPhotoOptions() {
  showSourceModal.value = true
}

// Take photo with camera
async function takePhoto() {
  showSourceModal.value = false

  try {
    const image = await Camera.getPhoto({
      quality: 75,
      height: 1024,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    })

    await processPhoto(image.webPath)
  } catch (e) {
    console.log('Camera cancelled or error:', e.message)
  }
}

// Choose from gallery
async function chooseFromGallery() {
  showSourceModal.value = false

  try {
    const images = await Camera.pickImages({
      quality: 75,
      height: 1024,
    })

    for (const image of images.photos) {
      await processPhoto(image.webPath)
    }
  } catch (e) {
    console.log('Gallery cancelled or error:', e.message)
  }
}

// Process a photo (quality check + upload)
async function processPhoto(webPath) {
  // Create temp photo entry with preview
  const tempId = `temp-${++tempIdCounter}`
  const photo = {
    tempId,
    preview: webPath,
    uploading: true,
    progress: 0,
    qualityWarning: null,
  }

  photos.value.push(photo)

  // Run quality check in parallel with starting upload
  try {
    const qualityResult = await analyzePhotoQuality(webPath)

    if (qualityResult.hasIssues) {
      const qualityMessage = getQualityMessage(qualityResult)
      photo.qualityWarning = {
        severity: qualityResult.overallSeverity,
        title: qualityMessage.title,
        message: qualityMessage.message,
      }

      // Show warning for critical issues
      if (qualityResult.overallSeverity === 'critical') {
        pendingPhoto.value = photo
        qualityModalTitle.value = qualityMessage.title
        qualityModalMessage.value = qualityMessage.message
        showQualityModal.value = true
        // Don't proceed with upload until user decides
        return
      }
    }
  } catch (e) {
    console.log('Quality check failed, continuing with upload:', e.message)
  }

  // Proceed with upload
  await uploadPhoto(photo, webPath)
}

// Upload a photo
async function uploadPhoto(photo, webPath) {
  try {
    const response = await fetch(webPath)
    const file = await response.blob()

    await new Promise((resolve, reject) => {
      if (uploadInstance) {
        uploadInstance.abort()
      }

      uploadInstance = new tus.Upload(file, {
        endpoint: runtimeConfig.public.TUS_UPLOADER,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        onError: (error) => {
          console.error('Upload failed:', error)
          photo.uploading = false
          photo.error = true
          reject(error)
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          photo.progress = Math.round((bytesUploaded / bytesTotal) * 100)
        },
        onSuccess: async () => {
          let uid = uploadInstance.url
          uid = 'freegletusd-' + uid.substring(uid.lastIndexOf('/') + 1)

          const att = {
            imgtype: props.type,
            externaluid: uid,
            externalmods: {},
            recognise: props.recognise && photos.value.indexOf(photo) === 0,
          }

          try {
            const ret = await imageStore.post(att)

            // Update photo with server data
            photo.id = ret.id
            photo.path = ret.url
            photo.paththumb = ret.url
            photo.ouruid = ret.uid
            photo.info = ret.info
            photo.uploading = false
            delete photo.tempId

            emit('photoProcessed', ret.id)
            resolve()
          } catch (e) {
            console.error('Image post failed:', e)
            photo.error = true
            photo.uploading = false
            reject(e)
          }
        },
      })

      uploadInstance.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          uploadInstance.resumeFromPreviousUpload(previousUploads[0])
        }
        uploadInstance.start()
      })
    })
  } catch (e) {
    console.error('Upload error:', e)
    photo.uploading = false
    photo.error = true
  }
}

// Remove a photo
function removePhoto(photo) {
  const index = photos.value.findIndex(
    (p) =>
      (p.id && p.id === photo.id) || (p.tempId && p.tempId === photo.tempId)
  )
  if (index !== -1) {
    photos.value.splice(index, 1)
  }
}

// Show quality warning for a photo
function showQualityWarning(photo) {
  if (photo.qualityWarning) {
    pendingPhoto.value = photo
    qualityModalTitle.value = photo.qualityWarning.title
    qualityModalMessage.value = photo.qualityWarning.message
    showQualityModal.value = true
  }
}

// Continue with photo despite quality warning
function continueWithPhoto() {
  showQualityModal.value = false

  if (
    pendingPhoto.value &&
    pendingPhoto.value.preview &&
    pendingPhoto.value.uploading
  ) {
    // Photo was waiting for quality decision, now upload
    uploadPhoto(pendingPhoto.value, pendingPhoto.value.preview)
  }

  pendingPhoto.value = null
}

// Retake photo
function retakePhoto() {
  showQualityModal.value = false

  if (pendingPhoto.value) {
    removePhoto(pendingPhoto.value)
  }

  pendingPhoto.value = null

  // Re-open photo options
  openPhotoOptions()
}
</script>

<style scoped lang="scss">
.app-photo-uploader {
  padding: 1rem;
}

.photo-grid {
  margin-bottom: 1rem;
}

.photo-grid-inner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.photo-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.2s ease;
}

.photo-card:active {
  transform: scale(0.98);
}

.photo-primary {
  border-color: #ffc107;
  border-width: 3px;
}

.photo-uploading {
  opacity: 0.8;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

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

.quality-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.75rem;
}

.quality-critical {
  background: #dc3545;
}

.quality-warning {
  background: #ffc107;
  color: #000;
}

.primary-badge {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background: #ffc107;
  color: #000;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.delete-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-button:active {
  background: #dc3545;
}

.photo-add {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  cursor: pointer;
  color: #6c757d;
}

.photo-add:active {
  background: #e9ecef;
}

.add-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.add-text {
  font-size: 0.75rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  color: #adb5bd;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #212529;
}

.empty-subtitle {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

.add-photos-button {
  min-width: 200px;
}

.add-more-section {
  margin-top: 1rem;
}

.source-options {
  display: flex;
  flex-direction: column;
}

.source-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1rem;
  color: #212529;
}

.source-option:not(:last-child) {
  border-bottom: 1px solid #e9ecef;
}

.source-option:active {
  background: #f8f9fa;
}

.ghost {
  opacity: 0.4;
}
</style>
