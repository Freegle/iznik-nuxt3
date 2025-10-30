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
    <b-row v-if="uploading">
      <b-col>
        <OurUploader
          v-model="currentAtts"
          class="bg-white"
          type="Noticeboard"
        />
      </b-col>
    </b-row>
    <b-row v-else>
      <b-col>
        <b-button variant="primary" class="mt-1 mb-2" @click="photoAdd">
          <v-icon icon="camera" />
          Upload photo
        </b-button>
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
        <OurUploadedImage
          v-if="image?.ouruid"
          :src="image.ouruid"
          :modifiers="image.imagemods"
          alt="Poster Photo"
          width="250"
        />
        <NuxtPicture
          v-else-if="image?.imageuid"
          fit="cover"
          format="webp"
          provider="uploadcare"
          :src="image.imageuid"
          :modifiers="image.imagemods"
          alt="Poster Photo"
          width="250"
        />
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
<script setup>
import { ref, watch, defineAsyncComponent } from 'vue'
import { useImageStore } from '~/stores/image'
import SpinButton from '~/components/SpinButton'
import { useNoticeboardStore } from '~/stores/noticeboard'
import { useOurModal } from '~/composables/useOurModal'

const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)
const DraggableMap = defineAsyncComponent(() =>
  import('~/components/DraggableMap')
)
const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)

const emit = defineEmits(['hidden'])

// Store instances
const noticeboardStore = useNoticeboardStore()
const imageStore = useImageStore()

// Modal control
const { modal, hide } = useOurModal()

// Component refs
const map = ref(null)

// Reactive state
const name = ref(null)
const description = ref(null)
const loaded = ref(false)
const active = ref(true)
const uploading = ref(false)
const image = ref(null)
const currentAtts = ref([])

// Watchers
watch(
  currentAtts,
  (newVal) => {
    if (newVal?.length) {
      uploading.value = false

      image.value = {
        id: newVal[0].id,
        imageuid: newVal[0].ouruid,
        imagemods: newVal[0].externalmods,
      }
    }
  },
  { deep: true }
)

// Methods
async function submit(callback) {
  if (name.value) {
    const cent = map.value.getCenter()

    if (cent?.lat || cent?.lng) {
      // There's a server oddity which means we need to add this and then edit in the name/description.
      const id = await noticeboardStore.add(cent.lat, cent.lng, active.value)

      if (id) {
        await noticeboardStore.edit(
          id,
          name.value,
          description.value,
          active.value,
          image.value?.id
        )

        name.value = null
        description.value = null
      }

      hide()
    }
  }
  callback()
}

function shown() {
  loaded.value = true
}

function hidden() {
  loaded.value = false
  emit('hidden')
}

function photoAdd() {
  // Flag that we're uploading. This will trigger the render of the filepond instance and subsequently the
  // processed callback below.
  uploading.value = true
}

async function rotate(deg) {
  const curr = image.value?.imagemods?.rotate || 0
  image.value.imagemods.rotate = curr + deg

  // Ensure between 0 and 360
  image.value.imagemods.rotate = (image.value.imagemods.rotate + 360) % 360

  await imageStore.post({
    id: image.value.id,
    rotate: image.value.imagemods.rotate,
    bust: Date.now(),
    noticeboard: true,
  })
}

function rotateLeft() {
  rotate(-90)
}

function rotateRight() {
  rotate(90)
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
