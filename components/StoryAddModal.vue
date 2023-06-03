<template>
  <b-modal
    id="storyaddemodal"
    v-model="showModal"
    :title="thankyou ? 'Thank you!' : 'Your Story'"
    size="lg"
    no-stacking
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
            <OurFilePond
              class="bg-white"
              imgtype="Story"
              imgflag="story"
              @photo-processed="photoProcessed"
            />
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
                  <b-img
                    v-if="story.image"
                    thumbnail
                    :src="story.image.paththumb + '?' + cacheBust"
                  />
                  <b-img v-else thumbnail width="250" src="/placeholder.jpg" />
                </div>
              </div>
            </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <h3 class="mt-2">Can we share?</h3>
            <p>
              Finally, click to let us know whether it's ok for us to share your
              story - on here, on social media and so on. This helps get more
              people freegling. We won't use your name or email address.
            </p>
            <p>
              If you don't want us to do this, that's fine - we'll just show it
              to your local volunteers.
            </p>
            <div class="bg-info text-center p-2">
              <b-form-radio-group v-model="allowpublic">
                <b-form-radio name="allowpublic" value="1">
                  Yes, you can share this
                </b-form-radio>
                <b-form-radio name="allowpublic" value="0">
                  No, keep it private
                </b-form-radio>
              </b-form-radio-group>
            </div>
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
import modal from '@/mixins/modal'
const OurFilePond = () => import('~/components/OurFilePond')

export default {
  components: {
    OurFilePond,
  },
  mixins: [modal],
  props: {},
  setup() {
    const storyStore = useStoryStore()
    const composeStore = useComposeStore()

    return {
      storyStore,
      composeStore,
    }
  },
  data() {
    return {
      allowpublic: 0,
      uploading: false,
      story: {
        headline: null,
        story: null,
        photo: null,
      },
      cacheBust: Date.now(),
      thankyou: false,
    }
  },
  computed: {
    uploadingPhoto() {
      return this.composeStore?.uploading
    },
  },
  methods: {
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // processed callback below.
      this.uploading = true
    },
    photoProcessed(imageid, imagethumb, image) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      this.story.image = {
        id: imageid,
        path: image,
        paththumb: imagethumb,
      }
    },
    async rotate(deg) {
      await this.imageStore.post({
        id: this.event.image.id,
        rotate: deg,
        bust: Date.now(),
        story: true,
      })

      this.cacheBust = Date.now()
    },
    rotateLeft() {
      this.rotate(90)
    },
    rotateRight() {
      this.rotate(-90)
    },
    show(type) {
      this.thankyou = false
      this.story.headline = null
      this.story.story = null
      this.story.image = null
      this.showModal = true
    },
    async submit() {
      if (this.story.headline && this.story.story) {
        await this.storyStore.add(
          this.story.headline,
          this.story.story,
          this.story.image ? this.story.image.id : null,
          this.allowpublic
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
