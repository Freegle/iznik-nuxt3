<template>
  <b-navbar
    id="navbar_small"
    toggleable="xl"
    type="dark"
    class="ourBack d-flex justify-content-between d-xl-none"
    fixed="top"
  >
    <OfflineIndicator v-if="!online" />
    <b-navbar-brand v-else-if="showBackButton" class="p-0">
      <b-button
        ref="backButton"
        variant="white"
        class="nohover"
        @click="backButton"
      >
        <v-icon icon="arrow-left" />
      </b-button>
    </b-navbar-brand>
    <div v-else class="p-0">
      <b-img
        class="logo mr-2"
        height="58"
        width="58"
        rounded
        :src="logo"
        alt="Home"
      />
    </div>
    <div class="d-flex align-items-center">
      <NotificationOptions
        v-if="loggedIn"
        v-model:unread-notification-count="unreadNotificationCount"
        :distance="distance"
        :small-screen="true"
        @show-about-me="showAboutMe"
      />
      <ChatMenu
        v-if="loggedIn"
        id="menu-option-chat-sm"
        v-model:chat-count="chatCount"
        :is-list-item="false"
        class="mr-4"
      />

      <b-nav>
        <nuxt-link v-if="!loggedIn" no-prefetch>
          <div class="btn btn-white" @click="requestLogin">Log in or Join</div>
        </nuxt-link>
      </b-nav>

      <b-nav class="">
        <b-button
          v-if="loggedIn"
          ref="mobileNav"
          v-b-toggle.nav_collapse_mobile
          class="toggler white mr-1"
        >
          <v-icon icon="bars" class="mb-1 fa-1-5x" />
        </b-button>
      </b-nav>
    </div>
    <b-collapse
      v-if="loggedIn"
      id="nav_collapse_mobile"
      ref="nav_collapse_mobile"
      class="w-100 ourBack"
      is-nav
    >
      <b-nav class="ml-auto flex-row flex-wrap small">
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/browse"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/browse')"
          >
            <v-icon icon="eye" class="fa-2x" />
            <br />
            <span class="nav-item__text">Browse</span>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/give"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/give')"
          >
            <v-icon icon="gift" class="fa-2x" />
            <br />
            <span class="nav-item__text">Give</span>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/find"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/find')"
          >
            <v-icon icon="shopping-cart" class="fa-2x" />
            <br />
            <span class="nav-item__text">Ask</span>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/myposts"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/myposts')"
          >
            <div class="position-relative">
              <v-icon icon="home" class="fa-2x" />
              <br />
              <b-badge
                v-if="activePostsCount"
                variant="info"
                class="mypostsbadge2"
                :title="activePostsCountPlural"
              >
                {{ activePostsCount }}
              </b-badge>
              <span class="nav-item__text">My Posts</span>
            </div>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0 white"
            to="/chitchat"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/chitchat')"
          >
            <div class="position-relative">
              <v-icon icon="coffee" class="fa-2x" />
              <br />
              <b-badge
                v-if="newsCount"
                variant="info"
                class="newsbadge2"
                :title="newsCountPlural"
              >
                {{ newsCount }}
              </b-badge>
              <span class="nav-item__text">ChitChat</span>
            </div>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/communityevents"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/communityevents')"
          >
            <v-icon icon="calendar-alt" class="fa-2x" />
            <br />
            <span class="nav-item__text">Events</span>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/volunteerings"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/volunteerings')"
          >
            <v-icon icon="hands-helping" class="fa-2x" />
            <br />
            <span class="nav-item__text">Volunteer</span>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/promote"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/promote')"
          >
            <v-icon icon="bullhorn" class="fa-2x" />
            <br />
            <span class="nav-item__text">Promote</span>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/help"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/help')"
          >
            <v-icon icon="question-circle" class="fa-2x" />
            <br />
            <span class="nav-item__text">Help</span>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0"
            to="/settings"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/settings')"
          >
            <v-icon icon="cog" class="fa-2x" />
            <br />
            <span class="nav-item__text">Settings</span>
          </nuxt-link>
        </li>
        <li class="nav-item text-center p-0">
          <nuxt-link
            no-prefetch
            class="nav-link text-center p-0 clickme"
            @click="logout"
          >
            <v-icon icon="sign-out-alt" class="fa-2x" />
            <br />
            <span class="nav-item__text">Logout</span>
          </nuxt-link>
        </li>
      </b-nav>
    </b-collapse>
  </b-navbar>
  <about-me-modal v-if="showAboutMeModal" @hidden="showAboutMeModal = false" />
</template>
<script setup>
import { useNavbar } from '~/composables/useNavbar'

const {
  online,
  distance,
  logo,
  unreadNotificationCount,
  chatCount,
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
  mobileNav?.value.$el?.click()
}
</script>
<style scoped lang="scss">
@import 'assets/css/navbar.scss';
</style>
