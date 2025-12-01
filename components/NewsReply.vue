<template>
  <div
    v-observe-visibility="visibilityChanged"
    :class="{ 'bg-info': scrollToThis }"
  >
    <div v-if="mod || myid === reply.userid || !reply.hidden" class="reply">
      <div
        class="clickme align-top"
        title="Click to see their profile"
        @click="showInfo"
      >
        <ProfileImage
          :image="reply.profile?.paththumb"
          class="ml-1 mr-2 mt-1 mb-1 inline"
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
          <OurUploadedImage
            v-if="reply?.image?.ouruid"
            :src="reply?.image?.ouruid"
            :modifiers="reply?.image?.externalmods"
            alt="ChitChat Photo"
            :width="100"
            class="clickme replyphoto mt-2 mb-2"
            @click="showReplyPhotoModal"
          />
          <NuxtPicture
            v-else-if="reply?.image?.externaluid"
            format="webp"
            fit="cover"
            provider="uploadcare"
            :src="reply?.image?.externaluid"
            :modifiers="reply?.image?.externalmods"
            alt="ChitChat Photo"
            :width="100"
            class="clickme replyphoto mt-2 mb-2"
            @click="showReplyPhotoModal"
          />
        </div>
        <div v-if="userid" class="text-muted align-items-center">
          <span class="text-muted small mr-1">
            <span class="d-none d-md-inline">{{ replyaddedago }}</span>
            <span class="d-md-none">{{ replyaddedagoShort }}</span>
          </span>
          <NewsUserInfo :id="id" class="mr-1 d-inline" />
        </div>
        <div class="reply-actions">
          <button class="reply-action" @click="replyReply">
            <v-icon icon="reply" class="action-icon" />
            <span class="action-text">Reply</span>
          </button>
          <template v-if="!reply.loved && reply.userid !== myid">
            <button class="reply-action" @click="love">
              <v-icon icon="heart" class="action-icon" />
              <span class="action-text">Love</span>
            </button>
          </template>
          <template v-if="reply.loved">
            <button class="reply-action loved" @click="unlove">
              <v-icon icon="heart" class="action-icon text-danger" />
              <span class="action-text">Loved</span>
            </button>
          </template>
          <template v-if="reply.loves">
            <button
              class="reply-action love-count"
              :aria-label="getShowLovesLabel"
              @click="showLove"
            >
              <v-icon icon="heart" class="text-danger" />
              <span>{{ reply.loves }}</span>
            </button>
          </template>
          <template v-if="parseInt(me.id) !== parseInt(userid)">
            <ChatButton
              class="reply-action"
              :userid="userid"
              title="Message"
              variant="link"
              size="sm"
              :show-icon="true"
              btn-class="text-muted p-0"
              title-class="d-none d-sm-inline ms-1"
            />
          </template>
          <!-- More actions dropdown -->
          <b-dropdown
            v-if="hasMoreActions"
            variant="link"
            no-caret
            right
            class="more-actions-dropdown"
          >
            <template #button-content>
              <v-icon icon="ellipsis-h" class="text-muted" />
            </template>
            <b-dropdown-item
              v-if="parseInt(me.id) === parseInt(userid) || admin"
              @click="showEdit"
            >
              <v-icon icon="pen" class="me-2" />Edit
            </b-dropdown-item>
            <b-dropdown-item
              v-if="parseInt(me.id) === parseInt(userid) || mod"
              @click="deleteReply"
            >
              <v-icon icon="trash" class="me-2" />Delete
            </b-dropdown-item>
            <b-dropdown-item
              v-if="chitChatMod && !reply.hidden"
              @click="hideReply"
            >
              <v-icon icon="eye-slash" class="me-2" />Hide
            </b-dropdown-item>
            <b-dropdown-item
              v-if="chitChatMod && reply.hidden"
              @click="unHideReply"
            >
              <v-icon icon="eye" class="me-2" />Unhide
            </b-dropdown-item>
          </b-dropdown>
        </div>
        <NewsPreviews
          v-if="reply.previews?.length"
          :previews="reply.previews"
          class="mt-1"
          size="sm"
        />
        <div v-if="mod && reply.hidden" class="text-danger small">
          This has been hidden by
          <UserName v-if="reply?.hiddenby" :id="reply.hiddenby" intro="by" />
          <span v-else>the system</span>
          and is only visible to volunteers and the person who posted it.
        </div>
      </div>
    </div>
    <NewsReplies
      v-if="reply?.replies?.length"
      :id="id"
      :threadhead="threadhead"
      :scroll-to="scrollTo"
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
          <template #prepend>
            <span class="input-group-text pl-1 pr-1">
              <ProfileImage
                v-if="me.profile.path"
                :image="me.profile.path"
                class="m-0 inline"
                is-thumbnail
                size="sm"
              />
            </span>
          </template>
          <AutoHeightTextarea
            ref="replyboxref"
            v-model="replybox"
            rows="1"
            max-rows="8"
            :placeholder="replyPlaceholder"
            class="reply-textarea"
            @focus="focusedReply"
          />
        </OurAtTa>
      </div>
      <div
        v-else
        class="w-100"
        @keyup.enter.exact.prevent
        @keydown.enter.exact.prevent="sendReply"
      >
        <OurAtTa
          ref="at"
          :members="tagusers"
          class="pl-2 input-group"
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
                />
              </span>
            </slot>
            <AutoHeightTextarea
              ref="replyboxref"
              v-model="replybox"
              rows="1"
              max-rows="8"
              :placeholder="replyPlaceholder"
              class="reply-textarea"
              @keydown.enter.exact.prevent
              @keyup.enter.exact="sendReply"
              @keydown.enter.shift.exact.prevent="newlineReply"
              @keydown.alt.shift.enter.exact.prevent="newlineReply"
              @focus="focusedReply"
            />
          </b-input-group>
        </OurAtTa>
      </div>
      <div class="reply-toolbar">
        <button class="toolbar-btn" title="Add photo" @click="photoAdd">
          <v-icon icon="camera" />
          <span class="toolbar-label">Photo</span>
        </button>
        <button
          v-if="enterNewLine"
          class="toolbar-btn send-btn"
          :disabled="!replybox?.trim()"
          @click="sendReply"
        >
          <v-icon icon="paper-plane" />
          <span class="toolbar-label">Send</span>
        </button>
      </div>
    </div>
    <NuxtPicture
      v-if="imageuid"
      format="webp"
      fit="cover"
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
    <NewsPhotoModal
      v-if="showNewsPhotoModal && reply.image"
      :id="reply.image.id"
      :newsfeedid="reply.id"
      :src="reply.image.path"
      imgtype="Newsfeed"
      imgflag="Newsfeed"
      @hidden="showNewsPhotoModal = false"
    />
    <ProfileModal
      v-if="showProfileModal"
      :id="userid"
      @hidden="showProfileModal = false"
    />
    <NewsLovesModal
      v-if="showLoveModal"
      :id="id"
      @hidden="showLoveModal = false"
    />
    <NewsEditModal
      v-if="showEditModal"
      :id="id"
      :threadhead="threadhead"
      @hidden="showEditModal = false"
    />
    <ConfirmModal
      v-if="showDeleteModal"
      :title="'Delete reply from ' + reply.displayname"
      @confirm="deleteConfirm"
      @hidden="showDeleteModal = false"
    />
  </div>
</template>
<script setup>
import pluralize from 'pluralize'
import {
  ref,
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  watch,
} from 'vue'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useMiscStore } from '~/stores/misc'
import { twem, untwem } from '~/composables/useTwem'
import NewsUserInfo from '~/components/NewsUserInfo'
import NewsHighlight from '~/components/NewsHighlight'
import ChatButton from '~/components/ChatButton'
import NewsPreviews from '~/components/NewsPreviews'
import ProfileImage from '~/components/ProfileImage'
import AutoHeightTextarea from '~/components/AutoHeightTextarea'
import { timeago, timeagoShort } from '~/composables/useTimeFormat'
import { useAuthStore } from '~/stores/auth'

const NewsPhotoModal = defineAsyncComponent(() =>
  import('./NewsPhotoModal.vue')
)
const NewsLovesModal = defineAsyncComponent(() => import('./NewsLovesModal'))
const NewsEditModal = defineAsyncComponent(() => import('./NewsEditModal'))
const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)
const ConfirmModal = defineAsyncComponent(() =>
  import('~/components/ConfirmModal.vue')
)
const NewsReplies = defineAsyncComponent(() =>
  import('~/components/NewsReplies.vue')
)
const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const OurAtTa = defineAsyncComponent(() => import('~/components/OurAtTa'))

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  threadhead: {
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
})

const emit = defineEmits(['rendered'])

// Stores
const newsfeedStore = useNewsfeedStore()
const miscStore = useMiscStore()
const authStore = useAuthStore()
const me = computed(() => authStore.user)
const myid = computed(() => me.value?.id)

const isMobile = computed(() => {
  return miscStore.breakpoint === 'xs' || miscStore.breakpoint === 'sm'
})

const replyPlaceholder = computed(() => {
  return isMobile.value ? 'Reply...' : 'Write a reply...'
})

// Refs
const at = ref(null)
const replybox = ref(null)
const replyboxref = ref(null)
const showReplyBox = ref(false)
const replyingTo = ref(null)
const uploading = ref(false)
const imageid = ref(null)
const imageuid = ref(null)
const imagemods = ref(null)
const showDeleteModal = ref(false)
const showLoveModal = ref(false)
const showEditModal = ref(false)
const hasBecomeVisible = ref(false)
const isVisible = ref(false)
const showProfileModal = ref(false)
const showNewsPhotoModal = ref(false)
const currentAtts = ref([])
const bump = ref(0) // Used to force re-renders

// Computed properties
const enterNewLine = computed(() => {
  return me.value?.settings?.enterNewLine
})

const userid = computed(() => {
  return reply.value?.userid
})

const reply = computed(() => {
  return newsfeedStore?.byId(props.id)
})

const replyaddedago = computed(() => {
  return timeago(reply.value.added)
})

const replyaddedagoShort = computed(() => {
  return timeagoShort(reply.value.added)
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

const admin = computed(() => {
  return (
    me.value &&
    (me.value.systemrole === 'Admin' || me.value.systemrole === 'Support')
  )
})

const chitChatMod = computed(() => {
  return mod.value
})

const emessage = computed(() => {
  return reply.value.message ? (twem(reply.value.message) + '').trim() : null
})

const threadUsers = computed(() => {
  const ret = []
  for (const user in tagusers.value) {
    ret.push('@' + tagusers.value[user])
  }
  return ret
})

const scrollToThis = computed(() => {
  return parseInt(props.scrollTo) === props.id
})

const getShowLovesLabel = computed(() => {
  return (
    'This comment has ' +
    pluralize('love', reply.value.loves, true) +
    '. Who loves this?'
  )
})

const hasMoreActions = computed(() => {
  return (
    parseInt(me.value?.id) === parseInt(userid.value) ||
    admin.value ||
    mod.value ||
    chitChatMod.value
  )
})

// Watchers
watch(
  () => props.scrollTo,
  (newVal) => {
    if (parseInt(props.scrollTo) === props.id && scrollIntoView) {
      scrollIntoView()
    }
  }
)

watch(
  currentAtts,
  (newVal) => {
    if (newVal.length > 0) {
      uploading.value = false
      imageid.value = newVal[0].id
      imageuid.value = newVal[0].ouruid
      imagemods.value = newVal[0].externalmods
    }
  },
  { deep: true }
)

// Lifecycle hooks
onMounted(() => {
  // This will get propogated up the stack so that we know if the reply to which we'd like to scroll has been
  // rendered.  We'll then come through the watch above.
  emit('rendered', props.id)
})

// Methods
function showInfo() {
  showProfileModal.value = true
}

function focusedReply() {
  replyingTo.value = props.id
  showReplyBox.value = true
}

watch(replyboxref, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    newVal.$el.focus()
  }
})

function replyReply() {
  replyingTo.value = props.id
  showReplyBox.value = true

  // Reply with tag.
  replybox.value = '@' + reply.value.displayname + ' '
}

async function sendReply(callback) {
  // Encode up any emojis.
  if (replybox.value && replybox.value.trim()) {
    const msg = untwem(replybox.value)

    await newsfeedStore.send(
      msg,
      replyingTo.value,
      props.threadhead,
      imageid.value
    )

    // New message will be shown because it's in the store and we have a computed property.

    // Clear and hide the textarea now it's sent.
    replybox.value = null
    showReplyBox.value = false

    // And any image id
    imageid.value = null
    imageuid.value = null
    imagemods.value = null

    // Force re-render. Store reactivity doesn't seem to work nicely with the nested reply structure we have.
    bump.value++
  }

  if (typeof callback === 'function') {
    callback()
  }
}

function newlineReply() {
  if (replybox.value && replybox.value.$el) {
    const p = replybox.value.$el.selectionStart
    if (p) {
      replybox.value.$el.value =
        replybox.value.$el.value.substring(0, p) +
        '\n' +
        replybox.value.$el.value.substring(p)
      nextTick(() => {
        replybox.value.$el.selectionStart = p + 1
        replybox.value.$el.selectionEnd = p + 1
      })
    } else {
      replybox.value.$el.value += '\n'
    }
  }
}

async function love(e) {
  const el = e.target
  el.classList.add('pulsate')

  await newsfeedStore.love(props.id, props.threadhead)

  el.classList.remove('pulsate')
}

async function unlove(e) {
  const el = e.target
  el.classList.add('pulsate')

  await newsfeedStore.unlove(props.id, props.threadhead)

  el.classList.remove('pulsate')
}

async function unHideReply() {
  await newsfeedStore.unhide(props.id)
}

async function hideReply() {
  await newsfeedStore.hide(props.id)
}

function deleteReply() {
  showDeleteModal.value = true
}

async function deleteConfirm() {
  await newsfeedStore.delete(props.id, props.threadhead)
}

function showEdit() {
  showEditModal.value = true
}

function showLove() {
  showLoveModal.value = true
}

function filterMatch(name, chunk) {
  // Only match at start of string.
  return name.toLowerCase().indexOf(chunk.toLowerCase()) === 0
}

function photoAdd() {
  // Flag that we're uploading. This will trigger the render of the filepond instance and subsequently the
  // init callback below.
  uploading.value = true
}

function scrollIntoView() {
  const api = miscStore.apiCount

  if (api) {
    // Try later
    setTimeout(scrollIntoView, 100)
  } else {
    // No outstanding requests, so we can scroll.
    const el = document.getElementById(`newsreply-${props.id}`)
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })

      nextTick(() => {
        if (!isVisible.value) {
          setTimeout(scrollIntoView, 200)
        } else {
          hasBecomeVisible.value = true
        }
      })
    }
  }
}

function visibilityChanged(visible) {
  if (parseInt(props.scrollTo) === props.id && !hasBecomeVisible.value) {
    isVisible.value = visible

    if (!visible) {
      scrollIntoView()
    }
  }
}

function showReplyPhotoModal() {
  showNewsPhotoModal.value = true
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.reply {
  display: flex;
}

.replyphoto {
  width: 150px;
}

.image__uploaded {
  width: 100px;
}

// Modern reply actions
.reply-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}

.reply-action {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  color: $colour-secondary;
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: $color-gray--lighter;
    color: darken($colour-secondary, 10%);
  }

  .action-icon {
    font-size: 0.75rem;
  }

  &.loved {
    color: $colour-secondary;
  }

  &.love-count {
    padding: 0.25rem 0.375rem;
    font-size: 0.75rem;
  }
}

.more-actions-dropdown {
  :deep(.btn) {
    padding: 0.25rem 0.375rem;
    line-height: 1;

    &:hover {
      background: $color-gray--lighter;
    }
  }

  :deep(.dropdown-menu) {
    font-size: 0.9rem;
    min-width: 140px;
  }

  :deep(.dropdown-item) {
    padding: 0.5rem 0.75rem;
  }
}

.reply-textarea {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.9rem;
  min-height: 32px;

  &:focus {
    border-color: $color-green-background;
    outline: none;
  }
}

.reply-toolbar {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: $color-gray--lighter;
  border: none;
  border-radius: 4px;
  color: $color-gray--darker;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: darken($color-gray--lighter, 5%);
    color: $color-green-background;
  }
}

.send-btn {
  background: $color-green-background;
  color: white;

  &:hover:not(:disabled) {
    background: darken($color-green-background, 8%);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

:deep(.fa-icon) {
  margin-bottom: 1px;
}

:deep(.strike) {
  text-decoration: line-through;
}
</style>
