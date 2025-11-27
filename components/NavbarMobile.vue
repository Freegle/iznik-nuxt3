<template>
  <div id="navbar-mobile">
    <div>
      <b-navbar
        type="dark"
        class="ourBack d-flex justify-content-between d-xl-none"
        :class="{ hideNavBarTop: navBarHidden, showNavBarTop: !navBarHidden }"
        fixed="top"
      >
        <OfflineIndicator v-if="!online" />
        <b-button
          v-if="online && (showBackButton || navBarBottomHidden)"
          variant="white"
          class="nohover ml-3"
          to="/"
        >
          <v-icon icon="home" />
        </b-button>
        <b-button
          v-if="online && showBackButton"
          ref="mobileNav"
          variant="white"
          class="nohover ml-2 mr-1"
          @click="backButton"
        >
          <v-icon icon="arrow-left" />
          <b-badge v-if="backButtonCount" variant="danger" class="ml-1">
            {{ backButtonCount }}
          </b-badge>
        </b-button>
        <NotificationOptions
          v-if="online && !showBackButton && loggedIn"
          v-model:unread-notification-count="unreadNotificationCount"
          v-model:shown="notificationsShown"
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
            <b-nav-item>
              <nuxt-link
                v-if="!loggedIn"
                no-prefetch
                class="test-signinbutton"
                :disabled="signInDisabled"
              >
                <div class="btn btn-white mr-2" @click="requestLogin">
                  Log in or Join
                </div>
              </nuxt-link>
            </b-nav-item>
          </b-nav>
        </div>
        <div v-if="isApp && loggedIn" class="text-white mr-3">
          <div class="notifwrapper">
            <v-icon icon="redo" class="fa-2x" @click="refresh" />
          </div>
        </div>
        <b-dropdown
          v-if="loggedIn"
          no-caret
          variant="primary"
          class="userOptions"
        >
          <template #button-content>
            <ProfileImage
              v-if="me?.profile?.path"
              :image="me.profile.path"
              class="m-0 inline"
              is-thumbnail
              size="lg"
            />
            <v-icon v-else icon="user" size="2x" />
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
          <b-dropdown-item v-if="isApp" @click="showDebugLogs = true">
            <div class="d-flex align-items-center clickme">
              <v-icon icon="bug" size="2x" class="mr-2" />
              <span class="text--large">Debug Logs</span>
            </div>
          </b-dropdown-item>
          <b-dropdown-item @click="logout">
            <div class="d-flex align-items-center clickme">
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
        :class="{
          hideNavBarBottom: navBarBottomHidden,
          showNavBarBottom: !navBarBottomHidden,
          stickyAdRendered,
        }"
      >
        <nuxt-link
          no-prefetch
          class="nav-link text-center p-0 botmen"
          to="/browse"
          @click="clickedMobileNav"
          @mousedown="maybeReload('/browse')"
        >
          <div class="position-relative">
            <v-icon icon="eye" class="fa-fw2" />
            <br />
            <b-badge
              v-if="browseCount"
              variant="info"
              class="browsebadge2"
              :title="browseCountPlural"
            >
              {{ browseCount }}
            </b-badge>
            <span class="nav-item__text">Browse</span>
          </div>
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
        <div class="postWrapper">
          <NavbarMobilePost class="navpost" />
          <div class="d-flex justify-content-around navpostnav">
            <nuxt-link
              no-prefetch
              class="nav-link text-center p-0 botmen"
              to="/post"
              @click="clickedMobileNav"
              @mousedown="maybeReload('/post')"
            >
              <div class="position-relative">
                <v-icon icon="home" class="fa-fw2 invisible" />
                <br />
                <span class="nav-item__text">Post</span>
              </div>
            </nuxt-link>
          </div>
        </div>
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
        <about-me-modal
          v-if="showAboutMeModal"
          @hidden="showAboutMeModal = false"
        />
        <DebugLogsModal v-if="showDebugLogs" @hidden="showDebugLogs = false" />
      </b-navbar>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import NavbarMobilePost from './NavbarMobilePost'
import {
  clearNavBarTimeout,
  setNavBarHidden,
  useNavbar,
  navBarHidden,
} from '~/composables/useNavbar'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '~/stores/mobile' // APP
const mobileStore = useMobileStore()

const {
  online,
  distance,
  unreadNotificationCount,
  activePostsCount,
  activePostsCountPlural,
  newsCount,
  newsCountPlural,
  browseCount,
  browseCountPlural,
  showAboutMeModal,
  showBackButton,
  backButtonCount,
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

const DebugLogsModal = defineAsyncComponent(() =>
  import('~/components/DebugLogsModal')
)

const showDebugLogs = ref(false)

const mobileNav = ref(null)

const clickedMobileNav = () => {
  mobileNav?.value?.$el?.click()
}

const title = computed(() => {
  return useMiscStore().pageTitle
})

const isApp = ref(mobileStore.isApp) // APP

const stickyAdRendered = computed(() => {
  return useMiscStore().stickyAdRendered
})

const notificationsShown = ref(false)

watch(notificationsShown, (newVal) => {
  console.log('Notifications shown', newVal)
  if (newVal && navBarHidden.value) {
    setNavBarHidden(false)
  }
})

const signInDisabled = ref(true)

// We want to hide the navbars when you scroll down.
onMounted(() => {
  // Keeping the button disabled until hygration has finished helps with Playwright tests.
  signInDisabled.value = false

  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  clearNavBarTimeout()
  window.removeEventListener('scroll', handleScroll)
})

function refresh() {
  // APP
  window.location.reload(true) // Works, but causes a complete reload from scratch. this.$router.go() doesn't work in iOS app
}

function handleScroll() {
  const scrollY = window.scrollY

  if (notificationsShown.value) {
    if (navBarHidden.value) {
      // Don't hide the navbar if the notifications are visible.s
      setNavBarHidden(false)
    }
  } else if (scrollY > 200 && !navBarHidden.value) {
    // Scrolling down.  Hide the navbars.
    setNavBarHidden(true)
  } else if (scrollY < 100 && navBarHidden.value) {
    // At the top. Show the navbars.
    setNavBarHidden(false)
  }
}

const route = useRoute()

const navBarBottomHidden = computed(() => {
  return (
    route.path.startsWith('/give') ||
    route.path.startsWith('/find') ||
    route.path.startsWith('/post') ||
    route.path.startsWith('/chat') ||
    navBarHidden.value
  )
})

const loggedIn = computed(() => useAuthStore().user !== null)
</script>
<style scoped lang="scss">
@import 'assets/css/navbar.scss';
@import 'assets/css/sticky-banner.scss';

#navbar-mobile {
  // Set all children to display: none except the last one.  This means that normally we'll display the navbar
  // above, but if we teleport a new navbar in, we'll hide the old one and show the new one.
  > * {
    display: none !important;
  }
  > *:last-child {
    display: grid !important;
  }
}

.navbot.stickyAdRendered {
  margin-bottom: $sticky-banner-height-mobile;

  @media (min-height: $mobile-tall) {
    margin-bottom: $sticky-banner-height-mobile-tall;
  }

  @include media-breakpoint-up(md) {
    margin-bottom: $sticky-banner-height-desktop;

    @media (min-height: $desktop-tall) {
      margin-bottom: $sticky-banner-height-desktop-tall;
    }
  }
}

:deep(.dropdown-toggle) {
  background-color: $color-green-background;
  border: none !important;
}

:deep(.userOptions .dropdown-menu) {
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
  color: white !important;
}

.browsebadge2 {
  position: absolute;
  top: 1px;
  right: -7px;
  font-size: 11px;
  color: white !important;
}

.chatup {
  transform: translate(3px, 1px);
}

.newsbadge2 {
  position: absolute;
  top: 2px;
  font-size: 11px;
  color: white !important;
}

.botmen {
  width: 51px;
  min-width: 51px;
  max-width: 51px;
  height: 51px;
  min-height: 51px;
  max-height: 51px;

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

.hideNavBarBottom {
  transform: translateY(150px);
  transition: transform 1s;

  .navpost {
    opacity: 0;
    transition: opacity 0.5s;
  }
}

.showNavBarBottom {
  transform: translateY(0px);
  transition: transform 1s;

  .navpost {
    opacity: 1;
    transition: opacity 0.5s;
  }
}

.hideNavBarTop {
  transform: translateY(-150px);
  transition: transform 1s;

  .navpost {
    opacity: 0;
    transition: opacity 0.5s;
  }
}

.showNavBarTop {
  transform: translateY(0px);
  transition: transform 1s;

  .navpost {
    opacity: 1;
    transition: opacity 0.5s;
  }
}

.postWrapper {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 51px;

  .navpost {
    grid-column: 1;
    grid-row: 1;
  }

  .navpostnav {
    grid-column: 1;
    grid-row: 1;
  }
}
</style>
