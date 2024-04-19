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
      debug
    ></lr-config>
    <div class="uploader">
      <lr-file-uploader-regular
        ref="uploader"
        v-model="uploadedPhotos"
        css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.35.2/web/lr-file-uploader-regular.min.css"
        ctx-name="my-uploader"
        :class="configName"
      >
      </lr-file-uploader-regular>
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
// import * as LR from '@uploadcare/blocks'
// TODO Rotate in microvolunteering and ModTools
// TODO User edit of photo
const LR = await import(
  'https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.36.1-alpha.3/web/blocks.min.js'
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

const emit = defineEmits(['uploaded'])
const uploadedPhotos = ref([])
const ctxProviderRef = ref(null)
const uploader = ref(null)

// eslint-disable-next-line no-unused-vars
const label = computed(() => {
  return uploadedPhotos.value.length > 0 ? 'Add/edit photos' : 'Add photos'
})

const configName = computed(() => {
  return uploadedPhotos.value.length ? 'my-config2' : 'my-config'
})

onMounted(() => {
  LR.FileUploaderRegular.shadowStyles =
    /* CSS */ `

:host lr-simple-btn button {
  background-color: #61C924;
  color: white;
  font-size: ` +
    (props.photos.length ? '1rem' : '1.25rem') +
    `;
}

:host .file-name {
  display: none;
}

:host lr-progress-bar {
  top: 0px !important;
  height: 100% !important;
}
`
  LR.registerBlocks(LR)

  uploader.value = ctxProviderRef.value.uploadCollection
  uploader.value.clearAll()
  uploadedPhotos.value = props.photos.map((f) => {
    return {
      uuiid: f.id,
    }
  })
  uploadedPhotos.value.forEach((f) => {
    ctxProviderRef.value.addFileFromUuid(f.uuiid)
  })
})

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
  }
}

function handleModalCloseEvent() {
  emit('uploaded', uploadedPhotos.value)
  uploadedPhotos.value = []
  ctxProviderRef.value.uploadCollection.clearAll()
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.uploader {
  min-height: 50px;
}

:deep(.my-config) {
  --darkmode: 0;
  --l10n-upload-files: 'Add photos';
  --h-accent: 98;
  --s-accent: 70%;
  --l-accent: 46%;
  --border-radius-element: 0;
  --border-radius-frame: 0;
  --border-radius-thumb: 0;
  --clr-confirm: #61c924;
  --ui-size: 50px;
  --icon-edit-file: 'm17.002 0.905 -2.269 2.269 6.094 6.094 2.269 -2.269c1.172 -1.172 1.172 -3.07 0 -4.242l-1.847 -1.852c-1.172 -1.172 -3.07 -1.172 -4.242 0zm-3.328 3.328L2.747 15.164c-0.488 0.488 -0.844 1.092 -1.041 1.753L0.047 22.556c-0.117 0.398 -0.009 0.825 0.281 1.116s0.717 0.398 1.111 0.286L7.078 22.298c0.661 -0.197 1.266 -0.553 1.753 -1.041l10.936 -10.931z';
  --icon-remove-file: 'M6.337 0.83C6.591 0.319 7.111 0 7.678 0h5.644c0.567 0 1.087 0.319 1.341 0.83L15 1.5h4.5c0.83 0 1.5 0.67 1.5 1.5s-0.67 1.5 -1.5 1.5H1.5C0.67 4.5 0 3.83 0 3s0.67 -1.5 1.5 -1.5h4.5zM1.5 6h18v15c0 1.655 -1.345 3 -3 3H4.5c-1.655 0 -3 -1.345 -3 -3zm4.5 3c-0.413 0 -0.75 0.338 -0.75 0.75v10.5c0 0.413 0.338 0.75 0.75 0.75s0.75 -0.338 0.75 -0.75V9.75c0 -0.413 -0.338 -0.75 -0.75 -0.75m4.5 0c-0.413 0 -0.75 0.338 -0.75 0.75v10.5c0 0.413 0.338 0.75 0.75 0.75s0.75 -0.338 0.75 -0.75V9.75c0 -0.413 -0.338 -0.75 -0.75 -0.75m4.5 0c-0.413 0 -0.75 0.338 -0.75 0.75v10.5c0 0.413 0.338 0.75 0.75 0.75s0.75 -0.338 0.75 -0.75V9.75c0 -0.413 -0.338 -0.75 -0.75 -0.75';
}

:deep(.my-config2) {
  --darkmode: 0;
  --l10n-upload-files: 'Add/edit photos';
  --h-accent: 98;
  --s-accent: 70%;
  --l-accent: 46%;
  --border-radius-element: 0;
  --border-radius-frame: 0;
  --border-radius-thumb: 0;
  --clr-confirm: #61c924;
  --ui-size: 50px;
  --icon-edit-file: 'm17.002 0.905 -2.269 2.269 6.094 6.094 2.269 -2.269c1.172 -1.172 1.172 -3.07 0 -4.242l-1.847 -1.852c-1.172 -1.172 -3.07 -1.172 -4.242 0zm-3.328 3.328L2.747 15.164c-0.488 0.488 -0.844 1.092 -1.041 1.753L0.047 22.556c-0.117 0.398 -0.009 0.825 0.281 1.116s0.717 0.398 1.111 0.286L7.078 22.298c0.661 -0.197 1.266 -0.553 1.753 -1.041l10.936 -10.931z';
  --icon-remove-file: 'M6.337 0.83C6.591 0.319 7.111 0 7.678 0h5.644c0.567 0 1.087 0.319 1.341 0.83L15 1.5h4.5c0.83 0 1.5 0.67 1.5 1.5s-0.67 1.5 -1.5 1.5H1.5C0.67 4.5 0 3.83 0 3s0.67 -1.5 1.5 -1.5h4.5zM1.5 6h18v15c0 1.655 -1.345 3 -3 3H4.5c-1.655 0 -3 -1.345 -3 -3zm4.5 3c-0.413 0 -0.75 0.338 -0.75 0.75v10.5c0 0.413 0.338 0.75 0.75 0.75s0.75 -0.338 0.75 -0.75V9.75c0 -0.413 -0.338 -0.75 -0.75 -0.75m4.5 0c-0.413 0 -0.75 0.338 -0.75 0.75v10.5c0 0.413 0.338 0.75 0.75 0.75s0.75 -0.338 0.75 -0.75V9.75c0 -0.413 -0.338 -0.75 -0.75 -0.75m4.5 0c-0.413 0 -0.75 0.338 -0.75 0.75v10.5c0 0.413 0.338 0.75 0.75 0.75s0.75 -0.338 0.75 -0.75V9.75c0 -0.413 -0.338 -0.75 -0.75 -0.75';
}
</style>
