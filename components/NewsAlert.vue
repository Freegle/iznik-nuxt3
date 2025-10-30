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
          {{ addedago }}
        </span>
      </div>
    </div>
    <!-- eslint-disable-next-line-->
    <div v-if="newsfeed.html" v-html="newsfeed.html" />
    <!-- eslint-disable-next-line-->
    <div v-else-if="newsfeed.message" class="font-weight-bold preline forcebreak" v-html="emessage" />
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
        @focus-comment="emit('focus-comment')"
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

<script setup>
import { defineAsyncComponent, ref, computed } from 'vue'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { twem } from '~/composables/useTwem'
import { timeago } from '~/composables/useTimeFormat'
import { URL_REGEX } from '~/constants'
import NewsLoveComment from '~/components/NewsLoveComment'
import ProfileImage from '~/components/ProfileImage'

const NewsShareModal = defineAsyncComponent(() =>
  import('~/components/NewsShareModal')
)
const NewsPhotoModal = defineAsyncComponent(() =>
  import('~/components/NewsPhotoModal.vue')
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

const emessage = computed(() => {
  let ret = newsfeed.value.message ? twem(newsfeed.value.message) : null

  if (ret) {
    // Remove leading spaces/tabs.
    let regExp = /^[\t ]+/gm
    ret = ret.replace(regExp, '')

    // Remove duplicate blank lines.
    const EOL = ret.match(/\r\n/gm) ? '\r\n' : '\n'
    regExp = new RegExp('(' + EOL + '){3,}', 'gm')
    ret = ret.replace(regExp, EOL + EOL)
  }

  if (newsfeed.value.type === 'Alert') {
    // Make links clickable.
    ret = ret.replace(URL_REGEX, '<a href="$1" target="_blank">$1</a>')
  }

  return ret
})

const addedago = computed(() => {
  return timeago(newsfeed.value?.added)
})

// Methods
function share() {
  showNewsShareModal.value = true
}

function showPhotoModal() {
  showNewsPhotoModal.value = true
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
