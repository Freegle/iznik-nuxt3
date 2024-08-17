<template>
  <button class="p-0 border-0" :disabled="disabled">
    <MessageTag :id="id" class="ps-2 pe-2" />
    <div
      v-if="!defaultAttachments && !thumbnail && attachments?.length"
      class="photozoom"
      @click="$emit('zoom')"
    >
      View larger image
    </div>
    <div class="photobadge d-flex">
      <client-only>
        <b-badge v-if="attachments?.length > 1" @click="$emit('zoom')">
          1 / {{ attachments?.length }} <v-icon icon="camera" />
        </b-badge>
      </client-only>
    </div>
    <div
      ref="imagewrapper"
      :class="{
        thumbnail: thumbnail,
        notThumbnail: !thumbnail,
        'w-100': !thumbnail,
      }"
    >
      <b-img
        v-if="defaultAttachments || !attachments?.length"
        :width="width"
        :height="height"
        src="/camera.png"
        class="align-self-center justify-self-center rounded h-100 fit-cover"
      />
      <OurUploadedImage
        v-else-if="attachments[0].ouruid"
        :src="attachments[0].ouruid"
        :modifiers="attachments[0].externalmods"
        alt="Item Photo"
        :width="width"
        :height="height"
        :sizes="thumbnail ? '200px' : '320px md:768px'"
        :preload="preload"
        @error="brokenImage"
        @click="$emit('zoom')"
      />
      <NuxtPicture
        v-else-if="attachments[0].externaluid"
        format="webp"
        provider="uploadcare"
        :src="attachments[0].externaluid"
        :modifiers="attachments[0].externalmods"
        alt="Item Photo"
        :width="width"
        :height="height"
        :sizes="thumbnail ? '200px' : '320px md:768px'"
        :preload="preload"
        @error="brokenImage"
        @click="$emit('zoom')"
      />
      <ProxyImage
        v-else
        class-name="p-0 rounded"
        alt="Item picture"
        title="Item picture"
        :src="attachments[0].path"
        :sizes="thumbnail ? '200px' : '320px md:768px'"
        :width="width"
        :height="height"
        fit="cover"
        :preload="preload"
        @error="brokenImage"
        @click="$emit('zoom')"
      />
    </div>
  </button>
</template>
<script setup>
import { useMiscStore } from '~/stores/misc'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  attachments: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  thumbnail: {
    type: Boolean,
    required: false,
    default: false,
  },
  showZoom: {
    type: Boolean,
    required: false,
    default: false,
  },
  preload: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const defaultAttachments = ref(false)
const imagewrapper = ref(null)

const miscStore = useMiscStore()

const width = computed(() => {
  // We need to pass in explicit values.  Find the element and get the width set by CSS, which will be using the
  // values in message-images.scss
  let ret = 150

  if (props.thumbnail) {
    if (imagewrapper.value) {
      const styles = window.getComputedStyle(imagewrapper.value)
      ret = parseInt(styles.getPropertyValue('width').replace('px', ''))
    }
  } else {
    ret = 768
  }

  return ret
})

const height = computed(() => {
  if (props.thumbnail) {
    return width.value
  } else if (miscStore.breakpoint === 'xs' || miscStore.breakpoint === 'sm') {
    return 150
  } else {
    return 200
  }
})

function brokenImage() {
  // If the attachment image is broken, we're best off just hiding it.
  defaultAttachments.value = true
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/message-images.scss';

:deep(.thumbnail img) {
  object-fit: cover;
  display: block;
  height: min($thumbnail-size, calc(45vw - 30px));
  width: min($thumbnail-size, calc(45vw - 30px));
  box-shadow: 0 0 1 $color-gray--dark;

  @include media-breakpoint-up(md) {
    height: $thumbnail-size-md;
    width: $thumbnail-size-md;
  }
}

:deep(.notThumbnail img) {
  object-fit: cover;
  width: 100% !important;
  display: block;
  height: $thumbnail-size;
  box-shadow: 0 0 1 $color-gray--dark;

  @include media-breakpoint-up(md) {
    height: $notthumbnail-size-md;
  }
}

.photobadge {
  right: 10px;
  position: absolute;
  bottom: 10px;
  border-radius: 4px;

  :deep(.badge) {
    background-color: $color-gray--darker !important;
    color: white !important;
  }
}

.photozoom {
  left: 10px;
  position: absolute;
  bottom: 10px;
  background-color: $color-gray--darker;
  color: white;
  border-radius: 4px;
  padding-left: 10px;
  padding-right: 10px;
}

.bg {
  background-color: $color-gray--light;
  width: 100%;
  height: 150px;
}
</style>
