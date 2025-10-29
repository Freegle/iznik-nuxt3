<template>
  <div>
    <div
      v-if="chat && (chat.chattype !== 'User2User' || otheruser?.info)"
      class="outer position-relative"
    >
      <div class="nameinfo pt-md-1 pb-md-1 pl-md-1">
        <div
          class="profile d-flex flex-column justify-content-around flex-grow-1"
        >
          <ProfileImage
            v-if="!collapsed && chat.icon"
            :image="chat.icon"
            class="pr-1 clickme d-none d-md-flex"
            is-thumbnail
            size="xl"
            border
            @click="showInfo"
          />
        </div>
        <div
          v-if="
            !collapsed && otheruser && otheruser.info && !otheruser?.deleted
          "
          class="d-none d-md-flex flex-column align-content-between pr-1 ratings"
        >
          <UserRatings
            :id="chat.otheruid"
            :key="'otheruser-' + chat.otheruid"
            class="mb-1 mb-md-0 mt-1 d-flex justify-content-end"
            size="sm"
          />
          <SupporterInfo v-if="otheruser.supporter" class="align-self-end" />
        </div>
        <div class="name font-weight-bold black text--large d-none d-md-block">
          {{ chat.name }}
        </div>
        <div
          v-if="otheruser && otheruser.info && !otheruser?.deleted"
          class="d-none d-md-flex flex-column align-content-between pr-1 ratings"
        >
          <UserRatings
            :id="chat.otheruid"
            :key="'otheruser-' + chat.otheruid"
            class="mb-1 mb-md-0 mt-1 d-flex justify-content-end"
            size="sm"
          />
          <SupporterInfo v-if="otheruser.supporter" class="align-self-end" />
        </div>
        <span
          v-if="!collapsed && otheruser && otheruser.info"
          class="userinfo mr-2"
        >
          <span
            class="small d-flex d-md-block justify-content-between flex-wrap"
          >
            <span v-if="otheruser.lastaccess" class="d-inline d-md-block">
              <span class="d-none d-md-inline">Last seen</span>
              <span class="d-inline d-md-none">Seen</span>
              <!-- eslint-disable-next-line-->
              <strong :title="datetimeshort(otheruser.lastaccess)" class="ml-1" >{{ otheraccess }}</strong>
              <span class="d-none d-md-inline">.</span>
            </span>
            <span v-if="replytime" class="d-inline d-md-block">
              <span class="d-none d-md-inline">Typically replies in</span>
              <span class="d-inline d-md-none">Replies in</span>
              <strong class="ml-1">{{ replytime }}</strong
              ><span class="d-none d-md-inline">.</span>
            </span>
            <span
              v-if="!otheruser?.deleted && milesaway"
              class="d-none d-md-block"
            >
              About <strong>{{ milesstring }}</strong
              >.
            </span>
          </span>
        </span>
      </div>
      <div
        v-if="aboutthem && !collapsed"
        class="d-none d-md-flex"
        @click="showInfo"
      >
        <div>"</div>
        <blockquote class="font-weight-bold aboutthem mb-0">
          {{ aboutthem }}
        </blockquote>
        <div>"</div>
      </div>
      <b-button
        v-if="unseen"
        variant="white"
        class="ml-1 d-block d-md-none"
        @click="markRead"
      >
        Mark read
        <b-badge variant="danger">
          {{ unseen }}
        </b-badge>
      </b-button>
      <div
        v-if="!collapsed"
        class="d-flex flex-wrap justify-content-between p-md-1 mt-md-1 actions"
      >
        <div class="d-flex">
          <b-button
            v-if="unseen"
            variant="white"
            class="d-none d-md-block mr-2"
            @click="markRead"
          >
            Mark read
            <b-badge variant="danger">
              {{ unseen }}
            </b-badge>
          </b-button>
          <div
            v-if="otheruser && otheruser.info && !otheruser?.deleted"
            class="mr-2"
          >
            <b-button
              v-b-tooltip="'Show the full profile for this freegler'"
              variant="secondary"
              class="d-none d-md-block"
              @click="showInfo"
            >
              View profile
            </b-button>
            <b-button
              v-b-tooltip="'Show the full profile for this freegler'"
              variant="link"
              size="sm"
              class="d-block d-md-none"
              @click="showInfo"
            >
              <span class="d-none d-md-block"> View profile </span>
              <span class="d-block d-md-none"> Profile </span>
            </b-button>
          </div>
          <div v-if="chat.chattype === 'User2User' || !unseen" class="mr-2">
            <template v-if="chat.status === 'Closed'">
              <b-button
                v-b-tooltip="'Unhide this chat'"
                variant="secondary"
                class="d-none d-md-block"
                @click="unhide"
              >
                <span class="d-none d-md-block"> Unhide chat </span>
                <span class="d-block d-md-none"> Unhide </span>
              </b-button>
              <b-button
                v-b-tooltip="'Unhide this chat'"
                variant="link"
                size="sm"
                class="d-block d-md-none"
                @click="unhide"
              >
                Unhide chat
              </b-button>
            </template>
            <template v-else>
              <b-button
                v-b-tooltip="
                  'Don\'t show this chat unless there\'s a new message'
                "
                variant="secondary"
                class="d-none d-md-block"
                @click="showhide"
              >
                <span class="d-none d-md-block"> Hide chat </span>
                <span class="d-block d-md-none"> Hide </span>
              </b-button>
              <b-button
                v-b-tooltip="
                  'Don\'t show this chat unless there\'s a new message'
                "
                variant="link"
                size="sm"
                class="d-block d-md-none"
                @click="showhide"
              >
                <span class="d-none d-md-block"> Hide chat </span>
                <span class="d-block d-md-none"> Hide </span>
              </b-button>
            </template>
          </div>
        </div>
        <div
          v-if="!collapsed"
          class="d-none d-md-flex flex-column justify-content-around clickme"
          @click="collapsed = true"
        >
          <v-icon
            icon="chevron-circle-up"
            class="text-faded d-block d-md-none"
            title="Collapse this section"
          />
          <v-icon
            icon="chevron-circle-up"
            class="text-faded fa-2x d-none d-md-block"
            title="Collapse this section"
          />
        </div>
        <div class="d-flex">
          <div v-if="chat.chattype === 'User2User' && otheruser" class="mr-2">
            <template v-if="chat.status === 'Blocked'">
              <b-button
                v-b-tooltip="'Allow this freegler to talk to you.'"
                variant="secondary"
                class="d-none d-md-block"
                @click="unhide"
              >
                Unblock
              </b-button>
              <b-button
                v-b-tooltip="'Allow this freegler to talk to you.'"
                variant="link"
                size="sm"
                class="d-block d-md-none"
                @click="unhide"
              >
                Unblock
              </b-button>
            </template>
            <template v-else>
              <b-button
                v-b-tooltip="'Block this freegler from talking to you.'"
                variant="secondary"
                class="d-none d-md-block"
                @click="showblock"
              >
                Block
              </b-button>
              <b-button
                v-b-tooltip="'Block this freegler from talking to you.'"
                variant="link"
                size="sm"
                class="d-block d-md-none"
                @click="showblock"
              >
                Block
              </b-button>
            </template>
          </div>
          <div
            v-if="
              chat.chattype === 'User2User' && otheruser && !otheruser?.deleted
            "
          >
            <b-button
              v-b-tooltip="'Report this chat to the volunteers'"
              variant="secondary"
              class="d-none d-md-block"
              @click="report"
            >
              Report
            </b-button>
            <b-button
              variant="link"
              size="sm"
              class="d-block d-md-none"
              @click="report"
            >
              Report
            </b-button>
          </div>
        </div>
      </div>
      <div
        v-if="aboutthem && !collapsed"
        class="d-flex d-md-none"
        @click="showInfo"
      >
        <div>"</div>
        <blockquote class="font-weight-bold aboutthem mb-0">
          {{ aboutthem }}
        </blockquote>
        <div>"</div>
      </div>
      <div
        v-if="collapsed"
        class="d-flex justify-content-around clickme collapsedbutton w-100"
        @click="collapsed = false"
      >
        <v-icon
          icon="chevron-circle-down"
          class="text-faded"
          title="Expand this section"
        />
      </div>
      <div v-if="otheruser && otheruser.info">
        <ChatBlockModal
          v-if="showChatBlock && chat.chattype === 'User2User'"
          :id="id"
          :user="otheruser"
          @confirm="block"
          @hidden="showChatBlock = false"
        />
        <ChatReportModal
          v-if="showChatReport && chat.chattype === 'User2User'"
          :id="'report-' + id"
          :user="otheruser"
          :chatid="chat.id"
          @confirm="hide"
          @hidden="showChatReport = false"
        />
        <ProfileModal
          v-if="showProfileModal"
          :id="otheruser.id"
          close-on-message
          @hidden="showProfileModal = false"
        />
      </div>
      <ChatHideModal
        v-if="
          showChatHide &&
          (chat.chattype === 'User2User' || chat.chattype === 'User2Mod')
        "
        :id="id"
        :user="otheruser"
        @confirm="hide"
        @hidden="showChatHide = false"
      />
    </div>
    <div v-else class="w-100">
      <div class="col text-center">
        <b-img src="/loader.gif" alt="Loading..." width="100px" />
      </div>
    </div>
  </div>
</template>
<script setup>
import ProfileImage from './ProfileImage'
import { useChatStore } from '~/stores/chat'
import { setupChat } from '~/composables/useChat'
import { twem, useRouter } from '#imports'
import { useMiscStore } from '~/stores/misc'
import SupporterInfo from '~/components/SupporterInfo'
import { timeago } from '~/composables/useTimeFormat'

const ChatBlockModal = defineAsyncComponent(() => import('./ChatBlockModal'))
const ChatHideModal = defineAsyncComponent(() => import('./ChatHideModal'))
const UserRatings = defineAsyncComponent(() =>
  import('~/components/UserRatings')
)
const ChatReportModal = defineAsyncComponent(() =>
  import('~/components/ChatReportModal')
)
const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const showProfileModal = ref(false)
const showChatHide = ref(false)
const showChatBlock = ref(false)
const showChatReport = ref(false)

const chatStore = useChatStore()
const miscStore = useMiscStore()
const router = useRouter()

const collapsed = computed({
  get: () => miscStore?.get('chatinfoheader'),
  set: (newVal) => {
    miscStore.set({
      key: 'chatinfoheader',
      value: newVal,
    })
  },
})

function collapse(val) {
  collapsed.value = val
}

defineExpose({
  collapse,
})

// Set up chat data
const { chat, otheruser, unseen, milesaway, milesstring } = await setupChat(
  props.id
)

// Set initial collapsed state
miscStore.set({
  key: 'chatinfoheader',
  value: false,
})

// Computed properties
const replytime = computed(() => {
  let ret = null
  let secs = null

  if (otheruser?.value?.info) {
    secs = otheruser.value.info.replytime
  }

  if (secs) {
    if (secs < 60) {
      ret = Math.round(secs) + ' second'
    } else if (secs < 60 * 60) {
      ret = Math.round(secs / 60) + ' minute'
    } else if (secs < 24 * 60 * 60) {
      ret = Math.round(secs / 60 / 60) + ' hour'
    } else {
      ret = Math.round(secs / 60 / 60 / 24) + ' day'
    }

    if (ret.indexOf('1 ') !== 0) {
      ret += 's'
    }
  }

  return ret
})

const aboutthem = computed(() => {
  return otheruser.value?.aboutme ? twem(otheruser.value.aboutme.text) : null
})

const otheraccess = computed(() => {
  return timeago(otheruser.value.lastaccess)
})

// Watch for changes in unseen messages
watch(unseen, () => {
  // Make sure the chat is up to date.  This helps in the case where pollForChatUpdates picks up a new
  // message and so we show that the chat has unread messages, but we haven't yet
  chatStore.fetchMessages(props.id)
})

// Methods
const hide = async () => {
  await chatStore.hide(props.id)
  router.push('/chats')
}

const block = async () => {
  await chatStore.block(props.id)
  router.push('/chats')
}

const unhide = async () => {
  await chatStore.unhide(props.id)
}

const showhide = () => {
  showChatHide.value = true
}

const showblock = () => {
  showChatBlock.value = true
}

const showInfo = () => {
  showProfileModal.value = true
}

const report = () => {
  showChatReport.value = true
}

const markRead = async () => {
  await chatStore.markRead(props.id)
  await chatStore.fetchChat(props.id)
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.outer {
  background-color: $color-blue--x-light;
  border: 1px solid $color-gray--light;
  box-shadow: 0px 4px 2px -2px $color-black-opacity-60 !important;
}

.nameinfo {
  display: grid;
  grid-template-columns: auto 10px 1fr 121px;

  .profile {
    grid-column: 1;
    grid-row: 1 / 3;
  }

  .name {
    grid-column: 3;
    grid-row: 1 / 2;
  }

  .ratings {
    grid-column: 4;
    grid-row: 1 / 2;
  }

  .userinfo {
    grid-column: 3 / 5;
    grid-row: 2 / 3;
    color: $colour-info-fg;
    padding-top: 0.25rem;

    @include media-breakpoint-up(md) {
      grid-row: 1 / 2;
      grid-column: 3 / 5;
      padding-top: 2rem;
    }
  }
}

.hidelink a {
  text-decoration: none;
  color: white;
}

:deep(.dropdown-toggle) {
  color: $color-white;

  &::after {
    border-top: 0.75em solid;
    border-right: 0.75em solid transparent;
    border-bottom: 0;
    border-left: 0.75em solid transparent;
  }
}

pre {
  white-space: pre-wrap; /* css-3 */
  white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
  width: 200px;

  @include media-breakpoint-up(md) {
    width: 300px;
  }

  @include media-breakpoint-up(lg) {
    width: 450px;
  }
}

.actions {
  @include media-breakpoint-up(md) {
    border-top: 1px solid $color-gray--light;
  }
}

.collapsedbutton {
  top: 8px;
  position: absolute;
}

.aboutthem {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
