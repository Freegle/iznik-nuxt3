<template>
  <b-navbar
    type="dark"
    class="ourBack d-flex justify-content-between d-xl-none"
    fixed="top"
  >
    <OfflineIndicator v-if="!online" />
    <b-button
      v-else-if="showBackButton"
      ref="mobileNav"
      variant="white"
      class="nohover ml-3"
      @click="backButton"
    >
      <v-icon icon="arrow-left" />
    </b-button>
    <NotificationOptions
      v-if="online && !showBackButton && loggedIn"
      v-model:unread-notification-count="unreadNotificationCount"
      :distance="distance"
      :small-screen="true"
      @show-about-me="showAboutMe"
    />
    <div v-else />
    <div class="flex-grow-1 d-flex justify-content-around">
      <h1 v-if="loggedIn" class="text-white truncate text-center maxwidth">
        {{ title }}
      </h1>
    </div>
    <div class="d-flex align-items-center">
      <b-nav>
        <nuxt-link v-if="!loggedIn" no-prefetch>
          <div class="btn btn-white mr-2" @click="requestLogin">
            Log in or Join
          </div>
        </nuxt-link>
      </b-nav>
    </div>
    <b-dropdown v-if="loggedIn" no-caret variant="primary">
      <template #button-content>
        <v-icon icon="user" size="2x" />
      </template>
      <b-dropdown-item
        href="/settings"
        class="ourBack"
        @click="clickedMobileNav"
        @mousedown="maybeReload('/settings')"
      >
        <div class="d-flex align-items-center">
          <v-icon icon="cog" size="2x" class="mr-2" />
          <span class="text--large">Settings</span>
        </div>
      </b-dropdown-item>
      <b-dropdown-item href="/settings" @click="logout">
        <div class="d-flex align-items-center">
          <v-icon icon="sign-out-alt" size="2x" class="mr-2" />
          <span class="text--large">Logout</span>
        </div>
      </b-dropdown-item>
    </b-dropdown>
  </b-navbar>
  <b-navbar
    v-if="!showBackButton && loggedIn"
    type="dark"
    class="ourBack d-flex justify-content-between d-xl-none navbot small"
    fixed="bottom"
  >
    <nuxt-link
      no-prefetch
      class="nav-link text-center p-0 botmen"
      to="/browse"
      @click="clickedMobileNav"
      @mousedown="maybeReload('/browse')"
    >
      <v-icon icon="eye" class="fa-fw2" />
      <br />
      <div class="div text--smallest">Browse</div>
    </nuxt-link>
    <div class="botmen ml-2">
      <ChatMenu
        v-if="loggedIn"
        id="menu-option-chat-sm"
        :is-list-item="false"
        class="mr-4"
      />
      <div class="chatup text-white">Chats</div>
    </div>
    <nuxt-link
      no-prefetch
      class="nav-link text-center p-0 botmen"
      to="/myposts"
      @click="clickedMobileNav"
      @mousedown="maybeReload('/myposts')"
    >
      <div class="position-relative">
        <v-icon icon="home" class="fa-fw2" />
        <br />
        <b-badge
          v-if="activePostsCount"
          variant="info"
          class="mypostsbadge2"
          :title="activePostsCountPlural"
        >
          {{ activePostsCount }}
        </b-badge>
        <span class="nav-item__text">My&nbsp;Posts</span>
      </div>
    </nuxt-link>
    <NavbarMobilePost class="navpost" />
    <nuxt-link
      no-prefetch
      class="nav-link text-center p-0 botmen"
      to="/chitchat"
      @click="clickedMobileNav"
      @mousedown="maybeReload('/chitchat')"
    >
      <div class="position-relative">
        <v-icon icon="coffee" class="fa-fw2" />
        <br />
        <b-badge
          v-if="newsCount"
          variant="info"
          class="newsbadge2"
          :title="newsCountPlural"
        >
          {{ newsCount }}
        </b-badge>
        <div class="nav-item__text">ChitChat</div>
      </div>
    </nuxt-link>
    <nuxt-link
      no-prefetch
      class="nav-link text-center p-0 botmen"
      to="/promote"
      @click="clickedMobileNav"
      @mousedown="maybeReload('/promote')"
    >
      <v-icon icon="bullhorn" class="fa-fw2" />
      <br />
      <div class="nav-item__text">Promote</div>
    </nuxt-link>
    <nuxt-link
      no-prefetch
      class="nav-link text-center p-0 botmen"
      to="/help"
      @click="clickedMobileNav"
      @mousedown="maybeReload('/help')"
    >
      <v-icon icon="question-circle" class="fa-fw2" />
      <br />
      <div class="nav-item__text">Help</div>
    </nuxt-link>
  </b-navbar>
  <about-me-modal v-if="showAboutMeModal" @hidden="showAboutMeModal = false" />
</template>
<script setup>
import NavbarMobilePost from './NavbarMobilePost'
import { useNavbar } from '~/composables/useNavbar'
import { useMiscStore } from '~/stores/misc'

const {
  online,
  distance,
  unreadNotificationCount,
  activePostsCount,
  activePostsCountPlural,
  newsCount,
  newsCountPlural,
  showAboutMeModal,
  showBackButton,
  requestLogin,
  logout,
  showAboutMe,
  maybeReload,
  backButton,
} = useNavbar()

const AboutMeModal = defineAsyncComponent(() =>
  import('~/components/AboutMeModal')
)

const NotificationOptions = defineAsyncComponent(() =>
  import('~/components/NotificationOptions')
)

const mobileNav = ref(null)

const clickedMobileNav = () => {
  mobileNav?.value?.$el?.click()
}

console.log('Meta', useHead())
const title = computed(() => {
  return useMiscStore().pageTitle
})
</script>
<style scoped lang="scss">
@import 'assets/css/navbar.scss';

.navbot {
  margin-bottom: 50px;
}

:deep(.dropdown-toggle) {
  background-color: $color-green-background;
  border: none !important;
}

:deep(.dropdown-menu) {
  background-color: $color-green-background;

  .dropdown-item {
    color: $color-white !important;
  }
}

.mypostsbadge2 {
  position: absolute;
  top: 1px;
  right: -1px;
  font-size: 11px;
}

.chatup {
  transform: translate(3px, 1px);
}

.newsbadge2 {
  position: absolute;
  top: 2px;
  font-size: 11px;
}

.botmen {
  width: 51px;
  min-width: 51px;
  max-width: 51px;

  div {
    font-size: 0.7rem;
  }
}

.fa-fw2 {
  width: 2rem !important;
  height: 2rem !important;
}

.navpost {
  transform: translateY(-40px);
  color: $color-white;
  width: 64px;
  height: 64px;
}

:deep(.container-fluid) {
  padding: 0 !important;
}

.maxwidth {
  max-width: calc(100vw - 130px);
}

:deep(.ourBack) {
  background-color: $color-green-background !important;
}
</style>
