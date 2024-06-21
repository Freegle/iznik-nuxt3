<template>
  <div>
    <div
      v-if="defaultAttachments || !attachments?.length"
      class="d-none d-md-block"
    >
      <MessageTag :id="id" def class="ps-2 pe-2" />
      <div class="d-flex justify-content-around bg rounded">
        <client-only>
          <b-img
            src="/camera.png"
            class="align-self-center justify-self-center w-100 rounded h-100 fit-cover"
          />
        </client-only>
      </div>
    </div>
    <button
      v-else-if="attachments?.length"
      class="w-100 p-0 border-0"
      :disabled="disabled"
    >
      <MessageTag :id="id" class="ps-2 pe-2" />
      <div
        v-if="!thumbnail && attachments?.length"
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
      <div :class="{ thumbnail: thumbnail, notThumbnail: !thumbnail }">
        <client-only>
          <div v-if="attachments[0].externaluid" ref="imagewrapper">
            <NuxtPicture
              format="webp"
              fit="cover"
              provider="uploadcare"
              :src="attachments[0].externaluid"
              :modifiers="attachments[0].externalmods"
              alt="Item Photo"
              class="attachment"
              :width="Math.round(width)"
              :height="Math.round(height)"
              preload
              @error="brokenImage"
              @click="$emit('zoom')"
            />
          </div>
          <div v-else>
            <b-img
              lazy
              rounded
              class="d-none d-md-block attachment p-0"
              generator-unable-to-provide-required-alt=""
              title="Item picture"
              :src="thumbnail ? attachments[0].paththumb : attachments[0].path"
              itemprop="image"
              @error="brokenImage"
              @click="$emit('zoom')"
            />
            <b-img
              lazy
              rounded
              class="d-block d-md-none attachment p-0"
              generator-unable-to-provide-required-alt=""
              title="Item picture"
              :src="attachments[0].path"
              itemprop="image"
              @error="brokenImage"
              @click="$emit('zoom')"
            />
          </div>
          <template #fallback>
            <img
              class="attachment p-0"
              generator-unable-to-provide-required-alt=""
              title="Item picture"
              src="/camera.png"
              itemprop="image"
            />
          </template>
        </client-only>
      </div>
    </button>
  </div>
</template>
<script setup>
import { useElementSize } from '@vueuse/core'

defineProps({
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
})

const defaultAttachments = ref(false)
const imagewrapper = ref(null)

const { width, height } = useElementSize(imagewrapper)

// Make width and height <= 3000 as that's an Uploadcare limit.
if (width > 3000) {
  width.value = 3000
}
if (height > 3000) {
  height.value = 3000
}

function brokenImage() {
  // If the attachment image is broken, we're best off just hiding it.
  defaultAttachments.value = true
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.attachment {
  object-fit: cover;
  width: 100%;
  box-shadow: 0 0 1 $color-gray--dark;
}

.thumbnail {
  .attachment {
    display: block;
    height: 200px;

    img {
      height: 200px;
    }
  }
}

.notThumbnail {
  .attachment {
    display: block;
    height: 200px;

    img {
      height: 200px;
    }

    @include media-breakpoint-up(sm) {
      height: 360px;

      img {
        height: 360px;
      }
    }
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
  height: 200px;
}
</style>
