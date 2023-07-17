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
        <b-card variant="success" no-body>
          <b-card-header class="font-weight-bold">
            {{ headline }}
          </b-card-header>
          <b-card-text class="p-2 preline">
            <b-img
              v-if="story?.image"
              thumbnail
              rounded
              lazy
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
          @click="shareStory"
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
      v-if="story?.image"
      :id="story.image.id"
      ref="photoModal"
      :newsfeedid="newsfeed.id"
      :src="story.image.path"
      imgtype="Story"
      imgflag="story"
    />
    <StoryAddModal v-if="showAdd" ref="addmodal" />
    <StoryShareModal v-if="showShare" :id="newsfeed.storyid" ref="share" />
  </div>
</template>
<script>
import ReadMore from 'vue-read-more3/src/ReadMoreComponent'
import { useStoryStore } from '../stores/stories'
import { useNewsfeedStore } from '../stores/newsfeed'
import { twem } from '~/composables/useTwem'
import NewsBase from '~/components/NewsBase'

import NewsUserIntro from '~/components/NewsUserIntro'
import NewsLoveComment from '~/components/NewsLoveComment'
import NewsPhotoModal from '~/components/NewsPhotoModal'
const StoryAddModal = () => import('~/components/StoryAddModal')
const StoryShareModal = () => import('~/components/StoryShareModal')

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
      showShare: false,
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
    async showAddModal() {
      this.showAdd = true
      await this.waitForRef('addmodal')
      this.$refs.addmodal.show()
    },
    async shareStory() {
      this.showShare = true
      await this.waitForRef('share')
      this.$refs.share.show()
    },
  },
}
</script>
