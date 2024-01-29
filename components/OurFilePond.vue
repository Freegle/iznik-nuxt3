<template>
  <div>
    <file-pond
      v-if="supported"
      ref="pond"
      name="photo"
      :allow-multiple="multiple"
      accepted-file-types="image/jpeg, image/png, image/gif, image/jpg, image/heic"
      :file-validate-type-detect-type="validateType"
      :files="myFiles"
      image-resize-target-width="800"
      image-resize-target-height="800"
      image-crop-aspect-ratio="1"
      :label-idle="userPrompt"
      :server="{ process, revert, restore, load, fetch }"
      :drop-on-element="false"
      :drop-on-page="true"
      :max-parallel-uploads="1"
      @init="photoInit"
      @processfile="processed"
      @processfiles="allProcessed"
    />
    <div v-else>
      Sorry, photo uploads aren't supported on this browser. Maybe it's old?
    </div>
  </div>
</template>
<script>
import { Camera, CameraSource, CameraResultType } from '@capacitor/camera'
import { useComposeStore } from '../stores/compose'
import { useImageStore } from '../stores/image'
import { useMobileStore } from '@/stores/mobile'

export default {
  props: {
    imgtype: {
      type: String,
      required: true,
    },
    imgflag: {
      type: String,
      required: true,
    },
    ocr: {
      type: Boolean,
      required: false,
      default: false,
    },
    identify: {
      type: Boolean,
      required: false,
      default: false,
    },
    browse: {
      type: Boolean,
      required: false,
      default: true,
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    msgid: {
      type: Number,
      required: false,
      default: null,
    },
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const composeStore = useComposeStore()
    const imageStore = useImageStore()

    return {
      composeStore,
      imageStore,
    }
  },
  data() {
    return {
      imageid: null,
      imagethumb: null,
      image: null,
      ocred: null,
      identified: null,
      myFiles: [],
      supported: true,
    }
  },
  computed: {
    userPrompt() {
      const mobileStore = useMobileStore()
      if (mobileStore.isApp) {
        if (mobileStore.isiOS) {
          return '<div><span class="filepond--label-action btn btn-white">Take a photo or Browse</span></div><div id="camera-msg"></div>'
        } else {
          return '<div><span class="take-photo btn btn-primary">Take Photo</span> or <span class="btn btn-white">Browse</span></div><div id="camera-msg"></div>'
        }
      }
      return 'Drag & Drop photos or <span class="btn btn-white ction"> Browse </span>'
    },
  },
  mounted() {
    if (process.client) {
      const externalScript = document.createElement('script')
      externalScript.setAttribute(
        'src',
        'https://cdn.jsdelivr.net/npm/heic2any_ags@0.0.4/dist/heic2any.min.js'
      )
      document.head.appendChild(externalScript)
    }
  },
  methods: {
    async takeAppPhoto() {
      // CC
      console.log('TAKE APP PHOTO')
      try {
        const image = await Camera.getPhoto({
          quality: 50,
          // allowEditing: true,
          width: 1200,
          height: 1200,
          source: CameraSource.Camera,
          resultType: CameraResultType.DataUrl,
        })

        this.$refs.pond.addFile(image.dataUrl)
      } catch (e) {
        console.log('takeAppPhoto error', e)
        document.getElementById('camera-msg').innerHTML = e.message
      }
    },
    photoInit() {
      const mobileStore = useMobileStore()
      if (mobileStore.isApp) {
        // this.takeAppPhoto()
        if (mobileStore.isiOS) {
          if (this.browse) {
            this.$refs.pond.browse()
          }
        } else {
          setTimeout(() => {
            // this.$nextTick didn't work
            const takePhoto = this.$el.querySelector('.take-photo')
            if (takePhoto) {
              takePhoto.addEventListener('click', (e) => {
                this.takeAppPhoto()
                e.preventDefault()
                return false
              })
            }
          }, 300)
        }
        if (this.browse) {
          // NO: don't show camera automatically: this.takeAppPhoto()
        }
      } else if (!this.$refs.pond._pond) {
        // This is the only way of finding out if the browser is supported - see
        // https://github.com/pqina/vue-filepond/issues/136
        this.supported = false
      } else {
        this.$emit('init')

        if (this.browse) {
          // We have rendered the filepond instance.  Trigger browse so that they can upload a photo without an
          // extra click.
          this.$refs.pond.browse()
        }
      }
    },
    async process(fieldName, file, metadata, load, error, progress, abort) {
      this.composeStore.uploading = true

      const data = new FormData()
      const fn = file.name.toLowerCase()

      if (fn.includes('.heic')) {
        // If we have an HEIC file, then the server can't cope with it as it will fail imagecreatefromstring, so
        // convert it to a PNG file on the client before upload.  We have to restrict the quality to keep the cconversion
        // time reasonable.
        //
        const blob = file.slice(0, file.size, 'image/heic')
        const png = await window.heic2any({
          blob,
          toType: 'image/jpeg',
          quality: 0.92,
        })
        data.append('photo', png, 'photo')
      } else {
        data.append('photo', file, 'photo')
      }

      data.append(this.imgflag, true)
      data.append('imgtype', this.imgtype)
      data.append('ocr', this.ocr)
      data.append('identify', this.identify)

      if (this.msgid) {
        data.append('msgid', this.msgid)
      } else if (this.groupid) {
        data.append('groupid', this.groupid)
      }

      // It would be nice to have a progress indicator, but this doesn't immediately appear to be
      // available using fetch().  So we don't specify onUpLoadProgress.
      const ret = await this.imageStore.postForm(data)

      try {
        if (ret.ret === 0) {
          this.imageid = ret.id
          this.imagethumb = ret.paththumb
          this.image = ret.path

          if (this.ocr) {
            this.ocred = ret.ocr
          }

          if (this.identify) {
            this.identified = ret.items
          }

          load(ret.id)
        } else {
          error(ret.status === 200 ? ret.status : 'Network error ' + ret.status)
        }
      } catch (e) {
        error('Network error ' + e.mesage)
      }

      return {
        abort: () => {
          // We don't need to do anything - the server will tidy up hanging images.
          abort()
        },
      }
    },
    load(uniqueFileId, load, error) {},
    fetch(url, load, error, progress, abort, headers) {},
    restore(uniqueFileId, load, error, progress, abort, headers) {},
    revert(uniqueFileId, load, error) {},

    processed(error, file) {
      if (!error) {
        this.$emit(
          'photoProcessed',
          this.imageid,
          this.imagethumb,
          this.image,
          this.ocred,
          this.identified
        )

        if (!this.multiple) {
          // Only one, so the allProcessed event isn't fired by pond.
          this.allProcessed()
        }
      }
    },

    addFile(f) {
      this.$refs.pond.addFile(f)
    },
    allProcessed() {
      this.composeStore.uploading = false
      this.$emit('allProcessed')
    },
    detector(source, type) {
      // This function is never executed...
      return new Promise((resolve, reject) => {
        console.log(source, type)
        if (source.name.includes('.heic')) {
          // This is not detected automatically.
          type = 'image/heic'
        }

        resolve(type)
      })
    },
    validateType(source, type) {
      const p = new Promise((resolve, reject) => {
        // Not all browsers set the MIME type correctly, so we have a custom validator to force it from the filename.
        if (source.name.toLowerCase().includes('.heic')) {
          resolve('image/heic')
        } else {
          resolve(type)
        }
      })

      return p
    },
  },
  blockkey(e) {
    // We're blocking all interaction with this div while the load happens.
    e.returnValue = false
    return false
  },
}
</script>
<style scoped lang="scss">
:deep(.filepond--root) {
  .filepond--drop-label {
    background-color: $colour-success-bg;

    label {
      font-weight: bold;
    }

    .btn {
      background-color: $colour-success !important;
      border-color: $colour-success !important;
      color: $color-white !important;

      &:hover {
        background-color: $colour-success-hover !important;
      }
    }
  }
}
</style>
