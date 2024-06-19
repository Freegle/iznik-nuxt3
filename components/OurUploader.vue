<template>
  <client-only>
    <div
      :class="{
        invisible: !visible,
      }"
    >
      <b-img
        v-if="busy"
        src="/loader.gif"
        class="fit-cover ml-2 fadein"
        width="200px"
      />
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
          ctx-name="my-uploader"
          :class="configName"
          @click="click"
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
  </client-only>
</template>
<script setup>
import { shouldPolyfill as shouldPolyfillLocale } from '@formatjs/intl-locale/should-polyfill'
import { shouldPolyfill as shouldPolyfillPlural } from '@formatjs/intl-pluralrules/should-polyfill'
import { useMiscStore } from '~/stores/misc'
import { useImageStore } from '~/stores/image'

const LR = await import('@uploadcare/blocks/web/blocks.min.js')

try {
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
})

const miscStore = useMiscStore()
const imageStore = useImageStore()

const emit = defineEmits(['update:modelValue'])
const uploadedPhotos = ref([])
const ctxProviderRef = ref(null)
const uploader = ref(null)
const busy = ref(false)

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

watch(
  lrconfig,
  (newVal) => {
    if (newVal) {
      try {
        lrconfig.value.localeDefinitionOverride = {
          en: {
            'drop-files-here': 'Add photos',
            clear: 'Remove',
            'add-more': 'Add more photos',
            'src-type-local': 'Browse',
          },
        }
        LR.registerBlocks(LR)
        setPhotos(props.modelValue)
        visible.value = true
      } catch (e) {
        console.error('Failed in mount', e)
      }
    }
  },
  {
    immediate: true,
  }
)

const visible = ref(false)

function setPhotos(photos) {
  if (ctxProviderRef.value) {
    ctxProviderRef.value.removeAllFiles()

    photos.forEach((f) => {
      console.log('Add photo', f)
      if (f.path) {
        ctxProviderRef.value.addFileFromCdnUrl(f.path, {
          silent: true,
        })
      } else if (f.externaluid) {
        ctxProviderRef.value.addFileFromUuid(f.externaluid, {
          silent: true,
        })
      }
    })
  }
}

async function uploadSuccess(e) {
  console.log('Uploaded', e)
  busy.value = true

  if (e.detail) {
    if (e.detail.status === 'success') {
      // We've uploaded a file.  Create the attachment on the server which references the uploaded image.
      //
      // Say we'd like it back in webp format for efficiency.
      const mods = {
        format: 'webp',
      }

      const att = {
        imgtype: props.type,
        externaluid: e.detail.uuid,
        externalmods: mods,
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
        externaluid: ret.uid,
        externalmods: mods,
      })

      console.log(
        'Added, emit update:modelValue',
        JSON.stringify(uploadedPhotos.value)
      )

      emit('update:modelValue', uploadedPhotos.value)
      busy.value = false
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
    console.log('emit modelValue', JSON.stringify(uploadedPhotos.value))
    emit('update:modelValue', uploadedPhotos.value)
  }
}

function click(e) {
  console.log('Clicked', e)
}
</script>
<style lang="scss">
@import '@uploadcare/blocks/web/lr-file-uploader-inline.min.css';
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
</style>
