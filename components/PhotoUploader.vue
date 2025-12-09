<template>
  <div class="app-photo-uploader" @dragenter="onDragEnter">
    <!-- Featured photo - always shows first photo (the primary one for post) -->
    <Transition name="fade">
      <div v-if="selectedPhoto" class="featured-photo">
        <PhotoCard
          :ouruid="selectedPhoto.ouruid"
          :src="
            selectedPhoto.preview ||
            selectedPhoto.path ||
            selectedPhoto.paththumb
          "
          :selected="true"
          :uploading="selectedPhoto.uploading"
          :progress="selectedPhoto.progress"
          :error="selectedPhoto.error"
          :quality-warning="selectedPhoto.qualityWarning"
          :show-rotate="!!selectedPhoto.id"
          @remove="removePhoto(selectedPhoto)"
          @rotate="rotatePhoto(selectedPhoto, 90)"
          @retry="retryUpload(selectedPhoto)"
          @show-quality="showQualityWarning(selectedPhoto)"
        />
      </div>
    </Transition>

    <!-- Thumbnail carousel (excluding selected photo) -->
    <div v-if="photos.length > 1" class="thumbnail-carousel">
      <draggable
        v-model="photos"
        class="thumbnail-strip"
        :item-key="(el) => `thumb-${el.id || el.tempId}`"
        :animation="150"
        ghost-class="ghost"
        @start="dragging = true"
        @end="dragging = false"
      >
        <template #item="{ element, index }">
          <div
            v-if="selectedIndex !== index"
            class="thumbnail"
            @click="selectPhoto(index)"
          >
            <OurUploadedImage
              v-if="element.ouruid"
              :src="element.ouruid"
              class="thumbnail-image"
              alt="Photo"
              :width="80"
            />
            <img
              v-else
              :src="element.preview || element.path || element.paththumb"
              class="thumbnail-image"
              alt="Photo"
            />
            <div v-if="element.uploading" class="thumbnail-uploading">
              {{ element.progress || 0 }}%
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Add more button (when photos exist) - secondary style -->
    <div
      v-if="photos.length > 0 && photos.length < maxPhotos"
      class="add-more-section"
    >
      <b-button
        variant="outline-primary"
        size="lg"
        class="add-photos-button"
        @click="openPhotoOptions"
      >
        <v-icon icon="plus" /> Add More Photos
      </b-button>
    </div>

    <!-- Empty state -->
    <div v-if="photos.length === 0" class="empty-state">
      <div class="empty-icon">
        <v-icon icon="camera" size="4x" />
      </div>
      <h2 class="empty-title">{{ emptyTitle }}</h2>
      <p class="empty-subtitle">{{ emptySubtitle }}</p>
      <b-button
        variant="primary"
        size="lg"
        class="add-photos-button"
        @click="openPhotoOptions"
      >
        <v-icon icon="camera" /> Add Photos
      </b-button>
      <p class="skip-link">
        <a href="#" @click.prevent="emit('skip')">Skip</a>
      </p>
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
          <v-icon icon="image" size="2x" />
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
      <template #footer="{}">
        <div class="d-flex w-100 justify-content-between">
          <b-button variant="secondary" @click="continueWithPhoto">
            Use This
          </b-button>
          <b-button variant="primary" @click="retakePhoto"> Retake </b-button>
        </div>
      </template>
    </b-modal>

    <!-- Uppy Dashboard Modal for web browsers -->
    <DashboardModal
      v-if="!isApp && uppy"
      :uppy="uppy"
      :open="uppyModalOpen"
      :props="{
        onRequestCloseModal: closeUppyModal,
        waitForThumbnailsBeforeUpload: true,
        closeAfterFinish: true,
        showNativePhotoCameraButton: true,
      }"
    />
  </div>
</template>

<script setup>
import {
  ref,
  shallowRef,
  watch,
  defineAsyncComponent,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera'
import * as tus from 'tus-js-client'
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/vue'
import Tus from '@uppy/tus'
import Compressor from '@uppy/compressor'
import PhotoCard from './PhotoCard.vue'
import OurUploadedImage from '~/components/OurUploadedImage.vue'
import { useRuntimeConfig } from '#app'
import { useImageStore } from '~/stores/image'
import { useMobileStore } from '~/stores/mobile'
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
  emptyTitle: {
    type: String,
    required: false,
    default: 'Add photos of your item',
  },
  emptySubtitle: {
    type: String,
    required: false,
    default: "You'll get a better response",
  },
})

const emit = defineEmits(['update:modelValue', 'photoProcessed', 'skip'])

const runtimeConfig = useRuntimeConfig()
const imageStore = useImageStore()
const mobileStore = useMobileStore()

// Detect if running in app vs web browser
// Use computed to stay reactive to store changes (store may initialize after component)
const isApp = computed(() => mobileStore.isApp)

// Uppy instance for web browsers - use shallowRef so template reactivity works
const uppy = shallowRef(null)
const uppyModalOpen = ref(false)

// Local state
const photos = ref([...props.modelValue])
const dragging = ref(false)
const showSourceModal = ref(false)
const showQualityModal = ref(false)
const qualityModalTitle = ref('')
const qualityModalMessage = ref('')
const pendingPhoto = ref(null)
// Always show first photo as the featured/primary one
const selectedIndex = ref(0)
let uploadInstance = null
let tempIdCounter = 0

// Computed property for the selected photo
const selectedPhoto = computed(() => {
  if (selectedIndex.value !== null && photos.value[selectedIndex.value]) {
    return photos.value[selectedIndex.value]
  }
  return null
})

// Select a photo as primary - moves it to front of array
function selectPhoto(index) {
  if (index > 0 && index < photos.value.length) {
    // Move the clicked photo to the front (making it primary)
    const photo = photos.value.splice(index, 1)[0]
    photos.value.unshift(photo)
    // Keep selectedIndex at 0 (always show first photo as featured)
    selectedIndex.value = 0
  }
}

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
    // Convert reactive objects to plain objects for store persistence
    const plainPhotos = newVal.map((p) => ({ ...p }))
    emit('update:modelValue', plainPhotos)
  },
  { deep: true }
)

// Open photo source selection
function openPhotoOptions() {
  if (isApp.value) {
    // App: show native camera/gallery modal
    showSourceModal.value = true
  } else {
    // Web: open Uppy modal
    openUppyModal()
  }
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
  // Create temp photo entry with preview - use reactive() for proper reactivity
  const tempId = `temp-${++tempIdCounter}`
  const photo = reactive({
    tempId,
    preview: webPath,
    uploading: true,
    progress: 0,
    qualityWarning: null,
    error: false,
  })

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
          const progress = Math.round((bytesUploaded / bytesTotal) * 100)
          photo.progress = progress
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

// Retry a failed upload
function retryUpload(photo) {
  if (photo.preview) {
    photo.error = false
    photo.uploading = true
    photo.progress = 0
    uploadPhoto(photo, photo.preview)
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

// Rotate a photo
async function rotatePhoto(photo, degrees) {
  if (!photo.id) return

  // Calculate new rotation
  const currentRotation = photo.externalmods?.rotate || 0
  let newRotation = currentRotation + degrees
  newRotation = ((newRotation % 360) + 360) % 360

  // Update local state
  if (!photo.externalmods) {
    photo.externalmods = {}
  }
  photo.externalmods.rotate = newRotation

  // Save to server
  try {
    await imageStore.post({
      id: photo.id,
      rotate: newRotation,
      bust: Date.now(),
      type: props.type,
    })
  } catch (e) {
    console.error('Failed to rotate photo:', e)
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

// Handle drag enter - open Uppy for web browsers
function onDragEnter() {
  if (!isApp.value && uppy.value) {
    openUppyModal()
  }
}

// Open Uppy modal for web browsers
function openUppyModal() {
  if (!isApp.value && uppy.value) {
    uppyModalOpen.value = true
  }
}

// Close Uppy modal
function closeUppyModal() {
  uppyModalOpen.value = false
}

// Handle Uppy upload success
async function handleUppySuccess(result) {
  if (!result.successful) return

  for (const r of result.successful) {
    let uid = r.tus?.uploadUrl

    if (uid) {
      uid = 'freegletusd-' + uid.substring(uid.lastIndexOf('/') + 1)

      const tempId = `temp-${++tempIdCounter}`
      const photo = reactive({
        tempId,
        preview: r.preview || null,
        uploading: true,
        progress: 100,
        qualityWarning: null,
        error: false,
      })

      photos.value.push(photo)

      try {
        const att = {
          imgtype: props.type,
          externaluid: uid,
          externalmods: {},
          recognise: props.recognise && photos.value.indexOf(photo) === 0,
        }

        const ret = await imageStore.post(att)

        photo.id = ret.id
        photo.path = ret.url
        photo.paththumb = ret.url
        photo.ouruid = ret.uid
        photo.info = ret.info
        photo.uploading = false
        delete photo.tempId

        emit('photoProcessed', ret.id)
      } catch (e) {
        console.error('Image post failed:', e)
        photo.error = true
        photo.uploading = false
      }
    }
  }

  closeUppyModal()
  uppy.value.clear()
}

// Initialize Uppy for web browsers
onMounted(() => {
  if (isApp.value) return

  uppy.value = new Uppy({
    autoProceed: true,
    closeAfterFinish: true,
    hidePauseResumeButton: true,
    hideProgressAfterFinish: true,
    locale: {
      strings: {
        dropPasteImportFiles: '%{browseFiles} or drag and drop',
        browseFiles: 'Browse files',
      },
    },
    restrictions: {
      allowedFileTypes: ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.heic'],
      maxNumberOfFiles: props.maxPhotos,
    },
  })
    .use(Tus, {
      endpoint: runtimeConfig.public.TUS_UPLOADER,
      uploadDataDuringCreation: true,
    })
    .use(Compressor)

  uppy.value.on('complete', handleUppySuccess)
  uppy.value.on('error', (error) => {
    console.error('Upload error, retry', error)
    uppy.value.retryAll()
  })
})

onBeforeUnmount(() => {
  if (uppy.value && typeof uppy.value.close === 'function') {
    uppy.value.close()
    uppy.value = null
  }
})
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.app-photo-uploader {
  padding: 1rem;
}

/* Featured photo area - square */
.featured-photo {
  margin-bottom: 1rem;
  max-width: 280px;
}

.featured-photo :deep(.photo-card) {
  width: 100%;
  aspect-ratio: 1;
}

/* Fade transition for featured photo */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Thumbnail carousel container */
.thumbnail-carousel {
  margin-bottom: 1rem;
}

/* Thumbnail strip - draggable, no scrollbar */
.thumbnail-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
}

.thumbnail {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
  position: relative;

  &:hover {
    border-color: rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;

  :deep(picture),
  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.thumbnail-uploading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
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
  border-color: #28a745;
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
  border-radius: 4px;
  font-size: 0.65rem;
  color: #212529;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

.add-more-section {
  text-align: center;
  margin-top: 1rem;
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

.skip-link {
  margin-top: 1rem;
  margin-bottom: 0;

  a {
    color: #6c757d;
    text-decoration: none;
  }
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

<style lang="scss">
@import '@uppy/core/dist/style.css';
@import '@uppy/webcam/dist/style.css';
@import 'assets/css/uploader.scss';
</style>
