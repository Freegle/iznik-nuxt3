/**
 * Mock implementation of ProfileImage component for unit testing
 */
export default {
  name: 'ProfileImage',
  template:
    '<div class="profile-image-stub" :data-image="image" :data-name="name"></div>',
  props: {
    image: {
      type: String,
      default: '',
    },
    externaluid: {
      type: String,
      default: null,
    },
    ouruid: {
      type: String,
      default: null,
    },
    externalmods: {
      type: Object,
      default: null,
    },
    altText: {
      type: String,
      default: 'Profile picture',
    },
    isThumbnail: {
      type: Boolean,
      default: false,
    },
    isModerator: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'md',
    },
    border: {
      type: Boolean,
      default: false,
    },
    lazy: {
      type: Boolean,
      default: true,
    },
    badge: {
      type: Number,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
  },
}
