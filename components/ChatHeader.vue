<template>
  <div>
    <div
      v-if="
        chat && (chat.chattype !== 'User2User' || (otheruser && otheruser.info))
      "
      class="outer position-relative"
    >
      <div class="nameinfo pt-1 pb-1 pl-1">
        <ProfileImage
          v-if="chat.icon"
          :image="chat.icon"
          class="mr-1 inline"
          is-thumbnail
          size="xl"
          border
        />
        <div
          class="d-flex flex-column align-content-around justify-content-center"
          @click="showInfo"
        >
          <div class="font-weight-bold black text--large">
            {{ chat.name }}
          </div>
          <div
            v-if="!collapsed && otheruser && otheruser.info"
            class="userinfo small flex flex-wrap mr-2"
          >
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
            <div v-if="milesaway" class="d-inline d-md-block">
              About <strong>{{ milesstring }}</strong
              >.
            </div>
          </div>
        </div>
        <div
          v-if="otheruser && otheruser.info"
          class="d-flex flex-column align-content-between pr-1"
        >
          <UserRatings
            :id="chat.otheruid"
            :key="'otheruser-' + chat.otheruid"
            class="mt-1 d-flex justify-content-end"
            size="sm"
          />
          <SupporterInfo v-if="otheruser.supporter" class="align-self-end" />
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
              variant="secondary"
              class="d-none d-md-block"
              @click="showInfo"
            >
              View profile
            </b-button>
            <b-button
              variant="link"
              size="sm"
              class="d-block d-md-none"
              @click="showInfo"
            >
              View profile
            </b-button>
          </div>
          <div
            v-if="chat.chattype === 'User2User' || chat.chattype === 'User2Mod'"
            class="mr-2"
          >
            <b-button
              variant="secondary"
              class="d-none d-md-block"
              @click="showhide"
            >
              Hide chat
            </b-button>
            <b-button
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
              variant="secondary"
              class="d-none d-md-block"
              @click="showblock"
            >
              Block
            </b-button>
            <b-button
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
          v-if="chat.chattype === 'User2User'"
          :id="id"
          ref="chatblock"
          :user="otheruser"
          @confirm="block"
        />
        <ChatReportModal
          v-if="chat.chattype === 'User2User'"
          :id="'report-' + id"
          ref="chatreport"
          :user="otheruser"
          :chatid="chat.id"
          @confirm="hide"
        />
        <ProfileModal :id="otheruser.id" ref="profile" />
      </div>
      <ChatHideModal
        v-if="chat.chattype === 'User2User' || chat.chattype === 'User2Mod'"
        :id="id"
        ref="chathide"
        :user="otheruser"
        @confirm="hide"
      />
    </div>
    <div v-else class="w-100">
      <div class="col text-center">
        <b-img src="/loader.gif" alt="Loading..." />
      </div>
    </div>
  </div>
</template>
<script>
import { useChatStore } from '../stores/chat'
import { setupChat } from '../composables/useChat'
import ProfileImage from './ProfileImage'
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
  computed: {
    collapsed: {
      get() {
        return this.miscStore.get('chatinfoheader')
      },
      set(newVal) {
        this.miscStore.set({
          key: 'chatinfoheader',
          value: newVal,
        })
      },
    },
    loaded() {
      // TODO Minor this could probably go now that we have setup()
      return this.chat && this.otheruser && this.otheruser.info
    },
    replytime() {
      let ret = null
      let secs = null

      if (this.otheruser && this.otheruser.info) {
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
    loaded() {
      this.$emit('update:loaded', true)
    },
  },
  methods: {
    popup() {
      this.$store.dispatch('popupchats/popup', { id: this.chat.id })
    },
    hide() {
      this.$store.dispatch('chats/hide', {
        id: this.id,
      })

      this.$router.push('/chats')
    },
    showhide() {
      this.waitForRef('chathide', () => {
        this.$refs.chathide.show()
      })
    },
    showblock() {
      this.waitForRef('chatblock', () => {
        this.$refs.chatblock.show()
      })
    },
    showInfo() {
      this.waitForRef('profile', () => {
        this.$refs.profile.show()
      })
    },
    report() {
      this.waitForRef('chatreport', () => {
        this.$refs.chatreport.show()
      })
    },
    block() {
      this.$store.dispatch('chats/block', {
        id: this.id,
      })

      this.$router.push('/chats')
    },
    async markRead() {
      await this.chatStore.markRead(this.id)
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.outer {
  background-color: $color-blue--x-light;
  border: 1px solid $color-gray--light;
  box-shadow: 0px 4px 2px -2px $color-black-opacity-60 !important;
}

.nameinfo {
  display: grid;
  grid-template-columns: auto 1fr 121px;
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

.userinfo {
  color: $colour-info-fg;
}

.actions {
  border-top: 1px solid $color-gray--light;
}

.collapsedbutton {
  top: 8px;
  position: absolute;
}
</style>
