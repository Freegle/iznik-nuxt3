<template>
  <b-modal
    :id="'newsPhotoModal-' + id"
    ref="modal"
    scrollable
    title="ChitChat photo"
    size="lg"
    no-stacking
  >
    <template #default>
      <div class="container p-0">
        <b-img
          lazy
          :src="src"
          rounded
          fluid
          generator-unable-to-provide-required-alt=""
          @error="brokenImage"
        />
      </div>
    </template>
    <template #footer>
      <div class="d-flex justify-content-end">
        <b-button variant="white" @click="hide"> Close </b-button>
      </div>
    </template>
  </b-modal>
</template>
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import { useImageStore } from '../stores/image'
import { useOurModal } from '~/composables/useOurModal'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
    newsfeedid: {
      type: Number,
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
  },
  setup() {
    const newsfeedStore = useNewsfeedStore()
    const imageStore = useImageStore()

    const { modal, hide } = useOurModal()

    return {
      newsfeedStore,
      imageStore,
      modal,
      hide,
    }
  },
  methods: {
    brokenImage(event) {
      event.target.src = '/placeholder.jpg'
    },
  },
}
</script>
<style scoped lang="scss">
.bottomright {
  bottom: 12px;
  right: 10px;
  position: absolute;
}

.topleft {
  top: 12px;
  left: 10px;
  position: absolute;
}

.topright {
  top: 12px;
  right: 10px;
  position: absolute;
}

.container {
  position: relative;
}

.stacked {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  svg {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  svg:nth-child(2) {
    z-index: 10000;
    color: white;
    padding-top: 7px;
    padding-right: 7px;
  }
}
</style>
