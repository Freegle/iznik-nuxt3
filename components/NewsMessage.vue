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
      <NuxtPicture
        v-if="newsfeed.image?.externaluid"
        format="webp"
        fit="cover"
        provider="uploadcare"
        :src="newsfeed.image.externaluid"
        :modifiers="newsfeed.image?.externalmod"
        alt="ChitChat Image"
        sizes="100vw md:400px"
        :height="400"
        class="imgthumb"
      />
      <b-img
        v-else-if="newsfeed.image"
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
import { useMiscStore } from '~/stores/misc'
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
  computed: {
    width() {
      const miscStore = useMiscStore()

      if (miscStore.breakpoint === 'xs' || miscStore.breakpoint === 'sm') {
        // Full width image.
        return process.server ? 400 : window.innerHeight
      } else {
        // 400px width image.
        return 400
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.imgthumb,
:deep(.imgthumb img) {
  width: 100%;
  object-fit: cover;

  @include media-breakpoint-up(md) {
    width: 400px;
  }
}
</style>
