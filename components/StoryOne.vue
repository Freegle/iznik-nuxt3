<template>
  <div>
    <b-card no-body variant="success">
      <b-card-header>
        <div class="d-flex justify-content-between">
          <div>&quot;{{ story.headline }}&quot;</div>
          <div>
            <span v-if="story.likes">
              <v-icon icon="heart" class="fa-fw mr-2" /> {{ story.likes }}
            </span>
            <b-button
              v-if="loggedIn && !story.liked"
              variant="secondary"
              class="mr-2"
              @click="love"
            >
              <v-icon icon="heart" class="fa-fw" /><span
                class="d-none d-sm-inline"
                >&nbsp;Love this</span
              >
            </b-button>
            <b-button
              v-if="loggedIn && story.liked"
              variant="secondary"
              class="mr-2"
              @click="unlove"
            >
              <v-icon icon="heart" class="text-danger fa-fw" /><span
                class="d-none d-sm-inline"
                >&nbsp;Unlove this</span
              >
            </b-button>
            <b-button variant="secondary" class="mr-2" @click="share(story)">
              <v-icon icon="share-alt" class="fa-fw" />
            </b-button>
          </div>
        </div>
      </b-card-header>
      <b-card-body>
        <b-card-text class="pl-4 pr-4">
          <div v-if="story.story" class="preline">
            <div v-if="story.image" class="float-right">
              <b-img
                lazy
                :src="story.image.path"
                class="storyphoto clickme"
                thumbnail
                @click="showPhotoModal = true"
              />
              <br />
            </div>
            <read-more
              v-if="story.story"
              :text="story.story"
              :max-chars="300"
            />
          </div>
          <div class="text-muted small d-flex justify-content-between">
            <span>
              {{ timeago(story.date) }}
              <span v-if="user?.displayname"> by {{ user.displayname }}</span>
              <span v-if="userLocation?.display">
                in {{ userLocation.display }}
              </span>
              <span v-else-if="userLocation.groupname">
                {{ publicLocation.groupname }}
              </span>
            </span>
            <nuxt-link
              no-prefetch
              :to="'/story/' + story.id"
              class="text-muted nodecor"
            >
              #{{ story.id }}
            </nuxt-link>
          </div>
        </b-card-text>
      </b-card-body>
    </b-card>
    <b-modal
      v-if="story.image"
      ref="photoModal"
      v-model="showPhotoModal"
      title="Story Photo"
      generator-unable-to-provide-required-alt=""
      size="lg"
      no-stacking
      ok-only
    >
      <template #default>
        <b-img fluid rounded center :src="story.image.path" />
      </template>
    </b-modal>
    <StoryShareModal v-if="showShare" :id="id" ref="share" />
  </div>
</template>
<script>
import ReadMore from 'vue-read-more3/src/ReadMoreComponent'
import { useStoryStore } from '../stores/stories'
import { useUserStore } from '../stores/user'
import StoryShareModal from '~/components/StoryShareModal'

export default {
  components: {
    StoryShareModal,
    ReadMore,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const storyStore = useStoryStore()
    const userStore = useUserStore()

    const story = await storyStore.fetch(props.id)
    const user = await userStore.fetch(story.userid)
    const userLocation = await userStore.fetchPublicLocation(story.userid)

    return {
      storyStore,
      userStore,
      story,
      user,
      userLocation,
    }
  },
  data() {
    return {
      showShare: false,
      showPhotoModal: false,
    }
  },
  methods: {
    async share(story) {
      this.showShare = true
      await this.waitForRef('share')
      this.$refs.share.show()
    },
    async love() {
      await this.storyStore.love(this.id)
    },
    async unlove() {
      await this.storyStore.unlove(this.id)
    },
  },
}
</script>
<style scoped>
.storyphoto {
  max-height: 250px !important;
  max-width: 250px !important;
}
</style>
