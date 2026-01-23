// Mock for @vueup/vue-quill
import { defineComponent } from 'vue'

export const QuillEditor = defineComponent({
  name: 'QuillEditor',
  props: ['content', 'modules', 'theme', 'toolbar', 'contentType'],
  template: '<div class="quill-editor"></div>',
})
