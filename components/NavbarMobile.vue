<template>
  <div id="navbar-mobile">
    <div v-if="!isSpecificChatPage">
      <b-navbar
        type="dark"
        class="ourBack d-flex justify-content-between d-xl-none"
        :class="{ hideNavBarTop: navBarHidden, showNavBarTop: !navBarHidden }"
        fixed="top"
      >
        <OfflineIndicator v-if="!online" />
        <div
          v-if="online && showBackButton"
          ref="mobileNav"
          class="nav-back-btn"
          @click="backButton"
        >
          <v-icon icon="arrow-left" class="back-icon" />
          <b-badge v-if="backButtonCount" variant="danger" class="back-badge">
            {{ backButtonCount }}
          </b-badge>
        </div>
        <nuxt-link
          v-else-if="online && navBarBottomHidden"
          to="/"
          class="nav-back-btn"
        >
          <v-icon icon="arrow-left" class="back-icon" />
        </nuxt-link>
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
          <h1
            v-if="loggedIn"
            class="text-white truncate text-center maxwidth m-0"
          >
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
              :name="me?.displayname"
              class="m-0 inline"
              is-thumbnail
              size="lg"
            />
            <v-icon v-else icon="user" size="2x" />
          </template>
          <b-dropdown-item
            href="/settings"
            @click="clickedMobileNav"
            @mousedown="maybeReload('/settings')"
          >
            <div class="d-flex align-items-center">
              <v-icon icon="cog" class="menu-icon" />
              <span class="menu-text">Settings</span>
            </div>
          </b-dropdown-item>
          <b-dropdown-item @click="logout">
            <div class="d-flex align-items-center clickme">
              <v-icon icon="sign-out-alt" class="menu-icon" />
              <span class="menu-text">Logout</span>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </b-navbar>
      <nav
        v-if="loggedIn"
        class="navbar-bottom d-xl-none"
        :class="{
          hideNavBarBottom: navBarBottomHidden,
          showNavBarBottom: !navBarBottomHidden,
          stickyAdRendered,
        }"
      >
        <NavbarMobileItem
          to="/browse"
          icon="eye"
          label="Browse"
          :badge="browseCount"
          @click="clickedMobileNav"
          @mousedown="maybeReload('/browse')"
        />
        <NavbarMobileItem
          to="/chats"
          icon="comments"
          label="Chats"
          :badge="chatCount"
          badge-variant="danger"
          @click="clickedMobileNav"
          @mousedown="maybeReload('/chats')"
        />
        <NavbarMobileItem
          to="/myposts"
          icon="home"
          label="My Posts"
          :badge="activePostsCount"
          @click="clickedMobileNav"
          @mousedown="maybeReload('/myposts')"
        />
        <div class="post-button-wrapper">
          <NavbarMobilePost class="navpost" />
        </div>
        <NavbarMobileItem
          to="/chitchat"
          icon="coffee"
          label="ChitChat"
          :badge="newsCount"
          @click="clickedMobileNav"
          @mousedown="maybeReload('/chitchat')"
        />
        <NavbarMobileItem
          to="/promote"
          icon="bullhorn"
          label="Promote"
          @click="clickedMobileNav"
          @mousedown="maybeReload('/promote')"
        />
        <NavbarMobileItem
          to="/help"
          icon="question-circle"
          label="Help"
          @click="clickedMobileNav"
          @mousedown="maybeReload('/help')"
        />
        <about-me-modal
          v-if="showAboutMeModal"
          @hidden="showAboutMeModal = false"
        />
      </nav>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import NavbarMobilePost from './NavbarMobilePost'
import NavbarMobileItem from './NavbarMobileItem'
import {
  clearNavBarTimeout,
  setNavBarHidden,
  useNavbar,
  navBarHidden,
} from '~/composables/useNavbar'
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { useMobileStore } from '~/stores/mobile'
const mobileStore = useMobileStore()

const {
  online,
  distance,
  unreadNotificationCount,
  activePostsCount,
  newsCount,
  browseCount,
  chatCount,
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
const lastScrollY = ref(0)
const scrollThreshold = 10

// We want to hide the navbars when scrolling down, show when scrolling up.
onMounted(() => {
  // Keeping the button disabled until hygration has finished helps with Playwright tests.
  signInDisabled.value = false
  lastScrollY.value = window.scrollY

  window.addEventListener('scroll', handleScroll, { passive: true })
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
  const scrollDelta = scrollY - lastScrollY.value

  if (notificationsShown.value) {
    if (navBarHidden.value) {
      setNavBarHidden(false)
    }
  } else if (scrollY < 60) {
    // Always show at top of page - immediately, bypassing typing delay
    if (navBarHidden.value) {
      clearNavBarTimeout()
      navBarHidden.value = false
    }
  } else if (scrollDelta > scrollThreshold && !navBarHidden.value) {
    // Scrolling down - hide
    setNavBarHidden(true)
  } else if (scrollDelta < -scrollThreshold && navBarHidden.value) {
    // Scrolling up - show
    setNavBarHidden(false)
  }

  lastScrollY.value = scrollY
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

// Detect when on a specific chat page (e.g., /chats/123) at mobile breakpoints.
// The ChatMobileNavbar will be teleported in to replace this navbar at xs/sm only,
// so only show the placeholder at those breakpoints.
const isSpecificChatPage = computed(() => {
  const match = route.path.match(/^\/chats\/(\d+)/)
  if (!match) return false
  // Only show placeholder at xs/sm breakpoints where ChatMobileNavbar is teleported
  const bp = useMiscStore().breakpoint
  return bp === 'xs' || bp === 'sm'
})

const loggedIn = computed(() => useAuthStore().user !== null)
const me = computed(() => useAuthStore().user)
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

// Modern top navbar styling
:deep(.navbar.ourBack) {
  background: linear-gradient(
    135deg,
    $color-green-background 0%,
    darken($color-green-background, 5%) 100%
  ) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0.75rem;
  min-height: $navbar-mobile-chat-height;

  h1 {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
}

// Bottom navbar - modern design
// Total height should be 67px (same as before: 51 content + 8 pad top + 8 pad bottom)
// On tablets (md+), increase to 76px (60 content + 8 pad top + 8 pad bottom)
.navbar-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  padding: 8px 4px calc(8px + env(safe-area-inset-bottom, 0px));
  height: 67px;
  box-sizing: border-box;

  @include media-breakpoint-up(md) {
    height: 76px;
  }
}

.navbar-bottom.stickyAdRendered {
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

.post-button-wrapper {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 64px;
  height: 51px;

  @include media-breakpoint-up(md) {
    height: 60px;
  }
}

// Modern user dropdown styling
:deep(.userOptions .dropdown-toggle) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin-right: 0.5rem;

  &::after {
    display: none;
  }
}

:deep(.userOptions .dropdown-menu) {
  background: white !important;
  border: 1px solid #ddd !important;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  padding: 0;
  min-width: 160px;
  margin-top: 0.25rem;

  .dropdown-item {
    background: white !important;
    color: #333 !important;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    &:hover,
    &:focus {
      background: #f8f8f8 !important;
    }
  }
}

.menu-icon {
  color: $color-green-background !important;
  width: 1.1rem !important;
  height: 1.1rem !important;
  margin-right: 0.5rem;
}

.menu-text {
  font-size: 0.9rem;
  color: #333;
}

.navpost {
  transform: translateY(-24px);
}

:deep(.container-fluid) {
  padding: 0 !important;
}

.maxwidth {
  max-width: calc(100vw - 130px);
}

// Modern back button styling
.nav-back-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-left: 4px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.15s ease;
  text-decoration: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.25);
  }
}

.back-icon {
  color: white;
  font-size: 1.25rem;
}

.back-badge {
  margin-left: 6px;
  font-size: 0.65rem;
}

.hideNavBarBottom {
  transform: translateY(150px);
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1);

  .navpost {
    opacity: 0;
    transition: opacity 0.15s ease-out;
  }
}

.showNavBarBottom {
  transform: translateY(0px);
  transition: transform 0.35s cubic-bezier(0, 0, 0.2, 1);

  .navpost {
    opacity: 1;
    transition: opacity 0.2s ease-in 0.1s;
  }
}

.hideNavBarTop {
  transform: translateY(-150px);
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1);
}

.showNavBarTop {
  transform: translateY(0px);
  transition: transform 0.35s cubic-bezier(0, 0, 0.2, 1);
}
</style>
