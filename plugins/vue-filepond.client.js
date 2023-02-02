import VueFilePond from 'vue-filepond'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginImageTransform from 'filepond-plugin-image-transform'
import FilePondPluginImageResize from 'filepond-plugin-image-resize'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'

export default defineNuxtPlugin((nuxtApp) => {
  const FilePond = VueFilePond(
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview,
    FilePondPluginImageTransform,
    FilePondPluginImageResize,
    FilePondPluginImageExifOrientation
  )

  nuxtApp.vueApp.use(FilePond)
})
