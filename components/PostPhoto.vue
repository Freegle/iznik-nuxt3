<template>
  <div class="container p-0 mb-1 mr-2" :class="{ primary }">
    <span @touchstart="rotateLeft" @click="rotateLeft">
      <div label="Rotate left" class="topleft clickme" title="Rotate left">
        <v-icon icon="circle" size="2x" />
        <v-icon icon="reply" class="image__icon" />
      </div>
    </span>
    <span @touchstart="rotateRight" @click="rotateRight">
      <div label="Rotate right" class="topright clickme" title="Rotate right">
        <v-icon icon="circle" size="2x" />
        <v-icon icon="reply" class="image__icon" flip="horizontal" />
      </div>
    </span>
    <span @touchstart="remove" @click="remove">
      <div
        label="Remove this photo"
        class="bottomright clickme"
        title="Remove this photo"
      >
        <v-icon icon="circle" size="2x" />
        <v-icon icon="trash-alt" class="image__icon" />
      </div>
    </span>
    <div class="image-wrapper">
      <NuxtImg
        v-if="externaluid"
        format="webp"
        provider="uploadcare"
        :src="externaluid"
        :modifiers="mods"
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
        @click="$emit('click')"
      />
      <b-img v-else lazy :src="path" rounded @click="$emit('click')" />
    </div>
    <ConfirmModal
      v-if="confirm"
      :title="'Delete this photo?'"
      @confirm="removeConfirmed"
      @hidden="confirm = false"
    />
  </div>
</template>
<script>
import { useImageStore } from '../stores/image'
const ConfirmModal = () =>
  defineAsyncComponent(() => import('./ConfirmModal.vue'))

export default {
  components: { ConfirmModal },
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
  data() {
    return {
      confirm: false,
      mods: {},
    }
  },
  watch: {
    externalmods: {
      handler(newVal) {
        this.mods = newVal
      },
      immediate: true,
    },
  },
  methods: {
    remove() {
      this.confirm = true
    },
    removeConfirmed() {
      this.$emit('remove', this.id)
    },
    async rotate(deg) {
      const curr = this.mods?.rotate || 0
      this.mods.rotate = curr + deg

      // Ensure between 0 and 360
      this.mods.rotate = (this.mods.rotate + 360) % 360

      await this.imageStore.post({
        id: this.id,
        rotate: this.mods.rotate,
        bust: Date.now(),
        type: 'Message',
      })
    },
    rotateLeft() {
      this.rotate(90)
    },
    rotateRight() {
      this.rotate(-90)
    },
  },
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.bottomright {
  bottom: 12px;
  right: 0px;
  position: absolute;
}

.topleft {
  top: 12px;
  left: 10px;
  position: absolute;
}

.topright {
  top: 12px;
  right: 0px;
  position: absolute;
}

.container {
  position: relative;

  :deep(img) {
    box-shadow: 0px 0px 3px 2px $color-gray--light;
    border-radius: 5px;
  }

  &.primary {
    :deep(img) {
      box-shadow: 0px 0px 3px 2px $colour-success;
    }
  }
}

.image__icon {
  color: $color-white;
  transform: translate(-1.5em, -0.5em);
  width: 1rem !important;
  height: 1rem !important;

  &.fa-flip-horizontal {
    transform: translate(-1.5em, -0.5em) scaleX(-1);
  }
}

.square {
  object-fit: cover;
  width: 200px;
  height: 200px;
  max-width: 200px;
  min-width: 200px;
  min-height: 200px;
  max-height: 200px;
}
</style>
