<template>
  <b-img
    thumbnail
    :class="profileClass"
    :alt="altText"
    :src="image"
    @error="brokenProfileImage"
  />
</template>

<script>
// This component should be imported, rather than using async require.  This is because async requires result in more
// Vue DOM patching overall, and this component is used in places like chat where it appears many times.  Testing shows
// this has a significant performance benefit.
//
// We can't use b-img-lazy as this component is used to render off document in GroupMarkerRich, and that doesn't
// work.
export default {
  name: 'GroupProfileImage',
  props: {
    image: {
      type: String,
      required: false,
      default: '',
    },
    altText: {
      type: String,
      required: false,
      default: 'Profile picture',
    },
    isThumbnail: {
      type: Boolean,
      required: false,
    },
    isModerator: {
      type: Boolean,
      required: false,
    },
    size: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    profileClass() {
      return this.size === 'sm' ? 'ProfileImage-sm' : 'ProfileImage'
    },
  },
  methods: {
    brokenProfileImage(event) {
      event.target.src = '/icon.png'
    },
  },
}
</script>

<style scoped lang="scss">
.ProfileImage {
  width: 100px;
  height: 100px;
}

.ProfileImage-sm {
  width: 60px;
  height: 60px;
}
</style>
