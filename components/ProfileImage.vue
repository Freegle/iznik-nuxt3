<template>
  <span class="ProfileImage__container">
    <b-img
      v-if="lazy"
      lazy
      rounded="circle"
      :thumbnail="isThumbnail"
      :class="className"
      :alt="altText"
      :src="validImage"
      @error.native="brokenProfileImage"
    />
    <b-img
      v-else
      rounded="circle"
      :thumbnail="isThumbnail"
      :class="className"
      :alt="altText"
      :src="validImage"
      @error="brokenProfileImage"
    />
    <v-icon
      v-if="isModerator"
      icon="leaf"
      :class="'ProfileImage__moderator ProfileImage__moderator--' + size"
    />
    <b-badge
      v-if="badge !== null"
      variant="danger"
      :class="'ProfileImage__moderator ProfileImage__moderator--' + size"
    >
      {{ badge }}
    </b-badge>
  </span>
</template>
<script>
// This component should be imported, rather than using async require.  This is because async requires result in more
// Vue DOM patching overall, and this component is used in places like chat where it appears many times.  Testing shows
// this has a significant performance benefit.
export default {
  name: 'ProfileImage',
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
      default: 'md',
    },
    border: {
      type: Boolean,
      required: false,
    },
    lazy: {
      type: Boolean,
      required: false,
      default: true,
    },
    badge: {
      type: Number,
      required: false,
      default: null,
    },
  },
  computed: {
    validImage() {
      return this.image || '/defaultprofile.png'
    },
    className() {
      let ret = 'p-0 profile profile--' + this.size

      if (this.border) {
        ret += ' ourBorder'
      }

      return ret
    },
  },
  methods: {
    brokenProfileImage(event) {
      event.target.src = '/defaultprofile.png'
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.ProfileImage__container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  img {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }
}

.profile {
  object-fit: cover;
}

.profile--sm {
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  min-height: 20px !important;
  max-width: 20px !important;
  max-height: 20px !important;

  @include media-breakpoint-up(md) {
    width: 25px !important;
    height: 25px !important;
    min-width: 25px !important;
    min-height: 25px !important;
    max-width: 25px !important;
    max-height: 25px !important;
  }
}

.profile--md {
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  min-height: 20px !important;
  max-width: 20px !important;
  max-height: 20px !important;

  @include media-breakpoint-up(md) {
    width: 35px !important;
    height: 35px !important;
    min-width: 35px !important;
    min-height: 35px !important;
    max-width: 35px !important;
    max-height: 35px !important;
  }
}

.profile--lg {
  width: 30px !important;
  height: 30px !important;
  min-width: 30px !important;
  min-height: 30px !important;
  max-width: 30px !important;
  max-height: 30px !important;

  @include media-breakpoint-up(sm) {
    width: 50px !important;
    height: 50px !important;
    min-width: 50px !important;
    min-height: 50px !important;
    max-width: 50px !important;
    max-height: 50px !important;
  }
}

.profile--lg-always {
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
  min-height: 50px !important;
  max-width: 50px !important;
  max-height: 50px !important;
}

.profile--xl {
  width: 75px !important;
  height: 75px !important;
  min-width: 75px !important;
  min-height: 75px !important;
  max-width: 75px !important;
  max-height: 75px !important;

  @include media-breakpoint-up(md) {
    width: 100px !important;
    height: 100px !important;
    min-width: 100px !important;
    min-height: 100px !important;
    max-width: 100px !important;
    max-height: 100px !important;
  }
}

.ProfileImage__moderator {
  display: flex;
  align-self: flex-end;
  justify-self: flex-end;
  border-radius: 50%;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  translate: 3px 3px;

  :not(.badge) {
    background-color: $color-white;
    color: $colour-success;
  }
}

.ProfileImage__moderator--sm {
  width: 12px;
  height: 12px;

  @include media-breakpoint-up(md) {
    width: 16px;
    height: 16px;
  }
}

.ProfileImage__moderator--md {
  width: 16px;
  height: 16px;

  @include media-breakpoint-up(md) {
    width: 20px;
    height: 20px;
  }
}

.ProfileImage__moderator--lg {
  width: 18px;
  height: 18px;

  @include media-breakpoint-up(md) {
    width: 24px;
    height: 24px;
  }
}

.ProfileImage__moderator--xl {
  width: 24px;
  height: 24px;

  @include media-breakpoint-up(md) {
    width: 36px;
    height: 36px;
  }
}

.ProfileImage__moderator--xxl {
  width: 24px;
  height: 24px;

  @include media-breakpoint-up(md) {
    width: 36px;
    height: 36px;
  }
}

.ourBorder {
  border: 2px solid $color-gray--dark;
  background-color: $color-gray--dark;
}
</style>
