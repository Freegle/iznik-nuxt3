<template>
  <b-container v-if="me" fluid>
    <b-row class="m-0">
      <b-col cols="0" lg="3" class="p-0 pr-1">
        <VisibleWhen :at="['lg', 'xl', 'xxl']">
          <SidebarLeft :show-community-events="true" :show-bot-left="true" />
        </VisibleWhen>
      </b-col>
      <b-col cols="12" lg="6" class="newsfeedHolder p-0">
        <GlobalWarning />
        <ExpectedRepliesWarning
          v-if="me && me.expectedreplies"
          :count="me.expectedreplies"
          :chats="me.expectedchats"
        />
        <b-card v-if="!id" body-class="p-2 p-md-4">
          <b-card-text class="mb-0">
            <h5 class="text-center mb-3 d-block d-md-none">
              <span class="d-none d-sm-inline"
                >Looking for your posts? Click</span
              >
              <span class="d-inline d-sm-none">Your posts are</span>
              <!-- eslint-disable-next-line -->
              <nuxt-link to="/myposts">here</nuxt-link>.
            </h5>
            <h5 class="text-center mb-3 d-block d-md-none">
              Browse OFFERs/WANTEDs
              <!-- eslint-disable-next-line -->
              <nuxt-link to="/browse">here</nuxt-link>.
            </h5>
            <div class="d-flex justify-content-between">
              <b-button
                id="givebutton"
                ref="givebutton"
                to="/give"
                variant="primary"
                class="post__button"
              >
                Give stuff
              </b-button>
              <b-button
                id="findbutton"
                ref="findbutton"
                to="/find"
                variant="secondary"
                class="post__button"
              >
                Ask for stuff
              </b-button>
            </div>
          </b-card-text>
          <v-tooltip
            :shown="showToolGive"
            target="givebutton"
            placement="bottom"
            variant="primary"
            :triggers="[]"
          >
            <template #popper>
              <div>
                Giving something away? Click the Give button. Chitchat is for
                other discussion.
              </div>
            </template>
          </v-tooltip>
          <v-tooltip
            :shown="showToolFind"
            target="findbutton"
            placement="bottom"
            variant="primary"
            :triggers="[]"
          >
            <template #popper>
              <div>
                Looking for an item? Click the Find button. Chitchat is for
                other discussion.
              </div>
            </template>
          </v-tooltip>
        </b-card>
        <div v-if="!id" class="mt-2">
          <b-card no-body class="mb-2">
            <b-card-text class="p-2 pb-0 mb-0">
              <label class="font-weight-bold mb-1" for="startThread"
                >Chat to nearby freeglers!
                <span class="d-none d-sm-inline"
                  >Ask for advice, recommendations, or just have a natter:</span
                ></label
              >
              <b-form-textarea
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
              <b-img
                v-if="imageid"
                lazy
                thumbnail
                :src="imagethumb"
                class="image__uploaded"
              />
            </b-card-text>
            <hr class="mt-1 mb-1" />
            <OurFilePond
              v-if="uploading"
              class="bg-white m-0 pondrow"
              imgtype="Newsfeed"
              imgflag="newsfeed"
              @photoProcessed="photoProcessed"
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
        <NoticeMessage
          v-if="id && newsfeed && newsfeed.length && !newsfeed[0].visible"
          class="mt-2"
        >
          Sorry, this thread isn't around any more.
        </NoticeMessage>
        <div class="p-0 pt-1 mb-1">
          <NewsThread
            v-for="entry in newsfeedToShow"
            :id="entry.id"
            :key="'newsfeed-' + entry.id + '-area-' + selectedArea"
            :scroll-to="scrollTo"
          />
          <client-only>
            <infinite-loading
              :identifier="infiniteId"
              force-use-infinite-wrapper="body"
              :distance="distance"
              @infinite="loadMore"
            >
              <span slot="no-results" />
              <span slot="no-more" />
              <span slot="spinner">
                <b-img-lazy src="~/static/loader.gif" alt="Loading" />
              </span>
            </infinite-loading>
          </client-only>
        </div>
      </b-col>
      <b-col cols="0" lg="3" class="p-0 pl-1">
        <VisibleWhen :at="['lg', 'xl', 'xxl']">
          <sidebar-right show-volunteer-opportunities show-job-opportunities />
        </VisibleWhen>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { useRoute } from 'vue-router'
import NoticeMessage from '../../components/NoticeMessage'
import GlobalWarning from '../../components/GlobalWarning'
import VisibleWhen from '../../components/VisibleWhen'
import { buildHead } from '../../composables/useBuildHead'
import { useMiscStore } from '../../stores/misc'
import { useNewsfeedStore } from '../../stores/newsfeed'
import { useAuthStore } from '../../stores/auth'
import NewsThread from '~/components/NewsThread.vue'
import { untwem } from '~/composables/useTwem'

const OurFilePond = () => import('~/components/OurFilePond')
const SidebarLeft = () => import('~/components/SidebarLeft')
const SidebarRight = () => import('~/components/SidebarRight')
const NewsLocation = () => import('~/components/NewsLocation')
const ExpectedRepliesWarning = () =>
  import('~/components/ExpectedRepliesWarning')

export default {
  components: {
    VisibleWhen,
    GlobalWarning,
    ExpectedRepliesWarning,
    NoticeMessage,
    NewsThread,
    OurFilePond,
    SidebarLeft,
    SidebarRight,
    NewsLocation,
  },
  validate({ params }) {
    // Must be a number if present
    return !params.id || /^\d+$/.test(params.id)
  },
  async setup() {
    const miscStore = useMiscStore()
    const newsfeedStore = useNewsfeedStore()
    const authStore = useAuthStore()

    const route = useRoute()
    const id = route.params.id

    // We want this to be our next home page.
    const existingHomepage = miscStore.get('lasthomepage')

    if (existingHomepage !== 'news') {
      miscStore.set({
        key: 'lasthomepage',
        value: 'news',
      })
    }

    useHead(
      buildHead(
        'ChitChat',
        'Chat to nearby freeglers...ask for advice, recommendations or just have a good old natter.'
      )
    )

    await newsfeedStore.fetch(id)

    return {
      authStore,
      newsfeedStore,
      miscStore,
      id,
    }
  },
  data() {
    return {
      show: 0,
      startThread: null,
      scrollTo: null,
      infiniteId: +new Date(),
      uploading: false,
      imageid: null,
      imagethumb: null,
      distance: 1000,
      runChecks: true,
      showToolGive: false,
      shownToolGive: false,
      showToolFind: false,
      shownToolFind: false,
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
      return Object.values(this.newsfeedStore.feed)
    },
    newsfeedToShow() {
      return this.newsfeed
        .slice(0, this.show)
        .filter((entry) => !entry.unfollowed)
    },
  },
  beforeCreate() {
    this.id = this.$route.params.id
  },
  beforeDestroy() {
    // Stop timers which would otherwise kill garbage collection.
    this.runChecks = false
  },
  mounted() {
    setTimeout(this.runCheck, 3000)
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
    loadMore($state) {
      this.busy = true
      this.scrollTo = this.id

      if (!this.me) {
        if ($state.complete) {
          $state.complete()
        }
      } else if (this.show < this.newsfeed.length) {
        this.show++
        $state.loaded()
      } else {
        $state.complete()
      }
    },
    areaChange() {
      this.infiniteId++
      this.$store.commit('newsfeed/clearFeed')
    },
    async postIt() {
      let msg = this.startThread

      if (msg && msg.trim().length) {
        // Encode up any emojis.
        msg = untwem(msg)

        await this.$store.dispatch('newsfeed/send', {
          message: msg,
          imageid: this.imageid,
        })

        // Clear the textarea now it's sent.
        this.startThread = null

        // And any image id
        this.imageid = null
      }
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // init callback below.
      this.uploading = true
    },
    photoProcessed(imageid, imagethumb) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      // The imageid is in this.imageid
      this.imageid = imageid
      this.imagethumb = imagethumb
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

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
