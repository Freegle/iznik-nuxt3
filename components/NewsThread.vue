<template>
  <div v-if="showThis" class="bg-white mt-2">
    <b-card v-if="newsfeed" :class="backgroundColor" no-body>
      <b-card-body class="p-1 p-sm-2">
        <b-card-text>
          <div v-if="mod && newsfeed.hidden" class="text-danger small mb-1">
            This has been hidden
            <UserName
              v-if="newsfeed?.hiddenby"
              :id="newsfeed.hiddenby"
              intro="by"
            />
            <span v-else>the system</span>
            and is only visible to volunteers and the person who posted it.
          </div>
          <div v-if="isNewsComponent">
            <b-dropdown lazy class="float-end" right variant="white">
              <template #button-content />
              <b-dropdown-item
                :href="'/chitchat/' + newsfeed?.id"
                target="_blank"
              >
                Open in new window
              </b-dropdown-item>
              <b-dropdown-item
                v-if="myid === parseInt(newsfeed.userid) || mod"
                :b-v-modal="'newsEdit' + newsfeed?.id"
                @click="show"
              >
                Edit
              </b-dropdown-item>
              <b-dropdown-item @click="unfollow">
                Unfollow this thread
              </b-dropdown-item>
              <b-dropdown-item @click="report">
                Report this thread or one of its replies
              </b-dropdown-item>
              <b-dropdown-item v-if="canRefer" @click="referToOffer">
                Refer to OFFER
              </b-dropdown-item>
              <b-dropdown-item v-if="canRefer" @click="referToWanted">
                Refer to WANTED
              </b-dropdown-item>
              <b-dropdown-item v-if="canRefer" @click="referToTaken">
                Refer to TAKEN
              </b-dropdown-item>
              <b-dropdown-item v-if="canRefer" @click="referToReceived">
                Refer to RECEIVED
              </b-dropdown-item>
              <b-dropdown-item v-if="canStory" @click="createStory">
                Turn this into a Story
              </b-dropdown-item>
              <b-dropdown-item
                v-if="chitChatMod && !newsfeed.hidden"
                @click="hide"
              >
                Hide this thread
              </b-dropdown-item>
              <b-dropdown-item
                v-if="chitChatMod && newsfeed.hidden"
                @click="unhide"
              >
                Unhide this thread
              </b-dropdown-item>
              <b-dropdown-item
                v-if="myid === parseInt(newsfeed.userid) || mod"
                @click="deleteIt"
              >
                Delete this thread
              </b-dropdown-item>
              <b-dropdown-item
                v-if="chitChatMod && !newsfeed.hidden"
                @click="mute"
              >
                Mute user on ChitChat
              </b-dropdown-item>
              <b-dropdown-item
                v-if="chitChatMod && newsfeed.hidden"
                @click="unmute"
              >
                Unmute user on ChitChat
              </b-dropdown-item>
            </b-dropdown>
            <component
              :is="newsComponentName"
              v-if="newsfeed"
              :id="newsfeed?.id"
              :newsfeed="newsfeed"
              :class="newsfeed.deleted ? 'strike' : ''"
              @focus-comment="focusComment"
              @hide="showThis = false"
            />
            <div v-else>Bad feed item {{ newsfeed }}</div>
            <NewsPreviews
              v-if="newsfeed.previews?.length && !newsfeed.html"
              :previews="newsfeed.previews"
              class="mt-1"
            />
          </div>
          <notice-message v-else variant="danger">
            Unknown item type {{ newsfeed?.type }}
          </notice-message>
        </b-card-text>
      </b-card-body>
      <template #footer>
        <NewsReplies
          v-if="newsfeed?.replies?.length"
          :id="id"
          :threadhead="newsfeed.id"
          :scroll-to="scrollDownTo"
          :reply-to="replyingTo"
          :depth="1"
          :class="newsfeed.deleted ? 'strike mr-1' : 'mr-1'"
          @rendered="rendered"
        />
        <span v-if="!newsfeed?.closed">
          <div v-if="enterNewLine">
            <OurAtTa
              v-if="!newsfeed.deleted"
              ref="at"
              :members="tagusers"
              class="flex-shrink-2 input-group"
              :filter-match="filterMatch"
            >
              <b-input-group>
                <slot name="prepend">
                  <span class="input-group-text pl-1 pr-1">
                    <ProfileImage
                      v-if="me.profile.path"
                      :image="me.profile.path"
                      class="m-0 inline"
                      is-thumbnail
                      size="sm"
                      :lazy="false"
                    />
                  </span>
                </slot>
                <AutoHeightTextarea
                  ref="threadcomment"
                  v-model="threadcomment"
                  size="sm"
                  rows="1"
                  max-rows="8"
                  maxlength="2048"
                  spellcheck="true"
                  placeholder="Write a comment on this thread..."
                  class="p-0 pl-1 pt-1 enternewline"
                  @focus="focusedComment"
                />
              </b-input-group>
            </OurAtTa>
          </div>
          <div
            v-else
            @keyup.enter.exact.prevent
            @keydown.enter.exact.prevent="sendComment"
          >
            <OurAtTa
              v-if="!newsfeed.deleted"
              ref="at"
              :members="tagusers"
              class="flex-shrink-2 input-group"
              :filter-match="filterMatch"
            >
              <b-input-group>
                <slot name="prepend">
                  <span class="input-group-text pl-2 pr-1">
                    <ProfileImage
                      v-if="me.profile.path"
                      :image="me.profile.path"
                      class="m-0 inline"
                      is-thumbnail
                      size="sm"
                    />
                  </span>
                </slot>
                <AutoHeightTextarea
                  ref="threadcomment"
                  v-model="threadcomment"
                  size="sm"
                  rows="1"
                  max-rows="8"
                  maxlength="2048"
                  spellcheck="true"
                  placeholder="Write a comment on this thread and hit enter to post..."
                  class="p-0 pl-2 pt-2 entersend"
                  autocapitalize="none"
                  @keydown.enter.shift.exact.prevent="newlineComment"
                  @keydown.alt.shift.enter.exact.prevent="newlineComment"
                  @focus="focusedComment"
                />
              </b-input-group>
            </OurAtTa>
          </div>
          <div
            v-if="threadcomment"
            class="d-flex justify-content-between flex-wrap m-1 mt-2"
          >
            <b-button variant="secondary" @click="photoAdd">
              <v-icon icon="camera" /><span class="d-none d-sm-inline"
                >&nbsp;Add Photo</span
              >
            </b-button>
            <SpinButton
              v-if="enterNewLine"
              variant="primary"
              icon-name="angle-double-right"
              label="Post"
              iconlast
              @handle="sendComment"
            />
          </div>
          <OurUploadedImage
            v-if="ouruid"
            :src="ouruid"
            :modifiers="imagemods"
            alt="ChitChat Photo"
            width="100"
            class="mt-1 ml-4 image__uploaded"
          />
          <NuxtPicture
            v-else-if="imageuid"
            format="webp"
            provider="uploadcare"
            :src="imageuid"
            :modifiers="imagemods"
            alt="ChitChat Photo"
            width="100"
            class="mt-1 ml-4 image__uploaded"
          />
          <OurUploader
            v-if="uploading"
            v-model="currentAtts"
            class="bg-white m-0 pondrow"
            type="Newsfeed"
          />
        </span>
        <notice-message v-else>
          This thread is now closed. Thanks to everyone who contributed.
        </notice-message>
      </template>
    </b-card>
    <NewsEditModal
      v-if="showEditModal"
      :id="id"
      :threadhead="newsfeed?.threadhead"
    />
    <NewsReportModal
      v-if="showReportModal"
      :id="newsfeed.id"
      @hidden="showReportModal = false"
    />
    <ConfirmModal
      v-if="showDeleteModal"
      :title="'Delete thread started by ' + starter"
      @confirm="deleteConfirmed"
      @hidden="showDeleteModal = false"
    />
  </div>
</template>
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import SpinButton from './SpinButton'
import AutoHeightTextarea from './AutoHeightTextarea'
import NewsReplies from '~/components/NewsReplies'
import { untwem } from '~/composables/useTwem'

// Use standard import to avoid screen-flicker
import NewsRefer from '~/components/NewsRefer'
import NewsMessage from '~/components/NewsMessage'
import NewsAboutMe from '~/components/NewsAboutMe'
import NewsCommunityEvent from '~/components/NewsCommunityEvent'
import NewsVolunteerOpportunity from '~/components/NewsVolunteerOpportunity'
import NewsStory from '~/components/NewsStory'
import NewsAlert from '~/components/NewsAlert'
import NewsNoticeboard from '~/components/NewsNoticeboard'
import NoticeMessage from '~/components/NoticeMessage'
import NewsPreviews from '~/components/NewsPreviews'
import ProfileImage from '~/components/ProfileImage'
import { useTeamStore } from '~/stores/team'
import { useAuthStore } from '~/stores/auth'
import { useUserStore } from '~/stores/user'

const NewsReportModal = defineAsyncComponent(() => import('./NewsReportModal'))
const ConfirmModal = () =>
  defineAsyncComponent(() => import('~/components/ConfirmModal.vue'))
const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const OurAtTa = defineAsyncComponent(() => import('~/components/OurAtTa'))

export default {
  name: 'NewsThread',
  components: {
    NewsReplies,
    SpinButton,
    OurUploader,
    NewsReportModal,
    NewsRefer,
    NewsMessage,
    NewsAboutMe,
    NewsCommunityEvent,
    NewsVolunteerOpportunity,
    NewsStory,
    NewsAlert,
    NewsNoticeboard,
    NoticeMessage,
    NewsPreviews,
    ProfileImage,
    ConfirmModal,
    AutoHeightTextarea,
    OurAtTa,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    scrollTo: {
      type: String,
      required: false,
      default: '',
    },
  },
  emits: ['rendered'],
  async setup(props) {
    const newsfeedStore = useNewsfeedStore()
    const teamStore = useTeamStore()
    const authStore = useAuthStore()
    const userStore = useUserStore()

    const me = authStore.user

    // Get ChitChat moderation team so that we can show extra options for them.
    if (
      me &&
      (me.systemrole === 'Moderator' ||
        me.systemrole === 'Support' ||
        me.systemrole === 'Admin')
    ) {
      teamStore.fetch('ChitChat Moderation')
    }

    await newsfeedStore.fetch(props.id)

    return {
      newsfeedStore,
      teamStore,
      userStore,
    }
  },
  data() {
    return {
      scrollDownTo: null,
      replyingTo: null,
      threadcomment: null,
      newsComponents: {
        AboutMe: 'NewsAboutMe',
        Message: 'NewsMessage',
        CommunityEvent: 'NewsCommunityEvent',
        VolunteerOpportunity: 'NewsVolunteerOpportunity',
        Story: 'NewsStory',
        Alert: 'NewsAlert',
        Noticeboard: 'NewsNoticeboard',
      },
      elementBackgroundColor: {
        CommunityEvent: 'card__community-event',
        VolunteerOpportunity: 'card__volunteer-opportunity',
      },
      uploading: false,
      imageid: null,
      ouruid: null,
      imageuid: null,
      imagemods: null,
      showDeleteModal: false,
      showEditModal: false,
      showReportModal: false,
      showThis: true,
      currentAtts: [],
    }
  },
  computed: {
    canRefer() {
      return (
        (this.mod && this.newsfeed?.type !== 'AboutMe') || this.supportOrAdmin
      )
    },
    canStory() {
      return this.mod && this.newsfeed?.type !== 'Story'
    },
    enterNewLine: {
      get() {
        return this.me?.settings?.enterNewLine
      },
      async set(newVal) {
        const settings = this.me.settings
        settings.enterNewLine = newVal

        await this.authStore.saveAndGet({
          settings,
        })
      },
    },
    newsfeed() {
      return this.newsfeedStore?.byId(this.id)
    },
    tagusers() {
      return this.newsfeedStore?.tagusers?.map((u) => u.displayname)
    },
    mod() {
      const me = this.me
      return (
        me &&
        (me.systemrole === 'Moderator' ||
          me.systemrole === 'Admin' ||
          me.systemrole === 'Support')
      )
    },
    backgroundColor() {
      return this.elementBackgroundColor[this.newsfeed?.type] || 'card__default'
    },
    isNewsComponent() {
      return this.newsfeed?.type in this.newsComponents
    },
    newsComponentName() {
      return this.isNewsComponent
        ? this.newsComponents[this.newsfeed?.type]
        : ''
    },
    user() {
      return this.userStore.byId(this.newsfeed?.userid)
    },
    starter() {
      if (this.newsfeed.userid === this.myid) {
        return 'you'
      } else if (this.newsfeed.displayname) {
        return this.newsfeed.displayname
      } else {
        return 'someone'
      }
    },
  },
  watch: {
    currentAtts: {
      handler(newVal) {
        this.uploading = false

        this.imageid = newVal[0].id
        this.imageuid = newVal[0].ouruid
        this.ouruid = newVal[0].ouruid
        this.imagemods = newVal[0].externalmods
      },
      deep: true,
    },
  },
  mounted() {
    // Scroll down now that the child components are rendered.
    this.$emit('rendered')
  },
  methods: {
    rendered(id) {
      if (parseInt(id) === parseInt(this.scrollTo)) {
        this.scrollDownTo = this.scrollTo
      }
    },
    focusComment() {
      this.$refs.threadcomment.$el.focus()
    },
    focusedComment() {
      this.replyingTo = this.newsfeed.id
    },
    async sendComment(callback) {
      if (this.threadcomment && this.threadcomment.trim()) {
        // Encode up any emojis.
        const msg = untwem(this.threadcomment)
        await this.newsfeedStore.send(
          msg,
          this.replyingTo,
          this.id,
          this.imageid
        )

        // New message will be shown because it's in the store and we have a computed property.

        // Clear the textarea now it's sent.
        this.threadcomment = null

        // And any image id
        this.imageid = null
        this.imageuid = null
        this.ouruid = null
        this.imagemods = null
      }

      if (typeof callback === 'function') {
        callback()
      }
    },
    newlineComment() {
      const p = this.$refs.threadcomment.selectionStart
      if (p) {
        this.threadcomment =
          this.threadcomment.substring(0, p) +
          '\n' +
          this.threadcomment.substring(p)
        this.$nextTick(() => {
          this.$refs.threadcomment.selectionStart = p + 1
          this.$refs.threadcomment.selectionEnd = p + 1
        })
      } else {
        this.threadcomment += '\n'
      }
    },
    show() {
      this.showEditModal = true
    },
    async save() {
      await this.newsfeedStore.edit(
        this.id,
        this.newsfeed.message,
        this.newsfeed.id
      )

      this.$refs.editModal.hide()
    },
    deleteIt() {
      this.showDeleteModal = true
    },
    deleteConfirmed() {
      this.newsfeedStore.delete(this.id, this.id)
    },
    async unfollow() {
      await this.newsfeedStore.unfollow(this.id)
    },
    report() {
      this.showReportModal = true
    },
    referToOffer() {
      this.referTo('Offer')
    },
    referToWanted() {
      this.referTo('Wanted')
    },
    referToTaken() {
      this.referTo('Taken')
    },
    referToReceived() {
      this.referTo('Recived')
    },
    async createStory() {
      await this.newsfeedStore.convertToStory(this.id)
    },
    async unhide() {
      await this.newsfeedStore.unhide(this.id)
    },
    async hide() {
      await this.newsfeedStore.hide(this.id)
    },
    async referTo(type) {
      await this.newsfeedStore.referTo(this.id, type)
    },
    filterMatch(name, chunk) {
      // Only match at start of string.
      return name.toLowerCase().indexOf(chunk.toLowerCase()) === 0
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // init callback below.
      this.uploading = true
    },
    async mute() {
      await this.userStore.muteOnChitChat(this.newsfeed.userid)
      await this.newsfeedStore.fetch(this.id)
    },
    async unmute() {
      await this.userStore.unMuteOnChitChat(this.newsfeed.userid)
      await this.newsfeedStore.fetch(this.id)
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

:deep(.img-thumbnail) {
  cursor: pointer;

  max-width: 100px;

  @include media-breakpoint-up(lg) {
    max-width: 100%;
  }
}

.card__community-event {
  background-color: $color-gray-1;
}

.card__volunteer-opportunity {
  background-color: $color-gray-2;
}

.card__default {
  background-color: $color-white;
}

.image__uploaded {
  width: 100px;
}

:deep(.dropdown-toggle) {
  padding-right: 13px;
  padding-left: 10px;
}

:deep(.dropdown-menu) {
  z-index: 10000;
}

:deep(.strike) {
  text-decoration: line-through;
}
</style>
