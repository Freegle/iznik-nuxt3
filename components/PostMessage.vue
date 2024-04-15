<template>
  <div>
    <div class="d-flex flex-wrap">
      <draggable
        v-model="attachments"
        class="d-flex flex-wrap w-100"
        :item-key="(el) => `image-${el.id}`"
        :animation="150"
        ghost-class="ghost"
      >
        <template #header>
          <div
            class="photoholder bg-dark-subtle d-flex flex-column align-items-center justify-content-around mr-md-1"
          >
            <v-icon icon="camera" class="camera text-faded" />
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
              <span v-if="attachments?.length === 1"> Add more photos </span>
              <span v-else> Add photos </span>
            </b-button>
          </div>
        </template>
        <template #item="{ element, index }">
          <div class="bg-transparent p-0">
            <PostPhoto
              v-bind="element"
              :primary="index === 0"
              class="mr-1 mt-1 mt-md-0"
              @remove="removePhoto"
            />
          </div>
        </template>
      </draggable>
      <hr />
    </div>
    <div v-if="uploading" class="bg-white">
      <OurFilePond
        ref="filepond"
        imgtype="Message"
        imgflag="message"
        :browse="pondBrowse"
        :multiple="true"
        @photo-processed="photoProcessed"
        @all-processed="allProcessed"
        @init="hidePhotoButton"
        @error="photoError"
        @heicerror="heicError"
      />
    </div>
    <NoticeMessage v-if="heicFailed" variant="danger" class="mt-2 mb-2">
      <p>This is an HEIC file. We tried to process it but failed.</p>
      <p>
        Please convert it to JPG and try again. You can find instructions on how
        to do this
        <ExternalLink
          href="https://www.lifewire.com/convert-heic-to-jpg-on-iphone-5295695"
          >here</ExternalLink
        >.
      </p>
    </NoticeMessage>
    <NoticeMessage v-else-if="photoFailed" variant="danger" class="mt-2 mb-2">
      Photo upload failed. If this keeps happening, then please contact
      <SupportLink />, including the photo as an attachment.
    </NoticeMessage>
    <div class="subject-layout mb-1 mt-1">
      <div class="d-flex flex-column">
        <label :for="$id('posttype')" class="d-none d-md-block pl-1">
          Type</label
        >
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
        class="description"
      />
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import { uid } from '../composables/useId'
import { useComposeStore } from '../stores/compose'
import { useMessageStore } from '../stores/message'
import { useMiscStore } from '../stores/misc'
import NumberIncrementDecrement from './NumberIncrementDecrement'

const OurFilePond = defineAsyncComponent(() =>
  import('~/components/OurFilePond')
)
const PostPhoto = defineAsyncComponent(() => import('~/components/PostPhoto'))
const PostItem = defineAsyncComponent(() => import('~/components/PostItem'))

export default {
  components: {
    NumberIncrementDecrement,
    OurFilePond,
    PostPhoto,
    PostItem,
    draggable,
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
      photoFailed: false,
      heicFailed: false,
    }
  },
  computed: {
    breakpoint() {
      const store = useMiscStore()
      return store.getBreakpoint
    },
    availablenow: {
      get() {
        const msg = this.composeStore?.message(this.id)
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
        const msg = this.composeStore?.message(this.id)
        return msg?.description
      },
      set(newValue) {
        this.composeStore.setDescription({
          id: this.id,
          description: newValue,
        })
      },
    },
    attachments: {
      get() {
        return this.composeStore?.attachments(this.id)
      },
      set(value) {
        return this.composeStore?.setAttachmentsForMessage(this.id, value)
      },
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
      this.photoFailed = false
    },
    photoProcessed(imageid, imagethumb, image) {
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
    photoError(e) {
      this.photoFailed = true
    },
    heicError(e) {
      this.heicFailed = true
    },
    removePhoto(id) {
      this.composeStore.removeAttachment({
        id: this.id,
        photoid: id,
      })
    },
    async drop(e) {
      // Although it's probably not widely used (I didn't know it even worked) in the old code you could drag and drog
      // a file onto the Add photos button.  So we should handle that too here.
      const droppedFiles = e.dataTransfer.files

      if (!droppedFiles) {
        return
      }

      this.uploading = droppedFiles.length
      this.pondBrowse = false

      // Give pond time to render.
      await this.$nextTick()
      ;[...droppedFiles].forEach((f) => {
        this.$refs.filepond.addFile(f)
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
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

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
  min-height: max(100px, 15vh);
  max-height: min(300px, 25vh, 50%);
  width: 100%;

  svg {
    font-size: min(8.75rem, 7.5vh);
  }

  @include media-breakpoint-up(md) {
    width: 200px;
  }
}

.ghost {
  opacity: 0.5;
}

.description {
  min-height: max(100px, 15vh);
  max-height: min(300px, 25vh);
}

:deep(.count label) {
  display: none;

  @include media-breakpoint-up(md) {
    display: inline;
  }
}
</style>
