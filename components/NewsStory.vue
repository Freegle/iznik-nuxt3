<template>
  <div>
    <NewsUserIntro
      v-if="userid"
      :userid="userid"
      :newsfeed="newsfeed"
      append="told their Freegle story"
    />
    <b-row>
      <b-col>
        <b-card no-body>
          <b-card-header
            class="font-weight-bold"
            bg-variant="primary"
            text-variant="white"
          >
            {{ headline }}
          </b-card-header>
          <b-card-text class="p-2 preline">
            <OurUploadedImage
              v-if="story?.image?.ouruid"
              :src="story?.image?.ouruid"
              :modifiers="story?.image?.externalmods"
              alt="Freegler Story Photo"
              sizes="100vw md:200px"
              class="clickme story-image"
              @click="showPhotoModal"
            />
            <NuxtPicture
              v-else-if="story?.image?.externaluid"
              fit="cover"
              format="webp"
              provider="uploadcare"
              :src="story?.image?.externaluid"
              :modifiers="story?.image?.externalmods"
              alt="Freegler Story Photo"
              sizes="100vw md:200px"
              class="clickme story-image"
              @click="showPhotoModal"
            />
            <b-img
              v-else-if="story?.image"
              thumbnail
              rounded
              lazy
              :src="story.image.paththumb"
              class="clickme story-image"
              @click="showPhotoModal"
            />
            <read-more
              v-if="body"
              :text="body"
              :max-chars="500"
              class="font-weight-bold preline forcebreak nopara"
            />
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
    <div class="mt-2 d-flex flex-wrap justify-content-between">
      <NewsLoveComment
        :newsfeed="newsfeed"
        @focus-comment="$emit('focus-comment')"
      />
      <div>
        <b-button
          variant="link"
          size="sm"
          class="d-inline-block mr-1"
          @click="share"
        >
          <v-icon icon="share-alt" /><span class="d-none d-inline-block-md">
            Share</span
          >
        </b-button>
        <b-button variant="secondary" to="/stories" size="sm" class="mr-1">
          <v-icon icon="book-open" class="mr-1" />
          <span class="d-none d-inline-block-md">More stories</span>
          <span class="d-inline-block d-none-md">More</span>
        </b-button>
        <b-button variant="primary" size="sm" @click="showAddModal">
          <v-icon icon="book-open" class="mr-1" />
          <span class="d-none d-inline-block-md">Tell your story!</span>
          <span class="d-inline-block d-none-md">Tell yours</span>
        </b-button>
      </div>
    </div>
    <NewsPhotoModal
      v-if="showNewsPhotoModal && story?.image"
      :id="story.image.id"
      :newsfeedid="newsfeed.id"
      :src="story.image.path"
      imgtype="Story"
      imgflag="story"
      @hidden="showNewsPhotoModal = false"
    />
    <StoryAddModal v-if="showAdd" @hidden="showAdd = false" />
    <StoryShareModal
      v-if="showNewsShareModal"
      :id="newsfeed.storyid"
      @hidden="showNewsShareModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useStoryStore } from '~/stores/stories'
import { useNewsfeedStore } from '~/stores/newsfeed'
import ReadMore from '~/components/ReadMore'
import { twem } from '~/composables/useTwem'
import NewsUserIntro from '~/components/NewsUserIntro'
import NewsLoveComment from '~/components/NewsLoveComment'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

defineEmits(['focus-comment'])

// Define the variables that were supposed to be imported from NewsBase
const showNewsPhotoModal = ref(false)
const showNewsShareModal = ref(false)

const NewsPhotoModal = defineAsyncComponent(() =>
  import('~/components/NewsPhotoModal')
)
const StoryAddModal = defineAsyncComponent(() =>
  import('~/components/StoryAddModal')
)
const StoryShareModal = defineAsyncComponent(() =>
  import('~/components/StoryShareModal')
)

const storyStore = useStoryStore()
const newsfeedStore = useNewsfeedStore()

// Create a newsfeed reference
const newsfeed = computed(() => {
  return newsfeedStore.byId(props.id)
})

// Create a userid computed property
const userid = computed(() => {
  return newsfeed.value?.userid
})

// Fetch story data
try {
  await storyStore.fetch(newsfeed.value.storyid)
} catch (e) {
  console.log('Error fetching story:', e)
}

const showAdd = ref(false)

const story = computed(() => {
  return storyStore?.byId(newsfeed.value?.storyid)
})

const body = computed(() => {
  let storyText = twem(story.value?.story)
  storyText = storyText?.trim()
  return storyText
})

const headline = computed(() => {
  return story.value?.headline
})

// Re-implement the functions from NewsBase
function share() {
  showNewsShareModal.value = true
}

function showPhotoModal() {
  showNewsPhotoModal.value = true
}

function showAddModal() {
  showAdd.value = true
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.story-image,
:deep(.story-image img) {
  width: 100%;
  margin-bottom: 0.5rem;

  @include media-breakpoint-up(md) {
    width: 200px;
    float: right;
    margin-left: 0.5rem;
    margin-bottom: 0;
  }
}
</style>
