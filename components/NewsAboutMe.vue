<template>
  <div>
    <NewsUserIntro
      v-if="userid"
      :userid="userid"
      :newsfeed="newsfeed"
      append="introduced themselves"
    />
    <read-more
      v-if="newsfeed.message && emessage"
      :text="emessage"
      :max-chars="1024"
      class="font-weight-bold preline forcebreak nopara"
    />
    <div>
      <b-row v-if="newsfeed.image">
        <b-col>
          <b-img
            thumbnail
            rounded
            lazy
            :src="newsfeed.image.paththumb"
            class="clickme"
            @click="showPhotoModal"
          />
        </b-col>
      </b-row>
    </div>
    <div
      class="mt-2 d-flex flex-wrap justify-content-between align-items-center"
    >
      <NewsLoveComment
        :newsfeed="newsfeed"
        @focus-comment="emit('focus-comment')"
      />
      <div>
        <b-button variant="primary" size="sm" @click="showModal">
          <v-icon icon="user" /> Introduce yourself to everyone
        </b-button>
        <AboutMeModal
          v-if="showAboutMeModal"
          @hidden="showAboutMeModal = false"
        />
      </div>
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
  </div>
</template>
<script setup>
import { defineAsyncComponent, ref, computed } from 'vue'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { twem } from '~/composables/useTwem'
import { URL_REGEX } from '~/constants'
import { useMe } from '~/composables/useMe'
import ReadMore from '~/components/ReadMore'
import NewsUserIntro from '~/components/NewsUserIntro'
import NewsLoveComment from '~/components/NewsLoveComment'

const AboutMeModal = defineAsyncComponent(() => import('./AboutMeModal'))
const NewsPhotoModal = defineAsyncComponent(() =>
  import('./NewsPhotoModal.vue')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['focus-comment'])

const newsfeedStore = useNewsfeedStore()
const { fetchMe } = useMe()

// Data properties
const showAboutMeModal = ref(false)
const showNewsPhotoModal = ref(false)

// Computed properties
const newsfeed = computed(() => {
  return newsfeedStore.byId(props.id)
})

const userid = computed(() => {
  return newsfeed.value?.userid
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

function showPhotoModal() {
  showNewsPhotoModal.value = true
}

async function showModal() {
  await fetchMe(['me'], true)
  showAboutMeModal.value = true
}
</script>
