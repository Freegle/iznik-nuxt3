<template>
  <div
    v-observe-visibility="visibilityChanged"
    :class="{ 'bg-info': scrollToThis }"
  >
    <div class="reply">
      <div
        class="clickme align-top"
        title="Click to see their profile"
        @click="showInfo"
      >
        <ProfileImage
          :image="reply.profile?.paththumb"
          class="ml-1 mr-2 mt-1 mb-1 inline float-left"
          :is-moderator="Boolean(reply.showmod && reply.replyto === threadhead)"
          :size="reply.replyto !== threadhead ? 'sm' : 'md'"
          :lazy="false"
        />
      </div>
      <div class="align-top">
        <span
          class="text-success font-weight-bold clickme"
          title="Click to see their profile"
          @click="showInfo"
          >{{ reply.displayname }}</span
        >
        <span
          :class="
            'font-weight-bold preline forcebreak text--small nopara ml-1 ' +
            (reply.deleted ? 'strike' : '')
          "
        >
          <NewsHighlight
            :search-words="threadUsers"
            :text="emessage"
            :max-chars="500"
            class="font-weight-bold preline forcebreak text--small d-inline"
          />
          <br />
        </span>
        <div v-if="reply.image">
          <b-img
            rounded
            class="clickme replyphoto mt-2 mb-2"
            generator-unable-to-provide-required-alt=""
            :src="reply.image.paththumb"
            @click="showReplyPhotoModal"
            @error="brokenImage"
          />
        </div>
        <span
          v-if="userid"
          class="text-muted d-flex flex-row flex-wrap align-items-center"
        >
          <span class="text-muted small mr-1">
            {{ timeago(reply.added) }}
          </span>
          <NewsUserInfo :id="replyid" class="mr-1" />
          &bull;
          <b-button
            variant="link"
            size="sm"
            class="reply__button text-muted"
            @click="replyReply"
          >
            Reply
          </b-button>
          <template v-if="!reply.loved">
            &bull;
            <b-button
              variant="link"
              size="sm"
              class="reply__button text-muted"
              @click="love"
            >
              Love this
            </b-button>
          </template>
          <template v-if="reply.loved">
            &bull;
            <b-button
              variant="link"
              size="sm"
              class="reply__button text-muted"
              @click="unlove"
            >
              Unlove this
            </b-button>
          </template>
          <template v-if="reply.loves">
            &bull;
            <b-button
              variant="link"
              size="sm"
              class="mr-1 small text-muted showlove"
              :aria-label="getShowLovesLabel"
              @click="showLove"
            >
              <v-icon icon="heart" class="text-danger" />&nbsp;{{ reply.loves }}
            </b-button>
          </template>
          <template v-if="parseInt(me.id) === parseInt(userid) || admin">
            &bull;
            <b-button
              variant="link"
              size="sm"
              class="reply__button text-muted"
              @click="showEdit"
            >
              Edit
            </b-button>
          </template>
          <template v-if="parseInt(me.id) === parseInt(userid) || mod">
            &bull;
            <b-button
              variant="link"
              size="sm"
              class="reply__button text-muted"
              @click="deleteReply"
            >
              Delete
            </b-button>
          </template>
          <template v-if="parseInt(me.id) !== parseInt(userid)">
            &bull;
            <ChatButton
              class="reply__button text-muted d-flex align-items-center"
              :userid="userid"
              title="Message"
              variant="link"
              size="sm"
              :show-icon="false"
              btn-class="text-muted p-0 mbsmall"
              title-class="ml-0"
            />
          </template>
        </span>
        <NewsPreview
          v-if="reply.preview"
          :preview="reply.preview"
          class="mt-1"
          size="sm"
        />
        <div v-if="reply.hidden" class="text-danger small">
          This has been hidden and is only visible to volunteers and the person
          who posted it.
        </div>
      </div>
    </div>
    <NewsReplies
      :id="id"
      :threadhead="threadhead"
      :scroll-to="scrollTo"
      :reply-ids="reply.replies.map((r) => r.id)"
      :reply-to="reply.id"
      :depth="depth + 1"
    />
    <div v-if="showReplyBox" class="mb-2 pb-1 ml-4">
      <div v-if="enterNewLine" class="w-100">
        <OurAtTa
          ref="at"
          :members="tagusers"
          class="pl-2 input-group"
          :filter-match="filterMatch"
        >
          <b-input-group-prepend>
            <span class="input-group-text pl-1 pr-1">
              <ProfileImage
                v-if="me.profile.path"
                :image="me.profile.path"
                class="m-0 inline float-left"
                is-thumbnail
                size="sm"
              />
            </span>
          </b-input-group-prepend>
          <b-form-textarea
            ref="replybox"
            v-model="replybox"
            size="sm"
            rows="1"
            max-rows="8"
            maxlength="2048"
            spellcheck="true"
            placeholder="Write a reply to this comment..."
            class="p-0 pl-1 pt-1"
            @focus="focusedReply"
          />
        </OurAtTa>
      </div>
      <div
        v-else
        class="w-100"
        @keyup.enter.exact.prevent
        @keydown.enter.exact="sendReply"
      >
        <OurAtTa
          ref="at"
          :members="tagusers"
          class="pl-2 input-group"
          :filter-match="filterMatch"
        >
          <b-input-group>
            <b-input-group-prepend>
              <span class="input-group-text pl-1 pr-1">
                <ProfileImage
                  v-if="me.profile.path"
                  :image="me.profile.path"
                  class="m-0 inline float-left"
                  is-thumbnail
                  size="sm"
                />
              </span>
            </b-input-group-prepend>
            <b-form-textarea
              ref="replybox"
              v-model="replybox"
              size="sm"
              rows="1"
              max-rows="8"
              maxlength="2048"
              spellcheck="true"
              placeholder="Write a reply to this comment and hit enter to send..."
              class="p-0 pl-1 pt-1"
              autocapitalize="none"
              @keydown.enter.exact.prevent
              @keyup.enter.exact="sendReply"
              @keydown.enter.shift.exact.prevent="newlineReply"
              @keydown.alt.shift.exact.prevent="newlineReply"
              @focus="focusedReply"
            />
          </b-input-group>
        </OurAtTa>
      </div>
      <div class="d-flex justify-content-between flex-wrap m-1">
        <b-button size="sm" variant="secondary" @click="photoAdd">
          <v-icon icon="camera" />&nbsp;Add Photo
        </b-button>
        <SpinButton
          v-if="enterNewLine"
          variant="primary"
          name="angle-double-right"
          label="Post"
          iconlast
          spinclass="text-white"
          @handle="sendReply"
        />
      </div>
    </div>
    <b-img
      v-if="imageid"
      lazy
      thumbnail
      :src="imagethumb"
      class="mt-1 ml-4 image__uploaded"
    />
    <OurFilePond
      v-if="uploading"
      class="bg-white m-0 pondrow"
      imgtype="Newsfeed"
      imgflag="newsfeed"
      @photo-processed="photoProcessed"
    />
    <NewsPhotoModal
      v-if="reply.image"
      :id="reply.image.id"
      ref="replyPhotoModal"
      :newsfeedid="reply.id"
      :src="reply.image.path"
      imgtype="Newsfeed"
      imgflag="Newsfeed"
    />
    <ProfileModal v-if="infoclick" :id="userid" ref="profilemodal" />
    <NewsLovesModal v-if="showLoveModal" :id="replyid" ref="loveModal" />
    <NewsEditModal
      v-if="showEditModal"
      :id="replyid"
      ref="editModal"
      :threadhead="threadhead"
    />
    <ConfirmModal
      v-if="showDeleteModal"
      ref="deleteConfirm"
      :title="'Delete reply from ' + reply.displayname"
      @confirm="deleteConfirm"
    />
  </div>
</template>
<script>
import pluralize from 'pluralize'
import { useNewsfeedStore } from '../stores/newsfeed'
import { useUserStore } from '../stores/user'
import { useMiscStore } from '../stores/misc'
import NewsLovesModal from './NewsLovesModal'
import SpinButton from './SpinButton'
import NewsEditModal from './NewsEditModal'
import { twem, untwem } from '~/composables/useTwem'

import NewsUserInfo from '~/components/NewsUserInfo'
import NewsHighlight from '~/components/NewsHighlight'
import ChatButton from '~/components/ChatButton'
import NewsPreview from '~/components/NewsPreview'
import ProfileImage from '~/components/ProfileImage'

const ProfileModal = () => import('~/components/ProfileModal')
const ConfirmModal = () => import('~/components/ConfirmModal.vue')
const NewsReplies = () => import('~/components/NewsReplies.vue')
const OurFilePond = () => import('~/components/OurFilePond')
const OurAtTa = () => import('~/components/OurAtTa')

export default {
  name: 'NewsReply',
  components: {
    NewsEditModal,
    NewsReplies,
    SpinButton,
    OurFilePond,
    NewsLovesModal,
    NewsUserInfo,
    NewsHighlight,
    ProfileModal,
    ChatButton,
    NewsPreview,
    ProfileImage,
    ConfirmModal,
    OurAtTa,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    threadhead: {
      type: Number,
      required: true,
    },
    replyid: {
      type: Number,
      required: true,
    },
    scrollTo: {
      type: String,
      required: false,
      default: '',
    },
    depth: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const newsfeedStore = useNewsfeedStore()
    const userStore = useUserStore()
    const miscStore = useMiscStore()

    return {
      userStore,
      newsfeedStore,
      miscStore,
    }
  },
  data() {
    return {
      showReplyBox: false,
      replyingTo: null,
      replybox: null,
      infoclick: false,
      showAllReplies: false,
      uploading: false,
      imageid: null,
      imagethumb: null,
      showDeleteModal: false,
      showLoveModal: false,
      showEditModal: false,
      hasBecomeVisible: false,
      isVisible: false,
    }
  },
  computed: {
    enterNewLine() {
      return this.me?.settings?.enterNewLine
    },
    userid() {
      return this.reply?.userid
    },
    reply() {
      return this.newsfeedStore?.byId(this.replyid)
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
    emessage() {
      return this.reply.message ? (twem(this.reply.message) + '').trim() : null
    },
    threadUsers() {
      const ret = []
      for (const user in this.tagusers) {
        ret.push('@' + this.tagusers[user])
      }
      return ret
    },
    scrollToThis() {
      return parseInt(this.scrollTo) === this.replyid
    },
    getShowLovesLabel() {
      return (
        'This comment has ' +
        pluralize('love', this.reply.loves, true) +
        '. Who loves this?'
      )
    },
  },
  watch: {
    scrollTo(newVal) {
      if (parseInt(this.scrollTo) === this.replyid && this.$el.scrollIntoView) {
        this.scrollIntoView()
      }
    },
  },
  mounted() {
    // This will get propogated up the stack so that we know if the reply to which we'd like to scroll has been
    // rendered.  We'll then come through the watch above.
    this.$emit('rendered', this.replyid)
  },
  methods: {
    async showInfo() {
      this.infoclick = true
      await this.waitForRef('profilemodal')
      this.$refs.profilemodal.show()
    },
    async replyReply() {
      console.log('Replying to', this.replyid, this.reply)
      this.replyingTo = this.replyid
      this.showReplyBox = true

      await this.waitForRef('replybox')
      this.$refs.replybox.$el.focus()

      // Reply with tag.
      this.replybox = '@' + this.reply.displayname + ' '
    },
    focusReply() {
      this.$refs.replybox.focus()
    },
    focusedReply() {
      this.replyingTo = this.replyid
    },
    async sendReply(e) {
      if (e) {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      }

      // Encode up any emojis.
      if (this.replybox && this.replybox.trim()) {
        const msg = untwem(this.replybox)

        await this.newsfeedStore.send(
          msg,
          this.replyingTo,
          this.threadhead,
          this.imageid
        )

        // New message will be shown because it's in the store and we have a computed property.

        // Clear and hide the textarea now it's sent.
        this.replybox = null
        this.showReplyBox = false

        // And any image id
        this.imageid = null

        // Force re-render.  Store reactivity doesn't seem to work nicely with the nested reply structure we have.
        this.bump++
      }
    },
    newlineReply() {
      const p = this.$refs.replybox.selectionStart
      if (p) {
        this.replybox =
          this.replybox.substring(0, p) + '\n' + this.replybox.substring(p)
        this.$nextTick(() => {
          this.$refs.replybox.selectionStart = p + 1
          this.$refs.replybox.selectionEnd = p + 1
        })
      } else {
        this.replybox += '\n'
      }
    },
    async love(e) {
      const el = e.target
      el.classList.add('pulsate')

      await this.newsfeedStore.love(this.replyid, this.threadhead)

      el.classList.remove('pulsate')
    },
    async unlove(e) {
      const el = e.target
      el.classList.add('pulsate')

      await this.newsfeedStore.unlove(this.replyid, this.threadhead)

      el.classList.remove('pulsate')
    },
    async deleteReply() {
      this.showDeleteModal = true
      await this.waitForRef('deleteConfirm')
      this.$refs.deleteConfirm.show()
    },
    async deleteConfirm() {
      await this.newsfeedStore.delete(this.replyid, this.threadhead)
    },
    brokenImage(event) {
      event.target.src = '/defaultprofile.png'
    },
    async showEdit() {
      this.showEditModal = true
      await this.waitForRef('editModal')
      this.$refs.editModal.show()
    },
    async showLove() {
      this.showLoveModal = true
      await this.waitForRef('loveModal')
      this.$refs.loveModal.show()
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
    photoProcessed(imageid, imagethumb) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      // The imageid is in this.imageid
      this.imageid = imageid
      this.imagethumb = imagethumb
    },
    scrollIntoView() {
      const api = this.miscStore.apiCount

      if (api) {
        // Try later
        setTimeout(this.scrollIntoView, 100)
      } else {
        // No outstanding requests, so we can scroll.
        this.$el.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        })

        this.$nextTick(() => {
          if (!this.isVisible) {
            setTimeout(this.scrollIntoView, 200)
          } else {
            this.hasBecomeVisible = true
          }
        })
      }
    },
    visibilityChanged(visible) {
      if (parseInt(this.scrollTo) === this.replyid && !this.hasBecomeVisible) {
        this.isVisible = visible

        if (!visible) {
          this.scrollIntoView()
        }
      }
    },
    showReplyPhotoModal() {
      this.$refs.replyPhotoModal.show()
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.reply {
  display: flex;
}

.replyphoto {
  width: 150px;
}

.image__uploaded {
  width: 100px;
}

.reply__button {
  margin-left: 3px;
  margin-right: 3px;
  padding: 0;
}

.showlove {
  border: none;
  padding: 3px;
  font-size: 0.8rem;
}

:deep(.fa-icon) {
  margin-bottom: 1px;
}

:deep(.strike) {
  text-decoration: line-through;
}

:deep(.mbsmall) {
  margin-bottom: 0.125rem !important;
}
</style>
