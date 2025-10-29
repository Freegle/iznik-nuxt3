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
                  ref="threadcommentautoheight"
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
                  ref="threadcommentautoheight"
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
<script setup>
import {
  ref,
  computed,
  defineAsyncComponent,
  watch,
  onMounted,
  nextTick,
} from 'vue'
import SpinButton from './SpinButton'
import AutoHeightTextarea from './AutoHeightTextarea'
import { useNewsfeedStore } from '~/stores/newsfeed'
import NewsReplies from '~/components/NewsReplies'
import { untwem } from '~/composables/useTwem'
import { useAuthStore } from '~/stores/auth'

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
import { useUserStore } from '~/stores/user'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  scrollTo: {
    type: String,
    required: false,
    default: '',
  },
})

const emit = defineEmits(['rendered'])

const NewsReportModal = defineAsyncComponent(() => import('./NewsReportModal'))
const ConfirmModal = defineAsyncComponent(() =>
  import('~/components/ConfirmModal.vue')
)
const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const OurAtTa = defineAsyncComponent(() => import('~/components/OurAtTa'))

// Setup stores
const newsfeedStore = useNewsfeedStore()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const me = computed(() => authStore.user)
const myid = computed(() => me.value?.id)

// References
const at = ref(null)
const threadcomment = ref(null)
const threadcommentref = ref(null)
const threadcommentautoheight = ref(null)

// Reactive state
const scrollDownTo = ref(null)
const replyingTo = ref(null)
const uploading = ref(false)
const imageid = ref(null)
const ouruid = ref(null)
const imageuid = ref(null)
const imagemods = ref(null)
const showDeleteModal = ref(false)
const showEditModal = ref(false)
const showReportModal = ref(false)
const showThis = ref(true)
const currentAtts = ref([])

// Constants
const newsComponents = {
  AboutMe: NewsAboutMe,
  Message: NewsMessage,
  CommunityEvent: NewsCommunityEvent,
  VolunteerOpportunity: NewsVolunteerOpportunity,
  Story: NewsStory,
  Alert: NewsAlert,
  Noticeboard: NewsNoticeboard,
  NewsRefer,
}

const elementBackgroundColor = {
  CommunityEvent: 'card__community-event',
  VolunteerOpportunity: 'card__volunteer-opportunity',
}

// Computed properties
const canRefer = computed(() => {
  return (
    (mod.value && newsfeed.value?.type !== 'AboutMe') || supportOrAdmin.value
  )
})

const canStory = computed(() => {
  return mod.value && newsfeed.value?.type !== 'Story'
})

const enterNewLine = computed({
  get() {
    return me.value?.settings?.enterNewLine
  },
  async set(newVal) {
    const settings = me.value.settings
    settings.enterNewLine = newVal

    await authStore.saveAndGet({
      settings,
    })
  },
})

const newsfeed = computed(() => {
  return newsfeedStore?.byId(props.id)
})

const tagusers = computed(() => {
  return newsfeedStore?.tagusers?.map((u) => u.displayname)
})

const mod = computed(() => {
  return (
    me.value &&
    (me.value.systemrole === 'Moderator' ||
      me.value.systemrole === 'Admin' ||
      me.value.systemrole === 'Support')
  )
})

const chitChatMod = computed(() => {
  return mod.value
})

const supportOrAdmin = computed(() => {
  return (
    me.value &&
    (me.value.systemrole === 'Support' || me.value.systemrole === 'Admin')
  )
})

const backgroundColor = computed(() => {
  return elementBackgroundColor[newsfeed.value?.type] || 'card__default'
})

const isNewsComponent = computed(() => {
  return newsfeed.value?.type in newsComponents
})

const newsComponentName = computed(() => {
  return isNewsComponent.value ? newsComponents[newsfeed.value?.type] : ''
})

const starter = computed(() => {
  if (newsfeed.value?.userid === myid.value) {
    return 'you'
  } else if (newsfeed.value?.displayname) {
    return newsfeed.value.displayname
  } else {
    return 'someone'
  }
})

// Watchers
watch(
  currentAtts,
  (newVal) => {
    if (newVal.length > 0) {
      uploading.value = false
      imageid.value = newVal[0].id
      imageuid.value = newVal[0].ouruid
      ouruid.value = newVal[0].ouruid
      imagemods.value = newVal[0].externalmods
    }
  },
  { deep: true }
)

// Setup
// Get ChitChat moderation team so that we can show extra options for them.
if (
  me.value &&
  (me.value.systemrole === 'Moderator' ||
    me.value.systemrole === 'Support' ||
    me.value.systemrole === 'Admin')
) {
  teamStore.fetch('ChitChat Moderation')
}

// Fetch the newsfeed
await newsfeedStore.fetch(props.id)

// Lifecycle hooks
onMounted(() => {
  // Scroll down now that the child components are rendered.
  emit('rendered')
})

// Methods
function rendered(id) {
  if (parseInt(id) === parseInt(props.scrollTo)) {
    scrollDownTo.value = props.scrollTo
  }
}

function focusComment() {
  console.log('Focus comment', threadcommentref.value)
  if (threadcommentref.value?.$el) {
    threadcommentref.value.$el.focus()
  }

  if (threadcommentautoheight.value) {
    threadcommentautoheight.value.focus()
  }
}

function focusedComment() {
  replyingTo.value = newsfeed.value.id
}

async function sendComment(callback) {
  if (threadcomment.value && threadcomment.value.trim()) {
    // Encode up any emojis.
    const msg = untwem(threadcomment.value)
    await newsfeedStore.send(msg, replyingTo.value, props.id, imageid.value)

    // New message will be shown because it's in the store and we have a computed property.

    // Clear the textarea now it's sent.
    threadcomment.value = null

    // And any image id
    imageid.value = null
    imageuid.value = null
    ouruid.value = null
    imagemods.value = null
  }

  if (typeof callback === 'function') {
    callback()
  }
}

function newlineComment() {
  if (threadcomment.value?.$el) {
    const p = threadcomment.value.$el.selectionStart
    if (p) {
      threadcomment.value.$el.value =
        threadcomment.value.$el.value.substring(0, p) +
        '\n' +
        threadcomment.value.$el.value.substring(p)
      nextTick(() => {
        threadcomment.value.$el.selectionStart = p + 1
        threadcomment.value.$el.selectionEnd = p + 1
      })
    } else {
      threadcomment.value.$el.value += '\n'
    }
  }
}

function show() {
  showEditModal.value = true
}

function deleteIt() {
  showDeleteModal.value = true
}

function deleteConfirmed() {
  newsfeedStore.delete(props.id, props.id)
}

async function unfollow() {
  await newsfeedStore.unfollow(props.id)
}

function report() {
  showReportModal.value = true
}

function referToOffer() {
  referTo('Offer')
}

function referToWanted() {
  referTo('Wanted')
}

function referToTaken() {
  referTo('Taken')
}

function referToReceived() {
  referTo('Recived')
}

async function createStory() {
  await newsfeedStore.convertToStory(props.id)
}

async function unhide() {
  await newsfeedStore.unhide(props.id)
}

async function hide() {
  await newsfeedStore.hide(props.id)
}

async function referTo(type) {
  await newsfeedStore.referTo(props.id, type)
}

function filterMatch(name, chunk) {
  // Only match at start of string.
  return name.toLowerCase().indexOf(chunk.toLowerCase()) === 0
}

function photoAdd() {
  // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
  // init callback below.
  uploading.value = true
}

async function mute() {
  await userStore.muteOnChitChat(newsfeed.value.userid)
  await newsfeedStore.fetch(props.id)
}

async function unmute() {
  await userStore.unMuteOnChitChat(newsfeed.value.userid)
  await newsfeedStore.fetch(props.id)
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
