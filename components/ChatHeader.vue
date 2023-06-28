<template>
  <div>
    <div
      v-if="chat && (chat.chattype !== 'User2User' || otheruser?.info)"
      class="outer position-relative"
    >
      <div class="nameinfo pt-1 pb-1 pl-1">
        <ProfileImage
          v-if="chat.icon"
          :image="chat.icon"
          class="pr-1 profile clickme"
          is-thumbnail
          size="xl"
          border
          @click="showInfo"
        />
        <div class="name font-weight-bold black text--large pl-1">
          {{ chat.name }}
        </div>
        <div
          v-if="otheruser && otheruser.info"
          class="d-flex flex-column align-content-between pr-1 ratings"
        >
          <UserRatings
            :id="chat.otheruid"
            :key="'otheruser-' + chat.otheruid"
            class="mt-1 d-flex justify-content-end"
            size="sm"
          />
          <SupporterInfo v-if="otheruser.supporter" class="align-self-end" />
        </div>
        <div
          v-if="!collapsed && otheruser && otheruser.info"
          class="userinfo mr-2"
        >
          <div class="small flex flex-wrap">
            <div v-if="otheruser.lastaccess" class="d-inline d-md-block">
              <span class="d-none d-md-inline">Last seen</span>
              <span class="d-inline d-md-none">Seen</span>
              <!-- eslint-disable-next-line-->
              <strong :title="datetimeshort(otheruser.lastaccess)" class="ml-1" >{{ timeago(otheruser.lastaccess) }}</strong>.
            </div>
            <div v-if="replytime" class="d-inline d-md-block">
              <span class="d-none d-md-inline">Typically replies in</span>
              <span class="d-inline d-md-none">Replies in</span>
              <strong class="ml-1">{{ replytime }}</strong
              >.
            </div>
            <br class="d-block d-md-none" />
            <div v-if="milesaway" class="d-inline d-md-block">
              About <strong>{{ milesstring }}</strong
              >.
            </div>
          </div>
        </div>
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
        class="d-flex flex-wrap justify-content-between p-1 mt-1 actions"
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
          <div v-if="otheruser && otheruser.info" class="mr-2">
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
              View profile
            </b-button>
          </div>
          <div v-if="chat.chattype === 'User2User' || !unseen" class="mr-2">
            <b-button
              v-b-tooltip="
                'Don\'t show this chat unless there\'s a new message'
              "
              variant="secondary"
              class="d-none d-md-block"
              @click="showhide"
            >
              Hide chat
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
              Hide chat
            </b-button>
          </div>
        </div>
        <div
          v-if="!collapsed"
          class="d-flex flex-column justify-content-around clickme"
          @click="collapsed = true"
        >
          <v-icon
            icon="chevron-circle-up"
            class="text-faded fa-2x"
            title="Collapse this section"
          />
        </div>
        <div class="d-flex">
          <div v-if="chat.chattype === 'User2User' && otheruser" class="mr-2">
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
          </div>
          <div v-if="chat.chattype === 'User2User' && otheruser">
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
          ref="chatblock"
          :user="otheruser"
          @confirm="block"
        />
        <ChatReportModal
          v-if="showChatReport && chat.chattype === 'User2User'"
          :id="'report-' + id"
          ref="chatreport"
          :user="otheruser"
          :chatid="chat.id"
          @confirm="hide"
        />
        <ProfileModal v-if="showProfile" :id="otheruser.id" ref="profile" />
      </div>
      <ChatHideModal
        v-if="
          showChatHide &&
          (chat.chattype === 'User2User' || chat.chattype === 'User2Mod')
        "
        :id="id"
        ref="chathide"
        :user="otheruser"
        @confirm="hide"
      />
    </div>
    <div v-else class="w-100">
      <div class="col text-center">
        <b-img src="/loader.gif" alt="Loading..." width="100px" />
      </div>
    </div>
  </div>
</template>
<script>
import { useChatStore } from '../stores/chat'
import { setupChat } from '../composables/useChat'
import ProfileImage from './ProfileImage'
import { useRouter } from '#imports'
import { useMiscStore } from '~/stores/misc'
import SupporterInfo from '~/components/SupporterInfo'

const ChatBlockModal = () => import('./ChatBlockModal')
const ChatHideModal = () => import('./ChatHideModal')
const UserRatings = () => import('~/components/UserRatings')
const ChatReportModal = () => import('~/components/ChatReportModal')
const ProfileModal = () => import('~/components/ProfileModal')

export default {
  components: {
    ProfileModal,
    SupporterInfo,
    UserRatings,
    ChatBlockModal,
    ChatHideModal,
    ChatReportModal,
    ProfileImage,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const chatStore = useChatStore()
    const miscStore = useMiscStore()

    const { chat, otheruser, unseen, milesaway, milesstring } = await setupChat(
      props.id
    )

    return {
      chatStore,
      miscStore,
      chat,
      otheruser,
      unseen,
      milesaway,
      milesstring,
    }
  },
  data() {
    return {
      showProfile: false,
      showChatHide: false,
      showChatBlock: false,
      showChatReport: false,
    }
  },
  computed: {
    collapsed: {
      get() {
        return this.miscStore?.get('chatinfoheader')
      },
      set(newVal) {
        this.miscStore.set({
          key: 'chatinfoheader',
          value: newVal,
        })
      },
    },
    replytime() {
      let ret = null
      let secs = null

      if (this.otheruser?.info) {
        secs = this.otheruser.info.replytime
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
    },
  },
  watch: {
    unseen() {
      // Make sure the chat is up to date.  This helps in the case where pollForChatUpdates picks up a new
      // message and so we show that the chat has unread messages, but we haven't yet
      this.chatStore.fetchMessages(this.id)
    },
  },
  methods: {
    async hide() {
      console.log('Hide chat')
      await this.chatStore.hide(this.id)
      const router = useRouter()
      console.log('Push')
      router.push('/chats')
      console.log('ushed')
    },
    async block() {
      await this.chatStore.block(this.id)
      const router = useRouter()
      router.push('/chats')
    },
    async showhide() {
      this.showChatHide = true
      await this.waitForRef('chathide')
      this.$refs.chathide.show()
    },
    async showblock() {
      this.showChatBlock = true
      await this.waitForRef('chatblock')
      this.$refs.chatblock.show()
    },
    async showInfo() {
      this.showProfile = true
      await this.waitForRef('profile')
      this.$refs.profile.show()
    },
    async report() {
      this.showChatReport = true
      await this.waitForRef('chatreport')
      this.$refs.chatreport.show()
    },
    async markRead() {
      await this.chatStore.markRead(this.id)
      await this.chatStore.fetchChat(this.id)
    },
  },
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
  grid-template-columns: auto 1fr 121px;

  .profile {
    grid-column: 1;
    grid-row: 1 / 2;
  }

  .name {
    grid-column: 2;
    grid-row: 1 / 2;
  }

  .ratings {
    grid-column: 3;
    grid-row: 1 / 2;
  }

  .userinfo {
    grid-column: 1 / 4;
    grid-row: 2 / 3;
    color: $colour-info-fg;
    padding-top: 0.5rem;

    @include media-breakpoint-up(md) {
      grid-row: 1 / 2;
      grid-column: 2 / 4;
      padding-top: 2rem;
      padding-left: 0.25rem;
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
  border-top: 1px solid $color-gray--light;
}

.collapsedbutton {
  top: 8px;
  position: absolute;
}
</style>
