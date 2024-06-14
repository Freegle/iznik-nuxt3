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
          <GlobalWarning />
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
                <div class="small text-muted">
                  Everything here is public. Be kind
                  <span class="d-none d-sm-inline">to each other</span>;
                  occasionally we may moderate to ensure things stay friendly.
                </div>
                <NuxtImg
                  v-if="imageuid"
                  fit="cover"
                  format="webp"
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
                :distance="distance"
                @infinite="loadMore"
              />
            </div>
          </div>
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1">
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarRight show-job-opportunities />
          </VisibleWhen>
        </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '../../composables/useBuildHead'
import { useMiscStore } from '../../stores/misc'
import { useNewsfeedStore } from '../../stores/newsfeed'
import { useAuthStore } from '../../stores/auth'
import NewsCommunityEventVolunteerSummary from '../../components/NewsCommunityEventVolunteerSummary'
import VisibleWhen from '~/components/VisibleWhen'
import GlobalWarning from '~/components/GlobalWarning'
import NoticeMessage from '~/components/NoticeMessage'
import AutoHeightTextarea from '~/components/AutoHeightTextarea'
import InfiniteLoading from '~/components/InfiniteLoading'
import NewsThread from '~/components/NewsThread.vue'
import { untwem } from '~/composables/useTwem'
import { ref } from '#imports'

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

export default {
  components: {
    NewsCommunityEventVolunteerSummary,
    VisibleWhen,
    GlobalWarning,
    ExpectedRepliesWarning,
    NoticeMessage,
    NewsThread,
    OurUploader,
    SidebarLeft,
    SidebarRight,
    NewsLocation,
    InfiniteLoading,
    AutoHeightTextarea,
  },
  validate({ params }) {
    // Must be a number if present
    return !params.id || /^\d+$/.test(params.id)
  },
  async setup(props) {
    definePageMeta({
      layout: 'login',
    })
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

    const me = authStore.user
    const mod =
      me &&
      (me.systemrole === 'Moderator' ||
        me.systemrole === 'Support' ||
        me.systemrole === 'Admin')

    const settings = me?.settings
    const distance = settings?.newsfeedarea || 0
    const error = ref(false)
    const threadhead = ref(null)

    if (me) {
      if (id) {
        // Force as there may be changes since we loaded what was in the store.
        const newsfeed = await newsfeedStore.fetch(id, true)

        // Mods can see deleted posts.
        if (!mod && (!newsfeed?.id || newsfeed?.deleted)) {
          error.value = true
        } else if (newsfeed?.id !== newsfeed?.threadhead) {
          threadhead.value = newsfeed.threadhead

          const fetched = await newsfeedStore.fetch(newsfeed.threadhead)

          if (!mod && (!fetched?.id || fetched?.deleted)) {
            error.value = true
          }
        } else {
          threadhead.value = id
        }
      } else {
        await newsfeedStore.fetchFeed(distance)

        // Fetch the first few threads in parallel so that they are in the store.  This speeds up rendering the
        // first page.
        const feed = newsfeedStore.feed

        if (feed?.length) {
          const firstThreads = feed.slice(0, 5)
          firstThreads.forEach((thread) => {
            newsfeedStore.fetch(thread.id)
          })
        }
      }
    }

    return {
      authStore,
      newsfeedStore,
      miscStore,
      id,
      error,
      infiniteId: new Date().getTime(),
      threadhead,
    }
  },
  data() {
    return {
      show: 0,
      startThread: null,
      uploading: false,
      imageid: null,
      imageuid: null,
      imagemods: null,
      distance: 1000,
      runChecks: true,
      showToolGive: false,
      shownToolGive: false,
      showToolFind: false,
      shownToolFind: false,
      infiniteState: null,
      currentAtts: [],
    }
  },
  computed: {
    selectedArea: {
      get() {
        const settings = this.me.settings
        return settings.newsfeedarea || 0
      },
      async set(newval) {
        const settings = this.me.settings
        settings.newsfeedarea = newval

        await this.authStore.saveAndGet({
          settings,
        })
      },
    },
    newsfeed() {
      let ret = Object.values(this.newsfeedStore?.feed)

      // Suppress duplicate posts.
      ret = ret.filter((item, index) => {
        if (index === 0) {
          return true
        }

        return (
          item.userid !== ret[index - 1].userid ||
          item.message !== ret[index - 1].message
        )
      })

      return ret
    },
    newsfeedToShow() {
      if (this.newsfeedStore) {
        if (this.id) {
          const thread = this.newsfeedStore.byId(this.threadhead)

          if (thread) {
            return [thread]
          } else {
            return []
          }
        } else {
          return this.newsfeed
            .slice(0, this.show)
            .filter((entry) => !entry.unfollowed)
        }
      }

      return []
    },
  },
  watch: {
    currentAtts: {
      handler(newVal) {
        this.uploading = false

        this.imageid = newVal[0].id
        this.imageuid = newVal[0].externaluid
        this.imagemods = newVal[0].externalmods
      },
      deep: true,
    },
  },
  beforeCreate() {
    this.id = this.$route.params.id
  },
  beforeUnmount() {
    // Stop timers which would otherwise kill garbage collection.
    this.runChecks = false
  },
  methods: {
    runCheck() {
      // People sometimes try to use chitchat to offer/request items, despite what are technically known as
      // Fuck Off Obvious Big Buttons.  Catch the most obvious attempts and redirect them.
      if (this.runChecks) {
        let msg = this.startThread

        if (msg) {
          msg = msg.toLowerCase()

          if (!this.shownToolGive) {
            for (const word of [
              'offer',
              'giving away',
              'does anyone want',
              'collection from',
              'collection only',
            ]) {
              if (msg.length && msg.includes(word)) {
                this.showToolGive = true
                this.shownToolGive = true
                this.$refs.givebutton.$el.scrollIntoView()
                window.scrollBy(0, -100)

                setTimeout(() => {
                  this.showToolGive = false
                }, 5000)
              }
            }
          }

          if (!this.shownToolFind) {
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
                this.showToolFind = true
                this.shownToolFind = true
                this.$refs.findbutton.$el.scrollIntoView()
                window.scrollBy(0, -100)

                setTimeout(() => {
                  this.showToolFind = false
                }, 5000)
              }
            }
          }
        }

        setTimeout(this.runCheck, 1000)
      }
    },
    rendered() {
      // We do this so that we wait until one item has rendered before inserting another.  Otherwise we get them
      // appearing out of order, which is worse than there being a delay before they appear in series.
      if (this.infiniteState) {
        this.infiniteState.loaded()
      }
    },
    loadMore($state) {
      this.infiniteState = $state

      if (this.show < this.newsfeed.length) {
        this.show += 1
      } else {
        $state.complete()
      }
    },
    async areaChange() {
      const distance = this.me?.settings?.newsfeedarea || 0
      await this.newsfeedStore.reset()
      await this.newsfeedStore.fetchFeed(distance)
      this.infiniteId++
      this.show = 0
    },
    async postIt() {
      let msg = this.startThread

      if (msg && msg.trim().length) {
        // Encode up any emojis.
        msg = untwem(msg)

        await this.newsfeedStore.send(msg, null, null, this.imageid)

        // Clear the textarea now it's sent.
        this.startThread = null

        // And any image id
        this.imageid = null
        this.imageuid = null
        this.imagemods = null

        // Show from top.
        this.infiniteId++
        this.show = 0
      }
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // init callback below.
      this.uploading = true
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

:deep(.post__button) {
  @include media-breakpoint-up(sm) {
    width: 40%;
  }
}

.newsfeedHolder {
  height: calc(100vh - 74px);
}

.tab-content,
.tab-pane {
  background-color: $color-white;
}

.image__uploaded {
  width: 100px;
}
</style>
