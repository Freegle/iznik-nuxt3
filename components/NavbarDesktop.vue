<template>
  <b-navbar
    id="navbar_large"
    class="ourBack d-none d-xl-flex pl-1 pr-2 navbar-dark navbar-expand-xl"
    fixed="top"
  >
    <nuxt-link :to="homePage" class="navbar-brand p-0" no-prefetch>
      <b-img
        class="logo mr-2"
        height="58"
        width="58"
        rounded
        :src="logo"
        alt="Home"
      />
    </nuxt-link>
    <b-button
      v-if="loggedIn"
      aria-label="Toggle navigation"
      class="navbar-toggler collapsed"
      aria-controls="nav_collapse"
      style="overflow-anchor: none"
    >
      <span class="navbar-toggler-icon"></span>
    </b-button>
    <div
      v-if="loggedIn"
      id="nav_collapse"
      class="flex-nowrap justify-content-between navbar-collapse collapse"
      style="display: none"
    >
      <ul class="navbar-nav mainnav mainnav--left">
        <li>
          <nuxt-link
            id="menu-option-mygroups"
            no-prefetch
            class="nav-link text-center small p-0 ml-2"
            to="/browse"
            @mousedown="maybeReload('/browse')"
          >
            <div class="position-relative">
              <v-icon icon="eye" class="fa-2x" />
              <br />
              <b-badge
                v-if="browseCount"
                variant="info"
                class="browsebadge"
                :title="browseCountPlural"
              >
                {{ browseCount }}
              </b-badge>
              <span class="nav-item__text">Browse</span>
            </div>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-give"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/give"
            @mousedown="maybeReload('/give')"
          >
            <v-icon icon="gift" class="fa-2x" />
            <br />
            <span class="nav-item__text">Give</span>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-find"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/find"
            @mousedown="maybeReload('/find')"
          >
            <v-icon icon="shopping-cart" class="fa-2x" />
            <br />
            <span class="nav-item__text">&nbsp;Ask</span>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-myposts"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/myposts"
            @mousedown="maybeReload('/myposts')"
          >
            <div class="position-relative">
              <v-icon icon="home" class="fa-2x" />
              <br />
              <b-badge
                v-if="activePostsCount"
                variant="info"
                class="mypostsbadge"
                :title="activePostsCountPlural"
              >
                {{ activePostsCount }}
              </b-badge>
              <span class="nav-item__text">My Posts</span>
            </div>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-chitchat"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/chitchat"
            @mousedown="maybeReload('/chitchat')"
          >
            <div class="position-relative">
              <v-icon icon="coffee" class="fa-2x" />
              <br />
              <b-badge
                v-if="newsCount"
                variant="info"
                class="newsbadge"
                :title="newsCountPlural"
              >
                {{ newsCount }}
              </b-badge>
              <span class="nav-item__text">ChitChat</span>
            </div>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-communityevents"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/communityevents"
            @mousedown="maybeReload('/communityevents')"
          >
            <v-icon icon="calendar-alt" class="fa-2x" />
            <br />
            <span class="nav-item__text">Events</span>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-volunteering"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/volunteerings"
            @mousedown="maybeReload('/volunteerings')"
          >
            <v-icon icon="hands-helping" class="fa-2x" />
            <br />
            <span class="nav-item__text">Volunteer</span>
          </nuxt-link>
        </li>
      </ul>
      <ul class="navbar-nav mainnav mainnav--right">
        <li>
          <NotificationOptions
            v-if="loggedIn"
            v-model:unread-notification-count="unreadNotificationCount"
            :distance="distance"
            :small-screen="false"
            @show-about-me="showAboutMe"
          />
        </li>
        <li></li>
        <li>
          <nuxt-link
            id="menu-option-spread"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/promote"
            @mousedown="maybeReload('/promote')"
          >
            <div class="position-relative">
              <v-icon icon="bullhorn" class="fa-2x" />
              <br />
              <span class="nav-item__text">Promote</span>
            </div>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-help"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/help"
            @mousedown="maybeReload('/help')"
          >
            <v-icon icon="question-circle" class="fa-2x" />
            <br />
            <span class="nav-item__text">Help</span>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-settings"
            no-prefetch
            class="nav-link text-center small p-0"
            to="/settings"
            @mousedown="maybeReload('/settings')"
          >
            <v-icon icon="cog" class="fa-2x" />
            <br />
            <span class="nav-item__text">Settings</span>
          </nuxt-link>
        </li>
        <li>
          <nuxt-link
            id="menu-option-logout"
            no-prefetch
            class="nav-link text-center p-0 small clickme"
            @click="logout"
          >
            <v-icon icon="sign-out-alt" class="fa-2x" />
            <br />
            <span class="nav-item__text">Logout</span>
          </nuxt-link>
        </li>
      </ul>
    </div>
    <div v-if="!loggedIn" class="navbar-nav ml-auto">
      <div class="nav-item" no-prefetch>
        <b-button variant="white" class="mr-2" @click="requestLogin">
          Sign&nbsp;in
        </b-button>
      </div>
    </div>
  </b-navbar>
  <about-me-modal v-if="showAboutMeModal" @hidden="showAboutMeModal = false" />
</template>
<script setup>
import { useNavbar } from '~/composables/useNavbar'

const {
  distance,
  logo,
  unreadNotificationCount,
  activePostsCount,
  activePostsCountPlural,
  newsCount,
  newsCountPlural,
  browseCount,
  browseCountPlural,
  showAboutMeModal,
  homePage,
  requestLogin,
  logout,
  showAboutMe,
  maybeReload,
} = useNavbar()

const AboutMeModal = defineAsyncComponent(() =>
  import('~/components/AboutMeModal')
)

const NotificationOptions = defineAsyncComponent(() =>
  import('~/components/NotificationOptions')
)
</script>
<style scoped lang="scss">
@import 'assets/css/navbar.scss';
</style>
