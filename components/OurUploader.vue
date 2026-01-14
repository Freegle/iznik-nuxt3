<template>
  <client-only>
    <div class="wrapper" @dragenter="openModal">
      <div class="d-flex flex-column justify-content-around">
        <v-icon
          v-if="!busy"
          :size="iconSize"
          icon="camera"
          class="camera text-faded"
        />
        <b-img v-if="busy" src="/loader.gif" class="fit-cover fadein loader" />
        <div
          v-else-if="multiple || !modelValue.length"
          class="d-flex justify-content-around"
        >
          <b-button
            :id="uploaderUid"
            variant="primary"
            :size="buttonSize"
            @click="openModal"
          >
            {{ label }}
          </b-button>
          &nbsp;
          <b-button v-if="isApp" variant="primary" @click="choosePhoto">
            {{ chooselabel }}
          </b-button>
          <p v-if="isApp">{{ loading }}</p>
        </div>
      </div>
      <DashboardModal
        v-if="!isApp"
        ref="dashboard"
        :uppy="uppy"
        :open="modalOpen"
        :props="{
          onRequestCloseModal: closeModal,
          waitForThumbnailsBeforeUpload: true,
          closeAfterFinish: true,
          showNativePhotoCameraButton: true,
        }"
      />
    </div>
  </client-only>
</template>
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { shouldPolyfill as shouldPolyfillLocale } from '@formatjs/intl-locale/should-polyfill'
import { shouldPolyfill as shouldPolyfillPlural } from '@formatjs/intl-pluralrules/should-polyfill'
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/vue'
import Tus from '@uppy/tus'
import Compressor from '@uppy/compressor'
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera'
import * as tus from 'tus-js-client'

import ResizeObserver from 'resize-observer-polyfill'
import hasOwn from 'object.hasown'
import * as Sentry from '@sentry/browser'
import { uid } from '~/composables/useId'
import { useMobileStore } from '@/stores/mobile' // APP...
import { useRuntimeConfig } from '#app'
import { useImageStore } from '~/stores/image'
import { useMiscStore } from '~/stores/misc'

const runtimeConfig = useRuntimeConfig()

const mobileStore = useMobileStore()

try {
  console.log('Consider polyfill ResizeObserver')
  if (!window.ResizeObserver) {
    // Need to globally polyfill this, because the Uppy uploader uses it.
    console.log('Polyfill ResizeObserver')
    window.ResizeObserver = ResizeObserver
  } else {
    console.log('No need to polyfill ResizeObserver')
  }

  console.log('Consider polyfill locale')
  if (shouldPolyfillLocale()) {
    console.log('Need to polyfill Locale')
    await import('@formatjs/intl-locale/polyfill')
  }

  console.log('Consider polyfill plural')
  if (shouldPolyfillPlural()) {
    const locale = 'en'
    const unsupportedLocale = shouldPolyfillPlural(locale)
    console.log('Unsupported?', unsupportedLocale)

    if (unsupportedLocale) {
      console.log('Polyfill-force')
      await import('@formatjs/intl-pluralrules/polyfill-force')
      console.log(
        'Polyfill-locale',
        '@formatjs/intl-pluralrules/locale-data/en'
      )
      await import('@formatjs/intl-pluralrules/locale-data/en')
    }
  }

  console.log('Consider polyfill hasOwn')
  if (!Object.hasOwn) {
    console.log('polyfill hasOwn')
    hasOwn.shim()
  }
} catch (e) {
  console.log('Polyfills failed', e)
}

const props = defineProps({
  multiple: {
    type: Boolean,
    required: false,
    default: false,
  },
  modelValue: {
    type: Array,
    required: false,
    default: () => [],
  },
  type: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: false,
    default: null,
  },
  startOpen: {
    type: Boolean,
    required: false,
    default: false,
  },
  recognise: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const miscStore = useMiscStore()
const imageStore = useImageStore()

const modalOpen = ref(props.startOpen)

const buttonSize = computed(() => (miscStore.breakpoint === 'xs' ? 'xs' : 'md'))
const iconSize = computed(() => (miscStore.breakpoint === 'xs' ? '4x' : '6x'))

let upload = null

function resetUpload() {
  if (upload) {
    upload.abort()
    upload = null
  }
}

async function openModal() {
  if (isApp.value) {
    // console.log('openModal A')
    resetUpload()
    try {
      const image = await Camera.getPhoto({
        quality: 75,
        height: 1024,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      })
      loading.value = 'Uploading'

      // image.webPath will contain a path that can be set as an image src.
      // You can access the original file using image.path, which can be
      // passed to the Filesystem API to read the raw data of the image,
      // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
      // console.log('openModal B', image)
      // var imageUrl = image.webPath
      // console.log('openModal C', imageUrl)

      // Can be set to the src of an image now
      // console.log('openModal D', image.webPath, image.format)

      const response = await fetch(image.webPath)
      const file = await response.blob()
      await uploadOneFile(file)
    } catch (e) {
      loading.value = ''
      console.log('openModal', e.message)
    }
    return
  }
  const DashboardModal = uppy.getPlugin('DashboardModal')
  if (DashboardModal) {
    DashboardModal.openModal()
  }
}

function closeModal() {
  const DashboardModal = uppy.getPlugin('DashboardModal')
  if (DashboardModal) {
    DashboardModal.closeModal()
  }
}

const uploaderUid = ref(uid('uploader'))

const loading = ref('')
const emit = defineEmits(['update:modelValue', 'closed', 'photoProcessed'])
const uploadedPhotos = ref([])
const busy = ref(false)

const label = computed(() => {
  if (props.label) {
    return label
  } else if (props.multiple) {
    return 'Add photos'
  } else {
    return 'Add photo'
  }
})

const isApp = ref(mobileStore.isApp) // APP

const chooselabel = computed(() => {
  if (props.label) {
    return label
  } else if (props.multiple) {
    return props.modelValue.length > 0 ? 'Choose more photos' : 'Choose photos'
  } else {
    return 'Choose photo'
  }
})

let uppy = null

const dashboard = ref(null)

watch(dashboard, (newVal, oldVal) => {
  console.log('Dashboard changed', newVal)

  if (newVal && !oldVal && props.startOpen) {
    openModal()
  }
})

// Return Promise that completes when upload succeeds or errors
function uploadOneFile(file) {
  // console.log('uploadOneFile A', file)
  return new Promise(function (resolve, reject) {
    resetUpload()
    // Create a new tus upload
    upload = new tus.Upload(file, {
      endpoint: runtimeConfig.public.TUS_UPLOADER,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      // metadata: {
      //  filename: uid,
      //  filetype: image.format,
      // },
      onError: function (error) {
        console.log('Failed because: ' + error)
        loading.value = 'Upload failed because: ' + error
        reject(new Error('Upload failed because: ' + error))
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        // console.log(bytesUploaded, bytesTotal, percentage + '%')
        loading.value = 'Uploading ' + percentage + '%'
      },
      onSuccess: async function (result) {
        // console.log('upload.url', result, upload.url)
        // console.log('result',result)
        // if( result){
        //  const { lastResponse } = result
        //  console.log('lastResponse',lastResponse)
        // }
        loading.value = 'Uploading nearly done'
        const promises = []
        let recognised = false

        let uid = upload.url
        uid = 'freegletusd-' + uid.substring(uid.lastIndexOf('/') + 1)

        const mods = {}
        const att = {
          imgtype: props.type,
          externaluid: uid,
          externalmods: mods,
          recognise: props.recognise && !recognised,
        }
        if (props.groupid) att.groupid = props.groupid

        // Only recognise the first photo.
        recognised = true

        const p = imageStore.post(att)
        promises.push(p)

        p.then((ret) => {
          // Set up our local attachment info.  This will get used in the parents to attach to whatever objects
          // these photos relate to.
          //
          // Note that the URL is returned from the server because it is manipulated on there to remove EXIF,
          // so we use that rather than the URL that was returned from the uploader.
          console.log('Image post returned', ret)
          uploadedPhotos.value = props.modelValue
          uploadedPhotos.value.push({
            id: ret.id,
            path: ret.url,
            paththumb: ret.url,
            ouruid: ret.uid,
            externalmods: mods,
            info: ret.info,
          })
          if (props.groupid) {
            emit('photoProcessed', ret.id)
          }
        })
        // console.log('pushed')
        await Promise.all(promises)
        emit('update:modelValue', uploadedPhotos.value)
        // console.log('emitted')
        loading.value = ''
        resolve()
      },
    })

    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0])
      }

      // Start the upload
      upload.start()
    })
  })
}

async function choosePhoto() {
  // console.log('choosePhoto A')
  try {
    const images = await Camera.pickImages({
      quality: 75,
      height: 1024,
      allowEditing: false,
    })
    loading.value = 'Uploading'

    console.log(images)
    for (const image of images.photos) {
      console.log(image.webPath)
      const response = await fetch(image.webPath)
      const file = await response.blob()
      await uploadOneFile(file)
    }
  } catch (e) {
    loading.value = ''
    console.log('choosePhoto', e.message)
  }
}

let uppyTimer = null

onMounted(() => {
  if (isApp.value) return
  console.log(
    'Uploader mounted',
    '#' + uploaderUid.value,
    dashboard.value,
    props.multiple,
    props.startOpen
  )
  uppy = new Uppy({
    autoProceed: true,
    closeAfterFinish: true,
    hidePauseResumeButton: true,
    hideProgressAfterFinish: true,
    locale: {
      strings: {
        dropPasteImportFiles: '%{browseFiles} or import from',
        browseFiles: 'Browse files',
      },
    },
    restrictions: {
      allowedFileTypes: ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.heic'],
      maxNumberOfFiles: props.multiple ? 10 : 1,
    },
  })
    .use(Tus, {
      endpoint: runtimeConfig.public.TUS_UPLOADER,
      uploadDataDuringCreation: true,
    })
    .use(Compressor)
  uppy.on('file-added', (file) => {
    console.log('Added file', file)
  })
  uppy.on('files-added', (files) => {
    console.log('Added files', files)
  })
  uppy.on('file-removed', (file) => {
    console.log('Removed file', file)
  })
  uppy.on('progress', (progress) => {
    // progress: integer (total progress percentage)
    console.log('Progress', progress)
  })
  uppy.on('preprocess-progress', (progress) => {
    // progress: integer (total progress percentage)
    console.log('Preprocess progress', progress)
  })
  uppy.on('upload-progress', (file, progress) => {
    // file: { id, name, type, ... }
    // progress: { uploader, bytesUploaded, bytesTotal }
    console.log(
      'Upload progress',
      file.id,
      progress.bytesUploaded,
      progress.bytesTotal
    )
  })
  uppy.on('upload-pause', (file, isPaused) => {
    // file: { id, name, type, ... }
    // progress: { uploader, bytesUploaded, bytesTotal }
    console.log('Upload paused', file, isPaused)
  })
  uppy.on('upload', (uploadID, files) => {
    console.log('Upload started', uploadID, files)
  })
  uppy.on('complete', uploadSuccess)
  uppy.on('dashboard:modal-open', () => {
    console.log('Uploader modal is open')
    if (!uppyTimer) {
      uppyTimer = setTimeout(() => {
        console.log('Uppy timed out')
        Sentry.captureMessage('Uppy timed out')
      }, 30000)
    }
  })
  uppy.on('postprocess-progress', (progress) => {
    // progress: integer (total progress percentage)
    console.log('Postprocess progress', progress)
  })
  uppy.on('upload-success', (file, response) => {
    console.log('Upload success', file, response)
  })
  uppy.on('complete', (result) => {
    console.log('Complete', result)
  })
  uppy.on('error', (error) => {
    console.error('Upload error, retry', error)
    uppy.retryAll()
  })
  uppy.on('upload-retry', (fileID) => {
    console.log('upload retried:', fileID)
  })
  uppy.on('upload-stalled', (error, files) => {
    console.log('upload seems stalled', error, files)
  })
  uppy.on('retry-all', (fileIDs) => {
    console.log('upload retried:', fileIDs)
  })
  uppy.on('restriction-failed', (file, error) => {
    console.log('Restriction failed', file, error)
  })
  uppy.on('dashboard:modal-closed', () => {
    console.log('Uploader modal is closed')
    if (uppyTimer) {
      clearTimeout(uppyTimer)
      uppyTimer = null
    }
    emit('closed')
  })
  uppy.on('thumbnail:generated', (file, preview) => {
    console.log('Thumbnail generated', file)
  })
})

onBeforeUnmount(() => {
  if (uppyTimer) {
    console.log('Uploader unmounted')
    clearTimeout(uppyTimer)
    uppyTimer = null
  }
})

async function uploadSuccess(result) {
  console.log('Upload success', result)
  busy.value = true

  if (result.successful) {
    // Iterate result.successful array
    const promises = []
    let recognised = false

    result.successful.forEach((r) => {
      // We've uploaded a file.  Find what is after the last slash

      let uid = r.tus?.uploadUrl

      if (uid) {
        console.log('Initial', uid)
        uid = 'freegletusd-' + uid.substring(uid.lastIndexOf('/') + 1)
        console.log('Got uid', r, uid)

        //  Create the attachment on the server which references the uploaded image.
        const mods = {}

        const att = {
          imgtype: props.type,
          externaluid: uid,
          externalmods: mods,
          recognise: props.recognise && !recognised,
        }
        if (props.groupid) att.groupid = props.groupid

        // Only recognise the first photo.
        recognised = true

        const p = imageStore.post(att)
        promises.push(p)

        p.then((ret) => {
          // Set up our local attachment info.  This will get used in the parents to attach to whatever objects
          // these photos relate to.
          //
          // Note that the URL is returned from the server because it is manipulated on there to remove EXIF,
          // so we use that rather than the URL that was returned from the uploader.
          console.log('Image post returned', ret)
          uploadedPhotos.value = props.modelValue
          uploadedPhotos.value.push({
            id: ret.id,
            path: ret.url,
            paththumb: ret.url,
            ouruid: ret.uid,
            externalmods: mods,
            info: ret.info,
          })
          if (props.groupid) {
            emit('photoProcessed', ret.id)
          }
        })
      }
    })

    await Promise.all(promises)

    emit('update:modelValue', uploadedPhotos.value)

    // Reset the uploader so that if we go back in we won't see photos which have already been uploaded.  This is
    // because control of the photos is handed over to our code, rather than the uploader.
    console.log('Reset uploader')
    closeModal()
    uppy.clear()
    busy.value = false
  }
}
</script>
<style lang="scss">
@import '@uppy/core/dist/style.css';
@import '@uppy/webcam/dist/style.css';
@import 'assets/css/uploader.scss';
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.fadein {
  animation: 15s fadeIn;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.wrapper {
  border: 1px lightgray dashed;
  width: 100%; /* 125px */
  height: 125px;
  align-content: center;

  @include media-breakpoint-up(sm) {
    width: 100%; /* 200px */
    height: 200px;
  }
}

.loader {
  width: 125px;

  @include media-breakpoint-up(sm) {
    width: 200px;
  }
}
</style>
