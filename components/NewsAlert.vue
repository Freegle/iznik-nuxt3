<template>
  <div>
    <div class="d-flex">
      <ProfileImage
        image="/icon.png"
        class="ml-1 mb-1 inline"
        is-thumbnail
        size="lg"
      />
      <div>
        <span class="text-success font-weight-bold pl-2"> Freegle </span>
        <br />
        <span class="text-muted small pl-2">
          {{ timeago(newsfeed.added) }}
        </span>
      </div>
    </div>
    <!-- eslint-disable-next-line-->
    <div v-if="newsfeed.html" v-html="newsfeed.html" />
    <!-- eslint-disable-next-line-->
    <div
      v-else-if="newsfeed.message"
      class="font-weight-bold preline forcebreak"
      v-html="emessage"
    />
    <div>
      <b-img
        v-if="newsfeed.image"
        rounded
        lazy
        :src="newsfeed.image.paththumb"
        class="clickme imgthumb mt-1"
        @click="showPhotoModal"
      />
    </div>
    <div class="mt-2 d-flex flex-wrap justify-content-between">
      <NewsLoveComment
        :newsfeed="newsfeed"
        @focus-comment="$emit('focus-comment')"
      />
      <b-button variant="link" class="d-inline-block" size="sm" @click="share">
        <v-icon icon="share-alt" /> Share
      </b-button>
    </div>
    <NewsPhotoModal
      v-if="showNewsPhotoModal && newsfeed.image"
      :id="newsfeed.image.id"
      :newsfeedid="newsfeed.id"
      :src="newsfeed.image.path"
      imgtype="Newsfeed"
      imgflag="Newsfeed"
      @hidden="showNewsPhotoModal = false"
    />
    <NewsShareModal
      v-if="showNewsShareModal"
      :newsfeed="newsfeed"
      @hidden="showNewsShareModal = false"
    />
  </div>
</template>

<script>
import NewsBase from '~/components/NewsBase'
import NewsLoveComment from '~/components/NewsLoveComment'
import ProfileImage from '~/components/ProfileImage'
const NewsShareModal = defineAsyncComponent(() =>
  import('~/components/NewsShareModal')
)
const NewsPhotoModal = defineAsyncComponent(() =>
  import('~/components/NewsPhotoModal.vue')
)

export default {
  components: {
    NewsShareModal,
    NewsLoveComment,
    ProfileImage,
    NewsPhotoModal,
  },
  extends: NewsBase,
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.imgthumb {
  width: 100%;

  @include media-breakpoint-up(md) {
    width: 400px;
  }
}
</style>
