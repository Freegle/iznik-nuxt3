<template>
  <client-only>
    <div class="wrapper" @dragenter="openModal">
      <div class="d-flex flex-column justify-content-around">
        <v-icon v-if="!busy" size="6x" icon="camera" class="camera text-faded" />
        <b-img v-if="busy" src="/loader.gif" class="fit-cover fadein loader" />
        <div v-else-if="multiple || !modelValue.length" class="d-flex justify-content-around">
          <b-button :id="uploaderUid" variant="primary" @click="openModal">
            {{ label }}
          </b-button>
        </div>
        <p>{{ loading }}</p>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { Camera, CameraResultType } from '@capacitor/camera'
import * as tus from 'tus-js-client'
import { useImageStore } from '../stores/image'

const runtimeConfig = useRuntimeConfig()

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
const loading = ref('')

// const modalOpen = ref(props.startOpen)

const emit = defineEmits(['update:modelValue', 'closed'])
const uploadedPhotos = ref([])
const busy = ref(false)

const label = computed(() => {
  if (props.label) {
    return label
  } else if (props.multiple) {
    return props.modelValue.length > 0 ? 'Add another photo' : 'Add photo'
  } else {
    return 'Add photo'
  }
})

let upload = null

function resetUpload() {
  if (upload) {
    upload.abort()
    upload = null
  }
}

async function openModal() {
  console.log('openModal A')
  resetUpload()
  try {
    const image = await Camera.getPhoto({
      quality: 75,
      height: 1024,
      allowEditing: false,
      resultType: CameraResultType.Uri
    })
    loading.value = 'Uploading'

    // image.webPath will contain a path that can be set as an image src.
    // You can access the original file using image.path, which can be
    // passed to the Filesystem API to read the raw data of the image,
    // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    console.log('openModal B', image)
    // var imageUrl = image.webPath
    // console.log('openModal C', imageUrl)

    // Can be set to the src of an image now
    console.log('openModal D', image.webPath, image.format)

    const response = await fetch(image.webPath)
    const file = await response.blob()
    console.log('openModal E', file)

// Create a new tus upload
    upload = new tus.Upload(file, {
      endpoint: runtimeConfig.public.TUS_UPLOADER,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      //metadata: {
      //  filename: uid,
      //  filetype: image.format,
      //},
      onError: function (error) {
        console.log('Failed because: ' + error)
        loading.value = 'Upload failed because: ' + error
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        console.log(bytesUploaded, bytesTotal, percentage + '%')
        loading.value = 'Uploading '+percentage + '%'
      },
      onSuccess: async function (payload) {
        console.log('upload.url', payload, upload.url)
        console.log('payload',payload)
        if( payload){
          const { lastResponse } = payload
          console.log('lastResponse',lastResponse)
        }
        loading.value = 'Uploading nearly done'

        let uid = upload.url
        uid = 'freegletusd-' + uid.substring(uid.lastIndexOf('/') + 1)

        const mods = {}
        const att = {
          imgtype: props.type,
          externaluid: uid,
          externalmods: mods,
        }
        console.log('att', att)

        const ret = await imageStore.post(att)
        console.log('ret', ret)
        uploadedPhotos.value = props.modelValue
        uploadedPhotos.value.push({
          id: ret.id,
          path: ret.url,
          paththumb: ret.url,
          ouruid: ret.uid,
          externalmods: mods,
        })
        console.log('pushed')
        emit('update:modelValue', uploadedPhotos.value)
        console.log('emitted')
        loading.value = ''
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
  }
  catch (e) {
    loading.value = ''
    console.log('openModal', e.message)
  }
}

onMounted(() => {
})

onBeforeUnmount(() => {
})

</script>
<style lang="scss"></style>
