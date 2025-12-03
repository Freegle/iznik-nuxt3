<template>
  <button class="p-0 border-0 position-relative" :disabled="disabled">
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
    <div v-if="!attachments?.length && sampleImage" class="sample-badge">
      Photo of similar item
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
        v-if="defaultAttachments || (!attachments?.length && !sampleImage)"
        :width="width"
        :height="height"
        src="/camera.png"
        class="align-self-center justify-self-center h-100 fit-cover"
      />
      <ProxyImage
        v-else-if="!attachments?.length && sampleImage"
        class-name="p-0 rounded"
        alt="Similar item"
        :src="sampleImage.path"
        :width="width"
        :height="height"
        :sizes="thumbnail ? '200px' : '320px md:768px'"
        fit="cover"
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
  sampleImage: {
    type: Object,
    required: false,
    default: null,
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

:deep(.thumbnail img, .thumbnail picture) {
  object-fit: cover;
  display: block;
  height: max($thumbnail-size, calc(50vw - 2rem)) !important;
  width: min(calc(50vw - 22.5px), 100%) !important;
  box-shadow: 0 0 1 $color-gray--dark;

  @include media-breakpoint-up(md) {
    height: $thumbnail-size-md !important;
    width: $thumbnail-size-md !important;
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

.sample-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(128, 128, 128, 0.6);
  color: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.85rem;
  font-weight: 500;
  z-index: 100;
}
</style>
