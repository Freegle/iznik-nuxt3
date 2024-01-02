<template>
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
    <b-dropdown v-if="loggedIn" no-caret variant="primary" class="userOptions">
      <template #button-content>
        <ProfileImage
          v-if="me.profile.path"
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
    }"
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
  </b-navbar>
  <about-me-modal v-if="showAboutMeModal" @hidden="showAboutMeModal = false" />
</template>
<script setup>
import { useRoute } from 'vue-router'
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

const title = computed(() => {
  return useMiscStore().pageTitle
})

// We want to hide the navbars when you slide down.
let lastScrollY = 0

onMounted(() => {
  lastScrollY = window.scrollY
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navBarHidden = ref(false)
let scrollTimer = null

function handleScroll() {
  const scrollY = window.scrollY

  if (scrollY > lastScrollY) {
    // Scrolling down.  Hide the navbars.
    if (!navBarHidden.value) {
      navBarHidden.value = true
    }

    // Start a timer to show the navbars again after a delay, in case the user doesn't realise that they can
    // make them show again by scrolling up.
    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }

    scrollTimer = setTimeout(() => {
      navBarHidden.value = false
    }, 5000)
  } else if (navBarHidden.value) {
    // Scrolling up. Show the navbars.
    navBarHidden.value = false

    if (scrollTimer) {
      clearTimeout(scrollTimer)
    }
  }

  lastScrollY = scrollY
}

const route = useRoute()

const navBarBottomHidden = computed(() => {
  return (
    route.path.startsWith('/give') ||
    route.path.startsWith('/find') ||
    route.path.startsWith('/post')
  )
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
