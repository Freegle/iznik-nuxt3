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
      <OurUploadedImage
        v-if="newsfeed.image?.ouruid"
        :src="newsfeed.image.ouruid"
        :modifiers="newsfeed.image?.externalmod"
        alt="ChitChat Image"
        sizes="100vw md:400px"
        class="imgthumb"
      />
      <NuxtPicture
        v-else-if="newsfeed.image?.externaluid"
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
        @focus-comment="emit('focus-comment')"
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
<script setup>
import { defineAsyncComponent, ref, computed } from 'vue'
import ChatButton from './ChatButton'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { twem } from '~/composables/useTwem'
import { URL_REGEX } from '~/constants'
import ReadMore from '~/components/ReadMore'
import NewsUserIntro from '~/components/NewsUserIntro'
import NewsLoveComment from '~/components/NewsLoveComment'
import OurUploadedImage from '~/components/OurUploadedImage'

const NewsShareModal = defineAsyncComponent(() =>
  import('~/components/NewsShareModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['focus-comment'])

const newsfeedStore = useNewsfeedStore()

// Data properties
const showNewsPhotoModal = ref(false)
const showNewsShareModal = ref(false)

// Computed properties
const newsfeed = computed(() => {
  return newsfeedStore.byId(props.id)
})

const userid = computed(() => {
  return newsfeed.value?.userid
})

const emessage = computed(() => {
  let ret = newsfeed.value?.message ? twem(newsfeed.value.message) : null

  if (ret) {
    // Remove leading spaces/tabs.
    let regExp = /^[\t ]+/gm
    ret = ret.replace(regExp, '')

    // Remove duplicate blank lines.
    const EOL = ret.match(/\r\n/gm) ? '\r\n' : '\n'
    regExp = new RegExp('(' + EOL + '){3,}', 'gm')
    ret = ret.replace(regExp, EOL + EOL)
  }

  if (newsfeed.value?.type === 'Alert') {
    // Make links clickable.
    ret = ret.replace(URL_REGEX, '<a href="$1" target="_blank">$1</a>')
  }

  return ret
})

function share() {
  showNewsShareModal.value = true
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
