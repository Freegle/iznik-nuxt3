<template>
  <client-only v-if="me">
    <b-container fluid class="p-0 chitchat-page">
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft show-community-events show-volunteer-opportunities />
          </VisibleWhen>
        </b-col>
        <b-col
          cols="12"
          md="8"
          offset-md="2"
          lg="6"
          offset-lg="0"
          class="newsfeedHolder p-0"
        >
          <GlobalMessage />
          <ExpectedRepliesWarning
            v-if="me && me.expectedreplies"
            :count="me.expectedreplies"
            :chats="me.expectedchats"
          />

          <!-- Mobile-optimized composer -->
          <div v-if="!id" class="composer-section">
            <div class="composer-card">
              <div class="composer-header">
                <v-icon icon="comments" class="header-icon" />
                <span class="header-title">Start a conversation</span>
              </div>
              <div class="composer-content">
                <AutoHeightTextarea
                  id="startThread"
                  v-model="startThread"
                  rows="2"
                  max-rows="8"
                  placeholder="What's on your mind?"
                  class="composer-textarea"
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
                <OurUploadedImage
                  v-if="ouruid"
                  format="webp"
                  fit="cover"
                  :src="ouruid"
                  :modifiers="imagemods"
                  alt="ChitChat Photo"
                  width="100"
                  class="mt-2 uploaded-preview"
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
                  class="mt-2 uploaded-preview"
                />
                <OurUploader
                  v-if="uploading"
                  v-model="currentAtts"
                  class="bg-white m-0 mt-2"
                  type="Newsfeed"
                />
                <div class="composer-actions">
                  <button class="action-btn photo-btn" @click="photoAdd">
                    <v-icon icon="camera" />
                    <span>Photo</span>
                  </button>
                  <button
                    class="action-btn post-btn"
                    :disabled="!startThread?.trim()"
                    @click="postIt"
                  >
                    <v-icon icon="paper-plane" />
                    <span>Post</span>
                  </button>
                </div>
                <p class="composer-hint">
                  <v-icon icon="globe-europe" class="hint-icon" />
                  Public · Be kind, we may moderate
                </p>
              </div>
            </div>

            <!-- Location filter -->
            <div class="filter-section">
              <div class="filter-row">
                <div v-if="areaname" class="location-display">
                  <v-icon icon="map-marker-alt" class="location-icon" />
                  <span>{{ areaname }}</span>
                </div>
                <b-form-select
                  v-model="selectedArea"
                  :options="areaOptions"
                  class="filter-select"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <!-- Community Events summary (mobile only) -->
          <VisibleWhen :at="['xs', 'sm', 'md']">
            <NewsCommunityEventVolunteerSummary class="events-section" />
          </VisibleWhen>

          <!-- Posts feed -->
          <div class="posts-feed">
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
import { useLocationStore } from '~/stores/location'
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
const locationStore = useLocationStore()

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

// Area/location filter options
const areaOptions = [
  { value: 'nearby', text: 'Nearby' },
  { value: 1609, text: 'Within 1 mile' },
  { value: 3128, text: 'Within 2 miles' },
  { value: 8046, text: 'Within 5 miles' },
  { value: 16093, text: 'Within 10 miles' },
  { value: 32186, text: 'Within 20 miles' },
  { value: 80467, text: 'Within 50 miles' },
  { value: '0', text: 'Anywhere' },
]

const areaname = ref(me.value?.settings?.mylocation?.area?.name)
const areaid = computed(() => me.value?.settings?.mylocation?.areaid)

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

// Watch selectedArea for changes
watch(selectedArea, async () => {
  await areaChange()
})

// Initialize location data if needed
const initializeLocation = async () => {
  if (!areaname.value && areaid.value) {
    const loc = await locationStore.fetchv2(areaid.value)
    areaname.value = loc.name
  }
}

// Lifecycle hooks
onMounted(() => {
  runCheck()
  initializeLocation()
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
@import 'assets/css/_color-vars.scss';
@import 'assets/css/navbar.scss';

.chitchat-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding-bottom: $page-bottom-padding;
}

// Composer section
.composer-section {
  padding: 0.5rem 0.75rem;

  @include media-breakpoint-up(md) {
    padding: 0.75rem 1rem;
  }

  @include media-breakpoint-up(lg) {
    padding: 1rem 0;
  }
}

.composer-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.composer-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .header-icon {
    color: $colour-success;
    font-size: 1.1rem;
  }

  .header-title {
    font-weight: 600;
    font-size: 1rem;
    color: $colour-success;
  }
}

.composer-content {
  padding: 1rem;
}

.composer-textarea {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.875rem;
  font-size: 1rem;
  resize: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: $color-green-background;
    box-shadow: 0 0 0 2px rgba($color-green-background, 0.1);
    outline: none;
  }
}

.uploaded-preview {
  border-radius: 2px;
}

.composer-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  span {
    @media (max-width: 360px) {
      display: none;
    }
  }
}

.photo-btn {
  background: $color-gray--lighter;
  color: $color-gray--darker;

  &:hover {
    background: darken($color-gray--lighter, 5%);
  }
}

.post-btn {
  background: $color-green-background;
  color: white;
  margin-left: auto;

  &:hover:not(:disabled) {
    background: darken($color-green-background, 8%);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.composer-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0.75rem 0 0 0;
  font-size: 0.8rem;
  color: $color-gray--dark;

  .hint-icon {
    font-size: 0.75rem;
  }
}

// Filter section
.filter-section {
  margin-top: 0;
  background: white;
  padding: 0.5rem 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.location-display {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.9rem;
  color: $color-gray--darker;

  .location-icon {
    color: $color-green-background;
  }
}

.filter-select {
  flex: 1;
  min-width: 150px;
  border-radius: 3px;
  border-color: #e0e0e0;
  font-size: 0.9rem;

  &:focus {
    border-color: $color-green-background;
    box-shadow: 0 0 0 2px rgba($color-green-background, 0.1);
  }
}

// Events section
.events-section {
  margin: 0.5rem 0.75rem;
  overflow: hidden;

  @include media-breakpoint-up(md) {
    margin: 0.75rem 1rem;
  }
}

// Posts feed
.posts-feed {
  padding: 0 0.5rem;

  @include media-breakpoint-up(md) {
    padding: 0 1rem;
  }

  @include media-breakpoint-up(lg) {
    padding: 0;
  }

  // Modernize post cards on mobile
  :deep(.card) {
    border-radius: 4px;
    border: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    margin-bottom: 0.75rem;
    overflow: hidden;
  }

  :deep(.card-body) {
    padding: 0.875rem;
  }

  :deep(.card-footer) {
    background: transparent;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding: 0.75rem;
  }

  // Clean up user intro section
  :deep(.media-body) {
    .text-success {
      font-size: 0.95rem;
    }

    .text-muted.small {
      font-size: 0.8rem;
    }
  }

  // Action buttons
  :deep(.btn-link) {
    font-size: 0.85rem;
    padding: 0.25rem 0.5rem;

    &:hover {
      text-decoration: none;
    }
  }

  // Clean up reply input area
  :deep(.input-group) {
    border-radius: 4px;
    overflow: hidden;

    .form-control {
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      font-size: 0.9rem;

      &:focus {
        border-color: $color-green-background;
        box-shadow: none;
      }
    }

    .input-group-text {
      background: transparent;
      border: none;
    }
  }

  // Better spacing for nested replies
  :deep(.ml-2),
  :deep(.ms-2) {
    margin-left: 0.75rem !important;
  }
}

// Legacy support
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
