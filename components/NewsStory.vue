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
              :width="200"
              :height="200"
              class="clickme float-end ml-2"
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
              :width="200"
              :height="200"
              class="clickme float-end ml-2"
              @click="showPhotoModal"
            />
            <b-img
              v-else-if="story?.image"
              thumbnail
              rounded
              lazy
              :width="200"
              :height="200"
              :src="story.image.paththumb"
              class="clickme float-end ml-2"
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
<script>
import { useStoryStore } from '../stores/stories'
import { useNewsfeedStore } from '../stores/newsfeed'
import ReadMore from '~/components/ReadMore'
import { twem } from '~/composables/useTwem'
import NewsBase from '~/components/NewsBase'

import NewsUserIntro from '~/components/NewsUserIntro'
import NewsLoveComment from '~/components/NewsLoveComment'
const NewsPhotoModal = defineAsyncComponent(() =>
  import('~/components/NewsPhotoModal')
)
const StoryAddModal = defineAsyncComponent(() =>
  import('~/components/StoryAddModal')
)
const StoryShareModal = defineAsyncComponent(() =>
  import('~/components/StoryShareModal')
)

export default {
  components: {
    NewsPhotoModal,
    NewsUserIntro,
    NewsLoveComment,
    ReadMore,
    StoryAddModal,
    StoryShareModal,
  },
  extends: NewsBase,
  async setup(props) {
    const storyStore = useStoryStore()
    const newsfeedStore = useNewsfeedStore()

    const newsfeed = newsfeedStore.byId(props.id)
    await storyStore.fetch(newsfeed.storyid)

    return {
      storyStore,
    }
  },
  data() {
    return {
      showAdd: false,
    }
  },
  computed: {
    story() {
      return this.storyStore?.byId(this.newsfeed?.storyid)
    },
    body() {
      let story = twem(this.story?.story)
      story = story?.trim()
      return story
    },
    headline() {
      return this.story?.headline
    },
  },
  methods: {
    showAddModal() {
      this.showAdd = true
    },
  },
}
</script>
