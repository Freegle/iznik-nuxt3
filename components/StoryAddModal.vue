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
              placeholder="Give us a summary!"
              class="mb-1"
              :class="{
                'is-invalid': noHeadline,
              }"
            />
            <h3>Your story</h3>
            <p>Ok, now tell us why you freegle!</p>
            <b-form-textarea
              v-model="story.story"
              spellcheck="true"
              rows="5"
              class="mb-1"
              :class="{
                'is-invalid': noStory,
              }"
              placeholder="What have you given, what have you received, how does it feel, who have you met...?"
            />
            <h3>Please add a photo</h3>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <p>
              Photos are option but help make a story more engaging. It's nice
              to see people and what they've freegled, or just take a selfie!
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
                    v-if="story.image?.imageuid"
                    :src="story.image.imageuid"
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
              helps get more people freegling. We won't use your email address.
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
<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useStoryStore } from '~/stores/stories'
import { useComposeStore } from '~/stores/compose'
import NoticeMessage from './NoticeMessage'
import { useOurModal } from '~/composables/useOurModal'
import { useImageStore } from '~/stores/image'

const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)

// Store instances
const storyStore = useStoryStore()
const composeStore = useComposeStore()
const imageStore = useImageStore()

// Modal control
const { modal, hide } = useOurModal()

// Reactive state
const uploading = ref(false)
const story = ref({
  headline: null,
  story: null,
  photo: null,
  image: null,
})
const thankyou = ref(false)
const currentAtts = ref([])
const noHeadline = ref(false)
const noStory = ref(false)

// Computed properties
const uploadingPhoto = computed(() => {
  return composeStore?.uploading
})

// Watchers
watch(
  currentAtts,
  (newVal) => {
    if (newVal?.length) {
      uploading.value = false

      story.value.image = {
        id: newVal[0].id,
        imageuid: newVal[0].ouruid,
        imagemods: newVal[0].externalmods,
      }
    }
  },
  { deep: true }
)

// Methods
function photoAdd() {
  // Flag that we're uploading. This will trigger the render of the filepond instance and subsequently the
  // processed callback below.
  uploading.value = true
}

async function rotate(deg) {
  const curr = story.value?.image?.imagemods?.rotate || 0
  story.value.image.imagemods.rotate = curr + deg

  // Ensure between 0 and 360
  story.value.image.imagemods.rotate =
    (story.value.image.imagemods.rotate + 360) % 360

  await imageStore.post({
    id: story.value.image.id,
    rotate: story.value.image.imagemods.rotate,
    bust: Date.now(),
    story: true,
  })
}

function rotateLeft() {
  rotate(-90)
}

function rotateRight() {
  rotate(90)
}

function onShow() {
  thankyou.value = false
  story.value.headline = null
  story.value.story = null
  story.value.image = null
}

async function submit() {
  noHeadline.value = false
  noStory.value = false

  if (story.value.headline && story.value.story) {
    await storyStore.add(
      story.value.headline,
      story.value.story,
      story.value.image ? story.value.image.id : null,
      true
    )

    thankyou.value = true
  } else {
    if (!story.value.headline) {
      noHeadline.value = true
    }

    if (!story.value.story) {
      noStory.value = true
    }
  }
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
