<template>
  <b-modal
    ref="modal"
    scrollable
    :title="thankyou ? 'Thank you!' : 'Your Story'"
    size="lg"
    no-stacking
    @shown="onShow"
  >
    <template #default>
      <div v-if="thankyou">
        <p>We're grateful that you've taken the time. Happy freegling!</p>
      </div>
      <div v-else>
        <b-row>
          <b-col>
            <p>First, please could we have a quick summary?</p>
            <b-form-input
              v-model="story.headline"
              spellcheck="true"
              maxlength="140"
              placeholder="Give us a soundbite!"
              class="mb-1"
            />
            <h3>Your story</h3>
            <p>Ok, now tell us why you freegle!</p>
            <b-form-textarea
              v-model="story.story"
              spellcheck="true"
              rows="5"
              class="mb-1"
              placeholder="What have you given, what have you received, how does it feel, who have you met...?"
            />
            <h3>Add a photo</h3>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <p>
              If you like, you can add a photo. It's nice to see people and what
              they've freegled. Take a selfie!
            </p>
            <b-button
              variant="secondary"
              size="lg"
              class="mt-1 mb-1"
              @click="photoAdd"
            >
              <v-icon icon="camera" /> Add a photo
            </b-button>
          </b-col>
        </b-row>
        <b-row v-if="uploading">
          <b-col>
            <OurUploader v-model="currentAtts" class="bg-white" type="Story" />
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12">
            <div class="mt-2">
              <div v-if="story.image" class="container p-0">
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
                    v-if="story.image?.ouruid"
                    fit="cover"
                    format="webp"
                    :src="story.image.ouruid"
                    :modifiers="story.image.imagemods"
                    alt="Store Photo"
                    width="250"
                  />
                  <NuxtPicture
                    v-else-if="story.image"
                    fit="cover"
                    format="webp"
                    provider="uploadcare"
                    :src="story.image.imageuid"
                    :modifiers="story.image.imagemods"
                    alt="Store Photo"
                    width="250"
                  />
                  <b-img v-else thumbnail width="250" src="/placeholder.jpg" />
                </div>
              </div>
            </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <NoticeMessage variant="info">
              We may share your story - on here, on social media and so on. This
              helps get more people freegling. We won't use your name or email
              address.
            </NoticeMessage>
          </b-col>
        </b-row>
      </div>
    </template>
    <template #footer>
      <div v-if="thankyou">
        <b-button variant="white" :disabled="uploadingPhoto" @click="hide">
          Close
        </b-button>
      </div>
      <div v-else>
        <b-button
          variant="white"
          :disabled="uploadingPhoto"
          class="mr-2"
          @click="hide"
        >
          Cancel
        </b-button>
        <b-button variant="primary" :disabled="uploadingPhoto" @click="submit">
          Add Your Story
        </b-button>
      </div>
    </template>
  </b-modal>
</template>
<script>
import { useStoryStore } from '../stores/stories'
import { useComposeStore } from '../stores/compose'
import NoticeMessage from './NoticeMessage'
import { useOurModal } from '~/composables/useOurModal'
const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)

export default {
  components: {
    NoticeMessage,
    OurUploader,
  },
  props: {},
  setup() {
    const storyStore = useStoryStore()
    const composeStore = useComposeStore()

    const { modal, hide } = useOurModal()

    return {
      storyStore,
      composeStore,
      modal,
      hide,
    }
  },
  data() {
    return {
      uploading: false,
      story: {
        headline: null,
        story: null,
        photo: null,
      },
      thankyou: false,
      currentAtts: [],
    }
  },
  computed: {
    uploadingPhoto() {
      return this.composeStore?.uploading
    },
  },
  watch: {
    currentAtts: {
      handler(newVal) {
        this.uploading = false

        this.story.image = {
          id: newVal[0].id,
          imageuid: newVal[0].externaluid,
          imagemods: newVal[0].externalmods,
        }
      },
      deep: true,
    },
  },
  methods: {
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // processed callback below.
      this.uploading = true
    },
    async rotate(deg) {
      const curr = this.story?.image?.imagemods?.rotate || 0
      this.story.image.imagemods.rotate = curr + deg

      // Ensure between 0 and 360
      this.story.image.imagemods.rotate =
        (this.story.image.imagemods.rotate + 360) % 360

      await this.imageStore.post({
        id: this.story.image.id,
        rotate: this.story.image.imagemods.rotate,
        bust: Date.now(),
        story: true,
      })
    },
    rotateLeft() {
      this.rotate(90)
    },
    rotateRight() {
      this.rotate(-90)
    },
    onShow() {
      this.thankyou = false
      this.story.headline = null
      this.story.story = null
      this.story.image = null
    },
    async submit() {
      if (this.story.headline && this.story.story) {
        await this.storyStore.add(
          this.story.headline,
          this.story.story,
          this.story.image ? this.story.image.id : null,
          true
        )

        this.thankyou = true
      }
    },
  },
}
</script>
<style scoped lang="scss">
.field {
  font-weight: bold;
  color: $color-green--darker;
}

label {
  font-weight: bold;
  color: $color-green--darker;
  margin-top: 10px;
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
