<template>
  <span class="ProfileImage__container">
    <OurUploadedImage
      v-if="ouruid"
      :src="ouruid"
      :modifiers="externalmods"
      :class="className"
      class="circle"
      :alt="altText"
      :width="width"
      :height="width"
    />
    <NuxtPicture
      v-else-if="externaluid"
      format="webp"
      fit="cover"
      provider="uploadcare"
      :src="externaluid"
      :modifiers="externalmods"
      :class="className"
      class="circle"
      :alt="altText"
      :width="width"
      :height="width"
    />
    <b-img
      v-else-if="image?.indexOf('data:image') === 0"
      :class-name="className"
      :src="image"
      :alt="altText"
      :width="width"
      :height="width"
    />
    <GeneratedAvatar
      v-else-if="useGeneratedAvatar"
      :name="name || 'User'"
      :size="width"
      class="generated-avatar"
    />
    <ProxyImage
      v-else
      :src="validImage"
      :sizes="width + 'px'"
      :width="width"
      :height="width"
      :class-name="className"
      :alt="altText"
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
      :class="
        'd-flex justify-content-around align-items-center ProfileImage__moderator ProfileImage__moderator--' +
        size
      "
    >
      {{ badge }}
    </b-badge>
  </span>
</template>
<script setup>
// This component should be imported, rather than using async require.  This is because async requires result in more
// Vue DOM patching overall, and this component is used in places like chat where it appears many times.  Testing shows
// this has a significant performance benefit.
const props = defineProps({
  image: {
    type: String,
    required: false,
    default: '',
  },
  externaluid: {
    type: String,
    required: false,
    default: null,
  },
  ouruid: {
    type: String,
    required: false,
    default: null,
  },
  externalmods: {
    type: Object,
    required: false,
    default: null,
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
  name: {
    type: String,
    required: false,
    default: null,
  },
})

const brokenImage = ref(false)

// Check if this is a default/placeholder image that should use generated avatar
const isDefaultImage = computed(() => {
  const img = props.image
  if (!img) return true
  if (img.includes('defaultprofile')) return true
  if (brokenImage.value) return true
  return false
})

// Use generated avatar when we have a name and no real image
const useGeneratedAvatar = computed(() => {
  return props.name && isDefaultImage.value
})

const validImage = computed(() => {
  return !brokenImage.value && props.image ? props.image : '/defaultprofile.png'
})

const className = computed(() => {
  let ret = 'p-0 profile profile--' + props.size

  if (props.border) {
    ret += ' ourBorder'
  }

  return ret
})

const width = computed(() => {
  // Return a resolution high enough for the CSS rules below.
  if (className.value.includes('--sm')) {
    return 25
  } else if (className.value.includes('--md')) {
    return 35
  } else if (className.value.includes('--lg')) {
    return 50
  } else {
    return 100
  }
})

const brokenProfileImage = (e) => {
  brokenImage.value = true
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.breakgrid,
.breakgrid .ProfileImage__moderator {
  display: inline !important;
}

.ProfileImage__container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  &.inline {
    display: inline-grid;
    vertical-align: middle;
  }

  :deep(picture) {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    border-radius: 50%;
    object-fit: cover;
  }

  :deep(img) {
    border-radius: 50%;
    object-fit: cover;
  }
}

.profile {
  object-fit: cover;
}

:deep(.profile--sm img) {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
  max-width: 24px !important;
  max-height: 24px !important;

  @include media-breakpoint-up(md) {
    width: 25px !important;
    height: 25px !important;
    min-width: 25px !important;
    min-height: 25px !important;
    max-width: 25px !important;
    max-height: 25px !important;
  }
}

:deep(.profile--md img) {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  max-width: 32px !important;
  max-height: 32px !important;

  @include media-breakpoint-up(md) {
    width: 35px !important;
    height: 35px !important;
    min-width: 35px !important;
    min-height: 35px !important;
    max-width: 35px !important;
    max-height: 35px !important;
  }
}

:deep(.profile--lg img) {
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  min-height: 40px !important;
  max-width: 40px !important;
  max-height: 40px !important;

  @include media-breakpoint-up(sm) {
    width: 50px !important;
    height: 50px !important;
    min-width: 50px !important;
    min-height: 50px !important;
    max-width: 50px !important;
    max-height: 50px !important;
  }
}

:deep(.profile--lg-always img) {
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
  min-height: 50px !important;
  max-width: 50px !important;
  max-height: 50px !important;
}

:deep(.profile--xl img) {
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
  background-color: $color-white;
  color: $colour-success;
  padding: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.ProfileImage__moderator--sm {
  width: 14px;
  height: 14px;

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
  width: 20px;
  height: 20px;
  font-size: 0.6rem;

  @include media-breakpoint-up(md) {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
}

.ProfileImage__moderator--xl {
  width: 24px;
  height: 24px;
  font-size: 0.75rem;

  @include media-breakpoint-up(md) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
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

:deep(.ourBorder img) {
  border: 2px solid $color-gray--dark;
  background-color: $color-gray--dark;
}

.circle {
  border-radius: 50%;
}

.generated-avatar {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  border-radius: 50%;
  overflow: hidden;
}
</style>
