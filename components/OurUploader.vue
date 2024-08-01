<template>
  <client-only>
    <div class="wrapper">
      <div class="d-flex flex-column justify-content-around">
        <v-icon
          v-if="!busy"
          size="6x"
          icon="camera"
          class="camera text-faded"
        />
        <b-img v-if="busy" src="/loader.gif" class="fit-cover fadein loader" />
        <div
          v-else-if="multiple || !modelValue.length"
          class="d-flex justify-content-around"
        >
          <b-button :id="uploaderUid" variant="primary" @click="openModal">
            {{ label }}
          </b-button>
        </div>
      </div>
      <DashboardModal
        ref="dashboard"
        :uppy="uppy"
        :open="modalOpen"
        :props="{
          onRequestCloseModal: closeModal,
          closeAfterFinish: true,
        }"
      />
    </div>
  </client-only>
</template>
<script setup>
import { shouldPolyfill as shouldPolyfillLocale } from '@formatjs/intl-locale/should-polyfill'
import { shouldPolyfill as shouldPolyfillPlural } from '@formatjs/intl-pluralrules/should-polyfill'
// eslint-disable-next-line import/no-named-as-default
import Uppy from '@uppy/core'
import { DashboardModal } from '@uppy/vue'
import Tus from '@uppy/tus'
import Webcam from '@uppy/webcam'
import Compressor from '@uppy/compressor'

import ResizeObserver from 'resize-observer-polyfill'
import { uid } from '../composables/useId'
import { useImageStore } from '~/stores/image'

const runtimeConfig = useRuntimeConfig()

try {
  console.log('Consider polyfill ResizeObserver')
  if (!window.ResizeObserver) {
    // Need to globally polyfill this, because the Uppy uploader uses it.
    console.log('Polyfill ResizeObserver')
    window.ResizeObserver = ResizeObserver
  } else {
    console.log('No need to polyfill ResizeObserver')
  }

  console.log('Consider polyfile locale')
  if (shouldPolyfillLocale()) {
    console.log('Need to polyfill Locale')
    await import('@formatjs/intl-locale/polyfill')
  }

  console.log('Consider polyfile plural')
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
})

// const miscStore = useMiscStore()
const imageStore = useImageStore()

const modalOpen = ref(props.startOpen)

function openModal() {
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

const emit = defineEmits(['update:modelValue', 'closed'])
const uploadedPhotos = ref([])
const busy = ref(false)

const label = computed(() => {
  if (props.label) {
    return label
  } else if (props.multiple) {
    return props.modelValue.length > 0 ? 'Add more photos' : 'Add photos'
  } else {
    return 'Add photo'
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

onMounted(() => {
  console.log(
    'Mounted',
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
    restrictions: {
      allowedFileTypes: ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.heic'],
      maxNumberOfFiles: props.multiple ? 10 : 1,
    },
  })
    .use(Webcam, {
      mirror: false,
      modes: ['picture'],
      mobileNativeCamera: true,
      showVideoSourceDropdown: true,
      videoConstraints: {
        facingMode: 'environment',
      },
    })
    .use(Tus, { endpoint: runtimeConfig.public.TUS_UPLOADER })
    .use(Compressor)
  uppy.on('complete', uploadSuccess)
  uppy.on('dashboard:modal-open', () => {
    console.log('Modal is open')
  })
  uppy.on('dashboard:modal-closed', () => {
    console.log('Modal is closed')
    emit('closed')
  })
})

async function uploadSuccess(result) {
  console.log('Uploaded', result)
  busy.value = true

  if (result.successful) {
    // Iterate result.successful array
    const promises = []

    result.successful.forEach((r) => {
      // We've uploaded a file.  Find what is after the last slash

      let uid = r.tus?.uploadUrl
      console.log('Initial', uid)
      uid = 'freegletusd-' + uid.substring(uid.lastIndexOf('/') + 1)
      console.log('Got uid', r, uid)

      //  Create the attachment on the server which references the uploaded image.
      const mods = {}

      const att = {
        imgtype: props.type,
        externaluid: uid,
        externalmods: mods,
      }

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
        })
      })
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
  width: 200px;
  height: 200px;
  align-content: center;
}

.loader {
  width: 200px;
}
</style>
