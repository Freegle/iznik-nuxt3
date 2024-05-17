<template>
  <div>
    <NewsUserIntro v-if="userid" :userid="userid" :newsfeed="newsfeed" />
    <!-- eslint-disable-next-line-->
    <div v-if="newsfeed.html" v-html="newsfeed.html" />
    <read-more
      v-else-if="newsfeed.message && emessage"
      :text="emessage"
      :max-chars="512"
      class="font-weight-bold preline forcebreak nopara"
    />
    <div>
      <b-img
        v-if="newsfeed.image"
        lazy
        rounded
        :src="newsfeed.image.path"
        class="clickme imgthumb mt-1"
        @click="showNewsPhotoModal = true"
      />
    </div>
    <div class="mt-2 d-flex justify-content-between">
      <NewsLoveComment
        :newsfeed="newsfeed"
        @focus-comment="$emit('focus-comment')"
      />
      <div class="d-flex flex-wrap">
        <ChatButton
          :userid="newsfeed.userid"
          title="Message"
          size="sm"
          variant="link"
          class="align-self-baseline"
          btn-class="ms-0 me-0 ps-0"
        />
        <div>
          <b-button
            variant="link"
            class="d-inline-block ms-0 me-0 ps-0 pe-0"
            size="sm"
            @click="share"
          >
            <v-icon icon="share-alt" /> Share
          </b-button>
        </div>
      </div>
    </div>
    <b-modal
      v-if="showNewsPhotoModal && newsfeed.image"
      v-model="showNewsPhotoModal"
      scrollable
      title="ChitChat photo"
      generator-unable-to-provide-required-alt=""
      size="lg"
      no-stacking
      hide-footer
      @hidden="showNewsPhotoModal = false"
    >
      <template #default>
        <b-img fluid rounded center :src="newsfeed.image.path" />
      </template>
    </b-modal>
    <NewsShareModal
      v-if="showNewsShareModal"
      :newsfeed="newsfeed"
      @hidden="showNewsShareModal = false"
    />
  </div>
</template>
<script>
import ChatButton from './ChatButton'
import ReadMore from '~/components/ReadMore'
import NewsBase from '~/components/NewsBase'
import NewsUserIntro from '~/components/NewsUserIntro'

import NewsLoveComment from '~/components/NewsLoveComment'
const NewsShareModal = defineAsyncComponent(() =>
  import('~/components/NewsShareModal')
)

export default {
  components: {
    ChatButton,
    NewsShareModal,
    NewsUserIntro,
    NewsLoveComment,
    ReadMore,
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
