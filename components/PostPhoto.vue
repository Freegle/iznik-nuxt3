<template>
  <div>
    <NuxtImg
      v-if="externaluid"
      format="webp"
      provider="uploadcare"
      :src="externaluid"
      :modifiers="externalmods"
      alt="Item Photo"
      :width="200"
      :height="200"
      @click="$emit('click')"
    />
    <b-img
      v-else-if="thumbnail"
      lazy
      :src="paththumb"
      rounded
      thumbnail
      class="square"
      :class="{ primary }"
      @click="$emit('click')"
    />
    <b-img v-else lazy :src="path" rounded @click="$emit('click')" />
  </div>
</template>
<script>
import { useImageStore } from '../stores/image'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    paththumb: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: Boolean,
      required: false,
      default: true,
    },
    primary: {
      type: Boolean,
      default: false,
    },
    externaluid: {
      type: String,
      required: false,
      default: null,
    },
    externalmods: {
      type: Array,
      required: false,
      default: () => {},
    },
  },
  setup() {
    const imageStore = useImageStore()

    return {
      imageStore,
    }
  },
}
</script>
<style scoped lang="scss">
.square {
  object-fit: cover;
  width: 200px;
  height: 200px;
  max-width: 200px;
  min-width: 200px;
  min-height: 200px;
  max-height: 200px;
}

.primary {
  border-width: 2px;
  border-color: $colour-success;
}
</style>
