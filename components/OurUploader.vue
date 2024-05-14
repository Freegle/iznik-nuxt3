<template>
  <div
    :class="{
      invisible: !visible,
    }"
  >
    <lr-config
      ref="lrconfig"
      ctx-name="my-uploader"
      pubkey="61ddd294bd3a390019c6"
      :max-local-file-size-bytes="0"
      img-only
      source-list="local, camera"
      :multiple="multiple"
      image-shrink="1024x1024 95%"
      remove-copyright
      :thumb-size="thumbSize"
      debug
    ></lr-config>
    <div class="d-flex flex-column justify-content-around align-items-start">
      <lr-file-uploader-inline
        ref="uploader"
        css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.39.0/web/lr-file-uploader-inline.min.css"
        ctx-name="my-uploader"
        :class="configName"
      >
      </lr-file-uploader-inline>
    </div>
    <lr-upload-ctx-provider
      ref="ctxProviderRef"
      ctx-name="my-uploader"
      @file-upload-success="uploadSuccess"
      @file-removed="removed"
    ></lr-upload-ctx-provider>
  </div>
</template>
<script setup>
// TODO Rotate in microvolunteering and ModTools
// TODO User edit of photo
// TODO Other photos besides messages.
// TODO Perceptual hashes.
// TODO Image editor height
import { useMiscStore } from '~/stores/misc'
import { useImageStore } from '~/stores/image'

const LR = await import(
  'https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.39.0/web/blocks.min.js'
)

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
    required: false,
    default: 'Message',
  },
})

const miscStore = useMiscStore()
const imageStore = useImageStore()

const emit = defineEmits(['update:modelValue'])
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

const lrconfig = ref(null)

const visible = ref(false)

onMounted(() => {
  lrconfig.value.localeDefinitionOverride = {
    en: {
      'drop-files-here': 'Add photos',
      clear: 'Remove',
      'add-more': 'Add',
      'src-type-local': 'Browse',
    },
  }
  LR.registerBlocks(LR)
  setPhotos(props.modelValue)
  visible.value = true
})

function setPhotos(photos) {
  console.log('Set photos', JSON.stringify(photos))
  if (ctxProviderRef.value) {
    ctxProviderRef.value.removeAllFiles()

    photos.forEach((f) => {
      ctxProviderRef.value.addFileFromCdnUrl(f.path, {
        silent: true,
      })
    })
  }
}

async function uploadSuccess(e) {
  console.log('Uploaded', e)

  if (e.detail) {
    if (e.detail.status === 'success') {
      // We've uploaded a file.  Create the attachment on the server which references the uploaded image.
      const att = {
        imgtype: props.type,
        externaluid: e.detail.uuid,
        externalurl: e.detail.cdnUrl,
      }

      const ret = await imageStore.post(att)

      // Set up our local attachment info.  This will get used in the parents to attach to whatever objects
      // these photos relate to.
      //
      // Note that the URL is returned from the server because it is manipulated on there to remove EXIF,
      // so we use that rather than the URL that was returned from the uploader.
      console.log('Post returned', ret)
      uploadedPhotos.value = props.modelValue
      uploadedPhotos.value.push({
        id: ret.id,
        path: ret.url,
        paththumb: ret.url,
      })

      emit('update:modelValue', uploadedPhotos.value)
    }
  }
}

function removed(e) {
  // We don't need to tidy up our server object - that will happen anyway.  Just remove from our
  // local attachment info.
  console.log('File removed', e?.detail?.uuid, JSON.stringify(e))
  if (e?.detail?.uuid) {
    uploadedPhotos.value = uploadedPhotos.value.filter((p) => {
      console.log('Compare', p.externaluid, e.detail.uuid)
      return p.externaluid !== e.detail.uuid
    })
    console.log('emit modelValue')
    emit('update:modelValue', uploadedPhotos.value)
  }
}
</script>
<style lang="scss">
@import 'https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.39.0/web/lr-file-uploader-inline.min.css';
@import 'assets/css/uploader.scss';
</style>
