<template>
  <div>
    <lr-config
      ctx-name="my-uploader"
      pubkey="61ddd294bd3a390019c6"
      :max-local-file-size-bytes="0"
      img-only
      source-list="local, camera"
      :multiple="multiple"
      image-shrink="1024x1024 95%"
      remove-copyright
      use-cloud-image-editor
      :thumb-size="thumbSize"
      debug
    ></lr-config>
    <div class="d-flex flex-column justify-content-around align-items-center">
      <lr-file-uploader-inline
        ref="uploader"
        v-model="uploadedPhotos"
        css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.39.0/web/lr-file-uploader-inline.min.css"
        ctx-name="my-uploader"
        :class="configName"
      >
      </lr-file-uploader-inline>
    </div>
    <lr-upload-ctx-provider
      ref="ctxProviderRef"
      ctx-name="my-uploader"
      @change="handleChangeEvent"
      @modal-close="handleModalCloseEvent"
    ></lr-upload-ctx-provider>
  </div>
</template>
<script setup>
// TODO Rotate in microvolunteering and ModTools
// TODO User edit of photo
// TODO Other photos besides messages.
// TODO Perceptual hashes.
import { useMiscStore } from '~/stores/misc'

const LR = await import(
  'https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.39.0/web/blocks.min.js'
)

const props = defineProps({
  multiple: {
    type: Boolean,
    required: false,
    default: false,
  },
  variant: {
    type: String,
    required: false,
    default: 'primary',
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
  photos: {
    type: Array,
    required: false,
    default: () => [],
  },
})

const miscStore = useMiscStore()
const emit = defineEmits(['uploaded'])
const uploadedPhotos = ref([])
const ctxProviderRef = ref(null)
const uploader = ref(null)

// const fontSize = computed(() => {
//   return uploadedPhotos.value.length > 0 ? '1rem' : '1.25rem'
// })

// eslint-disable-next-line no-unused-vars
const label = computed(() => {
  return uploadedPhotos.value.length > 0 ? 'Add/edit photos' : 'Add photos'
})

const configName = computed(() => {
  return uploadedPhotos.value.length ? 'my-config2' : 'my-config'
})

const thumbSize = computed(() => {
  return miscStore.breakpoint === 'xs' || miscStore.breakpoint === 'sm'
    ? 100
    : 200
})

onMounted(() => {
  LR.registerBlocks(LR)
  setPhotos(props.photos)
})

function setPhotos(photos) {
  ctxProviderRef.value.removeAllFiles()
  uploadedPhotos.value = photos.map((f) => {
    return {
      uuiid: f.externaluid,
    }
  })
  uploadedPhotos.value.forEach((f) => {
    ctxProviderRef.value.addFileFromUuid(f.uuiid)
  })
}

watch(
  () => props.photos,
  (newVal) => {
    setPhotos(newVal)
  }
)

function handleChangeEvent(e) {
  if (e.detail) {
    uploadedPhotos.value = e.detail.allEntries
      .filter((f) => f.status === 'success')
      .map((f) => {
        return {
          id: f.uuid,
          path: f.cdnUrl,
          paththumb: f.cdnUrl,
        }
      })
    emit('uploaded', uploadedPhotos.value)
  }
}
</script>
<style lang="scss">
@import 'https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.39.0/web/lr-file-uploader-inline.min.css';
@import 'assets/css/uploader.scss';
</style>
