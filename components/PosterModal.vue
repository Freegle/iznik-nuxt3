<template>
  <b-modal
    id="posterAddModal"
    ref="modal"
    scrollable
    title="Thanks!"
    no-stacking
    visible
    size="lg"
    @shown="shown"
    @hidden="hidden"
  >
    <notice-message class="mb-3">
      Please drag/zoom the map until the marker shows where the poster is.
    </notice-message>
    <client-only>
      <DraggableMap
        v-if="loaded"
        ref="map"
        :initial-zoom="7"
        class="mb-2"
        :max-zoom="17"
      />
    </client-only>
    <h4>Please add more info</h4>
    <b-form-input
      v-model="name"
      placeholder="Where is it?  E.g. village green, supermarket, name of cafe..."
      size="60"
      maxlength="60"
      spellcheck="true"
      class="mb-1"
    />
    <b-row>
      <b-col>
        <b-button variant="primary" class="mt-1 mb-2" @click="photoAdd">
          <v-icon icon="camera" />
          Upload photo
        </b-button>
      </b-col>
    </b-row>
    <b-row v-if="uploading">
      <b-col>
        <OurFilePond
          class="bg-white"
          imgtype="Noticeboard"
          imgflag="noticeboard"
          @photo-processed="photoProcessed"
        />
      </b-col>
    </b-row>
    <div v-if="image" class="container mt-4 mb-4">
      <div
        class="clickme rotateleft stacked"
        label="Rotate left"
        title="Rotate left"
        @click="rotateLeft"
      >
        <v-icon icon="circle" size="2x" />
        <v-icon icon="reply" class="ml-2" />
      </div>
      <div
        label="Rotate right"
        class="rotateright clickme stacked"
        title="Rotate right"
        @click="rotateRight"
      >
        <v-icon icon="circle" size="2x" />
        <v-icon icon="reply" flip="horizontal" />
      </div>
      <div class="image">
        <b-img v-if="image" fluid :src="image.paththumb + '?' + cacheBust" />
        <b-img v-else width="250" thumbnail src="/placeholder.jpg" />
      </div>
    </div>
    <b-form-textarea
      v-model="description"
      rows="5"
      max-rows="8"
      placeholder="Anything else we need to know?  Need to ask permission? If it's locked, how do you get access?"
      class="mb-2"
    />
    <b-form-checkbox v-model="active">
      <span class="text-muted"> This noticeboard is active </span>
    </b-form-checkbox>
    <template #footer>
      <b-button variant="white" @click="hide"> Cancel</b-button>
      <SpinButton
        icon-name="save"
        label="Save details"
        variant="primary"
        @handle="submit"
      />
    </template>
  </b-modal>
</template>
<script>
import { useImageStore } from '../stores/image'
import SpinButton from '~/components/SpinButton'
import { useNoticeboardStore } from '~/stores/noticeboard'
import { useModal } from '~/composables/useModal'

const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)
const DraggableMap = defineAsyncComponent(() =>
  import('~/components/DraggableMap')
)
const OurFilePond = defineAsyncComponent(() =>
  import('~/components/OurFilePond')
)

export default {
  components: {
    DraggableMap,
    NoticeMessage,
    SpinButton,
    OurFilePond,
  },
  emits: ['hidden'],
  setup() {
    const noticeboardStore = useNoticeboardStore()
    const imageStore = useImageStore()

    const { modal, hide } = useModal()

    return {
      noticeboardStore,
      imageStore,
      modal,
      hide,
    }
  },
  data() {
    return {
      name: null,
      description: null,
      loaded: false,
      active: true,
      uploading: false,
      cacheBust: Date.now(),
      image: null,
    }
  },
  methods: {
    async submit(callback) {
      if (this.name) {
        const cent = this.$refs.map.getCenter()

        if (cent?.lat || cent?.lng) {
          // There's a server oddity which means we need to add this and then edit in the name/description.
          const id = await this.noticeboardStore.add(
            cent.lat,
            cent.lng,
            this.active
          )

          if (id) {
            await this.noticeboardStore.edit(
              id,
              this.name,
              this.description,
              this.active,
              this.image?.id
            )

            this.name = null
            this.description = null
          }

          this.hide()
        }
      }
      callback()
    },
    shown() {
      this.loaded = true
    },
    hidden() {
      this.loaded = false
      this.$emit('hidden')
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // processed callback below.
      this.uploading = true
    },
    photoProcessed(imageid, imagethumb, image, ocr) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      this.image = {
        id: imageid,
        path: image,
        paththumb: imagethumb,
      }
    },
    async rotate(deg) {
      await this.imageStore.post({
        id: this.image.id,
        rotate: deg,
        bust: Date.now(),
        noticeboard: true,
      })

      this.cacheBust = Date.now()
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
.container {
  display: grid;
  grid-template-columns: 32px 250px 32px;
  justify-content: start;
}

.rotateleft {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  z-index: 10000;
}

.rotateright {
  grid-row: 1 / 2;
  grid-column: 3 / 4;
  z-index: 10000;
}

.image {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
}

.image__icon {
  color: $color-white;

  &.fa-flip-horizontal {
    transform: translate(-1.5em, -0.5em) scaleX(-1);
  }
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
