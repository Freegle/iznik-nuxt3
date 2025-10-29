<template>
  <client-only v-if="me">
    <b-container fluid class="p-0">
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft show-community-events show-volunteer-opportunities />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="newsfeedHolder p-0">
          <GlobalMessage />
          <ExpectedRepliesWarning
            v-if="me && me.expectedreplies"
            :count="me.expectedreplies"
            :chats="me.expectedchats"
          />
          <div v-if="!id" class="mt-2">
            <b-card no-body class="mb-2">
              <b-card-text class="p-2 pb-0 mb-0">
                <label class="font-weight-bold mb-1" for="startThread"
                  >Chat to nearby freeglers!
                  <span class="d-none d-sm-inline"
                    >Ask for advice, recommendations, or just have a
                    natter:</span
                  ></label
                >
                <AutoHeightTextarea
                  id="startThread"
                  v-model="startThread"
                  rows="2"
                  max-rows="8"
                  placeholder="What's going on in your world?"
                  class="border border-primary"
                />
                <NoticeMessage
                  v-if="showGiveFind"
                  ref="giveFind"
                  variant="warning"
                  class="mt-2"
                >
                  <p>
                    If you're giving something away or looking for something,
                    please click here. Chitchat is for other discussion.
                  </p>
                  <div class="d-flex justify-content-between flex-wrap w-100">
                    <div class="post__button d-flex justify-content-around">
                      <b-button to="/give" variant="primary">
                        Give stuff
                      </b-button>
                    </div>
                    <div class="post__button d-flex justify-content-around">
                      <b-button to="/find" variant="secondary">
                        Ask for stuff
                      </b-button>
                    </div>
                  </div>
                </NoticeMessage>
                <div class="small text-muted">
                  Everything here is public. Be kind
                  <span class="d-none d-sm-inline">to each other</span>;
                  occasionally we may moderate to ensure things stay friendly.
                </div>
                <OurUploadedImage
                  v-if="ouruid"
                  format="webp"
                  fit="cover"
                  :src="ouruid"
                  :modifiers="imagemods"
                  alt="ChitChat Photo"
                  width="100"
                  class="mt-1"
                />
                <NuxtPicture
                  v-else-if="imageuid"
                  format="webp"
                  fit="cover"
                  provider="uploadcare"
                  :src="imageuid"
                  :modifiers="imagemods"
                  alt="ChitChat Photo"
                  width="100"
                  class="mt-1"
                />
              </b-card-text>
              <hr class="mt-1 mb-1" />
              <OurUploader
                v-if="uploading"
                v-model="currentAtts"
                class="bg-white m-0"
                type="Newsfeed"
              />
              <div class="pb-1 d-flex justify-content-end">
                <b-button variant="secondary" class="mr-2" @click="photoAdd">
                  Add photo
                </b-button>
                <b-button variant="primary" class="mr-2" @click="postIt">
                  Post it!
                </b-button>
              </div>
            </b-card>
          </div>
          <NewsLocation v-if="!id" class="p-2" @changed="areaChange" />
          <VisibleWhen :at="['xs', 'sm', 'md']">
            <NewsCommunityEventVolunteerSummary class="mt-2" />
          </VisibleWhen>
          <div class="p-0 pt-1 mb-1">
            <NoticeMessage v-if="error" class="mt-2">
              Sorry, this thread isn't around any more.
            </NoticeMessage>
            <div v-else>
              <NewsThread
                v-for="entry in newsfeedToShow"
                :id="entry?.id"
                :key="
                  'newsfeed-' +
                  entry?.id +
                  '-area-' +
                  selectedArea +
                  '-' +
                  infiniteId
                "
                :scroll-to="id"
                @rendered="rendered"
              />
              <infinite-loading
                v-if="newsfeed.length"
                :identifier="infiniteId"
                force-use-infinite-wrapper="body"
                :distance="infiniteDistance"
                @infinite="loadMore"
              />
            </div>
          </div>
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarRight
              :show-job-opportunities="false"
              ad-unit-path="/22794232631/freegle_chat_app"
              ad-div-id="div-gpt-ad-1691925773522-0"
            />
          </VisibleWhen>
        </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useMiscStore } from '~/stores/misc'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useAuthStore } from '~/stores/auth'
import NewsCommunityEventVolunteerSummary from '~/components/NewsCommunityEventVolunteerSummary'
import { useMe } from '~/composables/useMe'
import VisibleWhen from '~/components/VisibleWhen'
import GlobalMessage from '~/components/GlobalMessage'
import NoticeMessage from '~/components/NoticeMessage'
import AutoHeightTextarea from '~/components/AutoHeightTextarea'
import InfiniteLoading from '~/components/InfiniteLoading'
import NewsThread from '~/components/NewsThread.vue'
import { untwem } from '~/composables/useTwem'
import {
  ref,
  computed,
  watch,
  nextTick,
  onBeforeUnmount,
  onMounted,
} from '#imports'

const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const SidebarLeft = defineAsyncComponent(() =>
  import('~/components/SidebarLeft')
)
const SidebarRight = defineAsyncComponent(() =>
  import('~/components/SidebarRight')
)
const NewsLocation = defineAsyncComponent(() =>
  import('~/components/NewsLocation')
)
const ExpectedRepliesWarning = defineAsyncComponent(() =>
  import('~/components/ExpectedRepliesWarning')
)
const OurUploadedImage = defineAsyncComponent(() =>
  import('~/components/OurUploadedImage')
)

// Route validation
definePageMeta({
  layout: 'login',
  validate: ({ params }) => {
    // Must be a number if present
    return !params.id || /^\d+$/.test(params.id)
  },
})

// Setup page head
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const id = route.params.id

useHead(
  buildHead(
    route,
    runtimeConfig,
    'ChitChat',
    'Chat to nearby freeglers...ask for advice, recommendations or just have a good old natter.',
    null,
    {
      class: 'overflow-y-scroll',
    }
  )
)

// Store setup
const miscStore = useMiscStore()
const newsfeedStore = useNewsfeedStore()
const authStore = useAuthStore()

// We want this to be our next home page.
const existingHomepage = miscStore.get('lasthomepage')

if (existingHomepage !== 'news') {
  miscStore.set({
    key: 'lasthomepage',
    value: 'news',
  })
}

// Use me computed property from useMe composable for consistency
const { me } = useMe()
const mod = computed(
  () =>
    me.value &&
    (me.value.systemrole === 'Moderator' ||
      me.value.systemrole === 'Support' ||
      me.value.systemrole === 'Admin')
)

// Refs and state
const show = ref(0)
const startThread = ref(null)
const uploading = ref(false)
const imageid = ref(null)
const ouruid = ref(null)
const imageuid = ref(null)
const imagemods = ref(null)
const distance = ref('nearby')
const infiniteDistance = ref(1000)
const runChecks = ref(true)
const infiniteState = ref(null)
const currentAtts = ref([])
const showGiveFind = ref(false)
const shownGiveFind = ref(false)
const error = ref(false)
const threadhead = ref(null)
const infiniteId = ref(new Date().getTime())
const giveFind = ref(null)

const selectedArea = computed({
  get() {
    const settings = me.value?.settings
    return settings?.newsfeedarea || 0
  },
  async set(newval) {
    const settings = me.value.settings
    settings.newsfeedarea = newval

    await authStore.saveAndGet({
      settings,
    })
  },
})

const newsfeed = computed(() => {
  let ret = Object.values(newsfeedStore?.feed || {})

  // Suppress duplicate posts.
  ret = ret.filter((item, index) => {
    if (index === 0) {
      return true
    }

    return (
      item.userid === 0 ||
      item.userid !== ret[index - 1].userid ||
      item.message !== ret[index - 1].message
    )
  })

  return ret
})

const newsfeedToShow = computed(() => {
  if (newsfeedStore) {
    if (id) {
      const thread = newsfeedStore.byId(threadhead.value)

      if (thread) {
        return [thread]
      } else {
        return []
      }
    } else {
      return newsfeed.value
        .slice(0, show.value)
        .filter((entry) => !entry.unfollowed)
    }
  }

  return []
})

// Watchers
watch(
  currentAtts,
  (newVal) => {
    if (newVal?.length) {
      uploading.value = false

      imageid.value = newVal[0].id
      imageuid.value = newVal[0].ouruid
      ouruid.value = newVal[0].ouruid
      imagemods.value = newVal[0].externalmods
    }
  },
  { deep: true }
)

// Methods
function rendered() {
  // We do this so that we wait until one item has rendered before inserting another.
  // Otherwise we get them appearing out of order, which is worse than there being a delay before they appear in series.
  console.log('Rendered')
  if (infiniteState.value) {
    infiniteState.value.loaded()
  }
}

function loadMore($state) {
  console.log('Load more', show.value, newsfeed.value.length)
  infiniteState.value = $state

  if (show.value < newsfeed.value.length) {
    console.log('Show another')
    show.value += 1
  } else {
    console.log('News complete')
    $state.complete()
  }
}

async function areaChange() {
  const newDistance = me.value?.settings?.newsfeedarea || 0
  await newsfeedStore.reset()
  await newsfeedStore.fetchFeed(newDistance)
  infiniteId.value++
  show.value = 0
}

async function postIt() {
  let msg = startThread.value

  if (msg && msg.trim().length) {
    // Encode up any emojis.
    msg = untwem(msg)

    await newsfeedStore.send(msg, null, null, imageid.value)

    // Clear the textarea now it's sent.
    startThread.value = null

    // And any image id
    imageid.value = null
    imageuid.value = null
    ouruid.value = null
    imagemods.value = null

    // Show from top.
    infiniteId.value++
    show.value = 0
  }
}

function photoAdd() {
  // Flag that we're uploading.  This will trigger the render of the filepond instance
  uploading.value = true
}

function scrollToGiveFind(give) {
  nextTick(() => {
    if (giveFind.value) {
      giveFind.value.$el.scrollIntoView()

      setTimeout(() => {
        if (give && giveFind.value?.$refs.givebutton?.$el) {
          giveFind.value.$refs.givebutton.$el.scrollIntoView()
        } else if (!give && giveFind.value?.$refs.findbutton?.$el) {
          giveFind.value.$refs.findbutton.$el.scrollIntoView()
        }
      }, 500)
    }

    window.scrollBy(0, 100)
    setTimeout(() => {
      showGiveFind.value = false
    }, 30000)
  })
}

function runCheck() {
  // People sometimes try to use chitchat to offer/request items, despite obvious buttons
  if (runChecks.value) {
    let msg = startThread.value

    if (msg) {
      msg = msg.toLowerCase()

      if (!shownGiveFind.value) {
        for (const word of [
          'offer',
          'giving away',
          'does anyone want',
          'collection from',
          'collection only',
        ]) {
          if (msg.length && msg.includes(word)) {
            showGiveFind.value = true
            shownGiveFind.value = true
            scrollToGiveFind(true)
          }
        }
      }

      if (!shownGiveFind.value) {
        for (const word of [
          'wanted',
          'wanting',
          'requesting',
          'looking for',
          'has anybody got',
          'has anyone got',
          'does anyone have',
          'i really need',
          'if anyone has',
        ]) {
          if (msg.length && msg.includes(word)) {
            showGiveFind.value = true
            shownGiveFind.value = true
            scrollToGiveFind(false)
          }
        }
      }
    }

    setTimeout(runCheck, 1000)
  }
}

// Lifecycle hooks
onMounted(() => {
  runCheck()
})

onBeforeUnmount(() => {
  // Stop timers which would otherwise kill garbage collection.
  runChecks.value = false
})

// Initial data loading
const settings = me.value?.settings
distance.value = settings?.newsfeedarea || 0

// Fetch data if user is logged in
if (me.value) {
  if (id) {
    // Force as there may be changes since we loaded what was in the store.
    newsfeedStore.fetch(id, true).then((newsfeed) => {
      // Mods can see deleted posts.
      if (!mod.value && (!newsfeed?.id || newsfeed?.deleted)) {
        error.value = true
      } else if (newsfeed?.id !== newsfeed?.threadhead) {
        threadhead.value = newsfeed.threadhead

        newsfeedStore.fetch(newsfeed.threadhead).then((fetched) => {
          if (!mod.value && (!fetched?.id || fetched?.deleted)) {
            error.value = true
          }
        })
      } else {
        threadhead.value = id
      }
    })
  } else {
    newsfeedStore.fetchFeed(distance.value).then(() => {
      // Fetch the first few threads in parallel so that they are in the store.
      const feed = newsfeedStore.feed

      if (feed?.length) {
        const firstThreads = feed.slice(0, 5)
        firstThreads.forEach((thread) => {
          newsfeedStore.fetch(thread.id)
        })
      }
    })
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/sticky-banner.scss';

:deep(.post__button) {
  @include media-breakpoint-up(sm) {
    width: 40%;
  }
}

.tab-content,
.tab-pane {
  background-color: $color-white;
}

.image__uploaded {
  width: 100px;
}
</style>
