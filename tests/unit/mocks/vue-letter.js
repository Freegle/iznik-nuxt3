// Mock for vue-letter package
// The Letter component renders email content in a nice format
import { defineComponent, h } from 'vue'

export const Letter = defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Letter',
  props: {
    html: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
  },
  render() {
    return h('div', {
      class: 'letter',
      'data-html': this.html,
      'data-text': this.text,
    })
  },
})
