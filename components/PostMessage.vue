<template>
  <div>
    <client-only>
      <div class="d-flex flex-wrap">
        <div
          class="photoholder bg-light d-flex flex-column align-items-center justify-items-center mr-1"
        >
          <v-icon icon="camera" class="fa-8-75x text-faded" />
          <b-button
            variant="primary"
            size="lg"
            :class="{
              'ml-3': true,
              'mr-3': true,
              invisible: uploading && hidingPhotoButton,
            }"
            @click="photoAdd"
            @drop.prevent="drop"
            @dragover.prevent
          >
            <span v-if="attachments && attachments.length === 1">
              Add more photos
            </span>
            <span v-else> Add photos </span>
          </b-button>
        </div>
        <div
          v-for="att in attachments"
          :key="'image-' + att.id"
          class="bg-transparent p-0"
        >
          <PostPhoto v-bind="att" class="mr-1" @remove="removePhoto" />
        </div>
        <hr />
      </div>
      <div v-if="uploading" class="bg-white">
        <OurFilePond
          ref="filepond"
          imgtype="Message"
          imgflag="message"
          :identify="true"
          :browse="pondBrowse"
          :multiple="true"
          @photoProcessed="photoProcessed"
          @allProcessed="allProcessed"
          @init="hidePhotoButton"
        />
      </div>
      <div class="subject-layout mb-1 mt-1">
        <div class="d-flex flex-column">
          <label :for="$id('posttype')" class="pl-1"> Type</label>
          <b-form-input
            :id="$id('posttype')"
            :model-value="type"
            disabled
            class="type text-uppercase bg-white mt-1"
            size="lg"
          />
        </div>
        <PostItem :id="id" ref="item" :type="type" class="item pt-1" />
        <NumberIncrementDecrement
          v-if="type === 'Offer'"
          v-model="availablenow"
          label="Quantity"
          append-text=" available"
          class="count pt-1"
        />
      </div>
      <div class="d-flex flex-column mt-2">
        <label :for="$id('description')">Please give a few details:</label>
        <b-form-textarea
          :id="$id('description')"
          v-model="description"
          :placeholder="placeholder"
          rows="8"
        />
      </div>
    </client-only>
  </div>
</template>
<script>
import { uid } from '../composables/useId'
import { useComposeStore } from '../stores/compose'
import { useMessageStore } from '../stores/message'
import NumberIncrementDecrement from './NumberIncrementDecrement'
const OurFilePond = () => import('~/components/OurFilePond')
const PostPhoto = () => import('~/components/PostPhoto')
const PostItem = () => import('~/components/PostItem')

export default {
  components: {
    NumberIncrementDecrement,
    OurFilePond,
    PostPhoto,
    PostItem,
  },
  props: {
    id: {
      type: Number,
      required: false,
      default: null,
    },
    type: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const composeStore = useComposeStore()
    const messageStore = useMessageStore()

    composeStore.setType({
      id: props.id,
      type: props.type,
    })

    return { composeStore, messageStore }
  },
  data() {
    return {
      uploading: false,
      myFiles: [],
      pondBrowse: true,
      hidingPhotoButton: false,
    }
  },
  computed: {
    availablenow: {
      get() {
        const msg = this.composeStore.message(this.id)
        return msg &&
          'availablenow' in msg &&
          typeof msg.availablenow !== 'undefined'
          ? msg.availablenow
          : 1
      },
      set(newValue) {
        this.composeStore.setAvailableNow(this.id, newValue)
      },
    },
    description: {
      get() {
        const msg = this.composeStore.message(this.id)
        return msg?.description
      },
      set(newValue) {
        this.composeStore.setDescription({
          id: this.id,
          description: newValue,
        })
      },
    },
    attachments() {
      return this.composeStore.attachments(this.id)
    },
    placeholder() {
      return this.type === 'Offer'
        ? "e.g. colour, condition, size, whether it's working etc."
        : "Explain what you're looking for, and why you'd like it."
    },
  },
  methods: {
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // init callback below.
      this.uploading = true
    },
    photoProcessed(imageid, imagethumb, image, ocr, suggestions) {
      // We have uploaded a photo.  Remove the filepond instance.
      const att = {
        id: imageid,
        paththumb: imagethumb,
        path: image,
      }

      this.composeStore.addAttachment({
        id: this.id,
        attachment: att,
      })
    },
    allProcessed() {
      this.uploading = false
    },
    removePhoto(id) {
      this.composeStore.removeAttachment({
        id: this.id,
        photoid: id,
      })
    },
    drop(e) {
      // Although it's probably not widely used (I didn't know it even worked) in the old code you could drag and drog
      // a file onto the Add photos button.  So we should handle that too here.
      const droppedFiles = e.dataTransfer.files

      if (!droppedFiles) {
        return
      }

      this.uploading = droppedFiles.length
      this.pondBrowse = false

      // Give pond time to render.
      this.waitForRef('filepond', () => {
        ;[...droppedFiles].forEach((f) => {
          this.$refs.filepond.addFile(f)
        })
      })
    },
    hidePhotoButton() {
      this.hidingPhotoButton = true
    },
    $id(type) {
      return uid(type)
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.subject-layout {
  display: grid;
  grid-template-columns: 1fr 50px 1fr;
  grid-template-rows: auto auto;
  grid-column-gap: 5px;

  @include media-breakpoint-up(md) {
    grid-template-columns: 1fr 3fr auto;
    grid-template-rows: auto;
  }

  .type {
    grid-column: 1 / 2;
    grid-row: 1 / 2;

    @include media-breakpoint-up(md) {
      grid-column: 1 / 2;
      grid-row: 1 / 2;
    }
  }

  .item {
    grid-column: 1 / 4;
    grid-row: 2 / 3;

    @include media-breakpoint-up(md) {
      grid-column: 2 / 3;
      grid-row: 1 / 2;
    }
  }

  .count {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    justify-self: end;

    @include media-breakpoint-up(md) {
      grid-column: 3 / 4;
      grid-row: 1 / 2;
    }
  }
}

.photoholder {
  width: 200px;
  height: 200px;
}
</style>
