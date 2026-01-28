/**
 * Mock implementation of vue-read-more3 component for unit testing
 */
export default {
  name: 'ReadMore',
  template: '<span class="read-more">{{ text }}</span>',
  props: {
    text: {
      type: String,
      default: '',
    },
    maxChars: {
      type: Number,
      default: 100,
    },
  },
}
